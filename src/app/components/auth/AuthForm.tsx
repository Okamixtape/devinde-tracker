'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '../../hooks/useI18n';

type AuthMode = 'login' | 'register';

const AuthForm: React.FC = () => {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  
  const { login, register, isLoading, error } = useAuth();
  
  useEffect(() => {
    if (pathname === '/register') {
      setMode('register');
    } else {
      setMode('login');
    }
  }, [pathname]);
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormError('');
    if (mode === 'login') {
      router.push('/register');
    } else {
      router.push('/login');
    }
  };
  
  const validateForm = (): boolean => {
    if (!email) {
      setFormError(t('auth.emailRequired'));
      return false;
    }
    
    if (!password) {
      setFormError(t('auth.passwordRequired'));
      return false;
    }
    
    if (mode === 'register' && password.length < 8) {
      setFormError(t('auth.passwordLength'));
      return false;
    }
    
    if (mode === 'register' && !name) {
      setFormError(t('auth.nameRequired'));
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
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
        setFormError('Authentication failed. Please check your credentials.');
      } else {
        // Vérifier s'il existe une URL à restaurer après connexion
        const savedPath = typeof window !== 'undefined' ? localStorage.getItem('redirectAfterLogin') : null;
        
        if (savedPath) {
          // Nettoyer le localStorage
          localStorage.removeItem('redirectAfterLogin');
          // Rediriger vers l'URL sauvegardée
          router.push(savedPath);
        } else {
          // Rediriger vers la liste des plans par défaut
          router.push('/plans');
        }
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        {mode === 'login' ? t('auth.login') : t('auth.register')}
      </h2>
      
      {(error || formError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {formError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="mb-4">
            <label className="block text-gray-800 font-medium mb-2" htmlFor="name">
              {t('auth.name')} <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-gray-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-gray-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-gray-500"
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
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input 
              id="remember" 
              type="checkbox" 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              {t('auth.rememberMe')}
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('auth.forgotPassword')}
            </a>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'login' ? t('common.loading') : t('common.creating')}
              </span>
            ) : (
              mode === 'login' ? t('auth.login') : t('auth.register')
            )}
          </button>
        </div>
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
