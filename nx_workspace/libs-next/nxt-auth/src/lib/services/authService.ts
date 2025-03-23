import axios from 'axios';
import { User } from '../hooks/useAuth';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000';

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
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  getProfile: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (token: string, profileData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<any> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return null;
      }
      
      return await authService.getProfile(token);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  getHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem('token');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
};

// Set up axios interceptor to add the token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
        const token = localStorage.getItem('token');
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