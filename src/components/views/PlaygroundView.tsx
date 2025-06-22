'use client';

import { useState } from 'react';
import { Bot, Loader2, Zap, Scale, Trophy, Award, Lightbulb } from 'lucide-react';

interface Scores {
  clarity: number;
  engagement: number;
  creativity: number;
  effectiveness: number;
  specificity: number;
}

interface JudgeResult {
  feedback: string;
  scores: { promptA: Scores, promptB: Scores };
  winner: string;
  reasoning: string;
  recommendations: {
    promptA: string[];
    promptB: string[];
  };
  overallAssessment: string;
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
    const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRunAndJudge = async () => {
        setIsLoading(true);
        setResponseA('');
        setResponseB('');
        setJudgeResult(null);
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
            setJudgeResult({
                feedback: data.feedback,
                scores: data.scores,
                winner: data.winner,
                reasoning: data.reasoning,
                recommendations: data.recommendations,
                overallAssessment: data.overallAssessment
            });

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderResponseArea = (title: string, response: string, isWinner: boolean = false) => (
        <div className={`flex flex-col bg-white border rounded-lg shadow-sm ${isWinner ? 'border-green-300 ring-2 ring-green-200' : 'border-gray-200'}`}>
            <div className={`p-4 border-b flex items-center gap-2 rounded-t-lg ${isWinner ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                <Bot size={20} className={isWinner ? 'text-green-600' : 'text-gray-600'} />
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                {isWinner && (
                    <div className="ml-auto flex items-center gap-1 text-green-600">
                        <Trophy size={16} />
                        <span className="text-sm font-medium">Winner</span>
                    </div>
                )}
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
            { label: 'Effectiveness', value: scoreData.effectiveness, color: 'bg-orange-500' },
            { label: 'Specificity', value: scoreData.specificity, color: 'bg-red-500' },
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

    const renderRecommendations = (recommendations: string[], promptName: string) => (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Lightbulb size={16} />
                {promptName} Recommendations
            </h4>
            <ul className="space-y-1">
                {recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{rec}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="flex flex-col h-full gap-6 p-1 md:p-4 bg-gray-50/50">
            <header className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Prompt Playground</h1>
                    <p className="text-gray-500 mt-1 text-sm">A/B test two prompts to see which one performs better with AI-powered analysis.</p>
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
                {renderResponseArea('Response A', responseA, judgeResult?.winner === 'promptA')}
                {renderResponseArea('Response B', responseB, judgeResult?.winner === 'promptB')}
            </div>

            {(isLoading || judgeResult) && !error && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-4">
                    <div className="p-4 border-b flex items-center gap-2 bg-gray-50 rounded-t-lg">
                        <Scale size={20} className="text-green-700" />
                        <h2 className="text-lg font-semibold text-gray-800">AI Judge&apos;s Analysis</h2>
                    </div>
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full min-h-[150px]">
                               <p className="text-gray-500">AI Judge is analyzing the responses...</p>
                           </div>
                        ) : (
                            judgeResult && (
                                <div className="space-y-6">
                                    {/* Winner Announcement */}
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <Award className="text-green-600" size={24} />
                                            <div>
                                                <h3 className="font-semibold text-gray-800">
                                                    Winner: {judgeResult.winner === 'promptA' ? 'Prompt A' : 'Prompt B'}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">{judgeResult.reasoning}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overall Assessment */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-semibold mb-2 text-gray-700">Overall Assessment</h3>
                                        <p className="text-gray-600 text-sm">{judgeResult.overallAssessment}</p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-1 space-y-6">
                                            <div>
                                                <h3 className="font-semibold text-center mb-3 text-gray-700">Prompt A Scores</h3>
                                                {renderScores(judgeResult.scores.promptA)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-center mb-3 text-gray-700">Prompt B Scores</h3>
                                                {renderScores(judgeResult.scores.promptB)}
                                            </div>
                                        </div>
                                        <div className="lg:col-span-2 space-y-6">
                                            <div>
                                                <h3 className="font-semibold mb-3 text-gray-700">Detailed Analysis</h3>
                                                <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: judgeResult.feedback.replace(/\n/g, '<br />') }} />
                                            </div>
                                            
                                            {/* Recommendations */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {renderRecommendations(judgeResult.recommendations.promptA, 'Prompt A')}
                                                {renderRecommendations(judgeResult.recommendations.promptB, 'Prompt B')}
                                            </div>
                                        </div>
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