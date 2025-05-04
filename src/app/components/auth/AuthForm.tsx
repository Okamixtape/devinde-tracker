'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

type AuthMode = 'login' | 'register';

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  
  const { login, register, isLoading, error } = useAuth();
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormError('');
  };
  
  const validateForm = (): boolean => {
    if (!email) {
      setFormError('Email is required');
      return false;
    }
    
    if (!password) {
      setFormError('Password is required');
      return false;
    }
    
    if (mode === 'register' && password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return false;
    }
    
    if (mode === 'register' && !name) {
      setFormError('Name is required');
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
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </h2>
      
      {(error || formError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {formError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'register' ? 'Min. 8 characters' : 'Your password'}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading
            ? 'Processing...'
            : mode === 'login'
            ? 'Sign In'
            : 'Create Account'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={toggleMode}
          className="text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          {mode === 'login'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
