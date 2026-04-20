import React, { useState, useEffect } from 'react';
import { getSystemCalls, executeSystemCall } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FileText, Edit3, Cpu, XCircle, Database, Wifi,
  Play, Lock, ChevronDown, ChevronUp, Terminal, Loader
} from 'lucide-react';

const ICON_MAP = {
  'file-text': FileText, 'edit': Edit3, 'cpu': Cpu,
  'x-circle': XCircle, 'database': Database, 'wifi': Wifi,
};
const COLOR_MAP = {
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   icon: 'text-blue-400',   badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30'   },
  green:  { bg: 'bg-green-500/10',  border: 'border-green-500/30',  icon: 'text-green-400',  badge: 'bg-green-500/15 text-green-400 border-green-500/30'  },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  red:    { bg: 'bg-red-500/10',    border: 'border-red-500/30',    icon: 'text-red-400',    badge: 'bg-red-500/15 text-red-400 border-red-500/30'    },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'text-yellow-400', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  cyan:   { bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',   icon: 'text-cyan-400',   badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'   },
};

function SyscallCard({ sc }) {
  const { isDark } = useTheme();
  const { user }   = useAuth();
  const [expanded, setExpanded]  = useState(false);
  const [params, setParams]      = useState({});
  const [loading, setLoading]    = useState(false);
  const [result, setResult]      = useState(null);

  const Icon = ICON_MAP[sc.icon] || Terminal;
  const c    = COLOR_MAP[sc.color] || COLOR_MAP.blue;
  const canAccess = sc.accessible;

  const handleChange = (name, value) => setParams(prev => ({ ...prev, [name]: value }));

  const handleExecute = async () => {
    if (!canAccess) {
      toast.error(`Access denied — requires admin role`);
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await executeSystemCall(sc.key, params);
      setResult({ ok: true, data: res.data });
      toast.success(`${sc.name} executed!`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Execution failed';
      setResult({ ok: false, msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`syscall-card rounded-2xl border overflow-hidden transition-all duration-200 ${
      isDark ? 'bg-gray-900/80 border-slate-800' : 'bg-white border-slate-200'
    } ${!canAccess ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div
        className={`flex items-center gap-4 p-5 cursor-pointer ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'} transition-colors`}
        onClick={() => canAccess && setExpanded(!expanded)}
      >
        <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
          {canAccess ? <Icon className={`w-5 h-5 ${c.icon}`} /> : <Lock className="w-5 h-5 text-slate-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{sc.name}</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${c.badge}`}>{sc.key}</span>
            {!canAccess && (
              <span className="text-xs font-mono px-2 py-0.5 rounded border bg-slate-800/50 text-slate-500 border-slate-700">
                Admin Only
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{sc.description}</p>
        </div>
        {canAccess && (
          <div className={`text-slate-500 flex-shrink-0`}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        )}
      </div>

      {/* Expanded form */}
      {expanded && canAccess && (
        <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} p-5 space-y-4 animate-fade-in`}>
          {/* Params */}
          {sc.params && sc.params.map(p => (
            <div key={p.name}>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {p.label} {p.required && <span className="text-red-400">*</span>}
              </label>
              {p.type === 'textarea' ? (
                <textarea
                  rows={3}
                  placeholder={p.placeholder}
                  value={params[p.name] || ''}
                  onChange={e => handleChange(p.name, e.target.value)}
                  className={`w-full text-sm font-mono px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all ${
                    isDark
                      ? 'bg-gray-800 border-slate-700 text-slate-200 placeholder-slate-600 focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400'
                  }`}
                />
              ) : p.type === 'select' ? (
                <select
                  value={params[p.name] || ''}
                  onChange={e => handleChange(p.name, e.target.value)}
                  className={`w-full text-sm font-mono px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all ${
                    isDark
                      ? 'bg-gray-800 border-slate-700 text-slate-200 focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400'
                  }`}
                >
                  <option value="">Select {p.label}</option>
                  {p.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={p.type}
                  placeholder={p.placeholder}
                  value={params[p.name] || ''}
                  onChange={e => handleChange(p.name, e.target.value)}
                  className={`w-full text-sm font-mono px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all ${
                    isDark
                      ? 'bg-gray-800 border-slate-700 text-slate-200 placeholder-slate-600 focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400'
                  }`}
                />
              )}
            </div>
          ))}

          {/* Execute button */}
          <button
            onClick={handleExecute}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all
              ${c.bg} border ${c.border} ${c.icon} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? 'Executing...' : `Execute ${sc.name}`}
          </button>

          {/* Result output */}
          {result && (
            <div className="animate-fade-in">
              <div className={`flex items-center gap-2 mb-2`}>
                <div className={`w-2 h-2 rounded-full ${result.ok ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className={`text-xs font-mono font-semibold ${result.ok ? 'text-green-400' : 'text-red-400'}`}>
                  {result.ok ? 'SYSCALL_OK' : 'SYSCALL_ERR'}
                </span>
              </div>
              <div className="terminal-output">
                {result.ok
                  ? JSON.stringify(result.data, null, 2)
                  : `Error: ${result.msg}`
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SystemCallsPage() {
  const { isDark } = useTheme();
  const [syscalls, setSyscalls] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getSystemCalls()
      .then(res => setSyscalls(res.data.systemCalls))
      .catch(() => toast.error('Failed to load system calls'))
      .finally(() => setLoading(false));
  }, []);

  const accessible   = syscalls.filter(s => s.accessible);
  const restricted   = syscalls.filter(s => !s.accessible);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`} style={{fontFamily:'Space Grotesk'}}>
          System Calls
        </h1>
        <p className={`text-sm mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {accessible.length} accessible · {restricted.length} restricted
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({length: 4}).map((_, i) => (
            <div key={i} className={`rounded-2xl border p-5 animate-pulse ${isDark ? 'bg-gray-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-800" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-800 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-800/50 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {syscalls.map(sc => <SyscallCard key={sc.id} sc={sc} />)}
        </div>
      )}
    </div>
  );
}
