import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Receipt,
  FolderOpen,
  MessageSquare,
  Bot,
  BarChart3,
  Settings,
  Shield,
  ChevronDown,
} from 'lucide-react';

export default function Sidebar() {
  const { currentWorkspace, workspaces, switchWorkspace, roleInCurrentWorkspace } = useWorkspace();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
    { name: 'Files', href: '/files', icon: FolderOpen },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'FlowDesk AI', href: '/ai-assistant', icon: Bot, badge: 'AI' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    ...(roleInCurrentWorkspace === 'OWNER' || roleInCurrentWorkspace === 'ADMIN'
      ? [{ name: 'Team & Access', href: '/team', icon: Shield }]
      : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-surface-900 text-surface-200 flex flex-col shrink-0 border-r border-surface-800 select-none">
      {/* Brand & Workspace Switcher Header */}
      <div className="p-4 border-b border-surface-800">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow">
            FD
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight">FlowDesk</span>
            <span className="block text-[10px] text-surface-400 font-medium uppercase tracking-wider">
              Workspace Platform
            </span>
          </div>
        </div>

        {/* Current Active Workspace Selector */}
        <div className="bg-surface-800/80 rounded-lg p-2 flex items-center justify-between border border-surface-700/50">
          <div className="truncate mr-2">
            <span className="block text-xs font-semibold text-white truncate">
              {currentWorkspace?.name || 'Select Workspace'}
            </span>
            <span className="text-[10px] text-surface-400 font-medium">
              Role: <span className="text-brand-400 uppercase">{roleInCurrentWorkspace}</span>
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-surface-400 shrink-0" />
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-surface-300 hover:bg-surface-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-400 text-surface-950 uppercase">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Session Footnote */}
      <div className="p-3 border-t border-surface-800 flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-xs uppercase">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="truncate flex-1">
          <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
          <p className="text-[10px] text-surface-400 truncate">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
}

