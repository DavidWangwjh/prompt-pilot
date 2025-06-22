'use client';

import { useState } from 'react';
import { Bot, ChevronDown, ChevronUp, Loader2, Workflow, Send } from 'lucide-react';

const McpResultDisplay = ({ result }: { result: any }) => {
    if (!result || !result.result) {
        return null;
    }

    const { type, workflow, prompts, message } = result.result;

    if (type === 'no_workflow_found') {
        return (
            <div className="text-center text-gray-500 py-4">
                <p>{message}</p>
            </div>
        );
    }
    
    if (type === 'prompt_chain' && workflow && prompts) {
        return (
            <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900">{workflow.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                </div>
                <div className="space-y-3">
                    {prompts.map((prompt: any, index: number) => (
                        <div key={prompt.id} className="bg-white border border-gray-200 rounded-lg p-4 relative">
                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{index + 1}</span>
                            <div className="ml-8">
                                <h4 className="font-semibold text-gray-800">{prompt.title}</h4>
                                <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-50 p-2 rounded">{prompt.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    return <p className="text-gray-500">The result format is not recognized.</p>;
};


export default function McpTestPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const runTest = async (currentQuery: string) => {
    setLoading(true);
    setResult(null);
    setQuery(currentQuery);

    try {
      const body = {
        jsonrpc: '2.0', id: 1, method: 'tools/call',
        params: { name: 'run_prompt_workflow', arguments: { task: currentQuery } }
      };
      
      const response = await fetch('/api/mcp-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setResult({ error: message });
    } finally {
      setLoading(false);
    }
  }

  const testExamples = [
    { name: 'Deep Research Task', query: 'deep research on AI safety and make a summary' },
    { name: 'Creative Writing', query: 'write a creative story about space exploration' },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-6">
        <Workflow className="mx-auto h-12 w-12 text-blue-600" />
        <h1 className="text-3xl font-bold mt-2">MCP Workflow Engine</h1>
        <p className="text-gray-500 mt-1">Enter a high-level task and see the prompt chain MCP prepares for execution.</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Quick Test Examples:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {testExamples.map((example, index) => (
            <button key={index} onClick={() => runTest(example.query)} disabled={loading} className="p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all">
              <div className="font-medium text-sm">{example.name}</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); runTest(query); }} className="flex gap-2 mb-4">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter your task..." className="border rounded-md p-2 flex-grow"/>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition-all inline-flex items-center gap-2">
          {loading ? <><Loader2 className="animate-spin" size={20}/> Building...</> : <><Send size={16}/>Run Workflow</>}
        </button>
      </form>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Execution Plan:</h2>
        {loading && <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /><span>Finding best workflow...</span></div>}
        {result && !loading && (
          <div className="border rounded-lg bg-gray-50/50 p-4">
            <McpResultDisplay result={result} />

            <div className="mt-4 border-t pt-4">
                <button onClick={() => setShowRaw(!showRaw)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                    {showRaw ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span>{showRaw ? 'Hide' : 'Show'} Raw JSON Response</span>
                </button>
                {showRaw && (
                     <pre className="bg-gray-900 text-white p-4 rounded-md border overflow-auto text-xs mt-2">
                        <code>{JSON.stringify(result, null, 2)}</code>
                    </pre>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}