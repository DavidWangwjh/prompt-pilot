'use client';

import { useState, useMemo } from 'react';
import PromptCard from '@/components/PromptCard';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

const publicPrompts = [
    { 
      id: 101, 
      title: 'Epic Landscape Generator', 
      content: 'Create a breathtaking fantasy landscape that combines multiple biomes in a single scene. Include a majestic mountain range with snow-capped peaks, a lush forest valley with a winding river, ancient ruins partially covered in vegetation, and a mystical floating island with cascading waterfalls. The lighting should be dramatic with golden hour rays breaking through storm clouds, creating atmospheric perspective and depth. Include fantastical elements like glowing crystals, ethereal mist, and wildlife that fits the environment.', 
      tags: ['art', 'landscape', 'fantasy'], 
      likes: 1800, 
      comments: 250, 
      model: 'GPT-4' 
    },
    { 
      id: 102, 
      title: 'Python Code Debugger', 
      content: 'You are an expert Python developer and debugging specialist. Analyze the provided Python code and identify all potential issues, including syntax errors, logical flaws, performance problems, and security vulnerabilities. For each issue found, provide a detailed explanation of why it occurs, the potential impact, and a corrected version of the code. Also suggest improvements for code readability, maintainability, and scalability.', 
      tags: ['coding', 'python', 'debugging', 'best-practices'], 
      likes: 2300, 
      comments: 450, 
      model: 'GPT-4' 
    },
    { 
      id: 103, 
      title: 'Content Summarizer', 
      content: 'Summarize the following content in multiple formats: a one-sentence executive summary, a bullet-point overview of key points, and a detailed analysis with main themes and supporting evidence. Identify the target audience, tone, and purpose of the original content. Highlight any important quotes, statistics, or data points. Provide context for why this information matters and suggest related topics for further exploration.', 
      tags: ['productivity', 'writing', 'summary', 'analysis'], 
      likes: 950, 
      comments: 120, 
      model: 'Claude' 
    },
    { 
      id: 104, 
      title: 'Character Backstory Creator', 
      content: 'Develop a rich and detailed backstory for a fictional character that includes their origin story, formative experiences, relationships, motivations, fears, and aspirations. Create a timeline of key events that shaped their personality and current situation. Include specific details about their cultural background, education, career path, and personal struggles. Develop their voice, mannerisms, and unique characteristics that make them memorable and relatable to readers.', 
      tags: ['writing', 'creative', 'rpg', 'character-development'], 
      likes: 780, 
      comments: 90, 
      model: 'Claude' 
    },
    { 
      id: 105, 
      title: 'SQL Query Builder', 
      content: 'Based on the database schema and requirements provided, construct optimized SQL queries for data retrieval, analysis, and reporting. Include multiple query variations for different use cases: simple lookups, complex joins, aggregations, and data transformations. Consider performance implications, indexing strategies, and query optimization techniques. Provide explanations for each query structure and suggest alternative approaches for different database systems.', 
      tags: ['coding', 'sql', 'database', 'analytics'], 
      likes: 1500, 
      comments: 310, 
      model: 'GPT-4' 
    },
    { 
      id: 106, 
      title: 'Fitness Plan Generator', 
      content: 'Design a comprehensive fitness plan tailored to specific goals, current fitness level, available equipment, and time constraints. Include detailed workout routines for different days, progressive overload principles, rest and recovery strategies, and nutrition guidelines. Consider individual preferences, limitations, and lifestyle factors. Provide modifications for different skill levels and alternative exercises for each movement pattern.', 
      tags: ['health', 'fitness', 'planning', 'wellness'], 
      likes: 600, 
      comments: 75, 
      model: 'Gemini' 
    },
    { 
      id: 107, 
      title: 'Product Launch Strategy', 
      content: 'Develop a comprehensive product launch strategy that covers pre-launch preparation, launch execution, and post-launch optimization. Include market research, competitive analysis, target audience identification, messaging strategy, channel selection, timeline planning, and success metrics. Consider different launch scenarios and provide contingency plans. Include specific tactics for generating buzz, managing expectations, and handling potential challenges.', 
      tags: ['business', 'marketing', 'strategy', 'product-management'], 
      likes: 890, 
      comments: 134, 
      model: 'GPT-4' 
    },
    { 
      id: 108, 
      title: 'Creative Writing Workshop', 
      content: 'Lead a creative writing workshop session focused on developing compelling narratives. Include writing exercises, prompts, and techniques for character development, plot structure, dialogue, and descriptive writing. Provide feedback frameworks and revision strategies. Cover different genres and writing styles, encouraging participants to experiment with voice and perspective. Include examples from literature and practical tips for overcoming writer\'s block.', 
      tags: ['writing', 'education', 'creative', 'workshop'], 
      likes: 420, 
      comments: 67, 
      model: 'Claude' 
    },
    { 
      id: 109, 
      title: 'Data Visualization Designer', 
      content: 'Create compelling data visualizations that effectively communicate complex information to different audiences. Choose appropriate chart types, color schemes, and layout strategies for various data types and presentation contexts. Consider accessibility, mobile responsiveness, and interactive elements. Provide guidelines for storytelling with data, including narrative structure, key insights highlighting, and call-to-action integration.', 
      tags: ['data-science', 'visualization', 'design', 'analytics'], 
      likes: 720, 
      comments: 98, 
      model: 'GPT-4' 
    },
    { 
      id: 110, 
      title: 'Social Media Campaign', 
      content: 'Design a multi-platform social media campaign that builds brand awareness and drives engagement. Include content themes, posting schedules, hashtag strategies, and community management guidelines. Consider platform-specific best practices, audience behavior patterns, and trending topics. Provide crisis management protocols and performance tracking methods. Include influencer collaboration strategies and user-generated content campaigns.', 
      tags: ['marketing', 'social-media', 'campaign', 'engagement'], 
      likes: 1100, 
      comments: 156, 
      model: 'Claude' 
    },
    { 
      id: 111, 
      title: 'Technical Documentation Writer', 
      content: 'Write comprehensive technical documentation that serves multiple audiences: developers, end users, and system administrators. Include installation guides, API references, troubleshooting sections, and best practices. Use clear, concise language with appropriate technical depth for each audience. Include code examples, screenshots, diagrams, and step-by-step procedures. Consider different learning styles and provide both quick-start guides and detailed reference materials.', 
      tags: ['writing', 'technical', 'documentation', 'education'], 
      likes: 380, 
      comments: 52, 
      model: 'GPT-4' 
    },
    { 
      id: 112, 
      title: 'UX Research Framework', 
      content: 'Develop a comprehensive UX research framework for understanding user needs, behaviors, and pain points. Include research methodologies, participant recruitment strategies, data collection methods, and analysis techniques. Cover both qualitative and quantitative approaches, from user interviews and surveys to usability testing and analytics. Provide templates for research plans, consent forms, and reporting structures.', 
      tags: ['ux', 'research', 'design', 'user-experience'], 
      likes: 650, 
      comments: 89, 
      model: 'Claude' 
    },
    { 
      id: 113, 
      title: 'Financial Analysis Report', 
      content: 'Conduct a thorough financial analysis of the provided data, including profitability analysis, cash flow assessment, risk evaluation, and growth projections. Include ratio analysis, trend identification, and benchmarking against industry standards. Provide actionable insights and recommendations for financial optimization. Consider different scenarios and their potential impacts on financial performance.', 
      tags: ['finance', 'analysis', 'business', 'reporting'], 
      likes: 540, 
      comments: 73, 
      model: 'GPT-4' 
    },
    { 
      id: 114, 
      title: 'Event Planning Coordinator', 
      content: 'Plan a comprehensive event from concept to execution, including venue selection, vendor management, timeline development, and risk mitigation strategies. Consider budget constraints, attendee experience, and logistical requirements. Include marketing and promotion strategies, registration systems, and post-event follow-up procedures. Provide contingency plans for common event challenges and success metrics for evaluation.', 
      tags: ['planning', 'events', 'coordination', 'management'], 
      likes: 470, 
      comments: 61, 
      model: 'Claude' 
    },
    { 
      id: 115, 
      title: 'Machine Learning Model Trainer', 
      content: 'Guide the development and training of a machine learning model, including data preparation, feature engineering, model selection, and evaluation strategies. Cover different algorithms, hyperparameter tuning, and validation techniques. Include best practices for avoiding overfitting, handling imbalanced data, and ensuring model interpretability. Provide guidelines for model deployment, monitoring, and continuous improvement.', 
      tags: ['machine-learning', 'data-science', 'ai', 'analytics'], 
      likes: 820, 
      comments: 112, 
      model: 'GPT-4' 
    }
];

// sort tags alphabetically
const allTags = [...new Set(publicPrompts.flatMap(p => p.tags))].sort();
const allModels = [...new Set(publicPrompts.map(p => p.model))];

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
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [tagsToShow, setTagsToShow] = useState(10);

    // Create dynamic prompts that include like state
    const dynamicPrompts = useMemo(() => {
        return publicPrompts.map(prompt => ({
            ...prompt,
            likes: prompt.likes + (likedPrompts.has(prompt.id) ? 1 : 0)
        }));
    }, [likedPrompts]);

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
    
    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
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
            <aside className={`lg:w-64 lg:h-full lg:shrink-0 transition-all duration-300 ${
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
                            {allTags.slice(0, tagsToShow).map(tag => (
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
                                    onSave={() => savePromptFromExplore(prompt)}
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