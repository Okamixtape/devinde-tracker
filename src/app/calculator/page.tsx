'use client';

import React from 'react';
import AuthRedirect from "@/app/components/auth/AuthRedirect";
import { useI18n } from "@/app/hooks/useI18n";

export default function CalculatorPage() {
  const { t } = useI18n();

  return (
    <AuthRedirect message={t('auth.unauthorizedCalculator')}>
      <div className="container mx-auto px-4 py-8">
        {/* Contenu du calculateur - Accessible uniquement par les utilisateurs authentifiés */}
        <h1 className="text-2xl font-bold mb-6">{t('calculator.title')}</h1>
        
        {/* Le contenu du calculateur sera ajouté ici dans une tâche future */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-700 dark:text-gray-300">
            {t('calculator.description')}
          </p>
        </div>
      </div>
    </AuthRedirect>
  );
}
