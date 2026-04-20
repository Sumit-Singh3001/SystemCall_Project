import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Terminal, Lock, User, Eye, EyeOff, Zap } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      toast.success(`Welcome back, ${user.displayName}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setUsername(role === 'admin' ? 'admin' : 'user');
    setPassword('password');
  };

  return (
    <div className="min-h-screen bg-gray-950 grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mb-4 animate-pulse-glow">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{fontFamily:'Space Grotesk'}}>
            SysCall Interface
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">Secure OS Simulation Platform v1.0</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Terminal prompt header */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-slate-500 text-xs font-mono ml-2">auth@syscall:~$ login</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  className="w-full bg-gray-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full bg-gray-800/60 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  <span>Access System</span>
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-slate-500 text-xs text-center mb-3 font-mono">— Demo credentials —</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fillDemo('admin')}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-violet-500/10 border border-violet-500/30 rounded-lg text-violet-400 text-xs font-mono hover:bg-violet-500/20 transition-all"
              >
                <Zap className="w-3 h-3" /> Admin User
              </button>
              <button
                onClick={() => fillDemo('user')}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-mono hover:bg-blue-500/20 transition-all"
              >
                <User className="w-3 h-3" /> Regular User
              </button>
            </div>
            <p className="text-slate-600 text-xs text-center mt-2 font-mono">password: password</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6 font-mono">
          © 2024 Arvika Tech · Secure System Call Interface
        </p>
      </div>
    </div>
  );
}
