'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import PromptCard from '@/components/PromptCard';
import { clsx } from 'clsx';
import { prompts } from '@/lib/prompts';

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
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} {...prompt} view={view} />
        ))}
      </div>
    </>
  );
}; 