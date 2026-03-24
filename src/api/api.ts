// src/api/index.ts
import axios from 'axios';

// Usa la variable de entorno que ya tienes configurada
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8222/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Opcional: interceptores para token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;