import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:5000/api',
  timeout: 10000,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('syscall_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('syscall_token');
      localStorage.removeItem('syscall_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────
export const login = (username, password) =>
  API.post('/auth/login', { username, password });

export const getMe = () => API.get('/auth/me');

// ── System Calls ──────────────────────────────────────────────────
export const getSystemCalls = () => API.get('/system-calls');

export const executeSystemCall = (syscallKey, params) =>
  API.post('/system-calls/execute', { syscallKey, params });

// ── Logs ──────────────────────────────────────────────────────────
export const getLogs = (filters = {}) =>
  API.get('/logs', { params: filters });

export const clearLogs = () => API.delete('/logs');

// ── Health ────────────────────────────────────────────────────────
export const healthCheck = () => API.get('/health');

export default API;
