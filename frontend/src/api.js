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
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark this request as retried to avoid infinite loops
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      
      if (refreshToken) {
        try {
          console.log("🔑 Attempting token refresh from interceptor");
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/token/refresh/`,
            { refresh: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (response.status === 200) {
            // Update the access token
            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            // Update the original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.log("🔑 Token refresh failed in interceptor:", refreshError);
          // Only clear storage if refresh explicitly fails
          localStorage.clear();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
      
      // No refresh token available, clear storage and redirect
      console.log("🔑 No refresh token available, clearing storage");
      localStorage.clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;