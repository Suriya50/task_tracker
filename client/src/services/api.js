import axios from 'axios';

// ─── BASE URL ───
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── CREATE AXIOS INSTANCE ───
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // if you use cookies (optional)
});

// ─── DEBUG LOG (only in development) ───
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', BASE_URL);
}

// ─── REQUEST INTERCEPTOR: ATTACH TOKEN ───
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR: HANDLE 401 ───
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network or server errors
    if (!error.response) {
      console.error('🌐 Network error:', error.message);
      return Promise.reject({ message: 'Network error – please check your connection' });
    }

    // 401 Unauthorized – clear token and redirect to login
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect only if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // 403 Forbidden – show a user-friendly message
    if (error.response.status === 403) {
      console.warn('⛔ Forbidden:', error.response.data?.message);
    }

    // 500 Internal Server Error – log the error
    if (error.response.status >= 500) {
      console.error('🔥 Server error:', error.response.data?.message || error.message);
    }

    return Promise.reject(error);
  }
);

export default api;