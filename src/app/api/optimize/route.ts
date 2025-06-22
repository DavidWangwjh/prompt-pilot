import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const MODEL_NAME = "gemini-2.0-flash";
const API_KEY = process.env.GEMINI_API_KEY || "";

async function optimizePrompt(title: string, content: string, tags: string[], model: string) {
    if (!API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    const aiModel = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const optimizePrompt = `
You are an expert prompt engineer and AI workflow optimizer. Your task is to optimize a prompt's title, tags, and content to make it more effective, clear, and engaging.

CURRENT DATA:
Title: "${title}"
Content: "${content}"
Current Tags: [${tags.join(', ')}]
Target Model: ${model}

Please optimize all three components:

1. TITLE: Make it concise, descriptive, and engaging (max 60 characters)
2. TAGS: Review the current tags and provide a completely new, optimized set of tags. Replace all existing tags with the most relevant ones for this prompt (max 6 tags, each 1-3 words). Do not keep any existing tags unless they are truly optimal.
3. CONTENT: Improve the prompt content for clarity, effectiveness, and better results

IMPORTANT: Return your response as a single, valid JSON object only. Do not include any other text, markdown, or explanations. The JSON object must follow this exact structure:
{
  "title": "Optimized title here",
  "tags": ["tag1", "tag2", "tag3"],
  "content": "Optimized prompt content here"
}

Guidelines:
- Title should be clear and action-oriented
- Tags should be relevant, specific, and help with discovery. Replace all existing tags with the best possible set.
- Content should be well-structured, clear, and optimized for the target AI model
- Keep the original intent and purpose of the prompt
- Make improvements that enhance effectiveness and clarity
- For tags: focus on the most relevant categories, use cases, and technical aspects
`;

    const result = await aiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: optimizePrompt }] }],
        generationConfig,
        safetySettings,
    });
    
    const text = result.response.text();

    try {
        // Find the start and end of the JSON object
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}') + 1;
        const jsonString = text.substring(startIndex, endIndex);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse JSON from Gemini response:", text, error);
        throw new Error("The AI optimizer returned an invalid response. Please try again.");
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content, tags, model } = body;

        // Validate input - require either title or content
        if ((!title || !title.trim()) && (!content || !content.trim())) {
            return NextResponse.json({ 
                error: 'Either title or prompt content is required for optimization' 
            }, { status: 400 });
        }

        const optimizedResult = await optimizePrompt(
            title || '',
            content || '',
            tags || [],
            model || 'GPT-4'
        );

        return NextResponse.json(optimizedResult);

    } catch (error) {
        console.error('Error in optimize API:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            details: errorMessage 
        }, { status: 500 });
    }
} 