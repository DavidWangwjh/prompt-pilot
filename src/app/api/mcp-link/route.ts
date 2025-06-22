import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Prompt = Database['public']['Tables']['prompts']['Row'];

const FAKE_USER_ID = 'f9df1fa1-1a38-494c-917e-ca3a3b80b75d';

// Task analysis patterns
// const TASK_PATTERNS = {
//   research: /research|analyze|investigate|study|explore/i,
//   writing: /write|compose|create|draft|author/i,
//   summary: /summarize|summarise|condense|brief|recap/i,
//   coding: /code|program|develop|build|implement|debug/i,
// };

// Task breakdown strategies
// const TASK_BREAKDOWN = {
//   research: ['background_research', 'deep_analysis', 'synthesis', 'summary'],
//   writing: ['outline', 'draft', 'review', 'polish'],
//   coding: ['planning', 'implementation', 'testing', 'documentation'],
//   planning: ['goal_setting', 'strategy_development', 'timeline', 'execution_plan'],
//   problem_solving: ['problem_analysis', 'solution_generation', 'evaluation', 'implementation'],
//   creative: ['inspiration', 'ideation', 'development', 'refinement']
// };

// interface TaskAnalysis {
//   primaryType: string;
//   secondaryTypes: string[];
//   complexity: 'low' | 'medium' | 'high';
//   estimatedSteps: number;
//   keywords: string[];
//   breakdown: string[];
// }

// interface ExecutionPlan {
//   task: string;
//   analysis: TaskAnalysis;
//   prompts: Array<{
//     id: number;
//     title: string;
//     content: string;
//     order: number;
//     step: string;
//     instructions: string;
//   }>;
//   totalSteps: number;
//   estimatedTime: string;
//   executionInstructions: string;
// }

// --- Task Analysis Logic ---
const ACTION_VERBS: Record<string, RegExp> = {
    research: /research|analyze|investigate|study|explore|find/i,
    write: /write|compose|create|draft|author|generate/i,
    summarize: /summarize|summarise|condense|brief|recap|summary/i,
    review: /review|evaluate|assess|critique|check/i,
    code: /code|program|develop|build|implement|debug/i,
};

async function analyzeTask(task: string) {
    console.log('[MCP] Analyzing task:', task);
    const lowerCaseTask = task.toLowerCase();

    // Identify the sequence of actions
    const actions = Object.keys(ACTION_VERBS)
        .map(verb => ({ verb, index: lowerCaseTask.search(ACTION_VERBS[verb]) }))
        .filter(item => item.index !== -1)
        .sort((a, b) => a.index - b.index)
        .map(item => item.verb);

    // Identify keywords, excluding action verbs
    let keywords = lowerCaseTask.split(/\s+/).filter(word => word.length > 3);
    const allActionPatterns = new RegExp(Object.values(ACTION_VERBS).map(p => p.source).join('|'), 'gi');
    // Also filter out common filler words
    const fillerWords = /\b(and|make|the|a|an|for|to|in|on|with|is|are)\b/gi;
    keywords = keywords.filter(kw => !allActionPatterns.test(kw) && !fillerWords.test(kw));

    const analysis = {
        actions: actions.length > 0 ? actions : ['general'],
        keywords,
    };
    console.log('[MCP] Task analysis result:', analysis);
    return analysis;
}


// --- Prompt Retrieval Logic ---
function calculateRelevance(prompt: Prompt, actionPattern: RegExp, keywords: string[]): number {
    let score = 0;
    const title = prompt.title.toLowerCase();
    const content = prompt.content.toLowerCase();

    // Strong match for the action verb in the title
    if (actionPattern.test(title)) {
        score += 5;
    }
    // Weaker match in content
    if (actionPattern.test(content)) {
        score += 2;
    }

    // Bonus for keywords
    keywords.forEach(kw => {
        if (title.includes(kw)) {
            score += 3;
        }
        if (content.includes(kw)) {
            score += 1;
        }
    });

    return score;
}

