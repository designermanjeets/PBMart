'use client';

import { createContext } from 'react';

// Define the shape of the auth context
export interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType | null>(null); 