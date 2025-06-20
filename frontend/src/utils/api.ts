import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const register = async (data: { name: string; username: string; contact: string; password: string; confirmPassword: string }) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const login = async (contact: string, password: string) => {
  const response = await api.post('/auth/login', { username: contact, password });
  return response.data;
};

export const verifyToken = async () => {
  const response = await api.get('/auth/verify');
  return response.data;
};

export const googleLogin = () => {
  window.location.href = import.meta.env.VITE_BACKEND_OAUTH_URL; // Initiate Google OAuth flow
};

export default api;