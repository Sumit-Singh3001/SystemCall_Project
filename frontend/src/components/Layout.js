import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { PanelLeftClose, PanelLeft } from 'lucide-react';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-gray-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className={`flex items-center gap-3 px-6 py-4 border-b ${isDark ? 'border-slate-800 bg-gray-900/50' : 'border-slate-200 bg-white/80'} backdrop-blur-sm flex-shrink-0`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
          <div className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            syscall@secure:~$
            <span className={`ml-1 inline-block w-2 h-3 ${isDark ? 'bg-slate-400' : 'bg-slate-500'} cursor-blink`} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
