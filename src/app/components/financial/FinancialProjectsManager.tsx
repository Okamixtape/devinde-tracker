'use client';

import React, { useState } from 'react';
import { FinancialProject, FinancialTransaction } from "@/app/services/interfaces/dataModels";

interface FinancialProjectsManagerProps {
  businessPlanId: string;
  projects: FinancialProject[];
  onProjectsChange: (projects: FinancialProject[]) => void;
  readOnly?: boolean;
}

/**
 * FinancialProjectsManager Component
 * 
 * Permet de gérer les projets financiers liés à un business plan.
 * Offre des fonctionnalités pour créer, modifier, et suivre les projets financiers
 * et leurs transactions associées.
 */
export function FinancialProjectsManager({
  businessPlanId,
  projects = [],
  onProjectsChange,
  readOnly = false
}: FinancialProjectsManagerProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectStartDate, setNewProjectStartDate] = useState<Date>(new Date());
  const [newProjectEndDate, setNewProjectEndDate] = useState<Date>(new Date());
  const [newProjectBudget, setNewProjectBudget] = useState(0);
  const [newProjectStatus, setNewProjectStatus] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [newTransactionAmount, setNewTransactionAmount] = useState<number>(0);
  const [newTransactionDescription, setNewTransactionDescription] = useState<string>('');
  const [newTransactionDate, setNewTransactionDate] = useState<Date>(new Date());
  const [newTransactionType, setNewTransactionType] = useState<'income' | 'expense'>('income');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);

  // Trouver le projet sélectionné
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  // Statistiques des projets
  const projectStats = React.useMemo(() => {
    if (!projects || projects.length === 0) return { totalBudget: 0, activeProjects: 0, completedProjects: 0, plannedProjects: 0, cancelledProjects: 0 };

    return {
      totalBudget: projects.reduce((sum, project) => sum + project.budget, 0),
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      plannedProjects: projects.filter(p => p.status === 'planned').length,
      cancelledProjects: projects.filter(p => p.status === 'cancelled').length
    };
  }, [projects]);

  // Calcul des totaux pour un projet
  const calculateProjectTotals = (project: FinancialProject): void => {
    const income = project.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = project.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    project.totalIncome = income;
    project.totalExpenses = expenses;
    project.balance = income - expenses;
  };

  // Mise à jour d'un projet
  const handleUpdateProject = (updatedProject: FinancialProject) => {
    const projectIndex = projects.findIndex(p => p.id === updatedProject.id);

    if (projectIndex !== -1) {
      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = updatedProject;
      onProjectsChange(updatedProjects);
    }
  };

  // Mise à jour d'une transaction
  const handleUpdateTransaction = (projectId: string, transactionId: string, updatedData: Partial<FinancialTransaction>) => {
    const updatedProjects = [...projects];
    const projectIndex = updatedProjects.findIndex(p => p.id === projectId);

    if (projectIndex !== -1) {
      const transactionIndex = updatedProjects[projectIndex].transactions.findIndex(t => t.id === transactionId);

      if (transactionIndex !== -1) {
        updatedProjects[projectIndex].transactions[transactionIndex] = {
          ...updatedProjects[projectIndex].transactions[transactionIndex],
          ...updatedData
        };

        // Update total and balance
        calculateProjectTotals(updatedProjects[projectIndex]);

        onProjectsChange(updatedProjects);
      }
    }
  };

  // Modification des champs d'un projet existant
  const handleEditProjectField = (projectId: string, field: keyof FinancialProject, value: string | number | Date) => {
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex !== -1) {
      const updatedProjects = [...projects];
      const updatedProject = {
        ...updatedProjects[projectIndex],
        [field]: value
      };

      updatedProjects[projectIndex] = updatedProject;
      onProjectsChange(updatedProjects);
    }
  };

  // Suppression d'une transaction
  const handleDeleteTransaction = (projectId: string, transactionId: string) => {
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex !== -1) {
      const updatedProjects = [...projects];
      const updatedTransactions = updatedProjects[projectIndex].transactions.filter(
        t => t.id !== transactionId
      );

      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        transactions: updatedTransactions
      };

      // Recalculer les totaux après la suppression
      calculateProjectTotals(updatedProjects[projectIndex]);

      onProjectsChange(updatedProjects);
    }
  };

  // Suppression d'un projet
  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet? Cette action est irréversible.')) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      onProjectsChange(updatedProjects);

      if (selectedProjectId === projectId) {
        setSelectedProjectId(updatedProjects.length > 0 ? updatedProjects[0].id : null);
      }
    }
  };

  // Gestion du projet
  const handleAddProject = () => {
    if (!newProjectName || !newProjectStartDate) return;

    const projectToAdd: FinancialProject = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription,
      client: newProjectClient,
      startDate: newProjectStartDate.toISOString().split('T')[0],
      endDate: newProjectEndDate.toISOString().split('T')[0],
      budget: newProjectBudget,
      status: newProjectStatus,
      transactions: [],
      category: 'client',
      roi: 0
    };

    const updatedProjects = [...projects, projectToAdd];
    onProjectsChange(updatedProjects);
    setSelectedProjectId(projectToAdd.id);
    setIsAddingProject(false);
    setNewProjectName('');
    setNewProjectClient('');
    setNewProjectDescription('');
    setNewProjectStartDate(new Date());
    setNewProjectEndDate(new Date());
    setNewProjectBudget(0);
    setNewProjectStatus('active');
  };

  // Gestion des transactions
  const handleAddTransaction = () => {
    if (!selectedProject || !newTransactionDescription || !newTransactionDate) return;

    const transactionToAdd: FinancialTransaction = {
      id: Date.now().toString(),
      date: newTransactionDate.toISOString().split('T')[0],
      amount: newTransactionAmount,
      type: newTransactionType,
      description: newTransactionDescription,
      category: 'Prestation',
      status: 'pending'
    };

    const updatedProject = {
      ...selectedProject,
      transactions: [...selectedProject.transactions, transactionToAdd]
    };

    handleUpdateProject(updatedProject);
    setIsAddingTransaction(false);
    setNewTransactionAmount(0);
    setNewTransactionDescription('');
    setNewTransactionDate(new Date());
    setNewTransactionType('income');
  };

  // Formatage des valeurs monétaires
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Rendu du composant
  return (
    <div className="space-y-6">
      {/* En-tête et statistiques */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold">Gestion des Projets Financiers</h2>
        {!readOnly && (
          <button
            onClick={() => setIsAddingProject(true)}
            className="mt-2 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
          >
            Nouveau Projet
          </button>
        )}
      </div>

      {/* Statistiques des projets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-sm text-blue-600 dark:text-blue-300">Budget Total</div>
          <div className="text-2xl font-bold">{formatCurrency(projectStats.totalBudget)}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-sm text-green-600 dark:text-green-300">Projets Actifs</div>
          <div className="text-2xl font-bold">{projectStats.activeProjects}</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-sm text-purple-600 dark:text-purple-300">Projets Complétés</div>
          <div className="text-2xl font-bold">{projectStats.completedProjects}</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="text-sm text-yellow-600 dark:text-yellow-300">Projets Planifiés</div>
          <div className="text-2xl font-bold">{projectStats.plannedProjects}</div>
        </div>
      </div>

      {/* Formulaire d'ajout/édition de projet */}
      {isAddingProject && !readOnly && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-medium mb-4">Nouveau Projet</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du Projet *
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client
              </label>
              <input
                type="text"
                value={newProjectClient}
                onChange={(e) => setNewProjectClient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de Début *
              </label>
              <input
                type="date"
                value={newProjectStartDate.toISOString().split('T')[0]}
                onChange={(e) => setNewProjectStartDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de Fin
              </label>
              <input
                type="date"
                value={newProjectEndDate.toISOString().split('T')[0]}
                onChange={(e) => setNewProjectEndDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Budget *
              </label>
              <input
                type="number"
                value={newProjectBudget}
                onChange={(e) => setNewProjectBudget(parseFloat(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut *
              </label>
              <select
                value={newProjectStatus}
                onChange={(e) => setNewProjectStatus(e.target.value as 'active' | 'completed' | 'cancelled')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="active">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsAddingProject(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleAddProject}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Liste des projets et détails du projet sélectionné */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste des projets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-auto">
          <h3 className="text-lg font-medium mb-4">Projets</h3>

          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucun projet financier n&apos;a été créé.
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id || null)}
                  className={`p-3 rounded-md cursor-pointer transition ${
                    selectedProjectId === project.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(project.budget)}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      project.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {project.status === 'active' ? 'Actif' :
                       project.status === 'completed' ? 'Complété' :
                       project.status === 'cancelled' ? 'Annulé' : 'Planifié'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Détails du projet sélectionné */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          {selectedProject ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-medium">{selectedProject.name}</h3>
                {!readOnly && (
                  <div className="mt-4 flex space-x-2 justify-end">
                    <button
                      onClick={() => setIsAddingTransaction(true)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition"
                    >
                      Ajouter Transaction
                    </button>
                    <button
                      onClick={() => handleDeleteProject(selectedProject.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>

              {/* Détails du projet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Client</div>
                  <div>{selectedProject.client || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Catégorie</div>
                  <div>{selectedProject.category === 'client' ? 'Client' : 
                         selectedProject.category === 'internal' ? 'Interne' : 'Investissement'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Date de début</div>
                  <div>{new Date(selectedProject.startDate).toLocaleDateString('fr-FR')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Date de fin</div>
                  <div>{selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString('fr-FR') : 'Non définie'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Budget</div>
                  <div>{formatCurrency(selectedProject.budget)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Statut</div>
                  <div className={`inline-block px-2 py-1 text-xs rounded-full ${
                    selectedProject.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedProject.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    selectedProject.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedProject.status === 'active' ? 'Actif' :
                     selectedProject.status === 'completed' ? 'Complété' :
                     selectedProject.status === 'cancelled' ? 'Annulé' : 'Planifié'}
                  </div>
                </div>
              </div>

              {/* Metriques financières du projet */}
              {selectedProject.transactions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2">Métriques Financières</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                      <div className="text-sm text-green-700 dark:text-green-300">Revenus</div>
                      <div className="text-xl font-bold">
                        {formatCurrency(selectedProject.totalIncome || 0)}
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      <div className="text-sm text-red-700 dark:text-red-300">Dépenses</div>
                      <div className="text-xl font-bold">
                        {formatCurrency(selectedProject.totalExpenses || 0)}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      <div className="text-sm text-blue-700 dark:text-blue-300">Solde</div>
                      <div className="text-xl font-bold">
                        {formatCurrency(selectedProject.balance || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulaire d'ajout de transaction */}
              {isAddingTransaction && !readOnly && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-md font-medium mb-4">Nouvelle Transaction</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={newTransactionDescription}
                        onChange={(e) => setNewTransactionDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={newTransactionDate.toISOString().split('T')[0]}
                        onChange={(e) => setNewTransactionDate(new Date(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Montant *
                      </label>
                      <input
                        type="number"
                        value={newTransactionAmount}
                        onChange={(e) => setNewTransactionAmount(parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type *
                      </label>
                      <select
                        value={newTransactionType}
                        onChange={(e) => setNewTransactionType(e.target.value as 'income' | 'expense')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-800 dark:text-white"
                      >
                        <option value="income">Revenu</option>
                        <option value="expense">Dépense</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsAddingTransaction(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddTransaction}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              )}

              {/* Liste des transactions */}
              <div>
                <h4 className="text-md font-medium mb-2">Transactions</h4>
                {selectedProject.transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Aucune transaction pour ce projet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                          {!readOnly && <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedProject.transactions.map(transaction => (
                          <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {new Date(transaction.date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{transaction.description}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                transaction.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {transaction.type === 'income' ? 'Revenu' : 'Dépense'}
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                transaction.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              }`}>
                                {transaction.status === 'completed' ? 'Complétée' : 'En attente'}
                              </span>
                            </td>
                            {!readOnly && (
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                <button
                                  onClick={() => handleUpdateTransaction(selectedProject.id || '', transaction.id || '', { status: 'completed' })}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                                >
                                  Marquer comme complétée
                                </button>
                                <button
                                  onClick={() => handleDeleteTransaction(selectedProject.id || '', transaction.id || '')}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Supprimer
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Sélectionnez un projet pour voir les détails
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
