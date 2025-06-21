'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type DashboardView = 'Vault' | 'Explore' | 'Playground' | 'MCP';

interface DashboardContextType {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<DashboardView>('Vault');

  return (
    <DashboardContext.Provider value={{ activeView, setActiveView }}>
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