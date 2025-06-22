'use client';

import { useState, useMemo, useEffect } from 'react';
import { LayoutGrid, List, Plus, X, Loader2 } from 'lucide-react';
import PromptCard from '@/components/PromptCard';
import { clsx } from 'clsx';
import { useDashboard, Prompt } from '@/context/DashboardContext';
import { supabase } from '@/lib/supabase';

const availableModels = ['GPT-4', 'GPT-3.5', 'Claude', 'Gemini', 'DALL-E'];

export default function VaultView() {
  const { globalSearchTerm, session, likedPrompts } = useDashboard();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showNewPromptModal, setShowNewPromptModal] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<Prompt | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      if (!session) {
        setPrompts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .eq('user_id', session.user.id);

      if (error) {
          console.error('Error fetching vault prompts:', error);
          setError('Failed to load your prompts. Please try again later.');
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
  }, [session]);

  // New prompt form state
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    model: 'GPT-4',
    is_public: false
  });
  const [tagInput, setTagInput] = useState('');

  // Create dynamic prompts that include like state
  const dynamicPrompts = useMemo(() => {
    return prompts.map(prompt => ({
      ...prompt,
      likes: prompt.likes + (likedPrompts.has(prompt.id) ? 1 : 0),
    }));
  }, [prompts, likedPrompts]);

  // Filter prompts based on global search term
  const filteredPrompts = useMemo(() => {
    if (!globalSearchTerm.trim()) {
      return dynamicPrompts;
    }
    const searchLower = globalSearchTerm.toLowerCase();
    return dynamicPrompts.filter(prompt => 
      prompt.title.toLowerCase().includes(searchLower) ||
      prompt.content.toLowerCase().includes(searchLower) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      prompt.model.toLowerCase().includes(searchLower)
    );
  }, [dynamicPrompts, globalSearchTerm]);

  const openForCreate = () => {
    setPromptToEdit(null);
    setNewPrompt({
      title: '',
      content: '',
      tags: [],
      model: 'GPT-4',
      is_public: false
    });
    setShowNewPromptModal(true);
  };
  
  const openForEdit = (prompt: Prompt) => {
    setPromptToEdit(prompt);
    setNewPrompt({
      title: prompt.title,
      content: prompt.content,
      tags: prompt.tags,
      model: prompt.model,
      is_public: prompt.is_public || false
    });
    setShowNewPromptModal(true);
  };

  const handleSavePrompt = async () => {
    if (!newPrompt.title.trim() || !newPrompt.content.trim()) {
      return;
    }

    if (!session?.user) {
      setError("You must be logged in to create a prompt.");
      return;
    }

    setLoading(true);
    const updatedPrompts = [...prompts];

    if (promptToEdit) {
      // Update existing prompt
      const { data, error } = await supabase
        .from('prompts')
        .update({ ...newPrompt })
        .eq('id', promptToEdit.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating prompt:', error);
        setError('Failed to update prompt.');
      } else if (data) {
        const promptIndex = prompts.findIndex(p => p.id === data.id);
        if(promptIndex !== -1) {
          updatedPrompts[promptIndex] = { ...data, likes: data.likes || 0, is_public: data.is_public || false };
        }
      }

    } else {
      // Create new prompt
      const { data, error } = await supabase
        .from('prompts')
        .insert([{ ...newPrompt, user_id: session.user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating prompt:', error);
        setError('Failed to create prompt.');
      } else if (data) {
        updatedPrompts.push({ ...data, likes: data.likes || 0, is_public: data.is_public || false });
      }
    }
    
    setPrompts(updatedPrompts);
    setShowNewPromptModal(false);
    setLoading(false);
  };

  const handleDeletePrompt = async () => {
    if (!promptToEdit) return;

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptToEdit.id);
    
    if (error) {
      console.error('Error deleting prompt:', error);
      setError('Failed to delete prompt.');
    } else {
      setPrompts(prompts.filter(p => p.id !== promptToEdit.id));
      setShowNewPromptModal(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newPrompt.tags.includes(tagInput.trim())) {
      if (newPrompt.tags.length >= 9) {
        // Could add a toast notification here if desired
        return;
      }
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

    // Ensure we don't exceed 9 tags total
    const currentTags = newPrompt.tags;
    const availableSlots = 9 - currentTags.length;
    const tagsToAdd = uniqueTags.slice(0, availableSlots);

    setNewPrompt(prev => ({
      ...prev,
      tags: [...prev.tags, ...tagsToAdd]
    }));
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full p-8">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col justify-center items-center h-full text-center p-8">
            <X className="text-red-500 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-800">An Error Occurred</h3>
            <p className="text-gray-500 mt-2">{error}</p>
        </div>
    );
  }

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

              {/* Public/Private Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!newPrompt.is_public}
                      onChange={() => setNewPrompt(prev => ({ ...prev, is_public: false }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Private</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={newPrompt.is_public}
                      onChange={() => setNewPrompt(prev => ({ ...prev, is_public: true }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Public</span>
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {newPrompt.is_public 
                    ? "Public prompts will be visible to everyone in the Explore section." 
                    : "Private prompts are only visible to you in your vault."}
                </p>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags {newPrompt.tags.length >= 9 && <span className="text-red-500">(Maximum 9 tags reached)</span>}
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
                    disabled={newPrompt.tags.length >= 9}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={newPrompt.tags.length >= 9 ? "Maximum tags reached" : "Add a tag..."}
                  />
                  <button
                    onClick={addTag}
                    disabled={newPrompt.tags.length >= 9 || !tagInput.trim()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
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

            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
              <div>
                {promptToEdit && (
                    <button
                        onClick={handleDeletePrompt}
                        className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                        Delete
                    </button>
                )}
              </div>
              <div className="flex items-center gap-3">
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
        </div>
      )}
    </>
  );
}; 