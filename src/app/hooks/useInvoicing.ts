/**
 * useInvoicing - Hook standardisé pour la gestion de la facturation
 * 
 * Ce hook facilite l'interaction avec les documents de facturation
 * en utilisant les interfaces standardisées et l'adaptateur correspondant.
 * 
 * @version 1.0
 * @standardized true
 */

import { useState, useEffect, useCallback } from 'react';
import DocumentService from '../services/documentService';
import PaymentService from '../services/paymentService';
import InvoicingAdapter from '../adapters/InvoicingAdapter.standardized';
import {
  UIDocument,
  UIInvoiceItem,
  UIPayment,
  UIDocumentFilters,
  UIInvoicingStats,
  DocumentType,
  DocumentStatus,
  PaymentMethod,
  calculateDocumentTotals,
  generateDocumentNumber,
  generateReceiptNumber,
  isDocumentOverdue
} from '../interfaces/invoicing';
import { v4 as uuidv4 } from 'uuid';

interface UseInvoicingResult {
  // Données
  documents: UIDocument[];
  filteredDocuments: UIDocument[];
  selectedDocument: UIDocument | null;
  stats: UIInvoicingStats;
  
  // État
  isLoading: boolean;
  error: string | null;
  
  // Filtres
  filters: UIDocumentFilters;
  
  // Actions pour les documents
  loadDocuments: () => void;
  getDocumentById: (id: string) => UIDocument | null;
  getDocumentsByBusinessPlanId: (businessPlanId: string) => UIDocument[];
  createDocument: (document: Partial<UIDocument>) => Promise<UIDocument>;
  updateDocument: (document: UIDocument) => Promise<UIDocument>;
  deleteDocument: (id: string) => Promise<boolean>;
  selectDocument: (id: string) => void;
  
  // Actions pour les éléments de facture
  addItem: (documentId: string, item: Partial<UIInvoiceItem>) => Promise<UIDocument>;
  updateItem: (documentId: string, item: UIInvoiceItem) => Promise<UIDocument>;
  removeItem: (documentId: string, itemId: string) => Promise<UIDocument>;
  
  // Actions pour les paiements
  addPayment: (payment: Partial<UIPayment>) => Promise<UIPayment>;
  deletePayment: (id: string) => Promise<boolean>;
  getDocumentPayments: (documentId: string) => UIPayment[];
  
  // Actions pour les statuts
  markAsSent: (documentId: string) => Promise<UIDocument>;
  markAsPaid: (documentId: string, paymentMethod: PaymentMethod) => Promise<UIDocument>;
  markAsAccepted: (documentId: string) => Promise<UIDocument>;
  markAsRejected: (documentId: string, reason?: string) => Promise<UIDocument>;
  
  // Actions pour les devis
  convertQuoteToInvoice: (quoteId: string) => Promise<UIDocument>;
  
  // Actions pour les filtres
  setFilters: (filters: Partial<UIDocumentFilters>) => void;
  resetFilters: () => void;
}

/**
 * Valeurs par défaut pour les filtres
 */
const defaultFilters: UIDocumentFilters = {
  documentTypes: Object.values(DocumentType),
  statuses: Object.values(DocumentStatus),
  searchTerm: ''
};

/**
 * Valeurs par défaut pour les statistiques
 */
const defaultStats: UIInvoicingStats = {
  totalDocuments: 0,
  totalRevenue: 0,
  unpaidInvoicesAmount: 0,
  unpaidInvoicesCount: 0,
  overdueInvoicesCount: 0,
  overdueAmount: 0,
  byType: {
    [DocumentType.INVOICE]: 0,
    [DocumentType.QUOTE]: 0
  },
  byStatus: {
    [DocumentStatus.DRAFT]: 0,
    [DocumentStatus.SENT]: 0,
    [DocumentStatus.ACCEPTED]: 0,
    [DocumentStatus.PARTIALLY_PAID]: 0,
    [DocumentStatus.PAID]: 0,
    [DocumentStatus.REJECTED]: 0,
    [DocumentStatus.OVERDUE]: 0,
    [DocumentStatus.IN_DISPUTE]: 0,
    [DocumentStatus.IN_COLLECTION]: 0
  },
  byPaymentMethod: {
    [PaymentMethod.BANK_TRANSFER]: 0,
    [PaymentMethod.CREDIT_CARD]: 0,
    [PaymentMethod.CHECK]: 0,
    [PaymentMethod.CASH]: 0,
    [PaymentMethod.PAYPAL]: 0,
    [PaymentMethod.OTHER]: 0
  },
  monthlyRevenue: []
};

