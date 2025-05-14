'use client';

import { useState, useEffect } from 'react';
import { Document, Payment, PaymentMethod } from '@/app/interfaces/invoicing';
import { RiskClientService } from '@/app/services/riskClientService';
import PaymentService from '@/app/services/paymentService';
import DocumentService from '@/app/services/documentService';
import { IncidentType } from '@/app/interfaces/client-risk';
import { v4 as uuidv4 } from 'uuid';

interface PaymentFormProps {
  document: Document;
  onPaymentAdded: () => void;
}

export default function PaymentForm({ document, onPaymentAdded }: PaymentFormProps) {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  // Chargement des paiements existants
  useEffect(() => {
    if (document) {
      const documentPayments = PaymentService.getDocumentPayments(document.id);
      setPayments(documentPayments);
      
      const paymentStats = PaymentService.getPaymentStats(document.id);
      setStats(paymentStats);
      
      // Si le montant n'est pas encore défini, définir le montant restant par défaut
      if (amount === 0 && paymentStats.remainingAmount > 0) {
        setAmount(paymentStats.remainingAmount);
      }
    }
  }, [document, amount]);
  
  // Traduction des méthodes de paiement
  const paymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.BANK_TRANSFER]: 'Virement bancaire',
    [PaymentMethod.CREDIT_CARD]: 'Carte bancaire',
    [PaymentMethod.CHECK]: 'Chèque',
    [PaymentMethod.CASH]: 'Espèces',
    [PaymentMethod.PAYPAL]: 'PayPal',
    [PaymentMethod.OTHER]: 'Autre'
  };
  
  // Ajout d'un nouveau paiement
  const handleAddPayment = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validation
      if (amount <= 0) {
        throw new Error('Le montant doit être supérieur à 0');
      }
      
      if (amount > stats.remainingAmount) {
        throw new Error(`Le montant ne peut pas dépasser le solde restant (${stats.remainingAmount.toFixed(2)} €)`);
      }
      
      // Création du paiement
      const newPayment: Payment = {
        id: uuidv4(),
        documentId: document.id,
        date,
        amount,
        method,
        reference,
        notes,
        receiptNumber: PaymentService.generatePaymentReceipt({
          id: '',
          documentId: document.id,
          date,
          amount,
          method
        })
      };
      
      // Enregistrement du paiement
      PaymentService.addPayment(newPayment);
      
      // Réinitialisation du formulaire
      setAmount(0);
      setReference('');
      setNotes('');
      setSuccess('Paiement enregistré avec succès');
      
      // Notification du parent
      onPaymentAdded();
      
      // Rechargement des paiements
      const updatedPayments = PaymentService.getDocumentPayments(document.id);
      setPayments(updatedPayments);
      
      const updatedStats = PaymentService.getPaymentStats(document.id);
      setStats(updatedStats);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Signaler un problème de paiement
  const reportPaymentIssue = (type: IncidentType) => {
    // Vérifier si le client existe déjà dans la liste des clients à risque
    let clientRisk = RiskClientService.getRiskClientByClientId(document.clientInfo.id || '');
    
    if (!clientRisk) {
      // Création d'un nouveau client à risque
      clientRisk = {
        id: '',
        clientId: document.clientInfo.id || document.clientInfo.name,
        clientName: document.clientInfo.name,
        riskLevel: 'low',
        incidents: [],
        notes: `Client initialement signalé pour un problème de paiement sur la facture ${document.number}`,
        lastUpdated: new Date().toISOString(),
        addedOn: new Date().toISOString(),
        contactInfo: {
          email: document.clientInfo.email,
          address: document.clientInfo.address
        }
      };
    }
    
    // Création de l'incident
    const incident = {
      id: uuidv4(),
      clientId: clientRisk.clientId,
      businessPlanId: document.businessPlanId,
      documentId: document.id,
      type,
      description: `Problème de paiement sur la facture ${document.number}`,
      date: new Date().toISOString(),
      amountInvolved: stats.remainingAmount,
      resolved: false
    };
    
    // Enregistrement de l'incident
    RiskClientService.saveIncident(incident);
    
    // Mise à jour du drapeau de risque sur le document
    const updatedDocument = {
      ...document,
      clientRiskFlag: true
    };
    
    DocumentService.save(updatedDocument);
    
    // Notification
    setSuccess(`Le client a été signalé pour un problème de type "${type}"`);
  };
  
  if (!document || !stats) {
    return <div>Chargement...</div>;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Gestion des paiements
      </h3>
      
      {/* Statistiques de paiement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Montant total</div>
          <div className="text-xl font-semibold">{stats.totalAmount.toFixed(2)} €</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Déjà payé</div>
          <div className="text-xl font-semibold">{stats.paidAmount.toFixed(2)} €</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Reste à payer</div>
          <div className="text-xl font-semibold">{stats.remainingAmount.toFixed(2)} €</div>
        </div>
      </div>
      
      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
        <div 
          className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500" 
          style={{ width: `${stats.paymentPercentage}%` }}
        ></div>
      </div>
      
      {/* Historique des paiements */}
      {payments.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-300">
            Historique des paiements
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Référence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(payment.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      {payment.amount.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {paymentMethodLabels[payment.method]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payment.reference || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Formulaire d'ajout de paiement */}
      {stats.remainingAmount > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-4">
          <h4 className="text-md font-medium mb-4 text-gray-800 dark:text-gray-300">
            Ajouter un paiement
          </h4>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-4 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400">
              {success}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Montant (€)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                step="0.01"
                min="0"
                max={stats.remainingAmount}
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Méthode de paiement
              </label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {Object.entries(paymentMethodLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Référence
              </label>
              <input
                type="text"
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Numéro de transaction, chèque..."
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={2}
              placeholder="Informations complémentaires..."
            ></textarea>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={handleAddPayment}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer le paiement'}
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => reportPaymentIssue(IncidentType.PAYMENT_DELAY)}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
              >
                Signaler un retard
              </button>
              <button
                onClick={() => reportPaymentIssue(IncidentType.NON_PAYMENT)}
                className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Signaler un impayé
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
