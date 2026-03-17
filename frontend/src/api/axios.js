import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ADDED: logs the real backend error to console so you can see it
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || error.message || 'Unknown error';
    console.error(`API Error [${error.response?.status}]: ${message}`);
    return Promise.reject(error);
  }
);

export default api;