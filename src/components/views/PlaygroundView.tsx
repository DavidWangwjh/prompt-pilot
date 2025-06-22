'use client';

import { useState } from 'react';
import { Bot, Loader2, Zap, Scale } from 'lucide-react';

interface Scores {
  clarity: number;
  engagement: number;
  creativity: number;
}

const ScoreBar = ({ score, colorClass }: { score: number; colorClass: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
            className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} 
            style={{ width: `${score}%` }}
        ></div>
    </div>
);

export default function PlaygroundView() {
    const [promptA, setPromptA] = useState('Write an engaging opening for a fantasy novel.');
    const [promptB, setPromptB] = useState('Write a mysterious opening scene for a fantasy story set in a tavern.');
    const [model, setModel] = useState('Gemini');
    const [responseA, setResponseA] = useState('');
    const [responseB, setResponseB] = useState('');
    const [judgeFeedback, setJudgeFeedback] = useState('');
    const [scores, setScores] = useState<{ promptA: Scores, promptB: Scores } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRunAndJudge = async () => {
        setIsLoading(true);
        setResponseA('');
        setResponseB('');
        setJudgeFeedback('');
        setScores(null);
        setError(null);

        try {
            const res = await fetch('/api/playground', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_and_judge',
                    promptA,
                    promptB,
                    model,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to get response from server');
            }

            const data = await res.json();
            setResponseA(data.responseA);
            setResponseB(data.responseB);
            setJudgeFeedback(data.feedback);
            setScores(data.scores);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderResponseArea = (title: string, response: string) => (
        <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b flex items-center gap-2 bg-gray-50 rounded-t-lg">
                <Bot size={20} className="text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            </div>
            <div className="p-4 flex-1 overflow-y-auto min-h-[200px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin text-blue-600" size={30} />
                    </div>
                ) : response ? (
                    <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br />') }} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-sm">AI response will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderScores = (scoreData: Scores) => {
        const scoreItems = [
            { label: 'Clarity', value: scoreData.clarity, color: 'bg-blue-500' },
            { label: 'Engagement', value: scoreData.engagement, color: 'bg-green-500' },
            { label: 'Creativity', value: scoreData.creativity, color: 'bg-purple-500' },
        ];
        return (
            <div className="space-y-3">
                {scoreItems.map(item => (
                    <div key={item.label}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium text-gray-600">{item.label}</span>
                            <span className="font-semibold text-gray-800">{item.value}</span>
                        </div>
                        <ScoreBar score={item.value} colorClass={item.color} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6 p-1 md:p-4 bg-gray-50/50">
            <header className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Prompt Playground</h1>
                    <p className="text-gray-500 mt-1 text-sm">A/B test two prompts to see which one performs better.</p>
                </div>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md p-2">
                    <label htmlFor="model-select" className="block text-sm font-medium text-gray-700">
                        Model
                    </label>
                    <select
                        id="model-select"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="pl-3 pr-8 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        disabled={isLoading}
                    >
                        <option>Gemini</option>
                        <option>GPT-4</option>
                        <option>Claude</option>
                    </select>
                </div>
            </header>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="prompt-a" className="block text-sm font-medium text-gray-700 mb-2">Prompt A</label>
                    <textarea
                        id="prompt-a"
                        value={promptA}
                        onChange={(e) => setPromptA(e.target.value)}
                        placeholder="e.g., Write an engaging opening for a fantasy novel."
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[120px]"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="prompt-b" className="block text-sm font-medium text-gray-700 mb-2">Prompt B</label>
                    <textarea
                        id="prompt-b"
                        value={promptB}
                        onChange={(e) => setPromptB(e.target.value)}
                        placeholder="e.g., Write a mysterious opening scene for a fantasy story set in a tavern."
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[120px]"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleRunAndJudge}
                    disabled={isLoading || !promptA || !promptB}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                            Generating & Analyzing...
                        </>
                    ) : (
                        <>
                           <Zap className="-ml-1 mr-2 h-5 w-5" /> 
                           Run & Judge Prompts
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderResponseArea('Response A', responseA)}
                {renderResponseArea('Response B', responseB)}
            </div>

            {(isLoading || judgeFeedback) && !error && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-4">
                    <div className="p-4 border-b flex items-center gap-2 bg-gray-50 rounded-t-lg">
                        <Scale size={20} className="text-green-700" />
                        <h2 className="text-lg font-semibold text-gray-800">AI Judge&apos;s Feedback</h2>
                    </div>
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full min-h-[150px]">
                               <p className="text-gray-500">Waiting for responses to analyze...</p>
                           </div>
                        ) : (
                            scores && judgeFeedback && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-center mb-3 text-gray-700">Prompt A Scores</h3>
                                            {renderScores(scores.promptA)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-center mb-3 text-gray-700">Prompt B Scores</h3>
                                            {renderScores(scores.promptB)}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 md:border-l md:pl-6">
                                        <h3 className="font-semibold mb-2 text-gray-700">Analysis & Recommendation</h3>
                                        <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: judgeFeedback.replace(/\n/g, '<br />') }} />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 