async function findSuitablePrompts(analysis: { actions: string[]; keywords: string[] }, userPrompts: Prompt[]) {
    console.log(`[MCP] Finding prompts for actions: ${analysis.actions.join(', ')}`);
    const finalPrompts: Prompt[] = [];
    const usedPromptIds = new Set<number>();

    for (const action of analysis.actions) {
        let bestPrompt: Prompt | null = null;
        let highestScore = 0;
        const actionPattern = (ACTION_VERBS)[action];

        if (!actionPattern) {
            console.log(`[MCP] No action pattern found for: ${action}`);
            continue;
        }

        for (const prompt of userPrompts) {
            if (usedPromptIds.has(prompt.id)) {
                continue; // Don't reuse prompts
            }

            const score = calculateRelevance(prompt, actionPattern, analysis.keywords);
            if (score > highestScore) {
                highestScore = score;
                bestPrompt = prompt;
            }
        }

        if (bestPrompt) {
            console.log(`[MCP] Best prompt for action '${action}' is '${bestPrompt.title}' with score ${highestScore}`);
            finalPrompts.push(bestPrompt);
            usedPromptIds.add(bestPrompt.id);
        } else {
            console.log(`[MCP] No suitable prompt found for action: ${action}`);
        }
    }
    
    return finalPrompts;
}


// --- NEW: LLM-Powered Reranking ---
async function rerankAndVerifyWithLLM(task: string, candidatePrompts: Prompt[]) {
    console.log('[MCP] Using LLM to rerank and verify candidate prompts.');
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        console.warn('[MCP] GEMINI_API_KEY not set, falling back to keyword-based ranking.');
        return candidatePrompts;
    }
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const rerankerPrompt = `
You are an expert task dispatcher. Your job is to analyze a user's request and a list of available tools (prompts) and determine the best sequence of tools to use to accomplish the request.

User's Request:
"${task}"

Available Tools (Prompts):
---
${JSON.stringify(candidatePrompts.map(p => ({ id: p.id, title: p.title, content: p.content.substring(0, 100) + '...' })), null, 2)}
---

Based on the user's request, please provide the ideal sequence of tool IDs to execute. The output must be a single, valid JSON array of numbers, representing the ordered list of prompt IDs. For example: [3, 1].

If none of the tools are suitable for the task, return an empty array []. Do not include any other text, markdown, or explanation in your response.
    `.trim();

    try {
        const result = await model.generateContent(rerankerPrompt);
        const textResponse = result.response.text();
        console.log('[MCP] LLM Reranker raw response:', textResponse);
        
        // Sanitize the response to ensure it's valid JSON
        const jsonMatch = textResponse.match(/\[(.*?)\]/);
        if (!jsonMatch) {
            console.error('[MCP] LLM Reranker did not return a valid JSON array.');
            // Fallback to the original naive ranking if LLM fails
            return candidatePrompts;
        }

        const orderedIds = JSON.parse(jsonMatch[0]) as number[];
        
        // Re-order the original prompt objects based on the IDs from the LLM
        const finalPrompts = orderedIds
            .map(id => candidatePrompts.find(p => p.id === id))
            .filter((p): p is Prompt => p !== undefined);

        console.log(`[MCP] LLM Reranker validated and ordered ${finalPrompts.length} prompts.`);
        return finalPrompts;

    } catch (error) {
        console.error("[MCP] Error during LLM reranking:", error);
        // If the LLM reranker fails for any reason, fall back to the original keyword-based ranking
        // This makes the system more resilient.
        return candidatePrompts;
    }
}


