'use client';

import { useState } from 'react';
import { Bot, Loader2, Send } from 'lucide-react';

export default function PlaygroundView() {
    const [prompt, setPrompt] = useState('');
    const [context, setContext] = useState('');
    const [model, setModel] = useState('GPT-4');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRun = async () => {
        setIsLoading(true);
        setResponse('');
        
        // Simulate an API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const aiResponse = `This is a simulated response from ${model} for the prompt: "${prompt}".\n\nWith the provided context, I can generate a more detailed and accurate answer. For example, if the context was about "React server components", I would explain how they work, their benefits, and provide code examples.`;
        
        setResponse(aiResponse);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
                {/* Input Section */}
                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="model-select" className="text-sm font-medium text-gray-700">Model</label>
                        <select
                            id="model-select"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            disabled={isLoading}
                        >
                            <option>GPT-4</option>
                            <option>Claude</option>
                            <option>Gemini</option>
                        </select>
                    </div>
                    <div className="flex-1 flex flex-col">
                         <label htmlFor="prompt-input" className="text-sm font-medium text-gray-700">Prompt</label>
                        <textarea
                            id="prompt-input"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter your prompt here..."
                            className="mt-1 flex-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex-1 flex flex-col">
                         <label htmlFor="context-input" className="text-sm font-medium text-gray-700">Context (Optional)</label>
                        <textarea
                            id="context-input"
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="Add any relevant context..."
                            className="mt-1 flex-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Output Section */}
                <div className="flex flex-col bg-white border border-gray-200 rounded-md">
                    <div className="p-4 border-b flex items-center gap-2">
                        <Bot size={20} className="text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-800">AI Response</h2>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto">
                        {isLoading && (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="animate-spin text-blue-600" size={40} />
                            </div>
                        )}
                        {response && !isLoading && (
                            <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans">{response}</pre>
                        )}
                        {!response && !isLoading && (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">The AI&apos;s response will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Action Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleRun}
                    disabled={isLoading || !prompt}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                            Running...
                        </>
                    ) : (
                        <>
                           <Send className="-ml-1 mr-2 h-5 w-5" /> 
                           Run Prompt
                        </>
                    )}
                </button>
            </div>
        </div>
    );
} 