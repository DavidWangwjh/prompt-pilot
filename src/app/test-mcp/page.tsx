'use client';

import { useState } from 'react';

export default function McpTestPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [testType, setTestType] = useState<'simple' | 'mcp'>('simple');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      let response;
      
      if (testType === 'mcp') {
        // Test MCP protocol
        response = await fetch('/api/mcp-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'get_best_prompt',
              arguments: { query }
            }
          }),
        });
      } else {
        // Test simple API
        response = await fetch('/api/mcp-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });
      }
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      if (error instanceof Error) {
        setResult(`Error: ${error.message}`);
      } else {
        setResult('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const testWorkflow = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await fetch('/api/mcp-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'get_prompt_workflow',
            arguments: { query: 'research analysis' }
          }
        }),
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      if (error instanceof Error) {
        setResult(`Error: ${error.message}`);
      } else {
        setResult('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MCP API Test Page</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Test Type:</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="simple"
              checked={testType === 'simple'}
              onChange={(e) => setTestType(e.target.value as 'simple' | 'mcp')}
              className="mr-2"
            />
            Simple API
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="mcp"
              checked={testType === 'mcp'}
              onChange={(e) => setTestType(e.target.value as 'simple' | 'mcp')}
              className="mr-2"
            />
            MCP Protocol
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query (e.g., 'story writing', 'code explanation', 'research')"
          className="border rounded-md p-2 flex-grow"
        />
        <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-400">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="mb-4">
        <button 
          onClick={testWorkflow} 
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
        >
          Test Workflow (Research Analysis)
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Response:</h2>
      <pre className="bg-gray-100 p-4 rounded-md border overflow-auto max-h-96">
        <code>{result}</code>
      </pre>
    </div>
  );
} 