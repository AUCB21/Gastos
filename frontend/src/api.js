// Interceptor file for API calls
// Adds correct headers, base URL, and token validation
import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode the JWT token payload (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000; // Convert to seconds
    
    // Check if token is expired (with 30 second buffer)
    return payload.exp < (currentTime + 30);
  } catch {
    return true; // Treat invalid tokens as expired
  }
};

// Helper function to clear auth data and redirect
const clearAuthAndRedirect = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  
  // Only redirect if not already on login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Helper function to refresh access token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Check if refresh token is expired
  if (isTokenExpired(refreshToken)) {
    throw new Error('Refresh token is expired');
  }

  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/token/refresh/`,
    { refresh: refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (response.status === 200 && response.data.access) {
    localStorage.setItem(ACCESS_TOKEN, response.data.access);
    return response.data.access;
  } else {
    throw new Error('Invalid refresh response');
  }
};

// Request interceptor - validates token before making requests
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem(ACCESS_TOKEN);
    
    // Skip token validation for login/register endpoints
    const isAuthEndpoint = config.url?.includes('/token/') || 
                          config.url?.includes('/register/') || 
                          config.url?.includes('/login/');
    
    if (!isAuthEndpoint) {
      // Check if we have a token
      if (!token) {
        clearAuthAndRedirect();
        return Promise.reject(new Error('No access token'));
      }
      
      // Check if token is expired
      if (isTokenExpired(token)) {
        try {
          token = await refreshAccessToken();
        } catch (error) {
          clearAuthAndRedirect();
          return Promise.reject(error);
        }
      }
      
      // Add valid token to request headers
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);  

// Response interceptor - handles authentication errors
api.interceptors.response.use(
  (response) => {
    // Request was successful
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      // Avoid infinite retry loops
      if (originalRequest._retry) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }
      
      // Skip retry for auth endpoints
      const isAuthEndpoint = originalRequest.url?.includes('/token/') || 
                            originalRequest.url?.includes('/register/') || 
                            originalRequest.url?.includes('/login/');
      
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }
      
      // Mark request as retried
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const newToken = await refreshAccessToken();
        
        // Update the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        
        // Retry the original request
        return api(originalRequest);
        
      } catch (refreshError) {
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      }
    }
    
    // Handle 403 Forbidden responses (might indicate invalid token)
    if (error.response?.status === 403) {
      const token = localStorage.getItem(ACCESS_TOKEN);
      
      if (token && isTokenExpired(token)) {
        clearAuthAndRedirect();
      }
    }
    
    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default api;