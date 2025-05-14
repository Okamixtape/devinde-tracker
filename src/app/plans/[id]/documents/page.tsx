'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Document, DocumentType, DocumentStatus } from '@/app/interfaces/invoicing';
import DocumentService from '@/app/services/documentService';
import { getBusinessPlanService } from '@/app/services/serviceFactory';
import { BusinessPlanData } from '@/app/services/interfaces/dataModels';

/**
 * Page de gestion des documents (factures et devis)
 */
export default function DocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const highlightId = searchParams.get('highlight');
  const businessPlanId = params.id as string;
  const businessPlanService = getBusinessPlanService();
  
  // États
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [businessPlan, setBusinessPlan] = useState<BusinessPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{type?: DocumentType, status?: DocumentStatus}>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Chargement du business plan
        if (businessPlanId) {
          const result = await businessPlanService.getItem(businessPlanId);
          if (result.success && result.data) {
            setBusinessPlan(result.data);
          }
        }
        
        // Chargement des documents
        const docs = DocumentService.getByBusinessPlanId(businessPlanId);
        setDocuments(docs);
        setFilteredDocuments(docs);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [businessPlanId, businessPlanService]);
  
  // Filtrage des documents
  useEffect(() => {
    let result = [...documents];
    
    // Filtrer par type
    if (filter.type) {
      result = result.filter(doc => doc.type === filter.type);
    }
    
    // Filtrer par statut
    if (filter.status) {
      result = result.filter(doc => doc.status === filter.status);
    }
    
    // Recherche texte
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(doc => 
        doc.number.toLowerCase().includes(term) ||
        doc.clientInfo.name.toLowerCase().includes(term) ||
        doc.items.some(item => item.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredDocuments(result);
  }, [documents, filter, searchTerm]);
  
  // Fonctions de gestion des documents
  const handleCreateDocument = (type: DocumentType) => {
    router.push(`/plans/${businessPlanId}/documents/new?type=${type}`);
  };
  
  const handleViewDocument = (id: string) => {
    router.push(`/plans/${businessPlanId}/documents/${id}`);
  };
  
  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      DocumentService.delete(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    }
  };
  
  // Conversion du type en texte lisible
  const getDocumentTypeLabel = (type: DocumentType) => {
    return type === DocumentType.INVOICE ? 'Facture' : 'Devis';
  };
  
  // Conversion du statut en texte lisible
  const getStatusLabel = (status: DocumentStatus) => {
    switch(status) {
      case DocumentStatus.DRAFT: return 'Brouillon';
      case DocumentStatus.SENT: return 'Envoyé';
      case DocumentStatus.ACCEPTED: return 'Accepté';
      case DocumentStatus.PAID: return 'Payé';
      case DocumentStatus.REJECTED: return 'Refusé';
      case DocumentStatus.OVERDUE: return 'En retard';
      default: return status;
    }
  };
  
  // Obtention de la classe CSS pour le statut
  const getStatusClass = (status: DocumentStatus) => {
    switch(status) {
      case DocumentStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case DocumentStatus.SENT: return 'bg-blue-100 text-blue-800';
      case DocumentStatus.ACCEPTED: return 'bg-green-100 text-green-800';
      case DocumentStatus.PAID: return 'bg-green-100 text-green-800';
      case DocumentStatus.REJECTED: return 'bg-red-100 text-red-800';
      case DocumentStatus.OVERDUE: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Formatage des montants
  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  // Formatage des dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR').format(date);
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
        <h1 className="text-2xl font-bold">Facturation</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => handleCreateDocument(DocumentType.QUOTE)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Nouveau devis
          </button>
          <button
            onClick={() => handleCreateDocument(DocumentType.INVOICE)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Nouvelle facture
          </button>
        </div>
      </div>
      
      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={filter.type || ''}
              onChange={(e) => setFilter({...filter, type: e.target.value as DocumentType || undefined})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les types</option>
              <option value={DocumentType.INVOICE}>Factures</option>
              <option value={DocumentType.QUOTE}>Devis</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Statut
            </label>
            <select
              value={filter.status || ''}
              onChange={(e) => setFilter({...filter, status: e.target.value as DocumentStatus || undefined})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value={DocumentStatus.DRAFT}>Brouillons</option>
              <option value={DocumentStatus.SENT}>Envoyés</option>
              <option value={DocumentStatus.ACCEPTED}>Acceptés</option>
              <option value={DocumentStatus.PAID}>Payés</option>
              <option value={DocumentStatus.REJECTED}>Refusés</option>
              <option value={DocumentStatus.OVERDUE}>En retard</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Liste des documents */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {filteredDocuments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDocuments.map((doc) => (
                  <tr 
                    key={doc.id} 
                    className={`${highlightId === doc.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''} hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer`} 
                    onClick={() => handleViewDocument(doc.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {doc.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {getDocumentTypeLabel(doc.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {doc.clientInfo.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatDate(doc.issueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatCurrency(doc.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(doc.status)}`}>
                        {getStatusLabel(doc.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Empêche la propagation du clic vers la ligne parent
                          handleViewDocument(doc.id);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        Voir
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Empêche la propagation du clic vers la ligne parent
                          handleDeleteDocument(doc.id);
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {documents.length === 0 
                ? "Vous n'avez pas encore créé de documents." 
                : "Aucun document ne correspond à vos critères de recherche."}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleCreateDocument(DocumentType.QUOTE)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Créer un devis
              </button>
              <button
                onClick={() => handleCreateDocument(DocumentType.INVOICE)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Créer une facture
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
