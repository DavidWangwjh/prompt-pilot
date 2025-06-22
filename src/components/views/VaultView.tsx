'use client';

import { useState, useMemo } from 'react';
import { LayoutGrid, List, Plus, X } from 'lucide-react';
import PromptCard from '@/components/PromptCard';
import { clsx } from 'clsx';
import { useDashboard, Prompt } from '@/context/DashboardContext';

const availableModels = ['GPT-4', 'GPT-3.5', 'Claude', 'Gemini', 'DALL-E'];

export default function VaultView() {
  const { prompts, addPrompt, updatePrompt, globalSearchTerm } = useDashboard();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showNewPromptModal, setShowNewPromptModal] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<Prompt | null>(null);

  // New prompt form state
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    model: 'GPT-4'
  });
  const [tagInput, setTagInput] = useState('');

  // Filter prompts based on global search term
  const filteredPrompts = useMemo(() => {
    if (!globalSearchTerm.trim()) {
      return prompts;
    }
    
    const searchLower = globalSearchTerm.toLowerCase();
    return prompts.filter(prompt => 
      prompt.title.toLowerCase().includes(searchLower) ||
      prompt.content.toLowerCase().includes(searchLower) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      prompt.model.toLowerCase().includes(searchLower)
    );
  }, [prompts, globalSearchTerm]);

  const openForCreate = () => {
    setPromptToEdit(null);
    setNewPrompt({
      title: '',
      content: '',
      tags: [],
      model: 'GPT-4'
    });
    setShowNewPromptModal(true);
  };
  
  const openForEdit = (prompt: Prompt) => {
    setPromptToEdit(prompt);
    setNewPrompt({
      title: prompt.title,
      content: prompt.content,
      tags: prompt.tags,
      model: prompt.model
    });
    setShowNewPromptModal(true);
  };

  const handleSavePrompt = () => {
    if (!newPrompt.title.trim() || !newPrompt.content.trim()) {
      return;
    }

    if (promptToEdit) {
      // Update existing prompt
      updatePrompt({
        ...promptToEdit,
        ...newPrompt
      });
    } else {
      // Create new prompt
      addPrompt(newPrompt);
    }
    
    setShowNewPromptModal(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !newPrompt.tags.includes(tagInput.trim())) {
      setNewPrompt(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewPrompt(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleOptimize = () => {
    if (!newPrompt.content.trim()) {
      return;
    }

    // Simple optimization logic - in a real app, this would call an AI API
    const content = newPrompt.content.toLowerCase();
    
    // Generate tags based on content
    const generatedTags: string[] = [];
    
    // Content type tags
    if (content.includes('code') || content.includes('programming') || content.includes('javascript') || content.includes('python')) {
      generatedTags.push('coding');
    }
    if (content.includes('write') || content.includes('story') || content.includes('article')) {
      generatedTags.push('writing');
    }
    if (content.includes('image') || content.includes('art') || content.includes('design')) {
      generatedTags.push('art');
    }
    if (content.includes('business') || content.includes('marketing') || content.includes('sales')) {
      generatedTags.push('business');
    }
    if (content.includes('education') || content.includes('learn') || content.includes('teach')) {
      generatedTags.push('education');
    }
    if (content.includes('creative') || content.includes('imagine') || content.includes('brainstorm')) {
      generatedTags.push('creative');
    }
    if (content.includes('productivity') || content.includes('organize') || content.includes('plan')) {
      generatedTags.push('productivity');
    }

    // Model-specific tags
    if (newPrompt.model === 'DALL-E') {
      generatedTags.push('image-generation');
    }
    if (newPrompt.model === 'GPT-4' || newPrompt.model === 'Claude') {
      generatedTags.push('text-generation');
    }

    // Remove duplicates and limit to 5 tags
    const uniqueTags = [...new Set(generatedTags)].slice(0, 5);

    setNewPrompt(prev => ({
      ...prev,
      tags: uniqueTags
    }));
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Prompt Vault</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('list')} className={clsx('p-2 rounded-md transition-colors', view === 'list' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100')} aria-label="List view"><List size={20} /></button>
          <button onClick={() => setView('grid')} className={clsx('p-2 rounded-md transition-colors', view === 'grid' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100')} aria-label="Grid view"><LayoutGrid size={20} /></button>
        </div>
      </div>
      
      <div className={clsx('transition-all duration-300', view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-4')}>
        {filteredPrompts.map((prompt) => (
          <PromptCard 
            key={prompt.id}
            {...prompt}
            source="vault"
            onEdit={() => openForEdit(prompt)}
            view={view}
          />
        ))}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={openForCreate}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 btn-hover z-50"
        aria-label="Create new prompt"
      >
        <Plus size={24} />
      </button>

      {/* New/Edit Prompt Modal */}
      {showNewPromptModal && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-10 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {promptToEdit ? 'Edit Prompt' : 'Create New Prompt'}
              </h2>
              <button
                onClick={() => setShowNewPromptModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={newPrompt.title}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter prompt title..."
                />
              </div>

              {/* Model Selection */}
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  id="model"
                  value={newPrompt.model}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newPrompt.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Add a tag..."
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Prompt Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt Content *
                </label>
                <textarea
                  id="content"
                  value={newPrompt.content}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Enter your prompt here..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowNewPromptModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleOptimize}
                disabled={!newPrompt.content.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Optimize
              </button>
              <button
                onClick={handleSavePrompt}
                disabled={!newPrompt.title.trim() || !newPrompt.content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {promptToEdit ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 