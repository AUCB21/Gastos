// Interceptor file for API calls
// Adds correct headers, base URL, etc.
import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

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
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      
      if (refreshToken) {
        try {
          // Try to blacklist the refresh token before clearing
          await api.post('/api/logout/', { refresh: refreshToken });
        } catch (logoutError) {
          console.log('Error during logout:', logoutError);
        }
      }
      
      // Clear all tokens and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;