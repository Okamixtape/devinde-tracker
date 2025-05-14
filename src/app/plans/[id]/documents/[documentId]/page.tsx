'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Document, 
  DocumentType, 
  DocumentStatus
} from '@/app/interfaces/invoicing';
import DocumentService from '@/app/services/documentService';
import { getBusinessPlanService } from '@/app/services/serviceFactory';
import { BusinessPlanData } from '@/app/services/interfaces/dataModels';
import { useReactToPrint } from 'react-to-print';
import PaymentForm from './payments';

/**
 * Page de détail d'un document (facture ou devis)
 */
export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessPlanId = params.id as string;
  const documentId = params.documentId as string;
  const businessPlanService = getBusinessPlanService();
  const printRef = useRef<HTMLDivElement>(null);
  
  // États
  const [document, setDocument] = useState<Document | null>(null);
  // On garde la possibilité de charger le business plan, mais on utilise seulement le setter
  const [, setBusinessPlan] = useState<BusinessPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Impression du document
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: document ? `${document.type === DocumentType.INVOICE ? 'Facture' : 'Devis'}_${document.number}` : 'Document',
  });
  
  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Chargement du document
        const doc = DocumentService.getById(documentId);
        if (!doc) {
          setError('Document non trouvé');
          setLoading(false);
          return;
        }
        setDocument(doc);
        
        // Chargement du business plan pour référence future
        if (businessPlanId) {
          const result = await businessPlanService.getItem(businessPlanId);
          if (result.success && result.data) {
            setBusinessPlan(result.data);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [businessPlanId, documentId, businessPlanService]);
  
  // Formatage des montants
  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  // Formatage des dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR').format(date);
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
  
  // Conversion d'un devis en facture
  const handleConvertToInvoice = () => {
    if (!document || document.type !== DocumentType.QUOTE) return;
    
    // Créer une nouvelle facture basée sur le devis
    const newInvoice = {
      ...document,
      id: '', // Sera généré par le service
      businessPlanId: businessPlanId, // Assurons-nous que le businessPlanId est conservé
      type: DocumentType.INVOICE,
      status: DocumentStatus.DRAFT,
      number: '', // Sera généré par le service
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 15);
        return date.toISOString().split('T')[0];
      })(),
      validUntil: undefined
    };
    
    // Sauvegarder la nouvelle facture
    const savedInvoice = DocumentService.save(newInvoice);
    
    // Rediriger vers la liste des documents pour voir tous les documents, y compris la nouvelle facture
    router.push(`/plans/${businessPlanId}/documents?highlight=${savedInvoice.id}`);
  };
  
  // Changement de statut
  const updateStatus = (newStatus: DocumentStatus) => {
    if (!document) return;
    
    const updatedDocument = {
      ...document,
      status: newStatus
    };
    
    const savedDocument = DocumentService.save(updatedDocument);
    setDocument(savedDocument);
  };
  
  // Suppression du document
  const handleDelete = () => {
    if (!document) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      DocumentService.delete(document.id);
      router.push(`/plans/${businessPlanId}/documents`);
    }
  };
  
  // Modification du document
  const handleEdit = () => {
    if (!document) return;
    
    // Pour le moment, redirigeons vers la création d'un nouveau document (à améliorer)
    router.push(`/plans/${businessPlanId}/documents/new?type=${document.type}&edit=${document.id}`);
  };
  
  // Retour à la liste des documents
  const handleBack = () => {
    router.push(`/plans/${businessPlanId}/documents`);
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
  
  if (error || !document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Document introuvable
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Le document demandé n&apos;existe pas ou a été supprimé.
            </p>
          </div>
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Fonction qui met à jour le document après l'ajout d'un paiement
  const handlePaymentAdded = () => {
    const updatedDoc = DocumentService.getById(documentId);
    if (updatedDoc) {
      setDocument(updatedDoc);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour à la liste
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Imprimer
          </button>
          
          {document.type === DocumentType.QUOTE && (
            <button
              onClick={handleConvertToInvoice}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Convertir en facture
            </button>
          )}
          
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Modifier
          </button>
          
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>
      
      {/* Statut et informations générales */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {document.type === DocumentType.INVOICE ? 'Facture' : 'Devis'} {document.number}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Date d&apos;émission : {formatDate(document.issueDate)}
          </p>
        </div>
        
        <div className="flex flex-col items-end">
          <div className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusClass(document.status)} mb-2`}>
            {getStatusLabel(document.status)}
          </div>
          
          <div className="relative">
            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => {
                // Utiliser globalThis.document pour éviter le conflit avec la variable d'état document
                const statusDropdown = globalThis.document.querySelector('#statusDropdown');
                if (statusDropdown) {
                  statusDropdown.classList.toggle('hidden');
                }
              }}
            >
              Changer le statut
            </button>
            
            <div id="statusDropdown" className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 hidden z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={() => updateStatus(DocumentStatus.DRAFT)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  Brouillon
                </button>
                <button
                  onClick={() => updateStatus(DocumentStatus.SENT)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  Envoyé
                </button>
                {document.type === DocumentType.QUOTE && (
                  <>
                    <button
                      onClick={() => updateStatus(DocumentStatus.ACCEPTED)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      Accepté
                    </button>
                    <button
                      onClick={() => updateStatus(DocumentStatus.REJECTED)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      Refusé
                    </button>
                  </>
                )}
                {document.type === DocumentType.INVOICE && (
                  <>
                    <button
                      onClick={() => updateStatus(DocumentStatus.PAID)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      Payé
                    </button>
                    <button
                      onClick={() => updateStatus(DocumentStatus.OVERDUE)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      En retard
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Document imprimable */}
      <div 
        ref={printRef}
        className="bg-white rounded-lg shadow-md p-8 mb-6 print:shadow-none print:p-0 print:m-0 border border-gray-300"
      >
        {/* En-tête de l'entreprise */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-2xl font-bold">
              {document.companyInfo.name}
            </h1>
            <div className="text-gray-800">
              {document.companyInfo.address}<br />
              {document.companyInfo.zipCode} {document.companyInfo.city}<br />
              {document.companyInfo.country}
            </div>
            <div className="mt-2 text-gray-800">
              {document.companyInfo.email && (
                <span className="block">Email: {document.companyInfo.email}</span>
              )}
              {document.companyInfo.phone && (
                <span className="block">Tél: {document.companyInfo.phone}</span>
              )}
              {document.companyInfo.website && (
                <span className="block">Web: {document.companyInfo.website}</span>
              )}
            </div>
            <div className="mt-2 text-gray-800">
              {document.companyInfo.siret && (
                <span className="block">SIRET: {document.companyInfo.siret}</span>
              )}
              {document.companyInfo.vatNumber && (
                <span className="block">N° TVA: {document.companyInfo.vatNumber}</span>
              )}
            </div>
          </div>
          
          <div className="text-right bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-2 text-blue-800">
              {document.type === DocumentType.INVOICE ? 'FACTURE' : 'DEVIS'}
            </h2>
            <p className="text-gray-800">
              <span className="font-medium">N°</span> {document.number}<br />
              <span className="font-medium">Date:</span> {formatDate(document.issueDate)}<br />
              {document.type === DocumentType.QUOTE && document.validUntil && (
                <span><span className="font-medium">Validité:</span> {formatDate(document.validUntil)}</span>
              )}
              {document.type === DocumentType.INVOICE && document.dueDate && (
                <span><span className="font-medium">Échéance:</span> {formatDate(document.dueDate)}</span>
              )}
            </p>
          </div>
        </div>
        
        {/* Coordonnées client */}
        <div className="border-t border-b border-gray-200 py-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-gray-700 font-medium mb-2">DE</h3>
              <p className="font-semibold text-gray-900">{document.companyInfo.name}</p>
            </div>
            <div>
              <h3 className="text-gray-700 font-medium mb-2">POUR</h3>
              <p className="font-semibold text-gray-900">{document.clientInfo.name}</p>
              <p className="text-gray-800">
                {document.clientInfo.address}<br />
                {document.clientInfo.zipCode} {document.clientInfo.city}<br />
                {document.clientInfo.country}
              </p>
              {document.clientInfo.email && (
                <p className="text-gray-800 mt-1">Email: {document.clientInfo.email}</p>
              )}
              {document.clientInfo.vatNumber && (
                <p className="text-gray-800 mt-1">N° TVA: {document.clientInfo.vatNumber}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Tableau des prestations */}
        <table className="min-w-full divide-y divide-gray-200 mb-8 border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="py-3 px-4 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">
                Qté
              </th>
              <th scope="col" className="py-3 px-4 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                Prix unitaire
              </th>
              <th scope="col" className="py-3 px-4 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">
                TVA
              </th>
              {document.items.some(item => item.discount) && (
                <th scope="col" className="py-3 px-4 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Remise
                </th>
              )}
              <th scope="col" className="py-3 px-4 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                Total HT
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {document.items.map((item, index) => (
              <tr key={index}>
                <td className="py-4 px-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.description}
                  </div>
                </td>
                <td className="py-4 px-4 text-center text-sm text-gray-900">
                  {item.quantity}
                </td>
                <td className="py-4 px-4 text-right text-sm text-gray-900">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="py-4 px-4 text-center text-sm text-gray-900">
                  {(item.taxRate * 100).toFixed(1)}%
                </td>
                {document.items.some(item => item.discount) && (
                  <td className="py-4 px-4 text-center text-sm text-gray-900">
                    {item.discount ? `${item.discount}%` : '-'}
                  </td>
                )}
                <td className="py-4 px-4 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Récapitulatif et total */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-1/2 lg:w-1/3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-y-2">
              <div className="text-sm font-medium text-gray-900">Sous-total HT:</div>
              <div className="text-sm text-right font-medium text-gray-900">{formatCurrency(document.subtotal)}</div>
              
              <div className="text-sm font-medium text-gray-900">TVA:</div>
              <div className="text-sm text-right font-medium text-gray-900">{formatCurrency(document.taxAmount)}</div>
              
              <div className="text-base font-bold pt-2 border-t border-gray-300 text-blue-900">Total TTC:</div>
              <div className="text-lg text-right font-bold pt-2 border-t border-gray-300 text-blue-900">{formatCurrency(document.total)}</div>
            </div>
          </div>
        </div>
        
        {/* Conditions et notes */}
        <div className="border-t border-gray-200 pt-6 mt-6 bg-gray-50 p-4 rounded-lg">
          {document.paymentTerms && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Conditions de paiement</h3>
              <p className="text-sm text-gray-800 font-medium">{document.paymentTerms}</p>
            </div>
          )}
          
          {document.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Notes</h3>
              <p className="text-sm text-gray-800 whitespace-pre-line font-medium">{document.notes}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Section de gestion des paiements (uniquement pour les factures) */}
      {document.type === DocumentType.INVOICE && (
        <PaymentForm document={document} onPaymentAdded={handlePaymentAdded} />
      )}
    </div>
  );
}