/**
 * Hook pour gérer la facturation avec les interfaces standardisées
 */
export const useInvoicing = (): UseInvoicingResult => {
  // État
  const [documents, setDocuments] = useState<UIDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<UIDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<UIDocument | null>(null);
  const [payments, setPayments] = useState<UIPayment[]>([]);
  const [stats, setStats] = useState<UIInvoicingStats>(defaultStats);
  const [filters, setFiltersState] = useState<UIDocumentFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Charger tous les documents
   */
  const loadDocuments = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer les données brutes
      const rawDocuments = DocumentService.getAll();
      const rawPayments = PaymentService.getAllPayments();
      
      // Transformer en format UI
      const uiDocuments = rawDocuments.map(doc => InvoicingAdapter.toUI(doc));
      const uiPayments = rawPayments.map(payment => {
        // Créer un paiement service temporaire avec les bons champs
        const servicePayment = {
          ...payment,
          createdAt: payment.date,
          updatedAt: payment.date
        };
        return InvoicingAdapter.paymentToUI(servicePayment);
      });
      
      // Calculer les statistiques
      const calculatedStats = calculateStats(uiDocuments, uiPayments);
      
      // Mettre à jour l'état
      setDocuments(uiDocuments);
      setPayments(uiPayments);
      setStats(calculatedStats);
      applyFilters(uiDocuments, filters);
    } catch (err) {
      setError('Erreur lors du chargement des documents: ' + 
        (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  /**
   * Calculer les statistiques de facturation
   */
  const calculateStats = useCallback((
    docs: UIDocument[],
    paymentsList: UIPayment[]
  ): UIInvoicingStats => {
    const stats: UIInvoicingStats = {
      totalDocuments: docs.length,
      totalRevenue: 0,
      unpaidInvoicesAmount: 0,
      unpaidInvoicesCount: 0,
      overdueInvoicesCount: 0,
      overdueAmount: 0,
      byType: {
        [DocumentType.INVOICE]: 0,
        [DocumentType.QUOTE]: 0
      },
      byStatus: {
        [DocumentStatus.DRAFT]: 0,
        [DocumentStatus.SENT]: 0,
        [DocumentStatus.ACCEPTED]: 0,
        [DocumentStatus.PARTIALLY_PAID]: 0,
        [DocumentStatus.PAID]: 0,
        [DocumentStatus.REJECTED]: 0,
        [DocumentStatus.OVERDUE]: 0,
        [DocumentStatus.IN_DISPUTE]: 0,
        [DocumentStatus.IN_COLLECTION]: 0
      },
      byPaymentMethod: {
        [PaymentMethod.BANK_TRANSFER]: 0,
        [PaymentMethod.CREDIT_CARD]: 0,
        [PaymentMethod.CHECK]: 0,
        [PaymentMethod.CASH]: 0,
        [PaymentMethod.PAYPAL]: 0,
        [PaymentMethod.OTHER]: 0
      },
      monthlyRevenue: []
    };
    
    // Regrouper les paiements par mois
    const paymentsByMonth: Record<string, number> = {};
    
    // Calculer les statistiques à partir des documents
    docs.forEach(doc => {
      // Comptage par type
      stats.byType[doc.type]++;
      
      // Comptage par statut
      stats.byStatus[doc.status]++;
      
      // Statistiques des factures
      if (doc.type === DocumentType.INVOICE) {
        // Total du montant payé (chiffre d'affaires)
        if (doc.status === DocumentStatus.PAID) {
          stats.totalRevenue += doc.total || 0;
          
          // Ajouter au revenu mensuel
          const month = doc.issueDate.substring(0, 7); // Format YYYY-MM
          paymentsByMonth[month] = (paymentsByMonth[month] || 0) + (doc.total || 0);
        }
        
        // Factures impayées
        if (doc.status !== DocumentStatus.PAID && doc.status !== DocumentStatus.DRAFT) {
          stats.unpaidInvoicesCount++;
          stats.unpaidInvoicesAmount += (doc.remainingAmount || 0);
        }
        
        // Factures en retard
        if (isDocumentOverdue(doc)) {
          stats.overdueInvoicesCount++;
          stats.overdueAmount += (doc.remainingAmount || 0);
        }
      }
    });
    
    // Statistiques des paiements
    paymentsList.forEach(payment => {
      // Montant par méthode de paiement
      stats.byPaymentMethod[payment.method] += payment.amount;
      
      // Ajouter au revenu mensuel si pas déjà compté
      const month = payment.date.substring(0, 7); // Format YYYY-MM
      if (!paymentsByMonth[month]) {
        paymentsByMonth[month] = 0;
      }
    });
    
    // Formater les revenus mensuels pour le graphique
    stats.monthlyRevenue = Object.entries(paymentsByMonth)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    return stats;
  }, []);
  
  /**
   * Récupérer un document par son ID
   */
  const getDocumentById = useCallback((id: string): UIDocument | null => {
    return documents.find(doc => doc.id === id) || null;
  }, [documents]);
  
  /**
   * Récupérer les documents associés à un plan d'affaires
   */
  const getDocumentsByBusinessPlanId = useCallback((businessPlanId: string): UIDocument[] => {
    return documents.filter(doc => doc.businessPlanId === businessPlanId);
  }, [documents]);
  
  /**
   * Créer un nouveau document
   */
  const createDocument = useCallback(async (document: Partial<UIDocument>): Promise<UIDocument> => {
    setIsLoading(true);
    
    try {
      // Générer un ID si non fourni
      const docWithId: UIDocument = {
        ...InvoicingAdapter.createDefaultUIDocument(),
        ...document,
        id: document.id || uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // S'assurer que les dates sont bien formatées
      if (!docWithId.issueDate) {
        docWithId.issueDate = new Date().toISOString().split('T')[0];
      }
      
      // Générer un numéro de document si non fourni
      if (!docWithId.number || docWithId.number === '') {
        const countKey = docWithId.type === DocumentType.INVOICE ? 'invoice_count' : 'quote_count';
        let count = 1;
        const storedCount = localStorage.getItem(countKey);
        if (storedCount) {
          count = parseInt(storedCount, 10) + 1;
        }
        localStorage.setItem(countKey, count.toString());
        docWithId.number = generateDocumentNumber(docWithId.type, count);
      }
      
      // Calculer les totaux
      const docWithTotals = calculateDocumentTotals(docWithId);
      
      // Convertir en format service
      const serviceDoc = InvoicingAdapter.toService(docWithTotals);
      
      // Sauvegarder via le service
      const savedDoc = DocumentService.save(serviceDoc);
      
      // Reconvertir en format UI
      const uiDoc = InvoicingAdapter.toUI(savedDoc);
      
      // Mettre à jour l'état local
      setDocuments(prev => [...prev, uiDoc]);
      
      // Appliquer les filtres
      applyFilters([...documents, uiDoc], filters);
      
      // Recalculer les statistiques
      loadDocuments();
      
      return uiDoc;
    } catch (err) {
      setError('Erreur lors de la création du document: ' +
        (err instanceof Error ? err.message : String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [documents, filters, loadDocuments]);
  
  /**
   * Mettre à jour un document existant
   */
  const updateDocument = useCallback(async (document: UIDocument): Promise<UIDocument> => {
    setIsLoading(true);
    
    try {
      // Calculer les totaux
      const docWithTotals = calculateDocumentTotals(document);
      
      // Convertir en format service
      const serviceDoc = InvoicingAdapter.toService(docWithTotals);
      
      // Sauvegarder via le service
      const savedDoc = DocumentService.save(serviceDoc);
      
      // Reconvertir en format UI
      const uiDoc = InvoicingAdapter.toUI(savedDoc);
      
      // Mettre à jour l'état local
      setDocuments(prev => {
        const index = prev.findIndex(d => d.id === uiDoc.id);
        if (index >= 0) {
          return [...prev.slice(0, index), uiDoc, ...prev.slice(index + 1)];
        }
        return prev;
      });
      
      // Si c'est le document sélectionné, mettre à jour la sélection
      if (selectedDocument?.id === uiDoc.id) {
        setSelectedDocument(uiDoc);
      }
      
      // Appliquer les filtres
      applyFilters(
        documents.map(d => d.id === uiDoc.id ? uiDoc : d),
        filters
      );
      
      // Recalculer les statistiques
      loadDocuments();
      
      return uiDoc;
    } catch (err) {
      setError('Erreur lors de la mise à jour du document: ' +
        (err instanceof Error ? err.message : String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [documents, filters, loadDocuments, selectedDocument]);
  
  /**
   * Supprimer un document
   */
  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Supprimer via le service
      const success = DocumentService.delete(id);
      
      if (success) {
        // Mettre à jour l'état local
        setDocuments(prev => prev.filter(d => d.id !== id));
        
        // Si c'était le document sélectionné, réinitialiser la sélection
        if (selectedDocument?.id === id) {
          setSelectedDocument(null);
        }
        
        // Appliquer les filtres
        applyFilters(documents.filter(d => d.id !== id), filters);
        
        // Recalculer les statistiques
        loadDocuments();
      }
      
      return success;
    } catch (err) {
      setError('Erreur lors de la suppression du document: ' +
        (err instanceof Error ? err.message : String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [documents, filters, loadDocuments, selectedDocument]);
  
  /**
   * Sélectionner un document
   */
  const selectDocument = useCallback((id: string) => {
    const doc = documents.find(d => d.id === id) || null;
    setSelectedDocument(doc);
  }, [documents]);
  
  /**
   * Ajouter un élément à un document
   */
  const addItem = useCallback(async (
    documentId: string,
    item: Partial<UIInvoiceItem>
  ): Promise<UIDocument> => {
    const document = getDocumentById(documentId);
    if (!document) {
      throw new Error(`Document avec ID ${documentId} non trouvé`);
    }
    
    // Créer un nouvel élément
    const newItem: UIInvoiceItem = {
      id: uuidv4(),
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      taxRate: item.taxRate || 0.2, // 20% par défaut
      discount: item.discount || 0,
      notes: item.notes || '',
      serviceId: item.serviceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEditing: false,
      validationErrors: {}
    };
    
    // Ajouter l'élément au document
    const updatedDocument: UIDocument = {
      ...document,
      items: [...document.items, newItem],
      updatedAt: new Date().toISOString()
    };
    
    // Mettre à jour le document
    return updateDocument(updatedDocument);
  }, [getDocumentById, updateDocument]);
  
  /**
   * Mettre à jour un élément d'un document
   */
  const updateItem = useCallback(async (
    documentId: string,
    item: UIInvoiceItem
  ): Promise<UIDocument> => {
    const document = getDocumentById(documentId);
    if (!document) {
      throw new Error(`Document avec ID ${documentId} non trouvé`);
    }
    
    // Mettre à jour l'élément
    const updatedItems = document.items.map(i => 
      i.id === item.id 
        ? { ...item, updatedAt: new Date().toISOString() } 
        : i
    );
    
    // Mettre à jour le document
    const updatedDocument: UIDocument = {
      ...document,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };
    
    // Mettre à jour le document
    return updateDocument(updatedDocument);
  }, [getDocumentById, updateDocument]);
  
  /**
   * Supprimer un élément d'un document
   */
  const removeItem = useCallback(async (
    documentId: string,
    itemId: string
  ): Promise<UIDocument> => {
    const document = getDocumentById(documentId);
    if (!document) {
      throw new Error(`Document avec ID ${documentId} non trouvé`);
    }
    
    // Retirer l'élément
    const updatedItems = document.items.filter(i => i.id !== itemId);
    
    // Mettre à jour le document
    const updatedDocument: UIDocument = {
      ...document,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };
    
    // Mettre à jour le document
    return updateDocument(updatedDocument);
  }, [getDocumentById, updateDocument]);
  
  /**
   * Ajouter un paiement
   */
  const addPayment = useCallback(async (payment: Partial<UIPayment>): Promise<UIPayment> => {
    setIsLoading(true);
    
    try {
      // S'assurer que le document existe
      const document = getDocumentById(payment.documentId || '');
      if (!document) {
        throw new Error(`Document avec ID ${payment.documentId} non trouvé`);
      }
      
      // Vérifier le type de document
      if (document.type !== DocumentType.INVOICE) {
        throw new Error("Impossible d'ajouter un paiement à un devis");
      }
      
      // Créer un nouveau paiement
      const newPayment: UIPayment = {
        id: uuidv4(),
        documentId: payment.documentId || '',
        date: payment.date || new Date().toISOString().split('T')[0],
        amount: payment.amount || 0,
        method: payment.method || PaymentMethod.BANK_TRANSFER,
        reference: payment.reference || '',
        notes: payment.notes || '',
        receiptNumber: generateReceiptNumber(payments.length + 1),
        receiptSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEditing: false,
        validationErrors: {}
      };
      
      // Convertir en format service
      const servicePayment = {
        id: newPayment.id,
        documentId: newPayment.documentId,
        date: newPayment.date,
        amount: newPayment.amount,
        method: newPayment.method.toString(),
        reference: newPayment.reference,
        notes: newPayment.notes,
        receiptNumber: newPayment.receiptNumber
      };
      
      // Sauvegarder via le service
      const savedPayment = PaymentService.addPayment(servicePayment);
      
      // Reconvertir en format UI
      const uiPayment: UIPayment = {
        ...newPayment,
        id: savedPayment.id
      };
      
      // Mettre à jour l'état local
      setPayments(prev => [...prev, uiPayment]);
      
      // Recharger les documents pour mettre à jour les statuts et montants
      loadDocuments();
      
      return uiPayment;
    } catch (err) {
      setError('Erreur lors de l\'ajout du paiement: ' +
        (err instanceof Error ? err.message : String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getDocumentById, loadDocuments, payments]);
  
  /**
   * Supprimer un paiement
   */
  const deletePayment = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Supprimer via le service
      const success = PaymentService.deletePayment(id);
      
      if (success) {
        // Mettre à jour l'état local
        setPayments(prev => prev.filter(p => p.id !== id));
        
        // Recharger les documents pour mettre à jour les statuts et montants
        loadDocuments();
      }
      
      return success;
    } catch (err) {
      setError('Erreur lors de la suppression du paiement: ' +
        (err instanceof Error ? err.message : String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadDocuments]);
  
  /**
   * Récupérer les paiements d'un document
   */
  const getDocumentPayments = useCallback((documentId: string): UIPayment[] => {
    return payments.filter(p => p.documentId === documentId);
  }, [payments]);
  
  /**
   * Marquer un document comme envoyé
   */
  const markAsSent = useCallback(async (documentId: string): Promise<UIDocument> => {
    const document = getDocumentById(documentId);
    if (!document) {
      throw new Error(`Document avec ID ${documentId} non trouvé`);
    }
    
    // Mettre à jour le statut
    const updatedDocument: UIDocument = {
      ...document,
      status: DocumentStatus.SENT,
      updatedAt: new Date().toISOString()
    };
    
    // Sauvegarder les modifications
    return updateDocument(updatedDocument);
  }, [getDocumentById, updateDocument]);
  
  /**
   * Marquer un document comme payé
   */
  const markAsPaid = useCallback(async (
    documentId: string,
    paymentMethod: PaymentMethod
  ): Promise<UIDocument> => {
    const document = getDocumentById(documentId);
    if (!document) {
      throw new Error(`Document avec ID ${documentId} non trouvé`);
    }
    
    // Vérifier le type de document
    if (document.type !== DocumentType.INVOICE) {
      throw new Error("Impossible de marquer un devis comme payé");
    }
    
    // Ajouter un paiement pour le montant total
    await addPayment({
      documentId,
      amount: document.total || 0,
      method: paymentMethod,
      date: new Date().toISOString().split('T')[0],
      notes: "Paiement intégral"
    });
    
    // Le document sera automatiquement mis à jour par le service de paiement
    // Recharger pour obtenir la version mise à jour
    loadDocuments();
    
    // Récupérer le document mis à jour
    const updatedDocument = getDocumentById(documentId);
    if (!updatedDocument) {
      throw new Error(`Document avec ID ${documentId} non trouvé après mise à jour`);
    }
    
    return updatedDocument;
  }, [addPayment, getDocumentById, loadDocuments]);
  
  /**
   * Marquer un devis comme accepté
   */
  const markAsAccepted = useCallback(async (documentId: string): Promise<UIDocument> => {
    const document = getDocumentById(documentId);
    if (!document) {
      throw new Error(`Document avec ID ${documentId} non trouvé`);
    }
    
    // Vérifier le type de document
    if (document.type !== DocumentType.QUOTE) {
      throw new Error("Seuls les devis peuvent être marqués comme acceptés");
    }
    
    // Mettre à jour le statut
    const updatedDocument: UIDocument = {
      ...document,
      status: DocumentStatus.ACCEPTED,
      updatedAt: new Date().toISOString()
    };
    
    // Sauvegarder les modifications
    return updateDocument(updatedDocument);
  }, [getDocumentById, updateDocument]);
  
  /**
   * Marquer un devis comme rejeté
   */
  const markAsRejected = useCallback(async (
    documentId: string,
    reason?: string
  ): Promise<UIDocument> => {
    const document = getDocumentById(documentId);
    if (!document) {
      throw new Error(`Document avec ID ${documentId} non trouvé`);
    }
    
    // Vérifier le type de document
    if (document.type !== DocumentType.QUOTE) {
      throw new Error("Seuls les devis peuvent être marqués comme rejetés");
    }
    
    // Mettre à jour le statut et les notes
    const updatedDocument: UIDocument = {
      ...document,
      status: DocumentStatus.REJECTED,
      notes: reason 
        ? `${document.notes || ''}\n\nMotif de rejet: ${reason}` 
        : document.notes,
      updatedAt: new Date().toISOString()
    };
    
    // Sauvegarder les modifications
    return updateDocument(updatedDocument);
  }, [getDocumentById, updateDocument]);
  
  /**
   * Convertir un devis en facture
   */
  const convertQuoteToInvoice = useCallback(async (quoteId: string): Promise<UIDocument> => {
    const quote = getDocumentById(quoteId);
    if (!quote) {
      throw new Error(`Devis avec ID ${quoteId} non trouvé`);
    }
    
    // Vérifier le type de document
    if (quote.type !== DocumentType.QUOTE) {
      throw new Error("Seuls les devis peuvent être convertis en facture");
    }
    
    // Créer une nouvelle facture basée sur le devis
    const invoiceData: Partial<UIDocument> = {
      type: DocumentType.INVOICE,
      status: DocumentStatus.DRAFT,
      clientInfo: quote.clientInfo,
      companyInfo: quote.companyInfo,
      items: quote.items,
      notes: quote.notes,
      paymentTerms: quote.paymentTerms,
      businessPlanId: quote.businessPlanId,
      serviceId: quote.serviceId,
      // Ajouter une date d'échéance à 30 jours par défaut
      dueDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
      })()
    };
    
    // Créer la facture
    const newInvoice = await createDocument(invoiceData);
    
    // Si le devis était accepté, marquer le devis comme converti dans les notes
    if (quote.status === DocumentStatus.ACCEPTED) {
      const updatedQuote: UIDocument = {
        ...quote,
        notes: `${quote.notes || ''}\n\nConverti en facture ${newInvoice.number} le ${new Date().toLocaleDateString()}.`,
        updatedAt: new Date().toISOString()
      };
      await updateDocument(updatedQuote);
    }
    
    return newInvoice;
  }, [createDocument, getDocumentById, updateDocument]);
  
  /**
   * Appliquer les filtres aux documents
   */
  const applyFilters = useCallback((docsList: UIDocument[], currentFilters: UIDocumentFilters) => {
    // Filtrer les documents selon les critères
    let filtered = [...docsList];
    
    // Filtrer par type de document
    if (currentFilters.documentTypes.length > 0) {
      filtered = filtered.filter(doc => 
        currentFilters.documentTypes.includes(doc.type)
      );
    }
    
    // Filtrer par statut
    if (currentFilters.statuses.length > 0) {
      filtered = filtered.filter(doc => 
        currentFilters.statuses.includes(doc.status)
      );
    }
    
    // Filtrer par date d'émission (début)
    if (currentFilters.issueDateFrom) {
      filtered = filtered.filter(doc => 
        doc.issueDate >= currentFilters.issueDateFrom!
      );
    }
    
    // Filtrer par date d'émission (fin)
    if (currentFilters.issueDateTo) {
      filtered = filtered.filter(doc => 
        doc.issueDate <= currentFilters.issueDateTo!
      );
    }
    
    // Filtrer par montant minimum
    if (currentFilters.minAmount !== undefined) {
      filtered = filtered.filter(doc => 
        (doc.total || 0) >= (currentFilters.minAmount || 0)
      );
    }
    
    // Filtrer par montant maximum
    if (currentFilters.maxAmount !== undefined) {
      filtered = filtered.filter(doc => 
        (doc.total || 0) <= (currentFilters.maxAmount || Infinity)
      );
    }
    
    // Filtrer par terme de recherche
    if (currentFilters.searchTerm) {
      const searchLower = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.number.toLowerCase().includes(searchLower) ||
        doc.clientInfo.name.toLowerCase().includes(searchLower) ||
        doc.items.some(item => 
          item.description.toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Filtrer par client
    if (currentFilters.clientId) {
      filtered = filtered.filter(doc => 
        doc.clientInfo.id === currentFilters.clientId
      );
    }
    
    // Filtrer par plan d'affaires
    if (currentFilters.businessPlanId) {
      filtered = filtered.filter(doc => 
        doc.businessPlanId === currentFilters.businessPlanId
      );
    }
    
    // Mettre à jour l'état des documents filtrés
    setFilteredDocuments(filtered);
  }, []);
  
  /**
   * Mettre à jour les filtres
   */
  const setFilters = useCallback((newFilters: Partial<UIDocumentFilters>) => {
    setFiltersState(prev => {
      const updated = { ...prev, ...newFilters };
      // Appliquer les nouveaux filtres
      applyFilters(documents, updated);
      return updated;
    });
  }, [applyFilters, documents]);
  
  /**
   * Réinitialiser les filtres
   */
  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    applyFilters(documents, defaultFilters);
  }, [applyFilters, documents]);
  
  // Charger les données initiales
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);
  
  // Appliquer les filtres quand les documents changent
  useEffect(() => {
    applyFilters(documents, filters);
  }, [documents, filters, applyFilters]);
  
  return {
    documents,
    filteredDocuments,
    selectedDocument,
    stats,
    isLoading,
    error,
    filters,
    loadDocuments,
    getDocumentById,
    getDocumentsByBusinessPlanId,
    createDocument,
    updateDocument,
    deleteDocument,
    selectDocument,
    addItem,
    updateItem,
    removeItem,
    addPayment,
    deletePayment,
    getDocumentPayments,
    markAsSent,
    markAsPaid,
    markAsAccepted,
    markAsRejected,
    convertQuoteToInvoice,
    setFilters,
    resetFilters
  };
};

export default useInvoicing;