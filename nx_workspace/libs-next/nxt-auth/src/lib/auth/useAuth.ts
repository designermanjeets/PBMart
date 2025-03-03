'use client';

import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useSession } from "next-auth/react";

export function useAuth() {
  const context = useContext(AuthContext);
  const { data: session } = useSession();
  
  // If no context is available, provide a default implementation
  if (!context) {
    return {
      user: session?.user || null,
      isAuthenticated: !!session,
      login: async () => false,
      logout: async () => {},
      register: async () => false,
      loading: false,
      error: null,
    };
  }
  
  return context;
}