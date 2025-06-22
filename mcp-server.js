#!/usr/bin/env node

const readline = require('readline');
const { spawn } = require('child_process');

// MCP Server that connects to your deployed endpoint
const MCP_ENDPOINT = 'https://mcprompt.vercel.app/api/mcp-link';

// Create readline interface for stdin/stdout
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Send JSON-RPC message
function sendMessage(message) {
  console.log(JSON.stringify(message));
}

// Handle incoming messages
async function handleMessage(message) {
  try {
    const { method, params, id } = message;
    
    switch (method) {
      case 'initialize':
        sendMessage({
          jsonrpc: '2.0',
          id,
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
        break;
        
      case 'tools/list':
        sendMessage({
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              {
                name: 'create_execution_plan',
                description: "Analyzes a user's task and creates a sequential plan of prompts from the user's vault.",
                inputSchema: {
                  type: 'object',
                  properties: { 
                    task: { 
                      type: 'string', 
                      description: 'The task to accomplish.' 
                    } 
                  },
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
        break;
        
      case 'tools/call':
        try {
          const response = await fetch(MCP_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: Date.now(),
              method: 'tools/call',
              params: params
            })
          });
          
          const result = await response.json();
          sendMessage({
            jsonrpc: '2.0',
            id,
            result: result.result || result
          });
        } catch (error) {
          sendMessage({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32603,
              message: error.message
            }
          });
        }
        break;
        
      default:
        sendMessage({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method '${method}' not found`
          }
        });
    }
  } catch (error) {
    sendMessage({
      jsonrpc: '2.0',
      id: message.id || null,
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
}

// Handle stdin
rl.on('line', (line) => {
  try {
    const message = JSON.parse(line);
    handleMessage(message);
  } catch (error) {
    console.error('Failed to parse message:', error);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  rl.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  rl.close();
  process.exit(0);
}); 