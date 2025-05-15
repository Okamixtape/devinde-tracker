/**
 * useFinancialProjects - Hook pour la gestion des projets financiers
 * 
 * Ce hook exploite les adaptateurs UI et les services existants pour fournir
 * une interface moderne pour la gestion des projets financiers.
 */

import { useState, useEffect, useCallback } from 'react';
import { BusinessPlanData, FinancialProject, FinancialTransaction } from '../services/interfaces/dataModels';
import { BusinessPlanServiceImpl } from '../services/implementations/businessPlanServiceImpl';
import { transformFinancialProjects, calculateFinancialProjectsSummary } from '../adapters/UIAdapters';
import { FinancialProjectCard, FinancialProjectSummary } from '../interfaces/UIModels';

interface UseFinancialProjectsResult {
  // Données
  projects: FinancialProject[];
  projectCards: FinancialProjectCard[];
  projectsSummary: FinancialProjectSummary;
  
  // État
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createProject: (project: Omit<FinancialProject, 'id'>) => Promise<boolean>;
  updateProject: (project: FinancialProject) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  addTransaction: (projectId: string, transaction: Omit<FinancialTransaction, 'id'>) => Promise<boolean>;
  updateTransaction: (projectId: string, transaction: FinancialTransaction) => Promise<boolean>;
  deleteTransaction: (projectId: string, transactionId: string) => Promise<boolean>;
}

/**
 * Hook pour gérer les projets financiers
 */
