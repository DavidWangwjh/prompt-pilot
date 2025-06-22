'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Define the Prompt type
export interface Prompt {
  id: number;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  model: string;
  is_public?: boolean;
}

const FAKE_USER_ID = 'f9df1fa1-1a38-494c-917e-ca3a3b80b75d';

// Create a fake session object
const fakeSession: Session = {
  access_token: 'fake-access-token',
  refresh_token: 'fake-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: FAKE_USER_ID,
    app_metadata: { provider: 'email' },
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  },
};

type DashboardView = 'Vault' | 'Explore' | 'Playground' | 'MCP';

interface DashboardContextType {
  session: Session | null;
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
  // We'll keep these for now, but they won't do much
  savePromptFromExplore: (prompt: Omit<Prompt, 'id'>) => void;
  toggleLike: (promptId: number) => void;
  likedPrompts: Set<number>;
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<DashboardView>('Vault');
  const [likedPrompts, setLikedPrompts] = useState<Set<number>>(new Set());
  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('');
  
  const savePromptFromExplore = async (promptToSave: Omit<Prompt, 'id'>) => {
    try {
      console.log('Attempting to save prompt:', promptToSave);
      console.log('Using user ID:', FAKE_USER_ID);
      
      const { data, error } = await supabase
        .from('prompts')
        .insert([{ 
          ...promptToSave, 
          is_public: false,
          user_id: FAKE_USER_ID 
        }])
        .select()
        .single();

      console.log('Supabase response - data:', data);
      console.log('Supabase response - error:', error);

      if (error) {
        console.error('Error saving prompt from explore:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to save prompt: ${error.message}`);
      }
      
      console.log('Successfully saved prompt:', data);
      return data;
    } catch (error) {
      console.error('Error in savePromptFromExplore:', error);
      throw error;
    }
  };

  const toggleLike = async (promptId: number) => {
    setLikedPrompts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(promptId)) {
        newSet.delete(promptId);
      } else {
        newSet.add(promptId);
      }
      return newSet;
    });

    // Fetch current likes
    const { data, error } = await supabase
      .from('prompts')
      .select('likes')
      .eq('id', promptId)
      .single();

    if (error) {
      console.error('Failed to fetch current likes:', error);
      return;
    }

    let newLikes = (data?.likes || 0);
    if (likedPrompts.has(promptId)) {
      newLikes = Math.max(0, newLikes - 1);
    } else {
      newLikes = newLikes + 1;
    }

    const { error: updateError } = await supabase
      .from('prompts')
      .update({ likes: newLikes })
      .eq('id', promptId);

    if (updateError) {
      console.error('Failed to update likes:', updateError);
    }
  };

  return (
    <DashboardContext.Provider value={{ 
      session: fakeSession, // Always provide the fake session
      activeView, 
      setActiveView, 
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