import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// MCP Protocol types
interface MCPRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: Record<string, unknown>;
  error?: {
    code: number;
    message: string;
  };
}

// MCP Tool call parameters
interface MCPToolCallParams {
  name: string;
  arguments: Record<string, unknown>;
}

// Prompt type definition based on database schema
type Prompt = Database['public']['Tables']['prompts']['Row'];

// Action verbs type
type ActionVerb = 'research' | 'write' | 'summarize' | 'review' | 'code';

// MCP Tool definitions
const tools = [
  {
//     name: 'list_prompts',
//     description: 'List all available prompts in the PromptPilot vault',
//     inputSchema: {
//       type: 'object',
//       properties: {
//         category: {
//           type: 'string',
//           description: 'Optional category filter'
//         },
//         search: {
//           type: 'string',
//           description: 'Optional search term to filter prompts'
//         }
//       }
//     }
//   },
//   {
//     name: 'get_prompt',
//     description: 'Get a specific prompt by ID',
//     inputSchema: {
//       type: 'object',
//       properties: {
//         id: {
//           type: 'number',
//           description: 'The ID of the prompt to retrieve'
//         }
//       },
//       required: ['id']
//     }
//   },
//   {
//     name: 'search_prompts',
//     description: 'Search prompts by content, tags, or description',
//     inputSchema: {
//       type: 'object',
//       properties: {
//         query: {
//           type: 'string',
//           description: 'Search query'
//         },
//         limit: {
//           type: 'number',
//           description: 'Maximum number of results to return',
//           default: 10
//         }
//       },
//       required: ['query']
//     }
//   },
//  {
    name: 'create_execution_plan',
    description: 'Create an execution plan for a given task using relevant prompts from the vault',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'The task to create an execution plan for'
        }
      },
      required: ['task']
    }
  },
  {
    name: 'execute_prompt_chain',
    description: 'Execute a chain of prompts in seGiven a natural language task from the user, automatically find the best prompts and execute them in sequence to complete the task. Use this when the user gives a multi-step task.quence',
    inputSchema: {
      type: 'object',
      properties: {
        prompts: {
          type: 'array',
          description: 'Array of prompts to execute in order',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              content: { type: 'string' },
              variables: { type: 'object' }
            }
          }
        }
      },
      required: ['prompts']
    }
  }
];

const FAKE_USER_ID = 'f9df1fa1-1a38-494c-917e-ca3a3b80b75d';

// --- Task Analysis Logic ---
const ACTION_VERBS: Record<ActionVerb, RegExp> = {
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
        .map(verb => ({ verb, index: lowerCaseTask.search(ACTION_VERBS[verb as ActionVerb]) }))
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
        const actionPattern = ACTION_VERBS[action as ActionVerb];

        if (!actionPattern) continue;

        for (const prompt of userPrompts) {
            if (usedPromptIds.has(prompt.id)) continue;
            const score = calculateRelevance(prompt, actionPattern, analysis.keywords);
            if (score > highestScore) {
                highestScore = score;
                bestPrompt = prompt;
            }
        }

        if (bestPrompt && highestScore > 0) {
            finalPrompts.push(bestPrompt);
            usedPromptIds.add(bestPrompt.id);
        }
    }

    // If the user asked for a summary and no summary prompt was found, try to find a generic summary prompt
    if (
        analysis.actions.includes('summarize') &&
        !finalPrompts.some(p => /summary|summarize|condense|recap/i.test(p.title + p.content))
    ) {
        let bestSummaryPrompt: Prompt | null = null;
        let bestScore = 0;
        for (const prompt of userPrompts) {
            if (usedPromptIds.has(prompt.id)) continue;
            if (/summary|summarize|condense|recap/i.test(prompt.title + prompt.content)) {
                const score = calculateRelevance(prompt, /summary|summarize|condense|recap/i, analysis.keywords);
                if (score > bestScore) {
                    bestScore = score;
                    bestSummaryPrompt = prompt;
                }
            }
        }
        if (bestSummaryPrompt) {
            finalPrompts.push(bestSummaryPrompt);
            usedPromptIds.add(bestSummaryPrompt.id);
        }
    }

    return finalPrompts;
}


