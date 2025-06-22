'use client';

import { useState } from 'react';
import { Bot, ChevronDown, ChevronUp, Loader2, Workflow, Send, Database, AlertTriangle } from 'lucide-react';

// --- Types ---
interface Prompt {
  id: number;
  title: string;
  content: string;
  order: number;
}

interface ExecutionPlan {
  task: string;
  analysis: {
    primaryType: string;
    keywords: string[];
  };
  prompts: Prompt[];
}

// --- Components ---
const ExecutionPlanDisplay = ({ plan }: { plan: ExecutionPlan }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Execution Plan for: <span className="text-blue-600">{plan.task}</span></h2>
        <p className="text-sm text-gray-500">Task Type: <span className="font-medium capitalize">{plan.analysis.primaryType}</span>, Keywords: <span className="font-medium">{plan.analysis.keywords.join(', ')}</span></p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            Prompts Retrieved from Vault
        </h3>
        {plan.prompts.map((prompt) => (
          <div key={prompt.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                  <span className="bg-purple-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{prompt.order}</span>
                  <h4 className="font-semibold text-gray-800">{prompt.title}</h4>
              </div>
              <p className="text-sm text-gray-600 font-mono bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{prompt.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Page ---
export default function McpTestPage() {
  const [task, setTask] = useState('research AI safety');
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTask = async (taskQuery: string) => {
    setLoading(true);
    setError(null);
    setExecutionPlan(null);

    try {
      const body = {
        jsonrpc: '2.0',
        id: Date.now(), // Use a unique ID for each request
        method: 'tools/call',
        params: {
          name: 'run_prompt_workflow',
          arguments: { task: taskQuery }
        }
      };
      
      const response = await fetch('/api/mcp-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'An unknown API error occurred');
      }

      setExecutionPlan(data.result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error("MCP Execution Error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
      <div className="text-center mb-8">
        <Workflow className="mx-auto h-12 w-12 text-blue-600" />
        <h1 className="text-3xl font-bold mt-2 text-gray-900">MCP Vault Retrieval Test</h1>
        <p className="text-gray-600 mt-1">Verify that the MCP can correctly analyze a task and retrieve prompts from your vault.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter a task (e.g., 'research AI safety')"
            className="border border-gray-300 rounded-md p-3 flex-grow focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => executeTask(task)}
            disabled={loading || !task.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition-all inline-flex items-center justify-center gap-2 font-medium"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={16} />}
            {loading ? 'Retrieving...' : 'Run Task'}
          </button>
        </div>
      </div>
      
      <div className="mt-8">
        {loading && (
          <div className="flex items-center justify-center gap-3 text-gray-600 py-12">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-lg">Analyzing task and retrieving prompts from your vault...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md" role="alert">
            <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3"/>
                <div>
                    <p className="font-bold">Error Retrieving Prompts</p>
                    <p>{error}</p>
                </div>
            </div>
          </div>
        )}

        {executionPlan && (
          <div className="bg-gray-50/50 rounded-lg p-6 border border-gray-200">
            <ExecutionPlanDisplay plan={executionPlan} />
          </div>
        )}
      </div>
    </div>
  );
} 