'use client';

import { ReactNode, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { AuthContext, AuthContextType } from './AuthContext';
import { authService } from '../services/authService';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // First try to authenticate with our customer API
      const result = await authService.login(email, password);
      
      // If successful, use next-auth to create a session
      if (result) {
        const nextAuthResult = await signIn('credentials', {
          redirect: false,
          email,
          password,
          callbackUrl: '/',
        });
        
        if (nextAuthResult?.error) {
          setError(nextAuthResult.error);
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
      return false;
    }
  };
  
  const logout = async (): Promise<void> => {
    await signOut({ redirect: false });
  };
  
  const register = async (userData: any): Promise<boolean> => {
    try {
      const result = await authService.register(userData);
      return !!result;
    } catch (err) {
      setError('An error occurred during registration');
      console.error('Registration error:', err);
      return false;
    }
  };
  
  const contextValue: AuthContextType = {
    user: session?.user || null,
    isAuthenticated: !!session,
    login,
    logout,
    register,
    loading: status === 'loading',
    error,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
} 