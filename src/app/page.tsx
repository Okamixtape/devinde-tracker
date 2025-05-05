"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBusinessPlanService } from './services/service-factory';
import { BusinessPlanData } from './services/interfaces/data-models';

export default function HomePage() {
  const [plans, setPlans] = useState<BusinessPlanData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      const businessPlanService = getBusinessPlanService();
      const result = await businessPlanService.getItems();
      
      if (result.success) {
        setPlans(result.data || []);
      }
      setLoading(false);
    };
    
    loadPlans();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-500 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">DevIndé Tracker</h1>
            <p className="text-xl mb-8">
              Votre assistant pour planifier, structurer et développer votre activité indépendante
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/plans/new" 
                className="px-6 py-3 bg-white text-indigo-600 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Créer un nouveau plan
              </Link>
              <Link
                href="/monitoring"
                className="px-6 py-3 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Monitoring
              </Link>
              {plans.length > 0 && (
                <Link 
                  href={`/plans/${plans[0].id}/dashboard`} 
                  className="px-6 py-3 bg-indigo-700 text-white rounded-md font-medium hover:bg-indigo-800 transition-colors"
                >
                  Mon dernier plan
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
          Structurez votre activité indépendante
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Modèle Économique</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Définissez votre positionnement, vos tarifs, et vos offres de services pour maximiser votre rentabilité.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Analyse de Marché</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Identifiez vos clients cibles, analysez la concurrence et positionnez-vous stratégiquement sur votre marché.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Plan d&apos;Action</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Créez votre roadmap avec des jalons clairs et des tâches précises pour atteindre vos objectifs.
            </p>
          </div>
        </div>
      </div>
      
      {/* Plans Section */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Mes Plans d&apos;Affaires
          </h2>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                      {plan.name || 'Plan sans nom'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {plan.pitch?.summary || 'Aucune description'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {plan.sections?.length || 0} sections
                      </span>
                      <Link
                        href={`/plans/${plan.id}/dashboard`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium"
                      >
                        Voir le plan →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md border-2 border-dashed border-gray-300 dark:border-gray-500 flex items-center justify-center">
                <Link
                  href="/plans/new"
                  className="p-6 text-center w-full h-full flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    Créer un nouveau plan
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md text-center max-w-lg mx-auto">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Vous n&apos;avez pas encore de plan d&apos;affaires. Créez votre premier plan pour commencer à structurer votre activité indépendante.
              </p>
              <Link
                href="/plans/new"
                className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 inline-block"
              >
                Créer mon premier plan
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">&copy; 2025 DevIndé Tracker - Tous droits réservés</p>
          <div className="mt-4 space-x-4">
            <Link href="/documentation" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">Documentation</Link>
            <Link href="/plans" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">Tous mes plans</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
