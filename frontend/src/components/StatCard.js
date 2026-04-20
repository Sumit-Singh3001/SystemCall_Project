import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function StatCard({ icon: Icon, label, value, sub, color = 'indigo', trend }) {
  const { isDark } = useTheme();

  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: 'text-indigo-400', value: 'text-indigo-300' },
    green:  { bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: 'text-green-400',  value: 'text-green-300'  },
    red:    { bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: 'text-red-400',    value: 'text-red-300'    },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: 'text-violet-400', value: 'text-violet-300' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: 'text-yellow-400', value: 'text-yellow-300' },
    cyan:   { bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   icon: 'text-cyan-400',   value: 'text-cyan-300'   },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className={`
      syscall-card rounded-2xl border p-5
      ${isDark
        ? `bg-gray-900/80 border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-black/20`
        : `bg-white border-slate-200 hover:border-slate-300 hover:shadow-md`
      }
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
            trend >= 0
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className={`text-3xl font-bold font-mono mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value ?? '—'}</div>
      <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</div>
      {sub && <div className={`text-xs mt-1 font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</div>}
    </div>
  );
}
