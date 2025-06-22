'use client';

import { useState, useMemo, useEffect } from 'react';
import PromptCard from '@/components/PromptCard';
import { Search, X, ChevronDown, Loader2, ThumbsUp, Copy, Check } from 'lucide-react';
import { useDashboard, Prompt } from '@/context/DashboardContext';
import { supabase } from '@/lib/supabase';

export default function ExploreView() {
    const { savePromptFromExplore, likedPrompts, globalSearchTerm, toggleLike } = useDashboard();
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<string>('All Models');
    const [savingPrompt, setSavingPrompt] = useState<number | null>(null);
    const [showDetailModal, setShowDetailModal] = useState<Prompt | null>(null);
    const [copied, setCopied] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const fetchPrompts = async () => {
            setLoading(true);
            setError(null);
            
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .eq('is_public', true);

            if (error) {
                console.error('Error fetching prompts:', error);
                setError('Failed to load prompts. Please try again later.');
            } else {
                const fetchedPrompts: Prompt[] = (data || []).map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    content: p.content,
                    tags: p.tags,
                    model: p.model,
                    comments: p.comments || 0,
                    likes: p.likes || 0,
                }));
                setPrompts(fetchedPrompts);
            }
            setLoading(false);
        };

        fetchPrompts();
    }, []);

    const allModels = useMemo(() => {
        return ['All Models', ...new Set(prompts.map(p => p.model))];
    }, [prompts]);
    
    // Create dynamic prompts that include like state
    const dynamicPrompts = useMemo(() => {
        return prompts.map(prompt => ({
            ...prompt,
            likes: prompt.likes + (likedPrompts.has(prompt.id) ? 1 : 0),
        }));
    }, [prompts, likedPrompts]);

    const filteredPrompts = useMemo(() => {
        let prompts = dynamicPrompts;

        // Apply global search filter only if there's a search term
        if (globalSearchTerm.trim()) {
            const searchLower = globalSearchTerm.trim().toLowerCase();
            prompts = prompts.filter(prompt => 
                prompt.title.toLowerCase().includes(searchLower) ||
                prompt.content.toLowerCase().includes(searchLower) ||
                prompt.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                prompt.model.toLowerCase().includes(searchLower)
            );
        }

        // Apply model filter
        if (selectedModel !== 'All Models') {
            prompts = prompts.filter(p => p.model === selectedModel);
        }

        // Sort by likes (most liked first)
        prompts.sort((a, b) => b.likes - a.likes);

        return prompts;
    }, [dynamicPrompts, globalSearchTerm, selectedModel]);

    // Get top 3 and rest of prompts
    const top3Prompts = filteredPrompts.slice(0, 3);
    const restPrompts = filteredPrompts.slice(3);
    
    const handleSavePrompt = async (prompt: Prompt) => {
        setSavingPrompt(prompt.id);
        try {
            const promptWithoutId = {
                title: prompt.title,
                content: prompt.content,
                tags: prompt.tags,
                likes: prompt.likes,
                model: prompt.model,
                is_public: prompt.is_public
            };
            await savePromptFromExplore(promptWithoutId);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            console.log('Prompt saved successfully!');
        } catch (error) {
            console.error('Failed to save prompt:', error);
        } finally {
            setSavingPrompt(null);
        }
    };

    const handleCopy = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleLike = (e: React.MouseEvent, promptId: number) => {
        e.stopPropagation();
        toggleLike(promptId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-full text-center">
                <X className="text-red-500 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-800">An Error Occurred</h3>
                <p className="text-gray-500 mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-8">
            {/* Model Filter */}
            <div className="flex justify-center">
                <div className="relative w-64">
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                    >
                        {allModels.map(model => (
                            <option key={model} value={model}>{model}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
            </div>

            {/* Top 3 Featured Section */}
            {top3Prompts.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900 text-center">⭐ Top 3 Picks ⭐</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {top3Prompts.map((prompt) => (
                            <PromptCard
                                key={prompt.id}
                                {...prompt}
                                source="explore"
                                view="grid"
                                onSave={() => handleSavePrompt(prompt)}
                                isSaving={savingPrompt === prompt.id}
                                size="large"
                                variant="featured"
                                is_public={prompt.is_public || false}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Rest of Prompts Grid */}
            {restPrompts.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">More Prompts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {restPrompts.map((prompt) => (
                            <PromptCard
                                key={prompt.id}
                                {...prompt}
                                source="explore"
                                view="grid" 
                                onSave={() => handleSavePrompt(prompt)}
                                isSaving={savingPrompt === prompt.id}
                                size="small"
                                is_public={prompt.is_public || false}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* No Results */}
            {filteredPrompts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-gray-400 mb-4">
                        <Search size={48} />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No prompts found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or model filter</p>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 backdrop-blur-xs bg-opacity-10 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{showDetailModal.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">Model: {showDetailModal.model}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Tags */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {showDetailModal.tags.map((tag) => (
                                        <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Prompt Content */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-gray-900">Prompt Content</h3>
                                    <button
                                        onClick={() => handleCopy(showDetailModal.content)}
                                        className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 btn-hover"
                                    >
                                        {copied ? (
                                            <>
                                                <Copy size={16} />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={16} />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap leading-relaxed">{showDetailModal.content}</pre>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <button 
                                    className={`flex items-center gap-1 transition-all duration-200 cursor-pointer ${
                                        likedPrompts.has(showDetailModal.id)
                                            ? 'text-blue-600 hover:text-blue-700' 
                                            : 'text-gray-500 hover:text-blue-600'
                                    }`}
                                    onClick={(e) => handleLike(e, showDetailModal.id)}
                                >
                                    <ThumbsUp 
                                        size={16} 
                                        className={`${
                                            likedPrompts.has(showDetailModal.id) ? 'fill-current' : ''
                                        }`} 
                                    />
                                    <span>{showDetailModal.likes} likes</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
                    <Check size={20} />
                    <span className="font-medium">This prompt has been saved to your vault!</span>
                </div>
            )}
        </div>
    );
}