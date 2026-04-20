import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Terminal, ScrollText, Settings,
  LogOut, Shield, Sun, Moon, ChevronRight, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/syscalls',  icon: Terminal,        label: 'System Calls' },
  { to: '/logs',      icon: ScrollText,      label: 'Audit Logs' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme }   = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className={`
      flex flex-col h-screen
      ${isDark ? 'bg-gray-900 border-slate-800' : 'bg-white border-slate-200'}
      border-r transition-all duration-300
      ${collapsed ? 'w-16' : 'w-60'}
    `}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
          <Shield className="w-4 h-4 text-indigo-400" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <div className={`font-bold text-sm leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`} style={{fontFamily:'Space Grotesk'}}>
              SysCall
            </div>
            <div className="text-indigo-400 text-xs font-mono">Secure Interface</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative
              ${isActive
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon className={`flex-shrink-0 w-4 h-4 ${isActive ? 'text-indigo-400' : ''}`} />
                {!collapsed && <span className="animate-fade-in">{label}</span>}
                {isActive && !collapsed && (
                  <ChevronRight className="w-3 h-3 ml-auto text-indigo-400" />
                )}
                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} p-3 space-y-1`}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all
            ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? (isDark ? 'Light mode' : 'Dark mode') : undefined}
        >
          {isDark ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User info */}
        {!collapsed && user && (
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-400 text-xs font-bold">{user.username[0].toUpperCase()}</span>
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <div className={`text-xs font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{user.displayName}</div>
              <div className="flex items-center gap-1">
                {isAdmin && <Zap className="w-2.5 h-2.5 text-violet-400" />}
                <span className={`text-xs font-mono ${isAdmin ? 'text-violet-400' : 'text-blue-400'}`}>{user.role}</span>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all text-red-400 hover:bg-red-500/10
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
