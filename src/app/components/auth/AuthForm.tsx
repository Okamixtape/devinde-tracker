'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { useI18n } from '@/app/hooks/useI18n';
import { useToast } from '@/app/components/error/ToastManager';

type AuthMode = 'login' | 'register';

const AuthForm: React.FC = () => {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { showError, showWarning } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const { login, register, isLoading } = useAuth();
  
  useEffect(() => {
    if (pathname === '/register') {
      setMode('register');
    } else {
      setMode('login');
    }
  }, [pathname]);
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    if (mode === 'login') {
      router.push('/register');
    } else {
      router.push('/login');
    }
  };
  
  const validateForm = (): boolean => {
    if (!email) {
      showError(t('auth.emailRequired'));
      return false;
    }
    
    if (!password) {
      showError(t('auth.passwordRequired'));
      return false;
    }
    
    if (mode === 'register' && password.length < 8) {
      showError(t('auth.passwordLength'));
      return false;
    }
    
    if (mode === 'register' && !name) {
      showError(t('auth.nameRequired'));
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      let success = false;
      
      if (mode === 'login') {
        success = await login(email, password);
      } else {
        success = await register(email, password, name);
      }
      
      if (!success) {
        showWarning('Authentication failed. Please check your credentials.', 'Login Error');
      } else {
        // Les redirections sont gérées dans la page login/page.tsx
        // grâce au RedirectService, ce qui assure une gestion cohérente
        // des redirections après l'authentification
      }
    } catch (err) {
      showWarning('An unexpected error occurred. Please try again.', 'System Error');
      console.error('Auth error:', err);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        {mode === 'login' ? t('auth.login') : t('auth.register')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {mode === 'register' && (
          <div className="mb-4">
            <label className="block text-gray-800 font-medium mb-2" htmlFor="name">
              {t('auth.name')} <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.namePlaceholder')}
              required
            />
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-800 font-medium mb-2" htmlFor="email">
            {t('auth.email')} <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-800 font-medium mb-2" htmlFor="password">
            {t('auth.password')} <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
            required
          />
          {mode === 'register' && (
            <p className="mt-1 text-sm text-gray-600">
              {t('auth.passwordRequirements')}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">{t('auth.processing')}</span>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            </>
          ) : (
            mode === 'login' ? t('auth.loginButton') : t('auth.registerButton')
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {mode === 'login' ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
          <button 
            onClick={toggleMode}
            className="ml-1 font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
          >
            {mode === 'login' ? t('auth.register') : t('auth.login')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
