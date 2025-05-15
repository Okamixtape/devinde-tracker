'use client';

import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentStatus, Payment, PaymentMethod } from '../interfaces/invoicing';
import DocumentService from './documentService';
import { IPaymentService } from './interfaces/service-interfaces';

// LocalStorage key
const PAYMENTS_KEY = 'devinde_payments';

/**
 * Implementation of the Payment Service
 * Provides methods to manage payments
 */
class PaymentServiceImpl implements IPaymentService {
  /**
   * Retrieves all payments
   * @returns Array of all payments
   */
  getAllPayments(): Payment[] {
    if (typeof window === 'undefined') return [];
    
    const paymentsJSON = localStorage.getItem(PAYMENTS_KEY);
    if (!paymentsJSON) return [];
    
    try {
      return JSON.parse(paymentsJSON);
    } catch (error) {
      console.error('Error retrieving payments:', error);
      return [];
    }
  }
  
  /**
   * Retrieves payments for a specific document
   * @param documentId The ID of the document to retrieve payments for
   * @returns Array of payments
   */
  getDocumentPayments(documentId: string): Payment[] {
    const payments = this.getAllPayments();
    return payments.filter(payment => payment.documentId === documentId);
  }
  
  /**
   * Adds a new payment
   * @param payment The payment to add
   * @returns The added payment
   */
  addPayment(payment: Payment): Payment {
    // Generate an ID if it doesn't have one
    if (!payment.id) {
      payment.id = uuidv4();
    }
    
    // Save the payment
    const payments = this.getAllPayments();
    payments.push(payment);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    
    // Update the associated document
    this.updateDocumentPaymentStatus(payment.documentId);
    
    return payment;
  }
  
  /**
   * Deletes a payment
   * @param paymentId The ID of the payment to delete
   * @returns True if deletion was successful, false otherwise
   */
  deletePayment(paymentId: string): boolean {
    const payments = this.getAllPayments();
    const paymentToDelete = payments.find(p => p.id === paymentId);
    
    if (!paymentToDelete) return false;
    
    const documentId = paymentToDelete.documentId;
    const updatedPayments = payments.filter(p => p.id !== paymentId);
    
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(updatedPayments));
    
    // Update the associated document
    this.updateDocumentPaymentStatus(documentId);
    
    return true;
  }
  
  /**
   * Updates the payment status of a document
   * @param documentId The ID of the document to update
   */
  updateDocumentPaymentStatus(documentId: string): void {
    const document = DocumentService.getById(documentId);
    if (!document || document.type !== 'invoice') return;
    
    const payments = this.getDocumentPayments(documentId);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Update the document
    const updatedDocument: Document = {
      ...document,
      payments: payments,
      amountPaid: totalPaid,
      remainingAmount: (document.total || 0) - totalPaid,
      lastPaymentDate: payments.length > 0 
        ? payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : undefined
    };
    
    // Determine the payment status
    if (totalPaid === 0) {
      // If no payments have been made
      if (document.dueDate && new Date(document.dueDate) < new Date()) {
        updatedDocument.status = DocumentStatus.OVERDUE;
      } else {
        updatedDocument.status = DocumentStatus.SENT;
      }
    } else if (totalPaid >= (document.total || 0)) {
      // If the amount is fully paid
      updatedDocument.status = DocumentStatus.PAID;
    } else {
      // If the amount is partially paid
      if (document.dueDate && new Date(document.dueDate) < new Date()) {
        updatedDocument.status = DocumentStatus.OVERDUE;
      } else {
        updatedDocument.status = DocumentStatus.PARTIALLY_PAID;
      }
    }
    
    // Save the updated document
    DocumentService.save(updatedDocument);
  }
  
  /**
   * Generates a payment receipt
   * @param payment The payment to generate a receipt for
   * @returns The receipt number
   */
  generatePaymentReceipt(payment: Payment): string {
    const document = DocumentService.getById(payment.documentId);
    if (!document) return '';
    
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const receiptCount = this.getAllPayments().length + 1;
    const paddedCount = receiptCount.toString().padStart(3, '0');
    
    return `RCPT-${year}${month}-${paddedCount}`;
  }
  
  /**
   * Calculates payment statistics for a document
   * @param documentId The ID of the document to calculate statistics for
   * @returns Payment statistics
   */
  getPaymentStats(documentId: string): {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentCount: number;
    isPaid: boolean;
    isPartiallyPaid: boolean;
    isOverdue: boolean;
    paymentPercentage: number;
  } {
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
    
    const payments = this.getDocumentPayments(documentId);
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
}

// Create singleton instance
export const PaymentService = new PaymentServiceImpl();

// Export both the service instance and the implementation class
export { PaymentServiceImpl };

export default PaymentService;