import { NextResponse } from 'next/server';
import { prompts } from '@/lib/prompts';
import { workflows } from '@/lib/workflows';
import Fuse from 'fuse.js';

const promptFuse = new Fuse(prompts, {
  keys: ['title', 'description', 'tags'],
  includeScore: true,
  threshold: 0.4, 
});

const workflowFuse = new Fuse(workflows, {
  keys: ['name', 'description'],
  includeScore: true,
  threshold: 0.4,
});

export async function GET() {
  console.log('GET request received');
  return NextResponse.json({ 
    message: 'MCP endpoint - use POST for MCP protocol requests',
    availableMethods: ['POST']
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request:', JSON.stringify(body, null, 2));
    
    // Handle MCP protocol messages
    if (body.jsonrpc === '2.0') {
      const { method, params, id } = body;
      console.log('MCP method:', method, 'id:', id);
      
      switch (method) {
        case 'initialize':
          console.log('Handling initialize');
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {}
              },
              serverInfo: {
                name: 'promptpilot',
                version: '1.0.0'
              }
            }
          });
          
        case 'notifications/initialized':
          console.log('Handling notifications/initialized');
          return NextResponse.json({
            jsonrpc: '2.0',
            result: null
          });
          
        case 'tools/list':
          console.log('Handling tools/list');
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            result: {
              tools: [
                {
                  name: 'get_best_prompt',
                  description: 'Get the best matching prompt from the vault based on a query',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      query: {
                        type: 'string',
                        description: 'The search query to find the best prompt'
                      }
                    },
                    required: ['query']
                  }
                }
              ]
            }
          });
          
        case 'tools/call':
          console.log('Handling tools/call', params);
          const { name, arguments: args } = params;
          
          if (name === 'get_best_prompt') {
            const { query } = args;
            
            if (!query) {
              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                error: {
                  code: -32602,
                  message: 'Query parameter is required'
                }
              });
            }

            // First, search for a matching workflow
            const workflowResults = workflowFuse.search(query);

            if (workflowResults.length > 0) {
              const workflow = workflowResults[0].item;
              const chainedPrompts = workflow.promptIds.map((id: string) => prompts.find((p: { id: string }) => p.id === id)).filter(Boolean);

              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                result: {
                  content: [{
                    type: 'prompt_chain',
                    chain: chainedPrompts
                  }]
                }
              });
            }

            // If no workflow is found, search for a single prompt
            const promptResults = promptFuse.search(query);
            
            if (promptResults.length > 0) {
              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                result: {
                  content: [
                    {
                      type: 'single_prompt',
                      prompt: promptResults[0].item
                    }
                  ]
                }
              });
            } else {
              return NextResponse.json({
                jsonrpc: '2.0',
                id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: 'No matching prompt found'
                    }
                  ]
                }
              });
            }
          }
          break;
      }
    }
    
    // Fallback for simple JSON requests (for testing)
    const { query } = body;
    if (query) {
      const results = promptFuse.search(query);
      if (results.length > 0) {
        return NextResponse.json(results[0].item);
      } else {
        return NextResponse.json({ error: 'No matching prompt found' }, { status: 404 });
      }
    }
    
    console.log('Invalid request - no jsonrpc or query found');
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error in MCP endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 