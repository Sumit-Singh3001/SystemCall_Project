import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('syscall_token');
    const storedUser  = localStorage.getItem('syscall_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch { /* corrupted storage */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await apiLogin(username, password);
    const { token, user } = res.data;
    localStorage.setItem('syscall_token', token);
    localStorage.setItem('syscall_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('syscall_token');
    localStorage.removeItem('syscall_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
