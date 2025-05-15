'use client';

import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentType, DocumentStatus, generateDocumentNumber, calculateDocumentTotals } from '../interfaces/invoicing';
import { Service } from '../plans/[id]/services/components/ServiceCard';
import { IDocumentService } from './interfaces/service-interfaces';

// LocalStorage keys
const DOCUMENTS_KEY = 'devinde_documents';
const DOCUMENT_COUNT_KEY = 'devinde_document_count';

/**
 * Implementation of the Document Service
 * Provides methods to manage documents (invoices and quotes)
 */
class DocumentServiceImpl implements IDocumentService {
  /**
   * Retrieves all documents
   * @returns Array of all documents
   */
  getAll(): Document[] {
    if (typeof window === 'undefined') return [];
    
    const documentsJSON = localStorage.getItem(DOCUMENTS_KEY);
    if (!documentsJSON) return [];
    
    try {
      return JSON.parse(documentsJSON);
    } catch (error) {
      console.error('Error retrieving documents:', error);
      return [];
    }
  }
  
  /**
   * Retrieves a document by its ID
   * @param id The ID of the document to retrieve
   * @returns The document or null if not found
   */
  getById(id: string): Document | null {
    const documents = this.getAll();
    return documents.find(doc => doc.id === id) || null;
  }
  
  /**
   * Retrieves all documents associated with a business plan
   * @param businessPlanId The ID of the business plan
   * @returns Array of documents
   */
  getByBusinessPlanId(businessPlanId: string): Document[] {
    const documents = this.getAll();
    return documents.filter(doc => doc.businessPlanId === businessPlanId);
  }
  
  /**
   * Retrieves all documents associated with a service
   * @param serviceId The ID of the service
   * @returns Array of documents
   */
  getByServiceId(serviceId: string): Document[] {
    const documents = this.getAll();
    return documents.filter(doc => doc.serviceId === serviceId);
  }
  
  /**
   * Saves a document (creates new or updates existing)
   * @param document The document to save
   * @returns The saved document
   */
  save(document: Document): Document {
    const documents = this.getAll();
    const updatedDoc = {...document};
    
    // If it's a new document or a converted document (without ID)
    if (!updatedDoc.id) {
      // Generate a new ID
      updatedDoc.id = uuidv4();
      
      // Generate a document number if it doesn't already have one
      if (!updatedDoc.number || updatedDoc.number === '') {
        // Get the current counter for this type of document
        const countKey = updatedDoc.type === DocumentType.INVOICE ? 'invoice_count' : 'quote_count';
        const count = Number(localStorage.getItem(countKey) || '0') + 1;
        localStorage.setItem(countKey, count.toString());
        
        // Generate the number
        updatedDoc.number = generateDocumentNumber(updatedDoc.type, count);
      }
    }
    
    const existingIndex = documents.findIndex(doc => doc.id === updatedDoc.id);
    
    // Calculate totals before saving
    const docWithTotals = calculateDocumentTotals(updatedDoc);
    
    if (existingIndex >= 0) {
      // Update an existing document
      documents[existingIndex] = docWithTotals;
    } else {
      // Add a new document
      documents.push(docWithTotals);
    }
    
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
    return docWithTotals;
  }
  
  /**
   * Deletes a document by its ID
   * @param id The ID of the document to delete
   * @returns True if deletion was successful, false otherwise
   */
  delete(id: string): boolean {
    const documents = this.getAll();
    const initialLength = documents.length;
    const filteredDocuments = documents.filter(doc => doc.id !== id);
    
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(filteredDocuments));
    return filteredDocuments.length < initialLength;
  }
  
  /**
   * Creates a new document from a service
   * @param type The type of document (invoice or quote)
   * @param service The service to create the document from
   * @param businessPlanId The ID of the business plan
   * @param clientInfo The client information
   * @param companyInfo The company information
   * @param additionalDetails Additional document details
   * @returns The created document
   */
  createFromService(
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
  ): Document {
    // Generate a new document number
    let count = 1;
    try {
      const storedCount = localStorage.getItem(DOCUMENT_COUNT_KEY);
      if (storedCount) {
        count = parseInt(storedCount, 10) + 1;
      }
      localStorage.setItem(DOCUMENT_COUNT_KEY, count.toString());
    } catch (e) {
      console.error('Error generating document number:', e);
    }
    
    const number = generateDocumentNumber(type, count);
    
    // Determine the price based on the billing mode
    let unitPrice = 0;
    let description = service.name;
    let quantity = 1;
    
    switch(service.billingMode) {
      case 'hourly':
        unitPrice = service.hourlyRate || 0;
        quantity = service.estimatedHours || 1;
        description = `${service.name} - Hourly rate`;
        break;
      case 'package':
        unitPrice = service.packagePrice || 0;
        description = `${service.name} - Fixed price`;
        break;
      case 'subscription':
        unitPrice = service.subscriptionPrice || 0;
        description = `${service.name} - Monthly subscription`;
        break;
    }
    
    // Create the document
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
          taxRate: 0.2, // 20% VAT by default
          discount: 0
        }
      ],
      ...additionalDetails
    };
    
    // Calculate totals
    const finalDocument = calculateDocumentTotals(newDocument);
    
    // Save and return the document
    return this.save(finalDocument);
  }
}

// Create singleton instance
export const DocumentService = new DocumentServiceImpl();

// Export both the service instance and the implementation class
export { DocumentServiceImpl };

export default DocumentService;