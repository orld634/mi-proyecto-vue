// src/api/adminApi.js
import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Cambia si es necesario

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const categoriaApi = {
  create: (data) => api.post('/categoria/create', data),
  getAllWithCount: () => api.get('/categoria/with-count'),
};

export const productoApi = {
  create: (data) => api.post('/productos/create', data),
  getAll: () => api.get('/productos'),
  getLowStock: () => api.get('/productos/stock-bajo'),
};