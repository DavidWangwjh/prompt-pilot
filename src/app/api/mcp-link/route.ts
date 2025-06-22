import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { workflows } from '@/lib/workflows';
import Fuse from 'fuse.js';

// Initialize Fuse.js for fuzzy searching workflows
const workflowFuse = new Fuse(workflows, {
  keys: ['name', 'description', 'category'],
  includeScore: true,
  threshold: 0.4,
});

const FAKE_USER_ID = 'f9df1fa1-1a38-494c-917e-ca3a3b80b75d';

// --- MCP Tools Implementation ---

async function runPromptWorkflow(task: string) {
  // 1. Find the best matching workflow for the given task.
  const workflowResults = workflowFuse.search(task);
  
  if (workflowResults.length === 0) {
    // If no workflow is found, we could potentially fall back to finding a single prompt.
    // For now, we'll indicate that no suitable workflow was found.
    return {
      type: 'no_workflow_found',
      message: 'Could not find a suitable workflow for your task. Please try rephrasing.'
    };
  }

  const bestWorkflow = workflowResults[0].item;

  // 2. Retrieve the full prompt objects for the workflow from the database.
  // This ensures we get the most up-to-date prompt content from the user's vault.
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', FAKE_USER_ID)
    .in('id', bestWorkflow.promptIds);

  if (error) {
    console.error('Error fetching prompts for workflow:', error);
    throw new Error('Failed to retrieve prompts for the workflow.');
  }

  // 3. Order the prompts correctly according to the workflow definition.
  const orderedPrompts = bestWorkflow.promptIds.map(id => 
    prompts.find(p => p.id === id)
  ).filter(Boolean); // Filter out any nulls if a prompt wasn't found

  // 4. Return the structured prompt chain.
  return {
    type: 'prompt_chain',
    workflow: {
      name: bestWorkflow.name,
      description: bestWorkflow.description,
    },
    prompts: orderedPrompts,
  };
}

// --- API Route Handler ---

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.jsonrpc !== '2.0') {
      return NextResponse.json({ error: 'Invalid request: Not a JSON-RPC 2.0 request' }, { status: 400 });
    }

    const { method, params, id } = body;
    
    switch (method) {
      case 'tools/list':
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              {
                name: 'run_prompt_workflow',
                description: "Analyzes a user's task and returns an executable chain of prompts from the user's vault to accomplish the task.",
                inputSchema: {
                  type: 'object',
                  properties: {
                    task: {
                      type: 'string',
                      description: 'The high-level task the user wants to accomplish. For example: "deep research on AI safety and make a summary."'
                    },
                  },
                  required: ['task']
                }
              }
            ]
          }
        });

      case 'tools/call':
        if (params.name === 'run_prompt_workflow') {
          const result = await runPromptWorkflow(params.arguments.task);
          return NextResponse.json({ jsonrpc: '2.0', id, result });
        }
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: 'Method not found' }
        });

      // Default cases for initialize, etc. can be added here if needed.
      case 'initialize':
      case 'notifications/initialized':
          return NextResponse.json({ jsonrpc: '2.0', id, result: null });
          
      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: 'Method not found' }
        });
    }
  } catch (error) {
    console.error('Error in MCP endpoint:', error);
    const message = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: message 
    }, { status: 500 });
  }
} 