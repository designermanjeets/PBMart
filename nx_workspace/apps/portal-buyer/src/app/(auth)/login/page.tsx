import { Metadata } from 'next';
import { AuthProvider } from '@b2b/auth';
import LoginForm from './components/LoginForm';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Login - B2B Marketplace',
  description: 'Login to your B2B marketplace account',
};

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-center">Login</h1>
          <LoginForm />
        </div>
      </div>
    </AuthProvider>
  );
} 