export const useFinancialProjects = (businessPlanId?: string): UseFinancialProjectsResult => {
  // Service pour accéder aux données du plan d'affaires
  const businessPlanService = new BusinessPlanServiceImpl();
  
  // État local
  const [businessPlan, setBusinessPlan] = useState<BusinessPlanData | null>(null);
  const [projects, setProjects] = useState<FinancialProject[]>([]);
  const [projectCards, setProjectCards] = useState<FinancialProjectCard[]>([]);
  const [projectsSummary, setProjectsSummary] = useState<FinancialProjectSummary>({
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Charger les projets financiers depuis le plan d'affaires
   */
  const loadProjects = useCallback(async (planId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await businessPlanService.getBusinessPlan(planId);
      
      if (result.success && result.data) {
        setBusinessPlan(result.data);
        
        // Extraire les projets financiers des données du plan d'affaires
        // Note: Dans un vrai scénario, ils pourraient être stockés dans financials.projects
        // Ici, nous supposons qu'ils sont déjà présents ou créons un tableau vide
        const financialProjects = result.data.financials.projects || [];
        
        setProjects(financialProjects);
        setProjectCards(transformFinancialProjects(financialProjects));
        setProjectsSummary(calculateFinancialProjectsSummary(financialProjects));
      } else {
        setError(result.error || 'Erreur inconnue lors du chargement des projets');
      }
    } catch (err) {
      setError('Erreur lors du chargement des projets: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanService]);
  
  /**
   * Sauvegarder les projets dans le plan d'affaires
   */
  const saveProjects = useCallback(async (updatedProjects: FinancialProject[]): Promise<boolean> => {
    if (!businessPlan) {
      setError('Aucun plan d\'affaires chargé');
      return false;
    }
    
    try {
      // Mettre à jour l'état local
      setProjects(updatedProjects);
      setProjectCards(transformFinancialProjects(updatedProjects));
      setProjectsSummary(calculateFinancialProjectsSummary(updatedProjects));
      
      // Mettre à jour le plan d'affaires avec les nouveaux projets
      const updatedBusinessPlan = {
        ...businessPlan,
        financials: {
          ...businessPlan.financials,
          projects: updatedProjects
        }
      };
      
      // Sauvegarder les modifications
      const result = await businessPlanService.saveBusinessPlan(updatedBusinessPlan);
      
      if (!result.success) {
        setError(result.error || 'Erreur inconnue lors de la sauvegarde');
        return false;
      }
      
      // Mettre à jour l'état local avec le plan d'affaires mis à jour
      setBusinessPlan(updatedBusinessPlan);
      
      return true;
    } catch (err) {
      setError('Erreur lors de la sauvegarde: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [businessPlan, businessPlanService]);
  
  /**
   * Créer un nouveau projet financier
   */
  const createProject = useCallback(async (project: Omit<FinancialProject, 'id'>): Promise<boolean> => {
    try {
      // Générer un nouvel ID unique
      const newId = `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Créer le nouveau projet
      const newProject: FinancialProject = {
        ...project,
        id: newId,
        transactions: project.transactions || []
      };
      
      // Ajouter le projet à la liste existante
      const updatedProjects = [...projects, newProject];
      
      // Sauvegarder les modifications
      return saveProjects(updatedProjects);
    } catch (err) {
      setError('Erreur lors de la création du projet: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [projects, saveProjects]);
  
  /**
   * Mettre à jour un projet financier existant
   */
  const updateProject = useCallback(async (project: FinancialProject): Promise<boolean> => {
    try {
      // Trouver l'index du projet à mettre à jour
      const projectIndex = projects.findIndex(p => p.id === project.id);
      
      if (projectIndex === -1) {
        setError('Projet non trouvé');
        return false;
      }
      
      // Mettre à jour le projet
      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = project;
      
      // Sauvegarder les modifications
      return saveProjects(updatedProjects);
    } catch (err) {
      setError('Erreur lors de la mise à jour du projet: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [projects, saveProjects]);
  
  /**
   * Supprimer un projet financier
   */
  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      // Filtrer le projet à supprimer
      const updatedProjects = projects.filter(p => p.id !== projectId);
      
      if (updatedProjects.length === projects.length) {
        setError('Projet non trouvé');
        return false;
      }
      
      // Sauvegarder les modifications
      return saveProjects(updatedProjects);
    } catch (err) {
      setError('Erreur lors de la suppression du projet: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [projects, saveProjects]);
  
  /**
   * Ajouter une transaction à un projet
   */
  const addTransaction = useCallback(async (
    projectId: string, 
    transaction: Omit<FinancialTransaction, 'id'>
  ): Promise<boolean> => {
    try {
      // Trouver le projet
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        setError('Projet non trouvé');
        return false;
      }
      
      // Générer un ID unique pour la transaction
      const newId = `transaction-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Créer la nouvelle transaction
      const newTransaction: FinancialTransaction = {
        ...transaction,
        id: newId
      };
      
      // Ajouter la transaction au projet
      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        transactions: [...updatedProjects[projectIndex].transactions, newTransaction]
      };
      
      // Sauvegarder les modifications
      return saveProjects(updatedProjects);
    } catch (err) {
      setError('Erreur lors de l\'ajout de la transaction: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [projects, saveProjects]);
  
  /**
   * Mettre à jour une transaction existante
   */
  const updateTransaction = useCallback(async (
    projectId: string, 
    transaction: FinancialTransaction
  ): Promise<boolean> => {
    try {
      // Trouver le projet
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        setError('Projet non trouvé');
        return false;
      }
      
      // Trouver la transaction
      const transactionIndex = projects[projectIndex].transactions.findIndex(t => t.id === transaction.id);
      
      if (transactionIndex === -1) {
        setError('Transaction non trouvée');
        return false;
      }
      
      // Mettre à jour la transaction
      const updatedProjects = [...projects];
      const updatedTransactions = [...updatedProjects[projectIndex].transactions];
      updatedTransactions[transactionIndex] = transaction;
      
      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        transactions: updatedTransactions
      };
      
      // Sauvegarder les modifications
      return saveProjects(updatedProjects);
    } catch (err) {
      setError('Erreur lors de la mise à jour de la transaction: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [projects, saveProjects]);
  
  /**
   * Supprimer une transaction
   */
  const deleteTransaction = useCallback(async (
    projectId: string, 
    transactionId: string
  ): Promise<boolean> => {
    try {
      // Trouver le projet
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        setError('Projet non trouvé');
        return false;
      }
      
      // Filtrer la transaction à supprimer
      const updatedTransactions = projects[projectIndex].transactions.filter(t => t.id !== transactionId);
      
      if (updatedTransactions.length === projects[projectIndex].transactions.length) {
        setError('Transaction non trouvée');
        return false;
      }
      
      // Mettre à jour le projet
      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        transactions: updatedTransactions
      };
      
      // Sauvegarder les modifications
      return saveProjects(updatedProjects);
    } catch (err) {
      setError('Erreur lors de la suppression de la transaction: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [projects, saveProjects]);
  
  // Charger les projets initiaux si un ID est fourni
  useEffect(() => {
    if (businessPlanId) {
      loadProjects(businessPlanId);
    }
  }, [businessPlanId, loadProjects]);
  
  return {
    projects,
    projectCards,
    projectsSummary,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};