// --- NEW: LLM-Powered Reranking ---
async function rerankAndVerifyWithLLM(task: string, candidatePrompts: Prompt[]) {
    console.log('[MCP] Using LLM to rerank and verify candidate prompts.');
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        throw new Error('GEMINI_API_KEY is not set for the reranker.');
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
    if (!userPrompts) {
        console.warn('[MCP] No data returned from prompts query for user:', FAKE_USER_ID);
        throw new Error('Could not retrieve prompts from your vault. The query returned no data.');
    }

    if (userPrompts.length === 0) {
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
        instructions: `The MCP will execute these prompts in order to complete your task.`
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

    let context = "";
    const thinking: Array<{
        promptId: string;
        title: string;
        status: string;
        summary: string;
        result: string;
      }> = [];

    for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        console.log(`[MCP] Executing Step ${i + 1}: ${prompt.title}`);

        const fullPrompt = `Context from previous step (if any):\n---\n${context}\n---\n\nYour task for this step:\n---\n${prompt.content}\n---`;
        const result = await model.generateContent(fullPrompt);
        context = result.response.text();
        thinking.push({
            promptId: prompt.id.toString(),
            title: prompt.title,
            status: 'Completed',
            summary: `Executed prompt #${prompt.id}: ${prompt.title}`,
            result: context,
        });
        console.log(`[MCP] Step ${i + 1} completed. Context updated.`);
    }

    console.log('[MCP] Autonomous execution finished.');
    return { thinking, finalAnswer: context };
}


// --- API Route Handler ---
export async function POST(request: NextRequest) {
  try {
    const body: MCPRequest = await request.json();
    const { jsonrpc, id, method, params } = body;

    if (jsonrpc !== '2.0') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32600, message: 'Invalid Request' }
      } as MCPResponse);
    }

    const supabase = await createSupabaseServerClient();

    switch (method) {
      case 'initialize':
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'promptpilot-mcp',
              version: '1.0.0'
            }
          }
        } as MCPResponse);

      case 'tools/list':
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: { tools }
        } as MCPResponse);

      case 'tools/call':
        if (!params || typeof params !== 'object' || !('name' in params) || !('arguments' in params)) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Invalid params: missing name or arguments' }
          } as MCPResponse);
        }
        
        const { name, arguments: args } = params as unknown as MCPToolCallParams;
        
        switch (name) {
          case 'list_prompts': {
            const { data: prompts, error } = await supabase
              .from('prompts')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (error) {
              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                error: { code: -32000, message: `Database error listing prompts: ${error.message}` }
              } as MCPResponse);
            }
            
            return NextResponse.json({
              jsonrpc: '2.0',
              id,
              result: { prompts: prompts || [] }
            } as MCPResponse);
          }

          case 'get_prompt': {
            if (typeof args.id !== 'number') {
              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                error: { code: -32602, message: 'Invalid arguments: id must be a number' }
              } as MCPResponse);
            }
            
            const { data: prompt, error: promptError } = await supabase
              .from('prompts')
              .select('*')
              .eq('id', args.id)
              .single();
            
            if (promptError) {
              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                error: { code: -32001, message: `Database error getting prompt: ${promptError.message}` }
              } as MCPResponse);
            }
            
            return NextResponse.json({
              jsonrpc: '2.0',
              id,
              result: { prompt }
            } as MCPResponse);
          }

          case 'search_prompts': {
            if (typeof args.query !== 'string') {
              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                error: { code: -32602, message: 'Invalid arguments: query must be a string' }
              } as MCPResponse);
            }
            
            const limit = typeof args.limit === 'number' ? args.limit : 10;
            
            const { data: searchResults, error: searchError } = await supabase
              .from('prompts')
              .select('*')
              .or(`title.ilike.%${args.query}%,content.ilike.%${args.query}%`)
              .limit(limit)
              .order('created_at', { ascending: false });
            
            if (searchError) {
              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                error: { code: -32002, message: `Database error searching prompts: ${searchError.message}` }
              } as MCPResponse);
            }
            
            return NextResponse.json({
              jsonrpc: '2.0',
              id,
              result: { prompts: searchResults || [] }
            } as MCPResponse);
          }

          case 'create_execution_plan': {
            if (typeof args.task !== 'string') {
              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                error: { code: -32602, message: 'Invalid arguments: task must be a string' }
              } as MCPResponse);
            }
            
            try {
              const executionPlan = await createExecutionPlan(args.task);
              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                result: executionPlan
              } as MCPResponse);
            } catch(e: unknown) {
              const errorMessage = e instanceof Error ? e.message : 'Failed to create execution plan.';
              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                error: { code: -32003, message: errorMessage }
              } as MCPResponse);
            }
          }

          case 'execute_prompt_chain': {
            if (!Array.isArray(args.prompts)) {
              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                error: { code: -32602, message: 'Invalid arguments: prompts must be an array' }
              } as MCPResponse);
            }
            
            const { thinking, finalAnswer } = await executePromptChain(args.prompts as Prompt[]);
            return NextResponse.json({
              jsonrpc: '2.0',
              id,
              result: { thinking, finalAnswer }
            } as MCPResponse);
          }

          default:
            return NextResponse.json({
              jsonrpc: '2.0',
              id,
              error: { code: -32601, message: 'Method not found' }
            } as MCPResponse);
        }

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: 'Method not found' }
        } as MCPResponse);
    }
  } catch (error) {
    console.error('MCP API Error:', error);
    return NextResponse.json({
      jsonrpc: '2.0',
      id: 'error',
      error: { code: -32603, message: 'Internal error' }
    } as MCPResponse);
  }
} 