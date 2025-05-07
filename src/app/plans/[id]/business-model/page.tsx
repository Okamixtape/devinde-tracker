'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BusinessPlan } from "@/app/services/interfaces/serviceInterfaces";

// Interfaces locales pour ne pas conflictuer avec d'autres définitions
interface HourlyRate {
  name: string;
  rate: number;
  description?: string;
}

interface Package {
  name: string;
  price: number;
  description?: string;
  features?: string[];
}

interface Subscription {
  name: string;
  price: number;
  period: string;
  description?: string;
  features?: string[];
}

// Interface pour le modèle d'affaires
interface BusinessModelData {
  valueProposition?: string[];
  customerSegments?: string[];
  channels?: string[];
  customerRelationships?: string[];
  keyResources?: string[];
  keyActivities?: string[];
  keyPartners?: string[];
  costStructure?: string[];
  revenueStreams?: string[];
  // Structure de tarification
  hourlyRates?: HourlyRate[];
  packages?: Package[];
  subscriptions?: Subscription[];
}
import { getBusinessPlanService } from '@/app/services/serviceFactory';
import { PricingImpactVisualizer } from '@/app/components/business-model/PricingImpactVisualizer';

// Extension de l'interface BusinessModelData pour les champs additionnels
interface BusinessModelSection {
  title: string;
  content: string[];
  isComplete: boolean;
}

