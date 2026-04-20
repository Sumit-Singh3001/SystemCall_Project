import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getLogs, getSystemCalls } from '../services/api';
import StatCard from '../components/StatCard';
import { Activity, CheckCircle, XCircle, Terminal, Clock, TrendingUp, Zap } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ACTION_LABELS = {
  FILE_READ: 'File Read', FILE_WRITE: 'File Write',
  PROCESS_CREATE: 'Proc Create', PROCESS_KILL: 'Proc Kill',
  MEMORY_ALLOC: 'Mem Alloc', NETWORK_SOCKET: 'Net Socket'
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats]       = useState({ total: 0, success: 0, failed: 0 });
  const [recentLogs, setRecent] = useState([]);
  const [chartData, setChart]   = useState(null);
  const [syscallCount, setSC]   = useState(0);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [logRes, scRes] = await Promise.all([getLogs({ limit: 20 }), getSystemCalls()]);
        const { stats: s, logs } = logRes.data;
        setStats(s);
        setRecent(logs.slice(0, 8));
        setSC(scRes.data.systemCalls.length);

        // Build chart data: group by action
        const actionCounts = {};
        logs.forEach(l => {
          const k = ACTION_LABELS[l.action] || l.action;
          if (!actionCounts[k]) actionCounts[k] = { success: 0, failed: 0 };
          if (l.status === 'SUCCESS') actionCounts[k].success++;
          else actionCounts[k].failed++;
        });

        const labels = Object.keys(actionCounts);
        setChart({
          labels,
          datasets: [
            {
              label: 'Success',
              data: labels.map(k => actionCounts[k].success),
              backgroundColor: 'rgba(74,222,128,0.7)',
              borderRadius: 6,
            },
            {
              label: 'Failed',
              data: labels.map(k => actionCounts[k].failed),
              backgroundColor: 'rgba(248,113,113,0.7)',
              borderRadius: 6,
            }
          ]
        });
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const successRate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'JetBrains Mono', size: 11 } } },
      tooltip: { backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, titleFont: { family: 'JetBrains Mono' }, bodyFont: { family: 'JetBrains Mono' } }
    },
    scales: {
      x: { grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } } },
      y: { grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } } }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`} style={{fontFamily:'Space Grotesk'}}>
          Dashboard
        </h1>
        <p className={`text-sm mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Welcome back, <span className="text-indigo-400">{user?.displayName}</span> · Role:
          <span className={`ml-1 ${user?.role === 'admin' ? 'text-violet-400' : 'text-blue-400'}`}>{user?.role}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity}    label="Total Calls"     value={stats.total}   color="indigo" sub="All time"    />
        <StatCard icon={CheckCircle} label="Successful"      value={stats.success} color="green"  sub="Executed OK" />
        <StatCard icon={XCircle}     label="Failed Attempts" value={stats.failed}  color="red"    sub="Blocked/err" />
        <StatCard icon={Terminal}    label="System Calls"    value={syscallCount}  color="violet" sub="Available"   />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className={`lg:col-span-2 rounded-2xl border p-5 ${isDark ? 'bg-gray-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Activity by System Call</h2>
            <span className={`text-xs font-mono px-2 py-1 rounded-lg ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Last 20 calls</span>
          </div>
          <div className="h-52">
            {chartData && chartData.labels.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className={`text-sm font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>No activity yet. Execute some system calls!</p>
              </div>
            )}
          </div>
        </div>

        {/* Success rate ring */}
        <div className={`rounded-2xl border p-5 flex flex-col items-center justify-center ${isDark ? 'bg-gray-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <TrendingUp className={`w-5 h-5 mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <div className={`text-5xl font-bold font-mono mb-1 ${successRate >= 80 ? 'text-green-400' : successRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {successRate}<span className="text-2xl">%</span>
          </div>
          <div className={`text-sm font-medium mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Success Rate</div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${successRate >= 80 ? 'bg-green-500' : successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${successRate}%` }}
            />
          </div>
          <div className={`text-xs font-mono mt-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {stats.success} / {stats.total} calls
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className={`rounded-2xl border ${isDark ? 'bg-gray-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <h2 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Recent Activity</h2>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono text-green-400">Live</span>
          </div>
        </div>
        <div className="divide-y divide-slate-800/50">
          {loading ? (
            Array.from({length: 4}).map((_, i) => (
              <div key={i} className="px-5 py-3 animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800" />
                <div className="flex-1">
                  <div className="h-3 bg-slate-800 rounded w-1/3 mb-2" />
                  <div className="h-2 bg-slate-800/50 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : recentLogs.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Zap className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
              <p className={`text-sm font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No activity yet. Head to System Calls to get started.</p>
            </div>
          ) : (
            recentLogs.map(log => (
              <div key={log.id} className={`px-5 py-3 flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.status === 'SUCCESS' ? 'bg-green-400' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{ACTION_LABELS[log.action] || log.action}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-failed'}`}>{log.status}</span>
                  </div>
                  <div className={`text-xs font-mono truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {log.username} · {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
