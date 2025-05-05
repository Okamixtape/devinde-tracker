'use client';

import React from 'react';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </ProtectedRoute>
  );
}
