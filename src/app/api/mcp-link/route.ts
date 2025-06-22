import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Fuse from 'fuse.js';

// Define the prompt type for search
interface SearchPrompt {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  likes: number;
  model: string;
}

// Initialize Fuse instance for prompt search
let promptFuse: Fuse<SearchPrompt> | null = null;

// Function to initialize prompt search
async function initializePromptSearch() {
  if (promptFuse) return; // Already initialized
  
  try {
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('is_public', true);
    
    if (error) {
      console.error('Error fetching prompts for search:', error);
      return;
    }
    
    // Transform database prompts to match expected format
    const transformedPrompts: SearchPrompt[] = (prompts || []).map(p => ({
      id: p.id.toString(),
      title: p.title,
      description: p.content.substring(0, 100) + '...', // Use content as description
      content: p.content,
      tags: p.tags,
      likes: p.likes || 0,
      model: p.model
    }));
    
    promptFuse = new Fuse(transformedPrompts, {
      keys: ['title', 'description', 'tags'],
      includeScore: true,
      threshold: 0.4,
    });
  } catch (error) {
    console.error('Error initializing prompt search:', error);
    // Initialize with empty array if Supabase is not available
    promptFuse = new Fuse([], {
      keys: ['title', 'description', 'tags'],
      includeScore: true,
      threshold: 0.4,
    });
  }
}

export async function GET() {
  console.log('GET request received');
  return NextResponse.json({ 
    message: 'MCP endpoint - use POST for MCP protocol requests',
    availableMethods: ['POST']
  });
}

export async function POST(request: Request) {
  try {
    // Initialize prompt search if not already done
    await initializePromptSearch();
    
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

            // Search for a single prompt from database
            if (promptFuse) {
              const promptResults = promptFuse.search(query);
              
              if (promptResults.length > 0) {
                const bestMatch = promptResults[0].item as SearchPrompt;
                return NextResponse.json({
                  jsonrpc: '2.0',
                  id,
                  result: {
                    content: [
                      {
                        type: 'single_prompt',
                        prompt: {
                          id: bestMatch.id,
                          title: bestMatch.title,
                          description: bestMatch.description,
                          content: bestMatch.content,
                          tags: bestMatch.tags,
                          model: bestMatch.model
                        }
                      }
                    ]
                  }
                });
              }
            }
            
            return NextResponse.json({
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: 'No matching prompt found for your query. Try rephrasing your request or be more specific about what you need.'
                  }
                ]
              }
            });
          }
          break;
      }
    }
    
    // Fallback for simple JSON requests (for testing)
    const { query } = body;
    if (query && promptFuse) {
      const results = promptFuse.search(query);
      if (results.length > 0) {
        const bestMatch = results[0].item as SearchPrompt;
        return NextResponse.json({
          id: bestMatch.id,
          title: bestMatch.title,
          description: bestMatch.description,
          content: bestMatch.content,
          tags: bestMatch.tags,
          model: bestMatch.model
        });
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