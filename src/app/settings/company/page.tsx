'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyInfo } from '@/app/interfaces/invoicing';

/**
 * Page de configuration des informations de l'entreprise
 * Ces informations seront utilisées automatiquement pour les devis et factures
 */
export default function CompanySettingsPage() {
  const router = useRouter();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'France',
    email: '',
    phone: '',
    website: '',
    siret: '',
    vatNumber: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Chargement des données entreprise
  useEffect(() => {
    const loadCompanyInfo = () => {
      try {
        const savedInfo = localStorage.getItem('devinde-company-info');
        if (savedInfo) {
          setCompanyInfo(JSON.parse(savedInfo));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des informations entreprise:', error);
      }
    };

    loadCompanyInfo();
  }, []);

  // Gestion des changements de champs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enregistrement des informations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      localStorage.setItem('devinde-company-info', JSON.stringify(companyInfo));
      setSaveMessage('Informations entreprise enregistrées avec succès');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      setSaveMessage('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Configuration de l&apos;entreprise</h1>
      <p className="text-gray-600 mb-6">
        Ces informations apparaîtront automatiquement sur vos devis et factures.
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations principales */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Informations générales</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom de l&apos;entreprise*
                </label>
                <input
                  type="text"
                  name="name"
                  value={companyInfo.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adresse*
                </label>
                <input
                  type="text"
                  name="address"
                  value={companyInfo.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code postal*
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={companyInfo.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ville*
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={companyInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pays*
                </label>
                <input
                  type="text"
                  name="country"
                  value={companyInfo.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            {/* Informations de contact */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Informations de contact</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={companyInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={companyInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site web
                </label>
                <input
                  type="url"
                  name="website"
                  value={companyInfo.website}
                  onChange={handleInputChange}
                  placeholder="https://www.exemple.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SIRET
                </label>
                <input
                  type="text"
                  name="siret"
                  value={companyInfo.siret}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numéro de TVA
                </label>
                <input
                  type="text"
                  name="vatNumber"
                  value={companyInfo.vatNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between">
            <div>
              {saveMessage && (
                <p className={`text-sm ${saveMessage.includes('Erreur') ? 'text-red-500' : 'text-green-500'}`}>
                  {saveMessage}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
