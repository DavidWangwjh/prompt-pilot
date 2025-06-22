'use client';

import { useDashboard } from '@/context/DashboardContext';
import ExploreView from '@/components/views/ExploreView';
import PlaygroundView from '@/components/views/PlaygroundView';
import VaultView from '@/components/views/VaultView';
import MCPView from '@/components/views/MCPView';

export default function DashboardPage() {
  const { activeView } = useDashboard();

  const renderContent = () => {
    switch (activeView) {
      case 'Vault':
        return <VaultView />;
      case 'Explore':
        return <ExploreView />;
      case 'Playground':
        return <PlaygroundView />;
      case 'MCP':
        return <MCPView />;
      default:
        return <VaultView />;
    }
  };

  return <>{renderContent()}</>;
}
