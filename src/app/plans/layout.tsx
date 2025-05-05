'use client';

import React from 'react';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
