'use client';

import { useState, useMemo, useEffect } from 'react';
import PromptCard from '@/components/PromptCard';
import { Search, Filter, X, ChevronDown, Loader2 } from 'lucide-react';
import { useDashboard, Prompt } from '@/context/DashboardContext';
import { supabase } from '@/lib/supabase';

const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">{title}</h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const FilterCheckbox = ({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: () => void }) => (
    <div className="flex items-center group cursor-pointer">
        <input 
            id={id} 
            type="checkbox" 
            checked={checked} 
            onChange={onChange} 
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200" 
        />
        <label htmlFor={id} className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-200 cursor-pointer">
            {label}
        </label>
    </div>
);

export default function ExploreView() {
    const { savePromptFromExplore, likedPrompts, globalSearchTerm } = useDashboard();
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [tagsToShow, setTagsToShow] = useState(10);
    const [savingPrompt, setSavingPrompt] = useState<number | null>(null);

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
                const fetchedPrompts: Prompt[] = (data || []).map(p => ({
                    ...p,
                    likes: p.likes || 0,
                    is_public: p.is_public || false,
                }));
                setPrompts(fetchedPrompts);
            }
            setLoading(false);
        };

        fetchPrompts();
    }, []);

    const allTags = useMemo(() => {
        return [...new Set(prompts.flatMap(p => p.tags))].sort();
    }, [prompts]);

    const allModels = useMemo(() => {
        return [...new Set(prompts.map(p => p.model))];
    }, [prompts]);
    
    // Create dynamic prompts that include like state
    const dynamicPrompts = useMemo(() => {
        return prompts.map(prompt => ({
            ...prompt,
            likes: prompt.likes + (likedPrompts.has(prompt.id) ? 1 : 0),
        }));
    }, [prompts, likedPrompts]);

    const handleTagChange = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const handleModelChange = (model: string) => {
        setSelectedModels(prev => prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]);
    };

    const clearFilters = () => {
        setSelectedTags([]);
        setSelectedModels([]);
        setSortBy('newest');
    };

    const loadMoreTags = () => {
        setTagsToShow(prev => Math.min(prev + 10, allTags.length));
    };

    const activeFiltersCount = selectedTags.length + selectedModels.length;

    const filteredPrompts = useMemo(() => {
        let prompts = dynamicPrompts;

        // Apply global search filter
        if (globalSearchTerm.trim()) {
            const searchLower = globalSearchTerm.toLowerCase();
            prompts = prompts.filter(prompt => 
                prompt.title.toLowerCase().includes(searchLower) ||
                prompt.content.toLowerCase().includes(searchLower) ||
                prompt.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                prompt.model.toLowerCase().includes(searchLower)
            );
        }

        if (selectedTags.length > 0) {
            prompts = prompts.filter(p => selectedTags.every(tag => p.tags.includes(tag)));
        }
        
        if (selectedModels.length > 0) {
            prompts = prompts.filter(p => selectedModels.includes(p.model));
        }

        switch (sortBy) {
            case 'newest':
                prompts.sort((a, b) => b.id - a.id);
                break;
            case 'most-liked':
                prompts.sort((a, b) => b.likes - a.likes);
                break;
            default:
                prompts.sort((a, b) => b.id - a.id);
                break;
        }

        return prompts;
    }, [dynamicPrompts, globalSearchTerm, selectedTags, selectedModels, sortBy]);
    
    const handleSavePrompt = async (prompt: Prompt) => {
        setSavingPrompt(prompt.id);
        try {
            // Create a new object without the id field
            const promptWithoutId = {
                title: prompt.title,
                content: prompt.content,
                tags: prompt.tags,
                likes: prompt.likes,
                model: prompt.model,
                is_public: prompt.is_public
            };
            await savePromptFromExplore(promptWithoutId);
            // Could add a toast notification here for success
            console.log('Prompt saved successfully!');
        } catch (error) {
            console.error('Failed to save prompt:', error);
            // Could add a toast notification here for error
        } finally {
            setSavingPrompt(null);
        }
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
        <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex items-center justify-between">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 btn-hover"
                >
                    <Filter size={20} />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
                {activeFiltersCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Filter Sidebar */}
            <aside className={`lg:w-64 lg:shrink-0 transition-all duration-300 ${
                showFilters ? 'block' : 'hidden lg:block'
            }`}>
                <div className="lg:sticky lg:top-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="lg:hidden flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="hidden lg:block">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Filters</h2>
                    </div>

                    <div className="space-y-4">
                    <FilterSection title="Sort By">
                            <div className="space-y-2">
                        <div className="flex items-center">
                                    <input id="sort-newest" type="radio" name="sort" checked={sortBy === 'newest'} onChange={() => setSortBy('newest')} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200" />
                                    <label htmlFor="sort-newest" className="ml-3 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors duration-200">Newest</label>
                        </div>
                        <div className="flex items-center">
                                    <input id="sort-most-liked" type="radio" name="sort" checked={sortBy === 'most-liked'} onChange={() => setSortBy('most-liked')} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200" />
                                    <label htmlFor="sort-most-liked" className="ml-3 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors duration-200">Most Liked</label>
                        </div>
                        </div>
                    </FilterSection>

                    <FilterSection title="Models">
                        {allModels.map(model => (
                            <FilterCheckbox key={model} id={`model-${model}`} label={model} checked={selectedModels.includes(model)} onChange={() => handleModelChange(model)} />
                        ))}
                    </FilterSection>

                    <FilterSection title="Tags">
                            {allTags.slice(0, tagsToShow).map((tag: string) => (
                            <FilterCheckbox key={tag} id={`tag-${tag}`} label={tag} checked={selectedTags.includes(tag)} onChange={() => handleTagChange(tag)} />
                        ))}
                            {tagsToShow < allTags.length && (
                                <button
                                    onClick={loadMoreTags}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 mt-2"
                                >
                                    <span>Load more</span>
                                    <ChevronDown size={16} />
                                </button>
                            )}
                    </FilterSection>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredPrompts.length > 0 ? (
                        filteredPrompts.map((prompt) => (
                            <div key={prompt.id} className="animate-fade-in">
                                <PromptCard 
                                    {...prompt}
                                    source="explore"
                                    view="grid" 
                                    onSave={() => handleSavePrompt(prompt)}
                                    isSaving={savingPrompt === prompt.id}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <Search size={48} />
                            </div>
                            <p className="text-gray-500 text-lg font-medium">No prompts found</p>
                            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}