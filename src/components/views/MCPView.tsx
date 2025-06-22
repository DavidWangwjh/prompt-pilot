"use client";

import { useState } from 'react';
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

// Example MCP JSON config
const exampleMCPConfig = {
  "mcpServers": {
    "prompt-pilot": {
      "command": "npx",
      "args": ["@prompt-pilot/mcp-server"],
      "env": {
        "PROMPT_PILOT_API_KEY": "your-api-key-here"
      }
    }
  }
};

const prettyConfig = JSON.stringify(exampleMCPConfig, null, 2);
const rawConfig = JSON.stringify(exampleMCPConfig);

export default function MCPView() {
  const [viewMode, setViewMode] = useState<'pretty' | 'raw'>('pretty');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = viewMode === 'pretty' ? prettyConfig : rawConfig;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MCP Configuration</h1>
            <p className="text-sm text-gray-600 mt-1">
              Model Context Protocol configuration for PromptPilot integration
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
              <div className="flex items-center bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setViewMode('pretty')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === 'pretty'
                      ? 'bg-white text-gray-900 shadow-sm scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Pretty
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === 'raw'
                      ? 'bg-white text-gray-900 shadow-sm scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Raw
                </button>
              </div>
            </div>
            
            <button
              onClick={handleCopy}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 btn-hover w-full sm:w-auto"
            >
              {copied ? (
                <>
                  <ClipboardDocumentCheckIcon className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* JSON Display */}
          <div className="p-4">
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96 border border-gray-700">
              <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap leading-relaxed">
                {viewMode === 'pretty' ? prettyConfig : rawConfig}
              </pre>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">How to use:</h3>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li className="hover:text-gray-800 transition-colors duration-200">
                Copy the configuration above
              </li>
              <li className="hover:text-gray-800 transition-colors duration-200">
                Add it to your MCP client configuration file
              </li>
              <li className="hover:text-gray-800 transition-colors duration-200">
                Replace <code className="bg-gray-200 px-1 rounded text-gray-800">your-api-key-here</code> with your actual API key
              </li>
              <li className="hover:text-gray-800 transition-colors duration-200">
                Restart your MCP client to load the new configuration
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 