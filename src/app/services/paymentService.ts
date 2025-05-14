'use client';

import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentStatus, Payment, PaymentMethod } from '../interfaces/invoicing';
import DocumentService from './documentService';

// Clé LocalStorage
const PAYMENTS_KEY = 'devinde_payments';

/**
 * Service de gestion des paiements
 */
export const PaymentService = {
  /**
   * Récupère tous les paiements
   */
  getAllPayments: (): Payment[] => {
    if (typeof window === 'undefined') return [];
    
    const paymentsJSON = localStorage.getItem(PAYMENTS_KEY);
    if (!paymentsJSON) return [];
    
    try {
      return JSON.parse(paymentsJSON);
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
      return [];
    }
  },
  
  /**
   * Récupère les paiements d'un document spécifique
   */
  getDocumentPayments: (documentId: string): Payment[] => {
    const payments = PaymentService.getAllPayments();
    return payments.filter(payment => payment.documentId === documentId);
  },
  
  /**
   * Ajoute un nouveau paiement
   */
  addPayment: (payment: Payment): Payment => {
    // Génération d'un ID s'il n'en a pas
    if (!payment.id) {
      payment.id = uuidv4();
    }
    
    // Sauvegarde du paiement
    const payments = PaymentService.getAllPayments();
    payments.push(payment);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    
    // Mise à jour du document associé
    PaymentService.updateDocumentPaymentStatus(payment.documentId);
    
    return payment;
  },
  
  /**
   * Supprime un paiement
   */
  deletePayment: (paymentId: string): boolean => {
    const payments = PaymentService.getAllPayments();
    const paymentToDelete = payments.find(p => p.id === paymentId);
    
    if (!paymentToDelete) return false;
    
    const documentId = paymentToDelete.documentId;
    const updatedPayments = payments.filter(p => p.id !== paymentId);
    
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(updatedPayments));
    
    // Mise à jour du document associé
    PaymentService.updateDocumentPaymentStatus(documentId);
    
    return true;
  },
  
  /**
   * Met à jour le statut de paiement d'un document
   */
  updateDocumentPaymentStatus: (documentId: string): void => {
    const document = DocumentService.getById(documentId);
    if (!document || document.type !== 'invoice') return;
    
    const payments = PaymentService.getDocumentPayments(documentId);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Mise à jour du document
    const updatedDocument: Document = {
      ...document,
      payments: payments,
      amountPaid: totalPaid,
      remainingAmount: (document.total || 0) - totalPaid,
      lastPaymentDate: payments.length > 0 
        ? payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : undefined
    };
    
    // Détermination du statut de paiement
    if (totalPaid === 0) {
      // Si aucun paiement n'a été effectué
      if (document.dueDate && new Date(document.dueDate) < new Date()) {
        updatedDocument.status = DocumentStatus.OVERDUE;
      } else {
        updatedDocument.status = DocumentStatus.SENT;
      }
    } else if (totalPaid >= (document.total || 0)) {
      // Si le montant est entièrement payé
      updatedDocument.status = DocumentStatus.PAID;
    } else {
      // Si le montant est partiellement payé
      if (document.dueDate && new Date(document.dueDate) < new Date()) {
        updatedDocument.status = DocumentStatus.OVERDUE;
      } else {
        updatedDocument.status = DocumentStatus.PARTIALLY_PAID;
      }
    }
    
    // Sauvegarde du document mis à jour
    DocumentService.save(updatedDocument);
  },
  
  /**
   * Génère un récépissé de paiement
   */
  generatePaymentReceipt: (payment: Payment): string => {
    const document = DocumentService.getById(payment.documentId);
    if (!document) return '';
    
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const receiptCount = PaymentService.getAllPayments().length + 1;
    const paddedCount = receiptCount.toString().padStart(3, '0');
    
    return `RECU-${year}${month}-${paddedCount}`;
  },
  
  /**
   * Calcule les statistiques de paiement pour un document
   */
  getPaymentStats: (documentId: string): {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentCount: number;
    isPaid: boolean;
    isPartiallyPaid: boolean;
    isOverdue: boolean;
    paymentPercentage: number;
  } => {
    const document = DocumentService.getById(documentId);
    if (!document) {
      return {
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
        paymentCount: 0,
        isPaid: false,
        isPartiallyPaid: false,
        isOverdue: false,
        paymentPercentage: 0
      };
    }
    
    const payments = PaymentService.getDocumentPayments(documentId);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalAmount = document.total || 0;
    const remainingAmount = totalAmount - totalPaid;
    
    return {
      totalAmount,
      paidAmount: totalPaid,
      remainingAmount,
      paymentCount: payments.length,
      isPaid: totalPaid >= totalAmount,
      isPartiallyPaid: totalPaid > 0 && totalPaid < totalAmount,
      isOverdue: document.status === DocumentStatus.OVERDUE,
      paymentPercentage: totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0
    };
  }
};

export default PaymentService;
