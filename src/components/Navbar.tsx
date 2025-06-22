"use client";

import { MagnifyingGlassIcon, BellIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const { setGlobalSearchTerm } = useDashboard();

  // Debounce search input to avoid too many updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, setGlobalSearchTerm]);

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
        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-full bg-white p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 btn-hover"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-gray-50 transition-all duration-200 btn-hover"
            id="user-menu-button"
            aria-expanded="false"
            aria-haspopup="true"
          >
            <span className="sr-only">Open user menu</span>
            <UserCircleIcon className="h-8 w-8 text-gray-400 hover:text-gray-600 transition-colors duration-200" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
} 