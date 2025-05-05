'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../services/core/auth-service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * Component to protect routes requiring authentication
 * Redirects to login page if user is not authenticated or doesn't have the required role
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Sauvegarder l'URL actuelle pour y revenir après authentification
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      router.push('/login');
      return;
    }

    // If a specific role is required, check permissions
    if (requiredRole && !hasRole(requiredRole)) {
      // Redirect to dashboard or unauthorized page
      router.push('/plans?unauthorized=true');
    }
  }, [isAuthenticated, hasRole, requiredRole, router]);

  // Don't render children until authentication is confirmed
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If role is required and user doesn't have it, show nothing while redirecting
  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  // User is authenticated and has required role, render children
  return <>{children}</>;
};

export default ProtectedRoute;
