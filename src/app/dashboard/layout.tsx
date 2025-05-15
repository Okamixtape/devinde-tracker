'use client';

import React from 'react';
import { ProtectedPage } from '@/app/components/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedPage title="Tableau de bord" description="Pilotez votre activité indépendante">
      {children}
    </ProtectedPage>
  );
}
