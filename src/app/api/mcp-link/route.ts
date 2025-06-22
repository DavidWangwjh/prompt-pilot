import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';

type Prompt = Database['public']['Tables']['prompts']['Row'];

const FAKE_USER_ID = 'f9df1fa1-1a38-494c-917e-ca3a3b80b75d';

// Task analysis patterns
const TASK_PATTERNS = {
  research: /research|analyze|investigate|study|explore/i,
  writing: /write|compose|create|draft|author/i,
  summary: /summarize|summarise|condense|brief|recap/i,
  coding: /code|program|develop|build|implement|debug/i,
};

// Task breakdown strategies
const TASK_BREAKDOWN = {
  research: ['background_research', 'deep_analysis', 'synthesis', 'summary'],
  writing: ['outline', 'draft', 'review', 'polish'],
  coding: ['planning', 'implementation', 'testing', 'documentation'],
  planning: ['goal_setting', 'strategy_development', 'timeline', 'execution_plan'],
  problem_solving: ['problem_analysis', 'solution_generation', 'evaluation', 'implementation'],
  creative: ['inspiration', 'ideation', 'development', 'refinement']
};

interface TaskAnalysis {
  primaryType: string;
  secondaryTypes: string[];
  complexity: 'low' | 'medium' | 'high';
  estimatedSteps: number;
  keywords: string[];
  breakdown: string[];
}

interface ExecutionPlan {
  task: string;
  analysis: TaskAnalysis;
  prompts: Array<{
    id: number;
    title: string;
    content: string;
    order: number;
    step: string;
    instructions: string;
  }>;
  totalSteps: number;
  estimatedTime: string;
  executionInstructions: string;
}

async function analyzeTask(task: string) {
  console.log('[MCP] Analyzing task:', task);
  const keywords = task.toLowerCase().split(/\s+/).filter(word => word.length > 3);
  const primaryType = Object.keys(TASK_PATTERNS).find(type => 
    (TASK_PATTERNS as any)[type].test(task)
  ) || 'general';
  
  const analysis = {
    primaryType,
    keywords,
    estimatedSteps: primaryType === 'research' ? 3 : 2,
  };
  console.log('[MCP] Task analysis result:', analysis);
  return analysis;
}

async function findSuitablePrompts(analysis: { primaryType: string; keywords: string[] }, userPrompts: Prompt[]) {
  console.log(`[MCP] Finding suitable prompts for type: ${analysis.primaryType}`);
  
  // Simple filtering logic
  const suitablePrompts = userPrompts.filter(prompt => {
    const title = prompt.title.toLowerCase();
    const content = prompt.content.toLowerCase();
    
    // Check if prompt matches primary task type or keywords
    const typeMatch = title.includes(analysis.primaryType) || content.includes(analysis.primaryType);
    const keywordMatch = analysis.keywords.some(kw => title.includes(kw) || content.includes(kw));

    return typeMatch || keywordMatch;
  });

  console.log(`[MCP] Found ${suitablePrompts.length} potentially suitable prompts.`);
  // Simple ordering: just take the first few matches
  return suitablePrompts.slice(0, 3);
}

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

  const orderedPrompts = await findSuitablePrompts(analysis, userPrompts);

  if (orderedPrompts.length === 0) {
    console.warn('[MCP] Could not find any suitable prompts for the task.');
    throw new Error('Could not find any suitable prompts in your vault for this task. Try adding more relevant prompts.');
  }

  console.log(`[MCP] Selected ${orderedPrompts.length} prompts for the execution plan.`);

  return {
    task,
    analysis,
    prompts: orderedPrompts.map((prompt, index) => ({
      ...prompt,
      order: index + 1,
    })),
  };
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
            tools: [{
              name: 'run_prompt_workflow',
              description: "Analyzes a user's task, finds suitable prompts from the vault, and creates an execution plan.",
              inputSchema: {
                type: 'object',
                properties: { task: { type: 'string', description: 'The task to accomplish.' } },
                required: ['task']
              }
            }]
          }
        });

      case 'tools/call':
        if (params.name === 'run_prompt_workflow') {
          const executionPlan = await createExecutionPlan(params.arguments.task);
          return NextResponse.json({ jsonrpc: '2.0', id, result: executionPlan });
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