export default function BusinessModelPage() {
  const { id } = useParams() as { id: string };
  const businessPlanService = getBusinessPlanService();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadBusinessPlan = async () => {
      setLoading(true);
      try {
        const result = await businessPlanService.getItem(id);
        if (result.success && result.data) {
          setBusinessPlan(result.data as BusinessPlan);
        } else {
          setError(result.error?.message || 'Impossible de charger le plan d\'affaires');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
      } finally {
        setLoading(false);
      }
    };
    
    loadBusinessPlan();
  }, [id, businessPlanService]);
  
  // Fonction de rendu d'une section
  const renderSection = (section: BusinessModelSection) => {
    return (
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{section.title}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            section.isComplete 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}>
            {section.isComplete ? 'Complété' : 'À compléter'}
          </span>
        </div>
        
        <div className="space-y-3">
          {section.content.map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <p className="text-gray-700 dark:text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!businessPlan) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-yellow-700 dark:text-yellow-400">
        <p>Aucun plan d&apos;affaires trouvé</p>
      </div>
    );
  }
  
  const businessModel = businessPlan.businessModel;
  
  // S'assurer que businessModel est correctement typé
  const businessModelData: BusinessModelData = businessModel || {};
  
  // Récupérer ou initialiser des tableaux vides pour les propriétés optionnelles
  const valueProposition = businessModelData.valueProposition || [];
  const customerSegments = businessModelData.customerSegments || [];
  const channels = businessModelData.channels || [];
  const customerRelationships = businessModelData.customerRelationships || [];
  const keyResources = businessModelData.keyResources || [];
  const keyActivities = businessModelData.keyActivities || [];
  const keyPartners = businessModelData.keyPartners || [];
  const costStructure = businessModelData.costStructure || [];
  
  // Création des sections
  const sections: BusinessModelSection[] = [
    {
      title: 'Proposition de Valeur',
      content: valueProposition,
      isComplete: Array.isArray(valueProposition) && valueProposition.length > 0
    },
    {
      title: 'Segments de Clientèle',
      content: customerSegments,
      isComplete: Array.isArray(customerSegments) && customerSegments.length > 0
    },
    {
      title: 'Canaux de Distribution',
      content: channels,
      isComplete: Array.isArray(channels) && channels.length > 0
    },
    {
      title: 'Relations Client',
      content: customerRelationships,
      isComplete: Array.isArray(customerRelationships) && customerRelationships.length > 0
    },
    {
      title: 'Sources de Revenus',
      content: [
        ...(businessModelData.hourlyRates || []).map(rate => typeof rate === 'string' ? rate : `${rate.name}: ${rate.rate}€/h`),
        ...(businessModelData.packages || []).map(pkg => typeof pkg === 'string' ? pkg : `${pkg.name}: ${pkg.price}€`),
        ...(businessModelData.subscriptions || []).map(sub => typeof sub === 'string' ? sub : `${sub.name}: ${sub.price}€/${sub.period}`)
      ],
      isComplete: (
        (Array.isArray(businessModelData.hourlyRates) && businessModelData.hourlyRates.length > 0) ||
        (Array.isArray(businessModelData.packages) && businessModelData.packages.length > 0) ||
        (Array.isArray(businessModelData.subscriptions) && businessModelData.subscriptions.length > 0)
      )
    },
    {
      title: 'Ressources Clés',
      content: keyResources,
      isComplete: Array.isArray(keyResources) && keyResources.length > 0
    },
    {
      title: 'Activités Clés',
      content: keyActivities,
      isComplete: Array.isArray(keyActivities) && keyActivities.length > 0
    },
    {
      title: 'Partenaires Clés',
      content: keyPartners,
      isComplete: Array.isArray(keyPartners) && keyPartners.length > 0
    },
    {
      title: 'Structure de Coûts',
      content: costStructure,
      isComplete: Array.isArray(costStructure) && costStructure.length > 0
    }
  ];
  
  // Fonctions d'assistance et formatage pour le rendu de l'UI
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Modèle Économique
      </h1>
      
      <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-medium mb-3 text-blue-800 dark:text-blue-300">
          À propos du Modèle Économique
        </h2>
        <p className="text-blue-700 dark:text-blue-400 mb-2">
          Cette section vous permet de définir les éléments clés de votre modèle économique en tant qu&apos;indépendant, 
          en utilisant le cadre du Business Model Canvas adapté à votre situation.
        </p>
        <p className="text-blue-700 dark:text-blue-400 mb-2">
          Le Business Model Canvas est un outil stratégique qui vous permet de décrire et visualiser votre modèle économique à travers 9 composantes essentielles :
        </p>
        <ul className="list-disc pl-6 text-blue-700 dark:text-blue-400 mb-2 space-y-1">
          <li>Les partenaires clés (avec qui vous collaborez)</li>
          <li>Les activités clés (ce que vous faites)</li>
          <li>Les ressources clés (ce dont vous avez besoin)</li>
          <li>La proposition de valeur (ce que vous offrez)</li>
          <li>Les relations clients (comment vous interagissez)</li>
          <li>Les canaux de communication (comment vous êtes découvert)</li>
          <li>Les segments de clientèle (pour qui vous créez de la valeur)</li>
          <li>La structure de coûts (ce que vous dépensez)</li>
          <li>Les sources de revenus (comment vous générez des fonds)</li>
        </ul>
        <p className="text-blue-700 dark:text-blue-400">
          Complétez les différentes sections pour avoir une vision claire de votre proposition de valeur, 
          de vos clients, de vos revenus et de vos coûts. Utilisez également la visualisation d&apos;impact 
          pour simuler et comprendre l&apos;effet de votre tarification sur vos revenus potentiels.
        </p>
      </div>
      
      {/* Section des tarifications */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Modèles de tarification</h2>
        {/* Rendu des modèles de tarification */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {businessModelData.hourlyRates && businessModelData.hourlyRates.length > 0 && (
            <div className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Tarifs horaires</h3>
              <ul className="space-y-2">
                {businessModelData.hourlyRates.map((rate, index) => (
                  <li key={index} className="border-b pb-2">
                    <div className="font-medium">{rate.name}: {rate.rate} €/h</div>
                    {rate.description && <div className="text-sm text-gray-600">{rate.description}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {businessModelData.packages && businessModelData.packages.length > 0 && (
            <div className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Packages</h3>
              <ul className="space-y-2">
                {businessModelData.packages.map((pkg, index) => (
                  <li key={index} className="border-b pb-2">
                    <div className="font-medium">{pkg.name}: {pkg.price} €</div>
                    {pkg.description && <div className="text-sm text-gray-600">{pkg.description}</div>}
                    {pkg.features && (
                      <ul className="mt-1 text-xs list-disc pl-5">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {businessModelData.subscriptions && businessModelData.subscriptions.length > 0 && (
            <div className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Abonnements</h3>
              <ul className="space-y-2">
                {businessModelData.subscriptions.map((sub, index) => (
                  <li key={index} className="border-b pb-2">
                    <div className="font-medium">{sub.name}: {sub.price} €/{sub.period}</div>
                    {sub.description && <div className="text-sm text-gray-600">{sub.description}</div>}
                    {sub.features && (
                      <ul className="mt-1 text-xs list-disc pl-5">
                        {sub.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Visualisation de l'impact des modèles tarifaires */}
      {businessModelData && (
        // Force le typage pour éviter les erreurs de compatibilité entre les interfaces
        <PricingImpactVisualizer businessModel={JSON.parse(JSON.stringify(businessModelData))} />
      )}
      
      {/* Sections du modèle économique */}
      <div className="mt-8 grid grid-cols-1 gap-6">
        {sections.map((section, index) => (
          <div key={index}>
            {renderSection(section)}
          </div>
        ))}
      </div>
    </div>
  );
}
