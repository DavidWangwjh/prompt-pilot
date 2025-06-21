'use client';

import { useState, useMemo } from 'react';
import PromptCard from '@/components/PromptCard';
import { Search } from 'lucide-react';

const publicPrompts = [
    { id: 101, title: 'Epic Landscape Generator', description: 'Creates stunning, detailed landscapes for concept art.', tags: ['art', 'midjourney', 'landscape'], likes: 1800, comments: 250, model: 'Midjourney' },
    { id: 102, title: 'Python Code Debugger', description: 'Analyzes Python code snippets and suggests fixes for common errors.', tags: ['coding', 'python', 'debugging'], likes: 2300, comments: 450, model: 'GPT-4' },
    { id: 103, title: 'Content Summarizer', description: 'Summarizes long articles or documents into key bullet points.', tags: ['productivity', 'writing', 'summary'], likes: 950, comments: 120, model: 'Claude' },
    { id: 104, title: 'Character Backstory Creator', description: 'Generates a rich and detailed backstory for a fictional character.', tags: ['writing', 'creative', 'rpg'], likes: 780, comments: 90, model: 'Claude' },
    { id: 105, title: 'SQL Query Builder', description: 'Helps construct complex SQL queries from natural language descriptions.', tags: ['coding', 'sql', 'database'], likes: 1500, comments: 310, model: 'GPT-4' },
    { id: 106, title: 'Fitness Plan Generator', description: 'Creates a personalized weekly fitness plan based on user goals.', tags: ['health', 'fitness'], likes: 600, comments: 75, model: 'Gemini' },
];

const allTags = [...new Set(publicPrompts.flatMap(p => p.tags))];
const allModels = [...new Set(publicPrompts.map(p => p.model))];

const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="py-4">
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const FilterCheckbox = ({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: () => void }) => (
    <div className="flex items-center">
        <input id={id} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <label htmlFor={id} className="ml-3 text-sm text-gray-600">{label}</label>
    </div>
);

export default function ExploreView() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('popular');

    const handleTagChange = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const handleModelChange = (model: string) => {
        setSelectedModels(prev => prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]);
    };

    const filteredPrompts = useMemo(() => {
        let prompts = publicPrompts;

        if (searchTerm) {
            prompts = prompts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()));
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
            case 'popular':
            default:
                prompts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
                break;
        }

        return prompts;
    }, [searchTerm, selectedTags, selectedModels, sortBy]);
    
    return (
        <div className="flex gap-8 h-full">
            {/* Filter Sidebar */}
            <aside className="w-64 h-full shrink-0">
                <div className="sticky top-6">
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search prompts..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <FilterSection title="Sort By">
                        <div className="flex items-center">
                            <input id="sort-popular" type="radio" name="sort" checked={sortBy === 'popular'} onChange={() => setSortBy('popular')} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="sort-popular" className="ml-3 text-sm text-gray-600">Popularity</label>
                        </div>
                        <div className="flex items-center">
                            <input id="sort-newest" type="radio" name="sort" checked={sortBy === 'newest'} onChange={() => setSortBy('newest')} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="sort-newest" className="ml-3 text-sm text-gray-600">Newest</label>
                        </div>
                        <div className="flex items-center">
                            <input id="sort-most-liked" type="radio" name="sort" checked={sortBy === 'most-liked'} onChange={() => setSortBy('most-liked')} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="sort-most-liked" className="ml-3 text-sm text-gray-600">Most Liked</label>
                        </div>
                    </FilterSection>

                    <FilterSection title="Models">
                        {allModels.map(model => (
                            <FilterCheckbox key={model} id={`model-${model}`} label={model} checked={selectedModels.includes(model)} onChange={() => handleModelChange(model)} />
                        ))}
                    </FilterSection>

                    <FilterSection title="Tags">
                        {allTags.map(tag => (
                            <FilterCheckbox key={tag} id={`tag-${tag}`} label={tag} checked={selectedTags.includes(tag)} onChange={() => handleTagChange(tag)} />
                        ))}
                    </FilterSection>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPrompts.length > 0 ? (
                        filteredPrompts.map((prompt) => (
                            <PromptCard key={prompt.id} {...prompt} view="grid" />
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full">No prompts found.</p>
                    )}
                </div>
            </div>
        </div>
    );
} 