import axios from 'axios';

// API configuration
export const api = axios.create({
  baseURL: process.env.VITE_API_URL || '/api',
  timeout: 10000,
});

// Request interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lokMoto-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para lidar com erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('lokMoto-token');
      localStorage.removeItem('lokMoto-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;