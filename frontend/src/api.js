// Interceptor file for API calls
// Adds correct headers, base URL, etc.
import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';
import { redirect } from 'react-router-dom';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});


// JWT Access Token interceptor
api.interceptors.request.use( config => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
    },
    (error) => Promise.reject(error)
);  

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      redirect('/login');
    }
    return Promise.reject(error);
  }
);

export default api;