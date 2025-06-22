'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Define the Prompt type
export interface Prompt {
  id: number;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  model: string;
}

// Initial dummy data for prompts
const initialPrompts: Prompt[] = [
  { 
    id: 1, 
    title: 'Creative Story Starter', 
    content: 'You are a master storyteller. Create an engaging opening scene for a fantasy novel that immediately hooks the reader. The scene should introduce a compelling protagonist, establish the magical world, and create tension or mystery that makes the reader want to continue. Include vivid sensory details, atmospheric descriptions, and a hint of the larger conflict to come. Make the first paragraph unforgettable.', 
    tags: ['writing', 'creative', 'fantasy', 'storytelling'], 
    likes: 120, 
    comments: 15, 
    model: 'GPT-4' 
  },
  { 
    id: 2, 
    title: 'JavaScript Code Explainer', 
    content: 'Analyze the following JavaScript code and explain it in simple terms that a beginner programmer would understand. Break down each part of the code, explain what it does, why it\'s written that way, and provide examples of when you might use similar patterns. Also identify any potential issues or improvements that could be made to the code.', 
    tags: ['coding', 'javascript', 'education', 'debugging'], 
    likes: 256, 
    comments: 42, 
    model: 'GPT-4' 
  },
  { 
    id: 3, 
    title: 'Midjourney Image Prompt', 
    content: 'Create a photorealistic sci-fi concept art piece featuring a futuristic cityscape at sunset. The city should have towering glass and steel skyscrapers with holographic advertisements, flying vehicles weaving between buildings, and neon lights reflecting in puddles on the street. Include detailed atmospheric effects like lens flares, volumetric lighting, and a dramatic sky with storm clouds. The style should be cinematic and highly detailed, with a color palette of deep blues, purples, and warm oranges.', 
    tags: ['art', 'midjourney', 'sci-fi', 'concept-art'], 
    likes: 512, 
    comments: 89, 
    model: 'Midjourney' 
  },
  { 
    id: 4, 
    title: 'Marketing Copy Generator', 
    content: 'Write compelling marketing copy for a new tech gadget that emphasizes its unique features and benefits. Create multiple versions: a short tagline, a product description for a website, and a social media post. Focus on the emotional benefits and pain points it solves. Use persuasive language, include a call-to-action, and make it sound innovative and exciting without being overly technical.', 
    tags: ['marketing', 'copywriting', 'business', 'persuasion'], 
    likes: 98, 
    comments: 23, 
    model: 'Claude' 
  },
  { 
    id: 5, 
    title: 'Recipe Creator', 
    content: 'Based on the following ingredients I have available, create a unique and delicious recipe. Consider flavor combinations, cooking techniques, and presentation. Provide detailed step-by-step instructions, cooking times, and tips for best results. Also suggest any additional ingredients that would enhance the dish, and include nutritional information and serving suggestions.', 
    tags: ['food', 'creative', 'cooking', 'nutrition'], 
    likes: 310, 
    comments: 55, 
    model: 'Gemini' 
  }
];

type DashboardView = 'Vault' | 'Explore' | 'Playground' | 'MCP';

interface DashboardContextType {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
  prompts: Prompt[];
  addPrompt: (promptData: Omit<Prompt, 'id' | 'likes' | 'comments'>) => void;
  updatePrompt: (updatedPrompt: Prompt) => void;
  savePromptFromExplore: (prompt: Prompt) => void;
  toggleLike: (promptId: number) => void;
  likedPrompts: Set<number>;
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<DashboardView>('Vault');
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [likedPrompts, setLikedPrompts] = useState<Set<number>>(new Set());
  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('');

  const addPrompt = (promptData: Omit<Prompt, 'id' | 'likes' | 'comments'>) => {
    const newPrompt: Prompt = {
      id: Date.now(),
      ...promptData,
      likes: 0,
      comments: 0
    };
    setPrompts(prev => [newPrompt, ...prev]);
  };

  const updatePrompt = (updatedPrompt: Prompt) => {
    setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
  };

  const savePromptFromExplore = (promptToSave: Prompt) => {
    const newPrompt = {
      ...promptToSave,
      id: Date.now(),
      likes: 0,
      comments: 0
    };
    setPrompts(prev => [newPrompt, ...prev]);
  };

  const toggleLike = (promptId: number) => {
    setPrompts(prev => prev.map(prompt => {
      if (prompt.id === promptId) {
        const isLiked = likedPrompts.has(promptId);
        return {
          ...prompt,
          likes: isLiked ? prompt.likes - 1 : prompt.likes + 1
        };
      }
      return prompt;
    }));

    setLikedPrompts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(promptId)) {
        newSet.delete(promptId);
      } else {
        newSet.add(promptId);
      }
      return newSet;
    });
  };

  return (
    <DashboardContext.Provider value={{ 
      activeView, 
      setActiveView, 
      prompts, 
      addPrompt, 
      updatePrompt, 
      savePromptFromExplore, 
      toggleLike, 
      likedPrompts,
      globalSearchTerm,
      setGlobalSearchTerm
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
} 