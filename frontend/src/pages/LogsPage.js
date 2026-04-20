import React, { useState, useEffect, useCallback } from 'react';
import { getLogs, clearLogs } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Search, Filter, Trash2, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

const ACTION_OPTIONS = ['ALL','FILE_READ','FILE_WRITE','PROCESS_CREATE','PROCESS_KILL','MEMORY_ALLOC','NETWORK_SOCKET'];
const STATUS_OPTIONS = ['ALL','SUCCESS','FAILED'];

export default function LogsPage() {
  const { isDark } = useTheme();
  const { isAdmin } = useAuth();

  const [logs, setLogs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirm] = useState(false);

  // Filters
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('ALL');
  const [action, setAction]   = useState('ALL');
  const [page, setPage]       = useState(0);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLogs({
        search: search || undefined,
        status: status !== 'ALL' ? status : undefined,
        action: action !== 'ALL' ? action : undefined,
        limit: LIMIT,
        offset: page * LIMIT
      });
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setStats(res.data.stats);
    } catch {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [search, status, action, page]);

  useEffect(() => { load(); }, [load]);

  // Reset page on filter change
  useEffect(() => { setPage(0); }, [search, status, action]);

  const handleClear = async () => {
    if (!confirmClear) { setConfirm(true); return; }
    setClearing(true);
    try {
      await clearLogs();
      toast.success('All logs cleared');
      load();
    } catch {
      toast.error('Failed to clear logs');
    } finally {
      setClearing(false);
      setConfirm(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const inputCls = `text-sm font-mono px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all ${
    isDark
      ? 'bg-gray-800 border-slate-700 text-slate-200 placeholder-slate-600 focus:border-indigo-500'
      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400'
  }`;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`} style={{fontFamily:'Space Grotesk'}}>
            Audit Logs
          </h1>
          <p className={`text-sm mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {stats.total ?? 0} total · <span className="text-green-400">{stats.success ?? 0} success</span> · <span className="text-red-400">{stats.failed ?? 0} failed</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {isAdmin && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                confirmClear
                  ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
                  : `border-red-500/30 text-red-400 hover:bg-red-500/10 ${isDark ? '' : 'border-red-300'}`
              }`}
            >
              {confirmClear ? <AlertTriangle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
              {confirmClear ? 'Confirm Clear?' : 'Clear Logs'}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-2xl border p-4 ${isDark ? 'bg-gray-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search logs..."
              className={`${inputCls} w-full pl-9`}
            />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
            {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o === 'ALL' ? 'All Status' : o}</option>)}
          </select>
          <select value={action} onChange={e => setAction(e.target.value)} className={inputCls}>
            {ACTION_OPTIONS.map(o => <option key={o} value={o}>{o === 'ALL' ? 'All Actions' : o}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                {['Status','User','Role','Action','Timestamp','Error'].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold font-mono uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {loading ? (
                Array.from({length: 8}).map((_, i) => (
                  <tr key={i}>
                    {Array.from({length: 6}).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-slate-800 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`px-4 py-12 text-center font-mono text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    No logs found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono px-2 py-1 rounded border ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-failed'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{log.username}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono ${log.role === 'admin' ? 'text-violet-400' : 'text-blue-400'}`}>{log.role}</span>
                    </td>
                    <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{log.action}</td>
                    <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} whitespace-nowrap`}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 font-mono text-xs max-w-48 truncate ${isDark ? 'text-red-400/70' : 'text-red-500'}`}>
                      {log.error || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Showing {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`text-xs font-mono px-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
