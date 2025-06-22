'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const mcpConfig = {
  mcpServers: {
    promptpilot: {
      url: "http://localhost:3000/api/mcp-link",
      transport: "http"
    }
  }
};

const configString = JSON.stringify(mcpConfig, null, 2);

export default function MCPConfigView() {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(configString).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">MCP Configuration</h1>
        <p className="text-gray-600 mb-6">
          Copy the configuration below and paste it into your Cursor or Claude Desktop settings to connect to your Prompt Pilot MCP.
        </p>

        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
            <span className="text-sm font-medium text-gray-300">mcp-config.json</span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {hasCopied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-sm text-white overflow-x-auto">
            <code>
              {configString}
            </code>
          </pre>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
            <h3 className="text-lg font-semibold text-blue-800">Note for Production</h3>
            <p className="text-blue-700 mt-2">
                This configuration uses your local development server. When you deploy your application, remember to replace 
                <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded mx-1">http://localhost:3000</code> 
                with your production URL.
            </p>
        </div>
      </div>
    </div>
  );
} 