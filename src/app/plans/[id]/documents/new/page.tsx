'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { 
  Document, 
  DocumentType, 
  DocumentStatus, 
  ClientInfo, 
  CompanyInfo,
  InvoiceItem,
  calculateDocumentTotals,
  generateDocumentNumber
} from '@/app/interfaces/invoicing';
import DocumentService from '@/app/services/documentService';
import { getBusinessPlanService } from '@/app/services/serviceFactory';
import { BusinessPlanData } from '@/app/services/interfaces/dataModels';
import { Service } from '@/app/plans/[id]/services/components/ServiceCard';
import { loadServiceDetailsFromLocalStorage } from '@/app/plans/[id]/services/components/serviceUtils';

/**
 * Page de création d'un nouveau document (devis ou facture)
 */
export default function NewDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessPlanId = params.id as string;
  const businessPlanService = getBusinessPlanService();
  
  // Paramètres d'URL
  const documentType = searchParams.get('type') as DocumentType || DocumentType.QUOTE;
  const serviceId = searchParams.get('serviceId');
  const serviceDataParam = searchParams.get('serviceData');
  
  // États
  const [loading, setLoading] = useState(true);
  // Nous stockons le business plan pour d'éventuelles utilisations futures
  const [, setBusinessPlan] = useState<BusinessPlanData | null>(null);
  const [documentItems, setDocumentItems] = useState<InvoiceItem[]>([]);
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'France',
    email: '',
    phone: '',
    vatNumber: ''
  });
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
  const [notes, setNotes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Paiement à réception de facture');
  const [validUntil, setValidUntil] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Calculs
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Variable pour éviter la répétition des appels à localStorage
  const [companyInfoLoaded, setCompanyInfoLoaded] = useState(false);
  
  // Chargement des données
  useEffect(() => {
    // Fonction pour charger le business plan
    const loadBusinessPlan = async () => {
      if (!businessPlanId) return null;
      
      try {
        const result = await businessPlanService.getItem(businessPlanId);
        if (result.success && result.data) {
          return result.data;
        }
      } catch (error) {
        console.error('Erreur lors du chargement du plan d\'affaires:', error);
      }
      return null;
    };
    
    // Fonction pour charger les infos de l'entreprise
    const loadCompanyInfo = () => {
      if (companyInfoLoaded) return;
      
      try {
        const savedCompanyInfo = localStorage.getItem('devinde-company-info');
        if (savedCompanyInfo) {
          setCompanyInfo(JSON.parse(savedCompanyInfo));
        } else {
          // Valeurs par défaut
          setCompanyInfo({
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
        }
        setCompanyInfoLoaded(true);
      } catch (e) {
        console.error('Erreur lors du chargement des informations entreprise:', e);
      }
    };
    
    // Fonction principale de chargement
    const loadData = async () => {
      setLoading(true);
      try {
        // Chargement du business plan
        const loadedBusinessPlan = await loadBusinessPlan();
        if (loadedBusinessPlan) {
          setBusinessPlan(loadedBusinessPlan);
        }
        
        // Chargement des informations de l'entreprise
        loadCompanyInfo();
        
        // Si un service est spécifié, l'ajouter comme élément
        if (serviceDataParam) {
          try {
            const serviceData = JSON.parse(decodeURIComponent(serviceDataParam)) as Service;
            
            // Déterminer le prix en fonction du mode de facturation
            let unitPrice = 0;
            let description = serviceData.name;
            let quantity = 1;
            
            switch(serviceData.billingMode) {
              case 'hourly':
                unitPrice = serviceData.hourlyRate || 0;
                quantity = serviceData.estimatedHours || 1;
                description = `${serviceData.name} - Prestation horaire`;
                break;
              case 'package':
                unitPrice = serviceData.packagePrice || 0;
                description = `${serviceData.name} - Forfait`;
                break;
              case 'subscription':
                unitPrice = serviceData.subscriptionPrice || 0;
                description = `${serviceData.name} - Abonnement mensuel`;
                break;
            }
            
            // Ajouter l'élément
            addItem({
              id: uuidv4(),
              description,
              quantity,
              unitPrice,
              taxRate: 0.2,
              discount: 0
            });
          } catch (e) {
            console.error('Erreur lors du parsing des données du service:', e);
          }
        }
        // Autrement, si seul un ID de service est fourni, le charger depuis le localStorage
        else if (serviceId) {
          const services = loadServiceDetailsFromLocalStorage(businessPlanId, []);
          const serviceData = services.find(s => s.id === serviceId);
          
          if (serviceData) {
            // Déterminer le prix en fonction du mode de facturation
            let unitPrice = 0;
            let description = serviceData.name;
            let quantity = 1;
            
            switch(serviceData.billingMode) {
              case 'hourly':
                unitPrice = serviceData.hourlyRate || 0;
                quantity = serviceData.estimatedHours || 1;
                description = `${serviceData.name} - Prestation horaire`;
                break;
              case 'package':
                unitPrice = serviceData.packagePrice || 0;
                description = `${serviceData.name} - Forfait`;
                break;
              case 'subscription':
                unitPrice = serviceData.subscriptionPrice || 0;
                description = `${serviceData.name} - Abonnement mensuel`;
                break;
            }
            
            // Ajouter l'élément
            addItem({
              id: uuidv4(),
              description,
              quantity,
              unitPrice,
              taxRate: 0.2,
              discount: 0
            });
          }
        }
        
        // Initialiser la validité/échéance
        const today = new Date();
        
        // Pour les devis (validité par défaut +30 jours)
        if (documentType === DocumentType.QUOTE) {
          const validityDate = new Date(today);
          validityDate.setDate(validityDate.getDate() + 30);
          setValidUntil(validityDate.toISOString().split('T')[0]);
        }
        
        // Pour les factures (échéance par défaut +15 jours)
        if (documentType === DocumentType.INVOICE) {
          const dueDate = new Date(today);
          dueDate.setDate(dueDate.getDate() + 15);
          setDueDate(dueDate.toISOString().split('T')[0]);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [businessPlanId, documentType, serviceDataParam, businessPlanService, serviceId, companyInfoLoaded]);
  
  // Recalculer les totaux quand les éléments changent
  useEffect(() => {
    // Sous-total
    const newSubtotal = documentItems.reduce((sum, item) => {
      const discountFactor = item.discount ? 1 - (item.discount / 100) : 1;
      return sum + (item.quantity * item.unitPrice * discountFactor);
    }, 0);
    
    // TVA
    const newTaxAmount = documentItems.reduce((sum, item) => {
      const discountFactor = item.discount ? 1 - (item.discount / 100) : 1;
      const itemTotal = item.quantity * item.unitPrice * discountFactor;
      return sum + (itemTotal * item.taxRate);
    }, 0);
    
    // Total
    const newTotal = newSubtotal + newTaxAmount;
    
    setSubtotal(newSubtotal);
    setTaxAmount(newTaxAmount);
    setTotal(newTotal);
  }, [documentItems]);
  
  // Ajouter un nouvel élément
  const addItem = (item: InvoiceItem) => {
    setDocumentItems(prev => [...prev, item]);
  };
  
  // Ajouter un élément vide
  const addEmptyItem = () => {
    addItem({
      id: uuidv4(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0.2,
      discount: 0
    });
  };
  
  // Mettre à jour un élément
  const updateItem = (id: string, data: Partial<InvoiceItem>) => {
    setDocumentItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...data } : item
    ));
  };
  
  // Supprimer un élément
  const removeItem = (id: string) => {
    setDocumentItems(prev => prev.filter(item => item.id !== id));
  };
  
  // Sauvegarder le document
  const saveDocument = () => {
    // Générer un nouveau numéro de document
    let count = 1;
    try {
      const storedCount = localStorage.getItem('devinde_document_count');
      if (storedCount) {
        count = parseInt(storedCount, 10) + 1;
      }
      localStorage.setItem('devinde_document_count', count.toString());
    } catch (e) {
      console.error('Erreur lors de la génération du numéro de document:', e);
    }
    
    const number = generateDocumentNumber(documentType, count);
    
    // Créer le document
    const document: Document = {
      id: uuidv4(),
      type: documentType,
      status: DocumentStatus.DRAFT,
      number,
      issueDate,
      businessPlanId,
      serviceId: serviceId || undefined,
      clientInfo,
      companyInfo,
      items: documentItems,
      notes,
      paymentTerms,
      validUntil: documentType === DocumentType.QUOTE ? validUntil : undefined,
      dueDate: documentType === DocumentType.INVOICE ? dueDate : undefined,
      subtotal,
      taxAmount,
      total
    };
    
    // Sauvegarder
    const savedDocument = DocumentService.save(document);
    
    // Rediriger vers la page de détails
    router.push(`/plans/${businessPlanId}/documents/${savedDocument.id}`);
  };
  
  // Annuler et retourner à la liste
  const handleCancel = () => {
    router.push(`/plans/${businessPlanId}/documents`);
  };
  
  // Formatage des montants
  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-pulse text-center">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {documentType === DocumentType.INVOICE ? 'Nouvelle Facture' : 'Nouveau Devis'}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={saveDocument}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Enregistrer
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Message concernant les paramètres de l'entreprise */}
        <div className="md:col-span-2 bg-blue-50 text-blue-700 p-4 rounded-lg mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <span className="font-medium">Astuce:</span> Vous pouvez configurer vos informations d&apos;entreprise dans les 
            <a href="/settings/company" target="_blank" className="underline ml-1">paramètres de l&apos;entreprise</a>.
          </div>
        </div>
      
        {/* Informations du client */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Informations du client</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="client-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom / Entreprise*
              </label>
              <input
                id="client-name"
                name="client-name"
                type="text"
                value={clientInfo.name}
                onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="client-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adresse*
              </label>
              <input
                id="client-address"
                name="client-address"
                type="text"
                value={clientInfo.address}
                onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="client-zipcode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code postal*
                </label>
                <input
                  id="client-zipcode"
                  name="client-zipcode"
                  type="text"
                  value={clientInfo.zipCode}
                  onChange={(e) => setClientInfo({...clientInfo, zipCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="client-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ville*
                </label>
                <input
                  id="client-city"
                  name="client-city"
                  type="text"
                  value={clientInfo.city}
                  onChange={(e) => setClientInfo({...clientInfo, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="client-country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pays
              </label>
              <input
                id="client-country"
                name="client-country"
                type="text"
                value={clientInfo.country}
                onChange={(e) => setClientInfo({...clientInfo, country: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="client-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="client-email"
                name="client-email"
                type="email"
                value={clientInfo.email || ''}
                onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="client-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Téléphone
              </label>
              <input
                id="client-phone"
                name="client-phone"
                type="tel"
                value={clientInfo.phone || ''}
                onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="client-vat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                N° TVA intracommunautaire
              </label>
              <input
                id="client-vat"
                name="client-vat"
                type="text"
                value={clientInfo.vatNumber || ''}
                onChange={(e) => setClientInfo({...clientInfo, vatNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Informations du document */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Informations du document</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date d'émission*
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {documentType === DocumentType.QUOTE && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de validité*
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}
            
            {documentType === DocumentType.INVOICE && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d'échéance*
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Conditions de paiement
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes / Conditions particulières
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      
      {/* Détails de facturation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Détails des prestations</h2>
          <button
            onClick={addEmptyItem}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
          >
            Ajouter une ligne
          </button>
        </div>
        
        {/* En-têtes */}
        <div className="grid grid-cols-12 gap-4 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="col-span-5">Description</div>
          <div className="col-span-1 text-center">Qté</div>
          <div className="col-span-2 text-right">Prix unitaire</div>
          <div className="col-span-1 text-center">TVA</div>
          <div className="col-span-1 text-center">Remise</div>
          <div className="col-span-1 text-right">Total HT</div>
          <div className="col-span-1"></div>
        </div>
        
        {/* Lignes d'articles */}
        <div className="space-y-2">
          {documentItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-5">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description de la prestation"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-right"
                />
              </div>
              <div className="col-span-1">
                <select
                  value={item.taxRate}
                  onChange={(e) => updateItem(item.id, { taxRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center"
                >
                  <option value="0">0%</option>
                  <option value="0.055">5.5%</option>
                  <option value="0.1">10%</option>
                  <option value="0.2">20%</option>
                </select>
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={item.discount || 0}
                  onChange={(e) => updateItem(item.id, { discount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center"
                />
              </div>
              <div className="col-span-1 text-right font-medium">
                {formatCurrency(item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100))}
              </div>
              <div className="col-span-1 text-center">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          
          {documentItems.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              Aucune prestation ajoutée. Cliquez sur "Ajouter une ligne" pour commencer.
            </div>
          )}
        </div>
        
        {/* Totaux */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-right">Sous-total HT:</div>
            <div className="text-right font-medium">{formatCurrency(subtotal)}</div>
            
            <div className="text-right">TVA:</div>
            <div className="text-right font-medium">{formatCurrency(taxAmount)}</div>
            
            <div className="text-right font-semibold">Total TTC:</div>
            <div className="text-right font-bold text-lg">{formatCurrency(total)}</div>
          </div>
        </div>
      </div>
      
      {/* Boutons d'action */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
        >
          Annuler
        </button>
        <button
          onClick={saveDocument}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
