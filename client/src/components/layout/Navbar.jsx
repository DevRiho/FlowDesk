import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Bell, Search, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { currentWorkspace } = useWorkspace();

  return (
    <header className="h-16 bg-white border-b border-surface-200 px-6 flex items-center justify-between shrink-0">
      {/* Search Input Bar */}
      <div className="flex items-center w-96">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search projects, tasks, clients, or invoices (Press '/' to focus)"
            className="w-full pl-9 pr-4 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-900 placeholder:text-surface-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Right Action Icons & User Menu */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-600"></span>
        </button>

        <div className="h-4 w-px bg-surface-200"></div>

        {/* User Profile Pill & Logout */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-semibold text-surface-900 leading-none">
              {user?.name}
            </span>
            <span className="text-[10px] text-surface-500 font-medium capitalize">
              {user?.role?.toLowerCase()}
            </span>
          </div>

          <button
            onClick={logout}
            title="Log out of FlowDesk"
            className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

