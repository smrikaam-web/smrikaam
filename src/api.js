import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization Bearer token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smrikaam_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname.startsWith('/smrikaam-admin') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('smrikaam_admin_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

