import axios from 'axios';
import { User } from '../hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to handle API errors
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error(error.message || 'Error setting up the request');
    }
  }
  throw error;
};

export const authService = {
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      
      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      
      return response.data.user;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async register(userData: any): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      
      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      
      return response.data.user;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
      localStorage.removeItem('token');
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return null;
      }
      
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  },
  
  async refreshToken(): Promise<string> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh-token`);
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error) {
      localStorage.removeItem('token');
      return handleApiError(error);
    }
  },
  
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
};

// Set up axios interceptor to add the token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Set up axios interceptor to handle token refresh on 401 errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const token = await authService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If token refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default authService; 