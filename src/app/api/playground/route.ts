import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const MODEL_NAME = "gemini-2.0-flash";
const API_KEY = process.env.GEMINI_API_KEY || "";

async function runGenerate(prompt: string, model: string) {
    if (!API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }
    const genAI = new GoogleGenerativeAI(API_KEY);
    // TODO: The model name is hardcoded for now, but we can use the `model` param
    // to switch between different models in the future.
    const aiModel = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.9,
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

    const result = await aiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
    });
    
    return result.response.text();
}

async function runJudgeAndScore(promptA: string, promptB: string, responseA: string, responseB: string) {
     if (!API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const judgePrompt = `
You are an expert prompt engineering assistant. Your task is to analyze two prompts and their generated responses.

PROMPT A:
---
${promptA}
---

RESPONSE A:
---
${responseA}
---

PROMPT B:
---
${promptB}
---

RESPONSE B:
---
${responseB}
---

Please provide a detailed analysis and a recommendation based on the quality of the responses. Also, provide scores for Clarity, Engagement, and Creativity for each prompt's response on a scale of 0-100.

IMPORTANT: Return your response as a single, valid JSON object only. Do not include any other text, markdown, or explanations. The JSON object must follow this exact structure:
{
  "feedback": "Your detailed analysis and recommendation here...",
  "scores": {
    "promptA": { "clarity": <score>, "engagement": <score>, "creativity": <score> },
    "promptB": { "clarity": <score>, "engagement": <score>, "creativity": <score> }
  }
}
`;
    const result = await model.generateContent(judgePrompt);
    const text = result.response.text();

    try {
        // Find the start and end of the JSON object
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}') + 1;
        const jsonString = text.substring(startIndex, endIndex);
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini response:", text);
        throw new Error("The AI judge returned an invalid response. Please try again.");
    }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, promptA, promptB, model } = body;

    if (action === 'generate_and_judge') {
        if (!promptA || !promptB || !model) {
            return NextResponse.json({ error: 'Missing parameters for generate action' }, { status: 400 });
        }
        
        const [generatedA, generatedB] = await Promise.all([
            runGenerate(promptA, model),
            runGenerate(promptB, model)
        ]);
        
        const { feedback, scores } = await runJudgeAndScore(promptA, promptB, generatedA, generatedB);

        return NextResponse.json({ 
            responseA: generatedA, 
            responseB: generatedB,
            feedback,
            scores,
        });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Error in playground API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
} 