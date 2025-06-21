"use client";

import { useDashboard } from '@/context/DashboardContext';
import { HomeIcon, MagnifyingGlassIcon, PlayIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

const navigation = [
  { name: 'Vault' as const, icon: HomeIcon },
  { name: 'Explore' as const, icon: MagnifyingGlassIcon },
  { name: 'Playground' as const, icon: PlayIcon },
  { name: 'MCP' as const, icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const { activeView, setActiveView } = useDashboard();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">PromptPilot</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = activeView === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveView(item.name)}
              className={clsx(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left",
                isActive
                  ? "bg-gray-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={clsx(
                  "mr-3 h-5 w-5 shrink-0",
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                )}
                aria-hidden="true"
              />
              {item.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
} 