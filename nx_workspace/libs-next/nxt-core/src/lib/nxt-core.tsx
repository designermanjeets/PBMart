import React, { createContext, useContext, ReactNode } from 'react';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Types
export interface CoreConfig {
  apiUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

interface CoreContextType {
  apiClient: AxiosInstance;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  showNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

interface CoreProviderProps {
  children: ReactNode;
  config: CoreConfig;
}

// Create context
const CoreContext = createContext<CoreContextType | undefined>(undefined);

// Custom hook for using the core context
export const useCore = () => {
  const context = useContext(CoreContext);
  if (!context) {
    throw new Error('useCore must be used within a CoreProvider');
  }
  return context;
};

// API client creator
export const createApiClient = (config: CoreConfig): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: config.apiUrl,
    timeout: config.timeout || 30000,
    headers: {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    },
  });

  // Request interceptor
  apiClient.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // Get token from localStorage if in browser environment
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('b2b_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      
      // Handle 401 Unauthorized errors (token expired)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh token
          if (typeof window !== 'undefined') {
            const refreshToken = localStorage.getItem('b2b_refresh_token');
            
            if (refreshToken) {
              const response = await axios.post(`${config.apiUrl}/auth/refresh-token`, {
                refreshToken,
              });
              
              const { token, refreshToken: newRefreshToken } = response.data;
              
              // Update tokens in localStorage
              localStorage.setItem('b2b_token', token);
              localStorage.setItem('b2b_refresh_token', newRefreshToken);
              
              // Update Authorization header
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              
              // Retry the original request
              return apiClient(originalRequest);
            }
          }
        } catch (refreshError) {
          // If refresh token is invalid, redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('b2b_token');
            localStorage.removeItem('b2b_refresh_token');
            window.location.href = '/login';
          }
        }
      }
      
      return Promise.reject(error);
    }
  );

  return apiClient;
};

// Core Provider component
export const CoreProvider: React.FC<CoreProviderProps> = ({ children, config }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const apiClient = React.useMemo(() => createApiClient(config), [config]);
  
  // Simple notification function (can be replaced with a proper notification library)
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    console.log(`[${type.toUpperCase()}]: ${message}`);
    // In a real implementation, you would use a toast/notification library
  };
  
  const value = {
    apiClient,
    isLoading,
    setLoading: setIsLoading,
    showNotification,
  };
  
  return <CoreContext.Provider value={value}>{children}</CoreContext.Provider>;
};

// SSR helper to fetch data on the server
export async function fetchDataOnServer<T>(
  url: string,
  config: CoreConfig,
  options?: AxiosRequestConfig
): Promise<T> {
  try {
    const apiClient = createApiClient(config);
    const response = await apiClient.get<T>(url, options);
    return response.data;
  } catch (error) {
    console.error('Error fetching data on server:', error);
    throw error;
  }
}

// Error boundary component
export class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Utility to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const data = axiosError.response.data as any;
      return data.message || 'An error occurred with the API request';
    } else if (axiosError.request) {
      // The request was made but no response was received
      return 'No response received from server. Please check your connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      return axiosError.message || 'Error setting up the request';
    }
  }
  
  // For non-Axios errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

// Export a default component for the library
export function NxtCore() {
  return (
    <div className="text-center p-4 bg-gray-100 rounded-md">
      <h2 className="text-xl font-bold text-gray-800">B2B E-commerce Platform</h2>
      <p className="text-gray-600">Core Next.js utilities loaded successfully</p>
    </div>
  );
}

export default NxtCore;
