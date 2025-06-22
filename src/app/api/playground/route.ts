import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { aiJudgeAgent } from '@/lib/ai-judge-agent';

const MODEL_NAME = "gemini-2.0-flash";
const API_KEY = process.env.GEMINI_API_KEY || "";

async function runGenerate(prompt: string) {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, promptA, promptB } = body;

    if (action === 'generate_and_judge') {
        if (!promptA || !promptB) {
            return NextResponse.json({ error: 'Missing prompt parameters' }, { status: 400 });
        }
        
        // Generate responses from both prompts using Gemini
        const [generatedA, generatedB] = await Promise.all([
            runGenerate(promptA),
            runGenerate(promptB)
        ]);
        
        // Use AI Judge Agent to analyze the prompts and responses
        const judgeResult = await aiJudgeAgent.analyzePrompts(promptA, promptB, generatedA, generatedB);

        return NextResponse.json({ 
            responseA: generatedA, 
            responseB: generatedB,
            feedback: judgeResult.feedback,
            scores: judgeResult.scores,
            winner: judgeResult.winner,
            reasoning: judgeResult.reasoning,
            recommendations: judgeResult.recommendations,
            overallAssessment: judgeResult.overallAssessment
        });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error) {
    console.error('Error in playground API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
} 