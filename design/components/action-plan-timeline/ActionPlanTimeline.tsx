import React, { useState } from 'react';
import { Calendar, Check, ChevronDown, Clock, Edit, Flag, Plus, Tag, Trash } from 'lucide-react';

const ActionPlanTimeline = () => {
  const [activeTab, setActiveTab] = useState('jalons');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Données simulées pour les jalons
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      title: "Lancement du site vitrine",
      description: "Mise en ligne du site de présentation de services",
      date: "2025-05-15",
      category: "marketing",
      status: "completed",
      tasks: [
        { id: 101, title: "Design de la page d'accueil", completed: true },
        { id: 102, title: "Rédaction du contenu", completed: true },
        { id: 103, title: "Tests et déploiement", completed: true }
      ]
    },
    {
      id: 2,
      title: "Acquisition des premiers clients",
      description: "Obtenir 3 clients avec des projets payants",
      date: "2025-06-10",
      category: "business",
      status: "in-progress",
      tasks: [
        { id: 201, title: "Préparation des propositions commerciales", completed: true },
        { id: 202, title: "Prise de contact avec les leads", completed: false },
        { id: 203, title: "Suivi et négociation", completed: false }
      ]
    },
    {
      id: 3,
      title: "Création de la bibliothèque de composants",
      description: "Développement d'une bibliothèque React pour accélérer les projets futurs",
      date: "2025-07-01",
      category: "technical",
      status: "planned",
      tasks: [
        { id: 301, title: "Design des composants UI", completed: false },
        { id: 302, title: "Implémentation en React", completed: false },
        { id: 303, title: "Documentation et tests", completed: false }
      ]
    },
    {
      id: 4,
      title: "Premier bilan financier trimestriel",
      description: "Analyse des résultats du premier trimestre d'activité",
      date: "2025-08-15",
      category: "financial",
      status: "planned",
      tasks: [
        { id: 401, title: "Compilation des revenus et dépenses", completed: false },
        { id: 402, title: "Analyse des indicateurs de performance", completed: false },
        { id: 403, title: "Ajustement des objectifs", completed: false }
      ]
    }
  ]);

  // Données simulées pour les tâches non associées à des jalons
  const [standaloneTasks, setStandaloneTasks] = useState([
    {
      id: 501,
      title: "Configuration de l'environnement de développement",
      description: "Installation et configuration des outils de développement",
      date: "2025-05-07",
      category: "technical",
      status: "completed"
    },
    {
      id: 502,
      title: "Mise en place de la comptabilité",
      description: "Configuration du logiciel de comptabilité et des processus de facturation",
      date: "2025-05-10",
      category: "admin",
      status: "in-progress"
    },
    {
      id: 503,
      title: "Création des profils sur plateformes freelance",
      description: "Inscription et optimisation des profils sur les principales plateformes",
      date: "2025-05-20",
      category: "marketing",
      status: "planned"
    }
  ]);

  // Catégories disponibles
  const categories = [
    { id: 'all', name: 'Toutes les catégories', color: 'bg-gray-500' },
    { id: 'business', name: 'Business', color: 'bg-blue-500' },
    { id: 'technical', name: 'Technique', color: 'bg-green-500' },
    { id: 'marketing', name: 'Marketing', color: 'bg-purple-500' },
    { id: 'financial', name: 'Financier', color: 'bg-yellow-500' },
    { id: 'admin', name: 'Administratif', color: 'bg-red-500' }
  ];

  // Filtres pour les statuts
  const statuses = [
    { id: 'all', name: 'Tous les statuts' },
    { id: 'completed', name: 'Complétés' },
    { id: 'in-progress', name: 'En cours' },
    { id: 'planned', name: 'Planifiés' }
  ];
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fonction pour filtrer les jalons selon la catégorie et le statut
  const getFilteredMilestones = () => {
    return milestones.filter(milestone => 
      (selectedCategory === 'all' || milestone.category === selectedCategory) &&
      (selectedStatus === 'all' || milestone.status === selectedStatus)
    );
  };

  // Fonction pour filtrer les tâches selon la catégorie et le statut
  const getFilteredTasks = () => {
    return standaloneTasks.filter(task => 
      (selectedCategory === 'all' || task.category === selectedCategory) &&
      (selectedStatus === 'all' || task.status === selectedStatus)
    );
  };

  // Fonction pour obtenir la couleur d'une catégorie
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : 'bg-gray-500';
  };

  // Fonction pour obtenir le texte d'un statut
  const getStatusText = (statusId) => {
    switch(statusId) {
      case 'completed': return { text: 'Complété', color: 'text-green-400' };
      case 'in-progress': return { text: 'En cours', color: 'text-blue-400' };
      case 'planned': return { text: 'Planifié', color: 'text-yellow-400' };
      default: return { text: 'Inconnu', color: 'text-gray-400' };
    }
  };

  // Fonction pour calculer le pourcentage de progression d'un jalon
  const calculateMilestoneProgress = (milestone) => {
    if (milestone.tasks.length === 0) return 0;
    const completedTasks = milestone.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / milestone.tasks.length) * 100);
  };

  // Format de date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };

  // Jalon actuel (formulaire vide ou édition)
  const [currentMilestone, setCurrentMilestone] = useState({
    id: null,
    title: '',
    description: '',
    date: '2025-05-07',
    category: 'business',
    status: 'planned',
    tasks: []
  });

  // État du formulaire
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Gérer l'ajout d'un nouveau jalon
  const handleAddMilestone = () => {
    setCurrentMilestone({
      id: null,
      title: '',
      description: '',
      date: '2025-05-07',
      category: 'business',
      status: 'planned',
      tasks: []
    });
    setIsEditing(false);
    setShowForm(true);
  };

  // Gérer l'édition d'un jalon existant
  const handleEditMilestone = (milestone) => {
    setCurrentMilestone({ ...milestone });
    setIsEditing(true);
    setShowForm(true);
  };

  // Simuler la sauvegarde d'un jalon
  const handleSaveMilestone = () => {
    // Ici, vous implémenteriez la logique de sauvegarde réelle
    console.log('Sauvegarde du jalon:', currentMilestone);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Plan d'Action</h1>
        <div className="flex space-x-3">
          <button 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md flex items-center"
            onClick={handleAddMilestone}
          >
            <Plus size={16} className="mr-2" />
            <span>Ajouter un Jalon</span>
          </button>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('jalons')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jalons' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            Jalons
          </button>
          <button
            onClick={() => setActiveTab('taches')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'taches' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            Tâches
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timeline' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            Timeline
          </button>
        </nav>
      </div>

      {/* Filtres et contrôles */}
      <div className="flex justify-between">
        <div className="flex space-x-4">
          <div className="relative">
            <select
              className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 pr-8 text-sm appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 pr-8 text-sm appearance-none"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        <div>
          <button className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm flex items-center">
            <Calendar size={14} className="mr-2" />
            Voir le calendrier
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout/édition de jalon */}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">{isEditing ? 'Modifier le Jalon' : 'Ajouter un Jalon'}</h2>
            <button className="text-gray-400 hover:text-white" onClick={() => setShowForm(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Titre</label>
              <input
                type="text"
                value={currentMilestone.title}
                onChange={(e) => setCurrentMilestone({...currentMilestone, title: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Titre du jalon"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <textarea
                value={currentMilestone.description}
                onChange={(e) => setCurrentMilestone({...currentMilestone, description: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                placeholder="Description détaillée du jalon"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Catégorie</label>
                <div className="relative">
                  <select
                    value={currentMilestone.category}
                    onChange={(e) => setCurrentMilestone({...currentMilestone, category: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.filter(cat => cat.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date cible</label>
                <input
                  type="date"
                  value={currentMilestone.date}
                  onChange={(e) => setCurrentMilestone({...currentMilestone, date: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Statut</label>
              <div className="relative">
                <select
                  value={currentMilestone.status}
                  onChange={(e) => setCurrentMilestone({...currentMilestone, status: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planned">Planifié</option>
                  <option value="in-progress">En cours</option>
                  <option value="completed">Complété</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Liste des tâches associées */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-400">Tâches Associées</label>
                <button className="text-blue-400 hover:text-blue-300 text-xs flex items-center">
                  <Plus size={12} className="mr-1" />
                  Ajouter une tâche
                </button>
              </div>
              
              <ul className="space-y-2">
                {currentMilestone.tasks.map((task, index) => (
                  <li key={task.id} className="flex items-center bg-gray-700 rounded-md p-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {
                        const updatedTasks = [...currentMilestone.tasks];
                        updatedTasks[index] = { ...task, completed: !task.completed };
                        setCurrentMilestone({...currentMilestone, tasks: updatedTasks});
                      }}
                      className="mr-3"
                    />
                    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </span>
                    <button className="text-gray-400 hover:text-red-400 ml-2">
                      <Trash size={14} />
                    </button>
                  </li>
                ))}
                {currentMilestone.tasks.length === 0 && (
                  <li className="text-sm text-gray-500 italic">Aucune tâche associée à ce jalon</li>
                )}
              </ul>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                className="px-4 py-2 border border-gray-600 rounded-md text-sm hover:bg-gray-700"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
                onClick={handleSaveMilestone}
              >
                {isEditing ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vue des jalons */}
      {activeTab === 'jalons' && (
        <div className="space-y-6">
          {getFilteredMilestones().length > 0 ? (
            <div className="space-y-4">
              {getFilteredMilestones().map((milestone) => (
                <div key={milestone.id} className="bg-gray-800 p-5 rounded-lg shadow-md">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(milestone.category)} mr-2`}></div>
                        <h3 className="text-lg font-medium">{milestone.title}</h3>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{milestone.description}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`text-sm ${getStatusText(milestone.status).color}`}>
                        {getStatusText(milestone.status).text}
                      </div>
                      <div className="text-sm flex items-center mt-1 text-gray-400">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(milestone.date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center text-sm text-gray-400">
                        <Check size={14} className="mr-1" />
                        Progression des tâches
                      </div>
                      <span className="text-sm font-medium">{calculateMilestoneProgress(milestone)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${
                          milestone.status === 'completed' ? 'bg-green-500' : 
                          milestone.status === 'in-progress' ? 'bg-blue-500' : 
                          'bg-yellow-500'
                        } h-2 rounded-full`}
                        style={{ width: `${calculateMilestoneProgress(milestone)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {milestone.tasks.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Tâches ({milestone.tasks.filter(t => t.completed).length}/{milestone.tasks.length})</h4>
                      <ul className="space-y-1">
                        {milestone.tasks.map((task) => (
                          <li key={task.id} className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 ${
                              task.completed ? 'border-green-500 bg-green-500 bg-opacity-20' : 'border-gray-600'
                            }`}>
                              {task.completed && <Check size={10} className="text-green-500" />}
                            </div>
                            <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-3 border-t border-gray-700 flex justify-end space-x-2">
                    <button 
                      onClick={() => handleEditMilestone(milestone)}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                    >
                      <Edit size={14} className="mr-1" />
                      Modifier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 p-8 rounded-lg shadow-md text-center">
              <div className="text-gray-400 mb-3">
                <Flag size={40} className="mx-auto mb-3 opacity-50" />
                <p>Aucun jalon ne correspond aux critères de recherche.</p>
              </div>
              <button 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm mt-4"
                onClick={handleAddMilestone}
              >
                Ajouter un jalon
              </button>
            </div>
          )}
        </div>
      )}

      {/* Vue des tâches */}
      {activeTab === 'taches' && (
        <div className="space-y-4">
          {getFilteredTasks().length > 0 ? (
            getFilteredTasks().map((task) => (
              <div key={task.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${
                    task.status === 'completed' ? 'border-green-500 bg-green-500 bg-opacity-20' : 'border-gray-600'
                  }`}>
                    {task.status === 'completed' && <Check size={10} className="text-green-500" />}
                  </div>
                  <div>
                    <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>{task.title}</h3>
                    <p className="text-sm text-gray-400">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end">
                    <div className={`text-sm ${getStatusText(task.status).color}`}>
                      {getStatusText(task.status).text}
                    </div>
                    <div className="text-sm flex items-center mt-1 text-gray-400">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(task.date)}
                    </div>
                  </div>
                  <div className={`w-2 h-8 rounded-full ${getCategoryColor(task.category)}`}></div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-800 p-8 rounded-lg shadow-md text-center">
              <div className="text-gray-400 mb-3">
                <Check size={40} className="mx-auto mb-3 opacity-50" />
                <p>Aucune tâche ne correspond aux critères de recherche.</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm mt-4">
                Ajouter une tâche
              </button>
            </div>
          )}
        </div>
      )}

      {/* Vue timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium mb-6">Timeline du Plan d'Action</h2>
          
          <div className="relative">
            {/* Ligne de temps verticale */}
            <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-700"></div>
            
            <div className="space-y-8 ml-12">
              {/* Regrouper tous les éléments (jalons et tâches) par date */}
              {[...getFilteredMilestones(), ...getFilteredTasks()]
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((item, index) => (
                  <div key={`timeline-${item.id}`} className="relative">
                    {/* Indicateur de date sur la ligne */}
                    <div className="absolute -left-12 mt-1">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        item.status === 'completed' ? 'border-green-500 bg-green-500' : 
                        item.status === 'in-progress' ? 'border-blue-500 bg-blue-500' : 
                        'border-yellow-500 bg-yellow-500'
                      }`}></div>
                    </div>
                    
                    {/* Date */}
                    <div className="absolute -left-36 mt-0 w-20 text-right">
                      <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                    </div>
                    
                    {/* Contenu */}
                    <div className={`bg-gray-700 p-4 rounded-lg ${
                      'tasks' in item ? 'border-l-4' : 'border-l-2'
                    } ${getCategoryColor(item.category)} border-opacity-70`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {'tasks' in item ? `🚩 ${item.title}` : `📌 ${item.title}`}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'completed' ? 'bg-green-900 text-green-400' :
                          item.status === 'in-progress' ? 'bg-blue-900 text-blue-400' :
                          'bg-yellow-900 text-yellow-400'
                        }`}>
                          {getStatusText(item.status).text}
                        </div>
                      </div>
                      
                      {'tasks' in item && item.tasks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <h4 className="text-xs font-medium text-gray-400 mb-2">TÂCHES ASSOCIÉES</h4>
                          <div className="space-y-1">
                            {item.tasks.map(task => (
                              <div key={task.id} className="flex items-center">
                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center mr-2 ${
                                  task.completed ? 'border-green-500 bg-green-500 bg-opacity-20' : 'border-gray-600'
                                }`}>
                                  {task.completed && <Check size={8} className="text-green-500" />}
                                </div>
                                <span className={`text-xs ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                  {task.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
                        <div className="flex items-center">
                          <Tag size={12} className="mr-1" />
                          {categories.find(cat => cat.id === item.category)?.name}
                        </div>
                        {'tasks' in item && (
                          <div className="flex items-center ml-4">
                            <Clock size={12} className="mr-1" />
                            {calculateMilestoneProgress(item)}% terminé
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPlanTimeline;