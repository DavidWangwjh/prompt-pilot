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
    actions: string[];
    keywords: string[];
  };
  prompts: Prompt[];
}

interface McpResult {
  finalAnswer: string;
  executionPlan: ExecutionPlan;
}

// --- Components ---
const ExecutionPlanDisplay = ({ plan, finalAnswer, status }: { plan: ExecutionPlan, finalAnswer: string | null, status: 'executing' | 'done' }) => {
  return (
    <div className="space-y-8">
      {/* Final Answer */}
      {finalAnswer && status === 'done' && (
        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 shadow-lg">
          <h2 className="text-xl font-bold text-green-900 mb-3">Final Result</h2>
          <div className="bg-white p-4 rounded-md text-gray-800 whitespace-pre-wrap">{finalAnswer}</div>
        </div>
      )}
      
      {/* Status Indicator */}
      {status === 'executing' && (
          <div className="flex items-center justify-center gap-3 text-blue-600 py-4">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-lg">Executing prompts...</span>
          </div>
      )}

      {/* Execution Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700">Execution Details</h3>
        <div className="mt-2 bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-600">
              <strong>Task:</strong> {plan.task} <br />
              <strong>Detected Actions:</strong> <span className="font-medium capitalize text-purple-600">{plan.analysis.actions.join(', ')}</span> | 
              <strong>Keywords:</strong> <span className="font-medium text-purple-600">{plan.analysis.keywords.join(', ')}</span>
            </p>
        </div>
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
  const [task, setTask] = useState('deep research AI safety, and make summary');
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'planning' | 'executing' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const runTask = async (taskQuery: string) => {
    // 1. Reset states and start planning
    setStatus('planning');
    setError(null);
    setExecutionPlan(null);
    setFinalAnswer(null);

    try {
      // 2. Create the execution plan
      const planResponse = await fetch('/api/mcp-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: { name: 'create_execution_plan', arguments: { task: taskQuery } }
        }),
      });
      const planData = await planResponse.json();
      if (planData.error) throw new Error(planData.error.message);
      
      setExecutionPlan(planData.result);

      // 3. Execute the plan
      setStatus('executing');
      const execResponse = await fetch('/api/mcp-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: { name: 'execute_prompt_chain', arguments: { prompts: planData.result.prompts } }
        }),
      });
      const execData = await execResponse.json();
      if (execData.error) throw new Error(execData.error.message);

      setFinalAnswer(execData.result.finalAnswer);
      setStatus('done');

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error("MCP Execution Error:", message);
      setError(message);
      setStatus('error');
    }
  };

  const isLoading = status === 'planning' || status === 'executing';

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
            placeholder="Enter a task (e.g., 'deep research AI safety, and make summary')"
            className="border border-gray-300 rounded-md p-3 flex-grow focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => runTask(task)}
            disabled={isLoading || !task.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition-all inline-flex items-center justify-center gap-2 font-medium"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={16} />}
            {status === 'planning' ? 'Planning...' : status === 'executing' ? 'Executing...' : 'Run Task'}
          </button>
        </div>
      </div>
      
      <div className="mt-8">
        {status === 'planning' && (
          <div className="flex items-center justify-center gap-3 text-gray-600 py-12">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-lg">Analyzing task and creating execution plan...</span>
          </div>
        )}

        {status === 'error' && error && (
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
            <ExecutionPlanDisplay plan={executionPlan} finalAnswer={finalAnswer} status={status as 'executing' | 'done'} />
          </div>
        )}
      </div>
    </div>
  );
} 