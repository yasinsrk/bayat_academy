// src/api/config.js
import axios from 'axios';

// Relative URL — Nginx will route /api/* to Django
// const API_BASE_URL = '/api';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});


// ===== Request Interceptor =====
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Response Interceptor =====
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        handleAutoLogout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/accounts/token/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

        return axios(originalRequest);

      } catch (refreshError) {
        handleAutoLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function handleAutoLogout() {
  console.log('🔴 Auto logout - Token expired');

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');

  try {
    const { store } = require('../app/store');
    const { resetAuth } = require('../features/auth/authSlice');
    store.dispatch(resetAuth());
    console.log('✅ Redux state reset');
  } catch (err) {
    console.warn('Could not reset Redux:', err);
  }

  try {
    const { toast } = require('react-toastify');
    toast.warning('نشست شما منقضی شده است. لطفاً مجدداً وارد شوید.');
  } catch (err) {
    console.warn('Could not show toast:', err);
  }

  setTimeout(() => {
    window.location.href = '/login';
  }, 500);
}

export default api;