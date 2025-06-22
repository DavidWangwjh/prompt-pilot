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
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
          PromptPilot
        </h1>
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
                "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 w-full text-left btn-hover",
                isActive
                  ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border hover:border-gray-200"
              )}
            >
              <item.icon
                className={clsx(
                  "mr-3 h-5 w-5 shrink-0 transition-all duration-200",
                  isActive 
                    ? "text-blue-600 scale-110" 
                    : "text-gray-400 group-hover:text-gray-500 group-hover:scale-110"
                )}
                aria-hidden="true"
              />
              <span className="transition-all duration-200">
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom section for additional features */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500 text-center">
          PromptPilot v1.0.0
        </div>
      </div>
    </div>
  );
} 