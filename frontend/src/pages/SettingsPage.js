import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, User, Moon, Sun, Info, Zap, Lock, Server } from 'lucide-react';

function SettingsSection({ title, icon: Icon, children, isDark }) {
  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'bg-gray-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className={`flex items-center gap-2 mb-5 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <Icon className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        <h2 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, isDark, mono = false }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono' : ''} ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`} style={{fontFamily:'Space Grotesk'}}>
          Settings
        </h1>
        <p className={`text-sm mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          System configuration and account info
        </p>
      </div>

      {/* Account */}
      <SettingsSection title="Account" icon={User} isDark={isDark}>
        <div className="space-y-1 divide-y divide-slate-800/30">
          <Row label="Username"     value={user?.username}    isDark={isDark} mono />
          <Row label="Display Name" value={user?.displayName} isDark={isDark} />
          <Row label="Role"         isDark={isDark} value={
            <span className={`text-xs font-mono px-2 py-1 rounded border ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
              {user?.role}
            </span>
          } />
          <Row label="User ID" value={user?.id} isDark={isDark} mono />
        </div>
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection title="Appearance" icon={isDark ? Moon : Sun} isDark={isDark}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Theme</div>
            <div className={`text-xs font-mono mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Currently: {isDark ? 'Dark Mode' : 'Light Mode'}</div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isDark ? 'bg-indigo-500' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${isDark ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </SettingsSection>

      {/* Security */}
      <SettingsSection title="Security" icon={Lock} isDark={isDark}>
        <div className="space-y-1 divide-y divide-slate-800/30">
          <Row label="Authentication" value="JWT Bearer Token" isDark={isDark} mono />
          <Row label="Token Expiry"   value="8 hours"          isDark={isDark} mono />
          <Row label="Rate Limiting"  value="20 calls/min"     isDark={isDark} mono />
          <Row label="Password Hashing" value="bcrypt (10 rounds)" isDark={isDark} mono />
        </div>
      </SettingsSection>

      {/* Permissions */}
      <SettingsSection title="Permissions" icon={Shield} isDark={isDark}>
        <div className="space-y-3">
          {[
            { call: 'File Read',      roles: 'admin, user' },
            { call: 'File Write',     roles: 'admin, user' },
            { call: 'Process Create', roles: 'admin, user' },
            { call: 'Process Kill',   roles: 'admin only' },
            { call: 'Memory Alloc',   roles: 'admin, user' },
            { call: 'Network Socket', roles: 'admin only' },
          ].map(({ call, roles }) => (
            <div key={call} className="flex items-center justify-between">
              <span className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{call}</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                roles.includes('only') ? 'badge-admin' : 'badge-user'
              }`}>{roles}</span>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* System info */}
      <SettingsSection title="System Info" icon={Server} isDark={isDark}>
        <div className="space-y-1 divide-y divide-slate-800/30">
          <Row label="Platform"  value="SysCall Interface v1.0" isDark={isDark} mono />
          <Row label="Backend"   value="Node.js + Express.js"   isDark={isDark} mono />
          <Row label="Database"  value="JSON File Store"         isDark={isDark} mono />
          <Row label="Developer" value="Sumit Singh"             isDark={isDark} />
        </div>
      </SettingsSection>

      {/* Info box */}
      <div className={`rounded-2xl border p-4 flex items-start gap-3 ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
        <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          This is a simulation platform. No actual OS system calls are executed. All process IDs, memory addresses, and file operations are virtualized for educational and demonstration purposes.
        </p>
      </div>
    </div>
  );
}
