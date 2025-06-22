'use client';

import { useState } from 'react';

export default function McpTestPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      const response = await fetch('/api/mcp-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
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
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          className="border rounded-md p-2 flex-grow"
        />
        <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-400">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      <h2 className="text-xl font-semibold mb-2">Response:</h2>
      <pre className="bg-gray-100 p-4 rounded-md border">
        <code>{result}</code>
      </pre>
    </div>
  );
} 