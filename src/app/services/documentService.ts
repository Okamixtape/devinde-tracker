'use client';

import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentType, DocumentStatus, generateDocumentNumber, calculateDocumentTotals } from '../interfaces/invoicing';
import { Service } from '../plans/[id]/services/components/ServiceCard';

// Clés LocalStorage
const DOCUMENTS_KEY = 'devinde_documents';
const DOCUMENT_COUNT_KEY = 'devinde_document_count';

/**
 * Service de gestion des documents (factures et devis)
 */
export const DocumentService = {
  /**
   * Récupérer tous les documents
   */
  getAll: (): Document[] => {
    if (typeof window === 'undefined') return [];
    
    const documentsJSON = localStorage.getItem(DOCUMENTS_KEY);
    if (!documentsJSON) return [];
    
    try {
      return JSON.parse(documentsJSON);
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      return [];
    }
  },
  
  /**
   * Récupérer un document par son ID
   */
  getById: (id: string): Document | null => {
    const documents = DocumentService.getAll();
    return documents.find(doc => doc.id === id) || null;
  },
  
  /**
   * Récupérer tous les documents associés à un plan d'affaires
   */
  getByBusinessPlanId: (businessPlanId: string): Document[] => {
    const documents = DocumentService.getAll();
    return documents.filter(doc => doc.businessPlanId === businessPlanId);
  },
  
  /**
   * Récupérer tous les documents associés à un service
   */
  getByServiceId: (serviceId: string): Document[] => {
    const documents = DocumentService.getAll();
    return documents.filter(doc => doc.serviceId === serviceId);
  },
  
  /**
   * Sauvegarder un document
   */
  save: (document: Document): Document => {
    const documents = DocumentService.getAll();
    const updatedDoc = {...document};
    
    // Si c'est un nouveau document ou un document converti (sans ID)
    if (!updatedDoc.id) {
      // Générer un nouvel ID
      updatedDoc.id = uuidv4();
      
      // Générer un numéro de document s'il n'en a pas déjà un
      if (!updatedDoc.number || updatedDoc.number === '') {
        // Récupérer le compteur actuel pour ce type de document
        const countKey = updatedDoc.type === DocumentType.INVOICE ? 'invoice_count' : 'quote_count';
        const count = Number(localStorage.getItem(countKey) || '0') + 1;
        localStorage.setItem(countKey, count.toString());
        
        // Générer le numéro
        updatedDoc.number = generateDocumentNumber(updatedDoc.type, count);
      }
    }
    
    const existingIndex = documents.findIndex(doc => doc.id === updatedDoc.id);
    
    // Calculer les totaux avant la sauvegarde
    const docWithTotals = calculateDocumentTotals(updatedDoc);
    
    if (existingIndex >= 0) {
      // Mise à jour d'un document existant
      documents[existingIndex] = docWithTotals;
    } else {
      // Ajout d'un nouveau document
      documents.push(docWithTotals);
    }
    
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
    return docWithTotals;
  },
  
  /**
   * Supprimer un document
   */
  delete: (id: string): boolean => {
    const documents = DocumentService.getAll();
    const initialLength = documents.length;
    const filteredDocuments = documents.filter(doc => doc.id !== id);
    
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(filteredDocuments));
    return filteredDocuments.length < initialLength;
  },
  
  /**
   * Créer un nouveau document à partir d'un service
   */
  createFromService: (
    type: DocumentType, 
    service: Service, 
    businessPlanId: string,
    clientInfo: Record<string, unknown>, 
    companyInfo: Record<string, unknown>,
    additionalDetails: {
      notes?: string,
      paymentTerms?: string,
      validUntil?: string,
      dueDate?: string
    } = {}
  ): Document => {
    // Générer un nouveau numéro de document
    let count = 1;
    try {
      const storedCount = localStorage.getItem(DOCUMENT_COUNT_KEY);
      if (storedCount) {
        count = parseInt(storedCount, 10) + 1;
      }
      localStorage.setItem(DOCUMENT_COUNT_KEY, count.toString());
    } catch (e) {
      console.error('Erreur lors de la génération du numéro de document:', e);
    }
    
    const number = generateDocumentNumber(type, count);
    
    // Déterminer le prix en fonction du mode de facturation
    let unitPrice = 0;
    let description = service.name;
    let quantity = 1;
    
    switch(service.billingMode) {
      case 'hourly':
        unitPrice = service.hourlyRate || 0;
        quantity = service.estimatedHours || 1;
        description = `${service.name} - Prestation horaire`;
        break;
      case 'package':
        unitPrice = service.packagePrice || 0;
        description = `${service.name} - Forfait`;
        break;
      case 'subscription':
        unitPrice = service.subscriptionPrice || 0;
        description = `${service.name} - Abonnement mensuel`;
        break;
    }
    
    // Créer le document
    const newDocument: Document = {
      id: uuidv4(),
      type,
      status: type === DocumentType.INVOICE ? DocumentStatus.DRAFT : DocumentStatus.DRAFT,
      number,
      issueDate: new Date().toISOString().split('T')[0],
      clientInfo,
      companyInfo,
      businessPlanId,
      serviceId: service.id,
      items: [
        {
          id: uuidv4(),
          description,
          quantity,
          unitPrice,
          taxRate: 0.2, // 20% TVA par défaut
          discount: 0
        }
      ],
      ...additionalDetails
    };
    
    // Calculer les totaux
    const finalDocument = calculateDocumentTotals(newDocument);
    
    // Sauvegarder et retourner le document
    return DocumentService.save(finalDocument);
  }
};

export default DocumentService;
