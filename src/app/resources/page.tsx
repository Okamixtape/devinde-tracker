'use client';

import React from 'react';
import AuthRedirect from '../components/auth/AuthRedirect';
import { useI18n } from '../hooks/useI18n';

export default function ResourcesPage() {
  const { t } = useI18n();

  return (
    <AuthRedirect message={t('auth.unauthorizedResources')}>
      <div className="container mx-auto px-4 py-8">
        {/* Contenu des ressources - Accessible uniquement par les utilisateurs authentifiés */}
        <h1 className="text-2xl font-bold mb-6">{t('resources.title')}</h1>
        
        {/* Le contenu des ressources sera ajouté ici dans une tâche future */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-700 dark:text-gray-300">
            {t('resources.description')}
          </p>
        </div>
      </div>
    </AuthRedirect>
  );
}
