'use client';

import { useDashboard } from '@/context/DashboardContext';
import ExploreView from '@/components/views/ExploreView';
import PlaygroundView from '@/components/views/PlaygroundView';
import VaultView from '@/components/views/VaultView';

const PlaceholderComponent = ({ title }: { title: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p>This feature is not yet implemented.</p>
    </div>
  );
};

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
        return <PlaceholderComponent title="MCP Config" />;
      default:
        return <VaultView />;
    }
  };

  return <>{renderContent()}</>;
}
