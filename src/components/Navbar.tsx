"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { setGlobalSearchTerm } = useDashboard();
  const router = useRouter();

  // Debounce search input to avoid too many updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, setGlobalSearchTerm]);

  const handleLogout = () => {
    setShowProfileMenu(false);
    router.push('/');
  };

  return (
    <div className="flex h-16 shrink-0 items-center justify-between bg-white px-4 sm:px-6 border-b border-gray-200">
      {/* Search */}
      <div className="flex flex-1 max-w-lg mr-4">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 focus:border-blue-600 sm:text-sm sm:leading-6 transition-all duration-200"
            placeholder="Search prompts..."
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 btn-hover h-8 w-8 items-center justify-center font-medium shadow-lg"
            id="user-menu-button"
            aria-expanded={showProfileMenu}
            aria-haspopup="true"
          >
            <span className="sr-only">Open user menu</span>
            <span className="text-sm font-semibold">P</span>
          </button>

          {/* Profile dropdown menu */}
          {showProfileMenu && (
            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
} 