// --- Execution Plan Logic ---
async function createExecutionPlan(task: string) {
    console.log('[MCP] Creating execution plan for task:', task);
    const analysis = await analyzeTask(task);
    const supabase = await createSupabaseServerClient();

    console.log('[MCP] Fetching prompts from vault for user:', FAKE_USER_ID);
    const { data: userPrompts, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', FAKE_USER_ID);

    if (error) {
        console.error('[MCP] Database error fetching prompts:', error);
        throw new Error(`Failed to retrieve prompts from vault: ${error.message}`);
    }

    if (!userPrompts || userPrompts.length === 0) {
        console.warn('[MCP] No prompts found in the user\'s vault.');
        throw new Error('Your prompt vault is empty. Please add prompts to use the MCP.');
    }
    
    console.log(`[MCP] Successfully retrieved ${userPrompts.length} prompts from vault.`);

    // 1. Get initial candidates using the keyword/action method
    const candidatePrompts = await findSuitablePrompts(analysis, userPrompts);

    if (candidatePrompts.length === 0) {
        console.warn('[MCP] Could not find any suitable prompts for the task.');
        throw new Error('Could not find any suitable prompts in your vault for this task. Try adding more relevant prompts.');
    }

    // 2. Use the LLM to rerank and validate the candidates
    const orderedPrompts = await rerankAndVerifyWithLLM(task, candidatePrompts);

    console.log(`[MCP] Final plan has ${orderedPrompts.length} prompts.`);

    return {
        task,
        analysis,
        prompts: orderedPrompts.map((prompt, index) => ({
            ...prompt,
            order: index + 1,
        })),
    };
}


// --- Tool 2: Execute Prompt Chain ---
async function executePromptChain(prompts: Prompt[]) {
    console.log(`[MCP] Starting autonomous execution of ${prompts.length} prompts.`);
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        console.warn('[MCP] GEMINI_API_KEY not set, returning execution plan without execution.');
        return {
            message: "API key not configured. Here's your execution plan:",
            prompts: prompts.map((prompt, index) => ({
                step: index + 1,
                title: prompt.title,
                content: prompt.content
            }))
        };
    }
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let context = ""; // This will hold the output from the previous step

    for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        console.log(`[MCP] Executing Step ${i + 1}: ${prompt.title}`);

        const fullPrompt = `Context from previous step (if any):\n---\n${context}\n---\n\nYour task for this step:\n---\n${prompt.content}\n---`;
        const result = await model.generateContent(fullPrompt);
        context = result.response.text();
        console.log(`[MCP] Step ${i + 1} completed. Context updated.`);
    }

    console.log('[MCP] Autonomous execution finished.');
    return context; // Return the final result
}


// --- API Route Handler ---
export async function GET() {
    // Handle GET requests for MCP server discovery
    return NextResponse.json({
        jsonrpc: '2.0',
        id: null,
        result: {
            protocolVersion: '2024-11-05',
            serverInfo: {
                name: 'PromptPilot MCP',
                version: '1.0.0'
            },
            capabilities: {
                tools: {}
            }
        }
    });
}

export async function POST(request: Request) {
    const body = await request.json();
    const { method, params, id } = body;

    try {
        switch (method) {
            case 'initialize':
                return NextResponse.json({
                    jsonrpc: '2.0', id,
                    result: { protocolVersion: '2024-11-05', serverInfo: { name: 'PromptPilot MCP' } }
                });

            case 'tools/list':
                return NextResponse.json({
                    jsonrpc: '2.0', id,
                    result: {
                        tools: [
                            {
                                name: 'create_execution_plan',
                                description: "Analyzes a user's task and creates a sequential plan of prompts from the user's vault.",
                                inputSchema: {
                                    type: 'object',
                                    properties: { task: { type: 'string', description: 'The task to accomplish.' } },
                                    required: ['task']
                                }
                            },
                            {
                                name: 'execute_prompt_chain',
                                description: "Executes an ordered chain of prompts, feeding the output of each step as context to the next.",
                                inputSchema: {
                                    type: 'object',
                                    properties: { 
                                        prompts: { 
                                            type: 'array', 
                                            description: 'An array of prompt objects to execute in sequence.',
                                            items: { type: 'object' } 
                                        } 
                                    },
                                    required: ['prompts']
                                }
                            }
                        ]
                    }
                });

            case 'tools/call':
                if (params.name === 'create_execution_plan') {
                    const executionPlan = await createExecutionPlan(params.arguments.task);
                    return NextResponse.json({ jsonrpc: '2.0', id, result: executionPlan });
                }
                if (params.name === 'execute_prompt_chain') {
                    const finalResult = await executePromptChain(params.arguments.prompts);
                    return NextResponse.json({ jsonrpc: '2.0', id, result: { finalAnswer: finalResult } });
                }
                throw new Error(`Method '${params.name}' not found.`);

            default:
                throw new Error(`Method '${method}' not found.`);
        }
    } catch (error) {
        console.error('[MCP] Error in API handler:', error);
        return NextResponse.json({
            jsonrpc: '2.0',
            id: id || null,
            error: {
                code: -32603,
                message: error instanceof Error ? error.message : 'An internal server error occurred.',
            },
        });
    }
} 