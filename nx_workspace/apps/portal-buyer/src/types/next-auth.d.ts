// Create this file to extend Next.js types
import "next-auth";

declare module "next-auth" {
  interface User {
    accessToken?: string;
    role?: string;
  }
  
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: string;
  }
} 