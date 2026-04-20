import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SystemCallsPage from './pages/SystemCallsPage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import './index.css';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="syscalls"  element={<SystemCallsPage />} />
              <Route path="logs"      element={<LogsPage />} />
              <Route path="settings"  element={<SettingsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#0f172a' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#0f172a' } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
