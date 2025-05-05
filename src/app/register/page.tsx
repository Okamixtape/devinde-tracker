'use client';

import React, { useEffect } from 'react';
import AuthForm from '@/app/components/auth/AuthForm';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">DevIndé Tracker</h1>
          <p className="mt-2 text-sm text-gray-600">
            Créez un compte pour commencer à utiliser DevIndé Tracker
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
