'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import PromptCard from '@/components/PromptCard';
import { clsx } from 'clsx';

const dummyPrompts = [
  { id: 1, title: 'Creative Story Starter', description: 'A prompt to generate an engaging opening for a fantasy novel.', tags: ['writing', 'creative', 'fantasy'], likes: 120, comments: 15, model: 'GPT-4' },
  { id: 2, title: 'JavaScript Code Explainer', description: 'Explains a complex piece of JavaScript code in simple terms.', tags: ['coding', 'javascript', 'education'], likes: 256, comments: 42, model: 'GPT-4' },
  { id: 3, title: 'Midjourney Image Prompt', description: 'Generates a detailed prompt for creating photorealistic sci-fi concept art.', tags: ['art', 'midjourney', 'sci-fi'], likes: 512, comments: 89, model: 'Midjourney' },
  { id: 4, title: 'Marketing Copy Generator', description: 'Creates compelling ad copy for a new tech gadget.', tags: ['marketing', 'copywriting'], likes: 98, comments: 23, model: 'Claude' },
  { id: 5, title: 'Recipe Creator', description: 'Generates a unique recipe based on a list of available ingredients.', tags: ['food', 'creative'], likes: 310, comments: 55, model: 'Gemini' },
];

export default function VaultView() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
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
        {dummyPrompts.map((prompt) => (
          <PromptCard key={prompt.id} {...prompt} view={view} />
        ))}
      </div>
    </>
  );
}; 