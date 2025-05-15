'use client';

import React, { useState, useEffect } from 'react';
import { 
  AvailabilityStatus, 
  BlockingType, 
  UIAvailabilitySettings,
  UIDayAvailability,
  UIDateRangeAvailability,
  WeeklyAvailabilityRule,
  DateRangeAvailabilityRule,
  BlockedTimeSlot,
  ServiceCapacity
} from '@/app/interfaces/services/availability';
import { ServiceType } from '@/app/interfaces/services/service-catalog';
import { UI_CLASSES } from '@/app/styles/ui-classes';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Save, 
  Plus, 
  Trash, 
  Edit, 
  X, 
  Check, 
  AlertTriangle
} from 'lucide-react';

interface AvailabilityCalendarProps {
  planId: string;
  initialSettings?: UIAvailabilitySettings;
  initialDateRange?: { startDate: string; endDate: string; };
  onSaveSettings: (settings: UIAvailabilitySettings) => Promise<boolean>;
  onAddBlockedPeriod: (blockedPeriod: BlockedTimeSlot) => Promise<boolean>;
  onDeleteBlockedPeriod: (periodId: string) => Promise<boolean>;
  onUpdateAvailabilityRule: (rule: WeeklyAvailabilityRule | DateRangeAvailabilityRule) => Promise<boolean>;
  fetchAvailability: (startDate: string, endDate: string) => Promise<UIDateRangeAvailability>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Calendrier de disponibilité des services
 * 
 * Permet de visualiser et de gérer les disponibilités des services, y compris
 * les règles hebdomadaires, les périodes bloquées et les capacités par service.
 */
const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  planId,
  initialSettings,
  initialDateRange,
  onSaveSettings,
  onAddBlockedPeriod,
  onDeleteBlockedPeriod,
  onUpdateAvailabilityRule,
  fetchAvailability,
  isLoading = false,
  error = null
}) => {
  // États pour les paramètres
  const [settings, setSettings] = useState<UIAvailabilitySettings>(initialSettings || {
    defaultWeeklyRules: [],
    customRules: [],
    blockedPeriods: [],
    serviceCapacities: []
  });
  
  // État pour la vue du calendrier
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateRangeAvailability, setDateRangeAvailability] = useState<UIDateRangeAvailability | null>(null);
  
  // États pour les formulaires
  const [activeTab, setActiveTab] = useState<'calendar' | 'rules' | 'blocked'>('calendar');
  const [editingRule, setEditingRule] = useState<WeeklyAvailabilityRule | DateRangeAvailabilityRule | null>(null);
  const [editingBlockedPeriod, setEditingBlockedPeriod] = useState<BlockedTimeSlot | null>(null);
  
  // État pour la nouvelle règle
  const [newRuleType, setNewRuleType] = useState<'weekly' | 'dateRange'>('weekly');
  
  // États pour la gestion des erreurs et des notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);
  
  // État interne de traitement
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Effet pour charger les disponibilités initiales
  useEffect(() => {
    loadMonthlyAvailability();
  }, [currentMonth]);
  
  // Charger les disponibilités pour le mois en cours
  const loadMonthlyAvailability = async () => {
    try {
      setViewError(null);
      
      // Calculer premier et dernier jour du mois en cours
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // Formater les dates au format ISO (YYYY-MM-DD)
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      // Charger les disponibilités pour ce mois
      const availability = await fetchAvailability(startDate, endDate);
      setDateRangeAvailability(availability);
      
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
      setViewError('Impossible de charger les disponibilités pour ce mois.');
    }
  };
  
  // Gérer le changement de mois
  const changeMonth = (increment: number) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + increment);
      return newMonth;
    });
  };
  
  // Gérer le clic sur un jour
  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };
  
  // Formater la date
  const formatDate = (dateStr: string, format: 'long' | 'short' = 'long') => {
    const date = new Date(dateStr);
    if (format === 'long') {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };
  
  // Obtenir les jours du mois en cours
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Ajuster pour commencer la semaine le lundi (0 = lundi, 6 = dimanche)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    
    // Ajouter les jours du mois précédent pour compléter la première semaine
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day).toISOString().split('T')[0];
      days.push({ date, isCurrentMonth: false });
    }
    
    // Ajouter les jours du mois en cours
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day).toISOString().split('T')[0];
      days.push({ date, isCurrentMonth: true });
    }
    
    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const lastDayOfWeek = lastDay.getDay();
    const nextMonthDays = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    for (let day = 1; day <= nextMonthDays; day++) {
      const date = new Date(year, month + 1, day).toISOString().split('T')[0];
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };
  
  // Obtenir la disponibilité pour un jour spécifique
  const getDayAvailability = (date: string): UIDayAvailability | null => {
    if (!dateRangeAvailability || !dateRangeAvailability.days) return null;
    
    return dateRangeAvailability.days.find(day => day.date === date) || null;
  };
  
  // Obtenir la classe CSS pour l'état de disponibilité
  const getAvailabilityStatusClass = (date: string): string => {
    const availability = getDayAvailability(date);
    
    if (!availability) return 'bg-gray-100 dark:bg-gray-800';
    
    switch (availability.status) {
      case AvailabilityStatus.AVAILABLE:
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case AvailabilityStatus.PARTIALLY_AVAILABLE:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case AvailabilityStatus.UNAVAILABLE:
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case AvailabilityStatus.HOLIDAY:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };
  
  // Gérer l'ajout d'une règle hebdomadaire
  const handleAddWeeklyRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRule || editingRule.type !== 'weekly') return;
    
    setIsProcessing(true);
    
    try {
      const success = await onUpdateAvailabilityRule(editingRule);
      
      if (success) {
        // Mettre à jour les règles locales
        setSettings(prev => ({
          ...prev,
          defaultWeeklyRules: [...prev.defaultWeeklyRules, editingRule]
        }));
        
        // Réinitialiser le formulaire
        setEditingRule(null);
        
        // Recharger les disponibilités
        await loadMonthlyAvailability();
        
        // Afficher une notification de succès
        setNotification({
          message: 'Règle hebdomadaire ajoutée avec succès',
          type: 'success'
        });
        
        // Cacher la notification après 3 secondes
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          message: 'Erreur lors de l\'ajout de la règle',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la règle:', error);
      setNotification({
        message: 'Erreur lors de l\'ajout de la règle',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Gérer l'ajout d'une règle pour une plage de dates
  const handleAddDateRangeRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRule || editingRule.type !== 'dateRange') return;
    
    setIsProcessing(true);
    
    try {
      const success = await onUpdateAvailabilityRule(editingRule);
      
      if (success) {
        // Mettre à jour les règles locales
        setSettings(prev => ({
          ...prev,
          customRules: [...prev.customRules, editingRule]
        }));
        
        // Réinitialiser le formulaire
        setEditingRule(null);
        
        // Recharger les disponibilités
        await loadMonthlyAvailability();
        
        // Afficher une notification de succès
        setNotification({
          message: 'Règle de disponibilité ajoutée avec succès',
          type: 'success'
        });
        
        // Cacher la notification après 3 secondes
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          message: 'Erreur lors de l\'ajout de la règle',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la règle:', error);
      setNotification({
        message: 'Erreur lors de l\'ajout de la règle',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Gérer l'ajout d'une période bloquée
  const handleAddBlockedPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBlockedPeriod) return;
    
    setIsProcessing(true);
    
    try {
      const success = await onAddBlockedPeriod(editingBlockedPeriod);
      
      if (success) {
        // Mettre à jour les périodes bloquées locales
        setSettings(prev => ({
          ...prev,
          blockedPeriods: [...prev.blockedPeriods, editingBlockedPeriod]
        }));
        
        // Réinitialiser le formulaire
        setEditingBlockedPeriod(null);
        
        // Recharger les disponibilités
        await loadMonthlyAvailability();
        
        // Afficher une notification de succès
        setNotification({
          message: 'Période bloquée ajoutée avec succès',
          type: 'success'
        });
        
        // Cacher la notification après 3 secondes
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          message: 'Erreur lors de l\'ajout de la période bloquée',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la période bloquée:', error);
      setNotification({
        message: 'Erreur lors de l\'ajout de la période bloquée',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Gérer la suppression d'une période bloquée
  const handleDeleteBlockedPeriod = async (periodId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette période bloquée ?')) {
      setIsProcessing(true);
      
      try {
        const success = await onDeleteBlockedPeriod(periodId);
        
        if (success) {
          // Mettre à jour les périodes bloquées locales
          setSettings(prev => ({
            ...prev,
            blockedPeriods: prev.blockedPeriods.filter(period => period.id !== periodId)
          }));
          
          // Recharger les disponibilités
          await loadMonthlyAvailability();
          
          // Afficher une notification de succès
          setNotification({
            message: 'Période bloquée supprimée avec succès',
            type: 'success'
          });
          
          // Cacher la notification après 3 secondes
          setTimeout(() => setNotification(null), 3000);
        } else {
          setNotification({
            message: 'Erreur lors de la suppression de la période bloquée',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la période bloquée:', error);
        setNotification({
          message: 'Erreur lors de la suppression de la période bloquée',
          type: 'error'
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  // Créer une nouvelle règle hebdomadaire
  const createNewWeeklyRule = () => {
    const newRule: WeeklyAvailabilityRule = {
      id: '',
      type: 'weekly',
      name: 'Nouvelle règle hebdomadaire',
      priority: 10,
      isActive: true,
      dayOfWeek: 1, // Lundi par défaut
      startTime: '09:00',
      endTime: '17:00'
    };
    
    setEditingRule(newRule);
    setNewRuleType('weekly');
  };
  
  // Créer une nouvelle règle pour une plage de dates
  const createNewDateRangeRule = () => {
    // Utiliser la date sélectionnée ou la date actuelle
    const startDate = selectedDate || new Date().toISOString().split('T')[0];
    
    // Calculer la date de fin (par défaut, 7 jours après)
    const endDateObj = new Date(startDate);
    endDateObj.setDate(endDateObj.getDate() + 7);
    const endDate = endDateObj.toISOString().split('T')[0];
    
    const newRule: DateRangeAvailabilityRule = {
      id: '',
      type: 'dateRange',
      name: 'Nouvelle règle de période',
      priority: 20,
      isActive: true,
      startDate,
      endDate,
      status: AvailabilityStatus.UNAVAILABLE,
      reason: 'Indisponible'
    };
    
    setEditingRule(newRule);
    setNewRuleType('dateRange');
  };
  
  // Créer une nouvelle période bloquée
  const createNewBlockedPeriod = () => {
    // Utiliser la date sélectionnée ou la date actuelle
    const startDate = selectedDate ? `${selectedDate}T09:00:00` : new Date().toISOString().split('.')[0];
    
    // Calculer la date de fin (par défaut, le même jour à 17h)
    const endDateObj = new Date(startDate);
    endDateObj.setHours(17, 0, 0, 0);
    const endDate = endDateObj.toISOString().split('.')[0];
    
    const newPeriod: BlockedTimeSlot = {
      id: '',
      startDate,
      endDate,
      title: 'Nouvelle période bloquée',
      description: '',
      blockingType: BlockingType.PERSONAL
    };
    
    setEditingBlockedPeriod(newPeriod);
  };
  
  // Si en cours de chargement
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Si une erreur s'est produite
  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Erreur</h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* En-tête avec titre et onglets */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className={UI_CLASSES.HEADING_2}>Gestion des Disponibilités</h2>
          <p className={UI_CLASSES.TEXT_SMALL}>
            Gérez vos disponibilités et périodes de blocage
          </p>
        </div>
        
        {/* Onglets */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`mr-4 py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar size={16} className="inline mr-1" />
            Calendrier
          </button>
          <button
            className={`mr-4 py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('rules')}
          >
            <Clock size={16} className="inline mr-1" />
            Horaires
          </button>
          <button
            className={`mr-4 py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'blocked'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('blocked')}
          >
            <X size={16} className="inline mr-1" />
            Blocages
          </button>
        </div>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`p-3 rounded-lg ${
          notification.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
        }`}>
          <div className="flex items-center">
            <AlertCircle size={18} className="mr-2" />
            <p>{notification.message}</p>
          </div>
        </div>
      )}
      
      {/* Onglet Calendrier */}
      {activeTab === 'calendar' && (
        <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
          {/* En-tête du calendrier */}
          <div className="flex justify-between items-center mb-4">
            <h3 className={UI_CLASSES.HEADING_3}>
              <Calendar size={18} className="inline mr-2" />
              {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className={UI_CLASSES.BUTTON_SECONDARY}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => changeMonth(1)}
                className={UI_CLASSES.BUTTON_SECONDARY}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          
          {/* Calendrier */}
          <div className="mb-4">
            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
                <div key={i} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Jours du mois */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map(({ date, isCurrentMonth }) => {
                const dayNum = new Date(date).getDate();
                const isSelected = date === selectedDate;
                const availability = getDayAvailability(date);
                const statusClass = getAvailabilityStatusClass(date);
                
                return (
                  <button
                    key={date}
                    onClick={() => handleDayClick(date)}
                    className={`
                      h-14 p-1 rounded-md flex flex-col justify-between border
                      ${isCurrentMonth ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800'}
                      ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                      ${!isCurrentMonth ? 'opacity-40' : ''}
                      ${isCurrentMonth ? statusClass : 'bg-gray-100 dark:bg-gray-800'}
                    `}
                  >
                    <span className="text-xs self-end">{dayNum}</span>
                    {isCurrentMonth && availability && (
                      <div className="text-xs w-full text-center">
                        {availability.availableHours > 0 && (
                          <span>{availability.availableHours}h</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Légende */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center border-t pt-4 border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 rounded bg-green-100 dark:bg-green-900/30"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 rounded bg-yellow-100 dark:bg-yellow-900/30"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Partiellement disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 rounded bg-red-100 dark:bg-red-900/30"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Indisponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 rounded bg-blue-100 dark:bg-blue-900/30"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Jour férié</span>
            </div>
          </div>
          
          {/* Détail du jour sélectionné */}
          {selectedDate && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className={UI_CLASSES.HEADING_4}>
                Détails : {formatDate(selectedDate)}
              </h4>
              
              {(() => {
                const dayAvailability = getDayAvailability(selectedDate);
                
                if (!dayAvailability) {
                  return (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      Aucune information disponible pour cette date.
                    </p>
                  );
                }
                
                return (
                  <div className="mt-2 space-y-4">
                    {/* Statut général */}
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Statut :</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        dayAvailability.status === AvailabilityStatus.AVAILABLE 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : dayAvailability.status === AvailabilityStatus.PARTIALLY_AVAILABLE
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : dayAvailability.status === AvailabilityStatus.UNAVAILABLE
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      }`}>
                        {dayAvailability.status === AvailabilityStatus.AVAILABLE && 'Disponible'}
                        {dayAvailability.status === AvailabilityStatus.PARTIALLY_AVAILABLE && 'Partiellement disponible'}
                        {dayAvailability.status === AvailabilityStatus.UNAVAILABLE && 'Indisponible'}
                        {dayAvailability.status === AvailabilityStatus.HOLIDAY && 'Jour férié'}
                      </span>
                    </div>
                    
                    {/* Heures disponibles */}
                    {dayAvailability.availableHours > 0 && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Heures disponibles :</span>
                        <span className="text-sm font-medium">{dayAvailability.availableHours}h</span>
                      </div>
                    )}
                    
                    {/* Plages horaires disponibles */}
                    {dayAvailability.availableSlots.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plages horaires :</h5>
                        <div className="space-y-1">
                          {dayAvailability.availableSlots.map((slot, index) => (
                            <div key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                              <Clock size={14} className="mr-1 text-blue-500" />
                              <span>
                                {slot.startTime} - {slot.endTime}
                                {slot.serviceTypes.length > 0 && ` (${slot.serviceTypes.join(', ')})`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Périodes bloquées */}
                    {dayAvailability.blockedSlots.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Périodes bloquées :</h5>
                        <div className="space-y-1">
                          {dayAvailability.blockedSlots.map((slot) => (
                            <div key={slot.id} className="text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex justify-between">
                                <span>{slot.title}</span>
                                <span>
                                  {new Date(slot.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
                                  {new Date(slot.endDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {slot.description && (
                                <p className="text-xs italic">{slot.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={createNewBlockedPeriod}
                        className={UI_CLASSES.BUTTON_SECONDARY}
                      >
                        <Plus size={14} className="mr-1" />
                        Bloquer cette journée
                      </button>
                      <button
                        onClick={createNewDateRangeRule}
                        className={UI_CLASSES.BUTTON_SECONDARY}
                      >
                        <Plus size={14} className="mr-1" />
                        Créer règle de période
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
      
      {/* Onglet Horaires (Règles de disponibilité) */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Règles de disponibilité hebdomadaires */}
          <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={UI_CLASSES.HEADING_3}>Horaires hebdomadaires</h3>
              <button
                onClick={createNewWeeklyRule}
                className={UI_CLASSES.BUTTON_PRIMARY}
                disabled={isProcessing}
              >
                <Plus size={16} className="mr-1" />
                Ajouter
              </button>
            </div>
            
            {/* Liste des règles hebdomadaires */}
            {settings.defaultWeeklyRules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className={`${UI_CLASSES.TABLE} w-full`}>
                  <thead>
                    <tr>
                      <th className={UI_CLASSES.TABLE_HEADER}>Jour</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Horaires</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Services concernés</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Priorité</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Statut</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.defaultWeeklyRules.map((rule) => {
                      const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                      return (
                        <tr key={rule.id} className={UI_CLASSES.TABLE_ROW}>
                          <td className={UI_CLASSES.TABLE_CELL}>{dayNames[rule.dayOfWeek]}</td>
                          <td className={UI_CLASSES.TABLE_CELL}>{rule.startTime} - {rule.endTime}</td>
                          <td className={UI_CLASSES.TABLE_CELL}>
                            {rule.serviceTypes && rule.serviceTypes.length > 0 
                              ? rule.serviceTypes.map(type => {
                                  switch(type) {
                                    case ServiceType.DEVELOPMENT: return 'Développement';
                                    case ServiceType.DESIGN: return 'Design';
                                    case ServiceType.CONSULTING: return 'Conseil';
                                    case ServiceType.TRAINING: return 'Formation';
                                    case ServiceType.MAINTENANCE: return 'Maintenance';
                                    case ServiceType.SUPPORT: return 'Support';
                                    default: return 'Autre';
                                  }
                                }).join(', ')
                              : 'Tous'
                            }
                          </td>
                          <td className={UI_CLASSES.TABLE_CELL}>{rule.priority}</td>
                          <td className={UI_CLASSES.TABLE_CELL}>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              rule.isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}>
                              {rule.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className={UI_CLASSES.TABLE_CELL}>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingRule(rule)}
                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Modifier"
                                disabled={isProcessing}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  // Logique de suppression de règle
                                }}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                title="Supprimer"
                                disabled={isProcessing}
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun horaire hebdomadaire défini. Cliquez sur "Ajouter" pour commencer.
                </p>
              </div>
            )}
          </div>
          
          {/* Formulaire d'édition de règle hebdomadaire */}
          {editingRule && editingRule.type === 'weekly' && (
            <form 
              onSubmit={handleAddWeeklyRule}
              className={`${UI_CLASSES.CARD} border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20`}
            >
              <h3 className={UI_CLASSES.HEADING_3}>
                {editingRule.id ? 'Modifier l\'horaire' : 'Nouvel horaire'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div>
                  <label htmlFor="ruleName" className={UI_CLASSES.LABEL}>Nom</label>
                  <input
                    type="text"
                    id="ruleName"
                    className={UI_CLASSES.INPUT}
                    value={editingRule.name}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="dayOfWeek" className={UI_CLASSES.LABEL}>Jour de la semaine</label>
                  <select
                    id="dayOfWeek"
                    className={UI_CLASSES.INPUT}
                    value={editingRule.dayOfWeek}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, dayOfWeek: parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5 | 6 } : null)}
                    required
                  >
                    <option value={1}>Lundi</option>
                    <option value={2}>Mardi</option>
                    <option value={3}>Mercredi</option>
                    <option value={4}>Jeudi</option>
                    <option value={5}>Vendredi</option>
                    <option value={6}>Samedi</option>
                    <option value={0}>Dimanche</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="startTime" className={UI_CLASSES.LABEL}>Heure de début</label>
                  <input
                    type="time"
                    id="startTime"
                    className={UI_CLASSES.INPUT}
                    value={editingRule.startTime}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="endTime" className={UI_CLASSES.LABEL}>Heure de fin</label>
                  <input
                    type="time"
                    id="endTime"
                    className={UI_CLASSES.INPUT}
                    value={editingRule.endTime}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="priority" className={UI_CLASSES.LABEL}>Priorité</label>
                  <input
                    type="number"
                    id="priority"
                    className={UI_CLASSES.INPUT}
                    value={editingRule.priority}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, priority: parseInt(e.target.value) } : null)}
                    min="1"
                    max="100"
                    required
                  />
                </div>
                
                <div className="flex items-center h-full">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={editingRule.isActive}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Règle active
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className={UI_CLASSES.BUTTON_SECONDARY}
                  disabled={isProcessing}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={UI_CLASSES.BUTTON_PRIMARY}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                      Enregistrement...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save size={16} className="mr-1" />
                      Enregistrer
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
          
          {/* Règles de disponibilité pour des périodes spécifiques */}
          <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700 mt-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={UI_CLASSES.HEADING_3}>Règles de disponibilité pour périodes spécifiques</h3>
              <button
                onClick={createNewDateRangeRule}
                className={UI_CLASSES.BUTTON_PRIMARY}
                disabled={isProcessing}
              >
                <Plus size={16} className="mr-1" />
                Ajouter
              </button>
            </div>
            
            {/* Liste des règles de période */}
            {settings.customRules.filter(rule => rule.type === 'dateRange').length > 0 ? (
              <div className="overflow-x-auto">
                <table className={`${UI_CLASSES.TABLE} w-full`}>
                  <thead>
                    <tr>
                      <th className={UI_CLASSES.TABLE_HEADER}>Nom</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Période</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Statut</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Raison</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Priorité</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.customRules
                      .filter(rule => rule.type === 'dateRange')
                      .map((rule) => {
                        const typedRule = rule as DateRangeAvailabilityRule;
                        return (
                          <tr key={rule.id} className={UI_CLASSES.TABLE_ROW}>
                            <td className={UI_CLASSES.TABLE_CELL}>{rule.name}</td>
                            <td className={UI_CLASSES.TABLE_CELL}>
                              {formatDate(typedRule.startDate, 'short')} - {formatDate(typedRule.endDate, 'short')}
                            </td>
                            <td className={UI_CLASSES.TABLE_CELL}>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                typedRule.status === AvailabilityStatus.AVAILABLE
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                  : typedRule.status === AvailabilityStatus.PARTIALLY_AVAILABLE
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                  : typedRule.status === AvailabilityStatus.UNAVAILABLE
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                              }`}>
                                {typedRule.status === AvailabilityStatus.AVAILABLE && 'Disponible'}
                                {typedRule.status === AvailabilityStatus.PARTIALLY_AVAILABLE && 'Partiellement dispo.'}
                                {typedRule.status === AvailabilityStatus.UNAVAILABLE && 'Indisponible'}
                                {typedRule.status === AvailabilityStatus.HOLIDAY && 'Jour férié'}
                              </span>
                            </td>
                            <td className={UI_CLASSES.TABLE_CELL}>{typedRule.reason || '-'}</td>
                            <td className={UI_CLASSES.TABLE_CELL}>{rule.priority}</td>
                            <td className={UI_CLASSES.TABLE_CELL}>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setEditingRule(rule)}
                                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Modifier"
                                  disabled={isProcessing}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    // Logique de suppression de règle
                                  }}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  title="Supprimer"
                                  disabled={isProcessing}
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune règle de période définie. Cliquez sur "Ajouter" pour commencer.
                </p>
              </div>
            )}
          </div>
          
          {/* Formulaire d'édition de règle de période */}
          {editingRule && editingRule.type === 'dateRange' && (
            <form 
              onSubmit={handleAddDateRangeRule}
              className={`${UI_CLASSES.CARD} border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20`}
            >
              <h3 className={UI_CLASSES.HEADING_3}>
                {editingRule.id ? 'Modifier la règle de période' : 'Nouvelle règle de période'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div>
                  <label htmlFor="ruleName" className={UI_CLASSES.LABEL}>Nom</label>
                  <input
                    type="text"
                    id="ruleName"
                    className={UI_CLASSES.INPUT}
                    value={editingRule.name}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className={UI_CLASSES.LABEL}>Statut</label>
                  <select
                    id="status"
                    className={UI_CLASSES.INPUT}
                    value={(editingRule as DateRangeAvailabilityRule).status}
                    onChange={(e) => setEditingRule(prev => {
                      if (!prev || prev.type !== 'dateRange') return prev;
                      return { ...prev, status: e.target.value as AvailabilityStatus };
                    })}
                    required
                  >
                    <option value={AvailabilityStatus.AVAILABLE}>Disponible</option>
                    <option value={AvailabilityStatus.PARTIALLY_AVAILABLE}>Partiellement disponible</option>
                    <option value={AvailabilityStatus.UNAVAILABLE}>Indisponible</option>
                    <option value={AvailabilityStatus.HOLIDAY}>Jour férié</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="startDate" className={UI_CLASSES.LABEL}>Date de début</label>
                  <input
                    type="date"
                    id="startDate"
                    className={UI_CLASSES.INPUT}
                    value={(editingRule as DateRangeAvailabilityRule).startDate}
                    onChange={(e) => setEditingRule(prev => {
                      if (!prev || prev.type !== 'dateRange') return prev;
                      return { ...prev, startDate: e.target.value };
                    })}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className={UI_CLASSES.LABEL}>Date de fin</label>
                  <input
                    type="date"
                    id="endDate"
                    className={UI_CLASSES.INPUT}
                    value={(editingRule as DateRangeAvailabilityRule).endDate}
                    onChange={(e) => setEditingRule(prev => {
                      if (!prev || prev.type !== 'dateRange') return prev;
                      return { ...prev, endDate: e.target.value };
                    })}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="reason" className={UI_CLASSES.LABEL}>Raison (optionnel)</label>
                  <input
                    type="text"
                    id="reason"
                    className={UI_CLASSES.INPUT}
                    value={(editingRule as DateRangeAvailabilityRule).reason || ''}
                    onChange={(e) => setEditingRule(prev => {
                      if (!prev || prev.type !== 'dateRange') return prev;
                      return { ...prev, reason: e.target.value };
                    })}
                    placeholder="Ex: Vacances, formation, etc."
                  />
                </div>
                
                <div>
                  <label htmlFor="priority" className={UI_CLASSES.LABEL}>Priorité</label>
                  <input
                    type="number"
                    id="priority"
                    className={UI_CLASSES.INPUT}
                    value={editingRule.priority}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, priority: parseInt(e.target.value) } : null)}
                    min="1"
                    max="100"
                    required
                  />
                </div>
                
                <div className="flex items-center h-full">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={editingRule.isActive}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Règle active
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className={UI_CLASSES.BUTTON_SECONDARY}
                  disabled={isProcessing}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={UI_CLASSES.BUTTON_PRIMARY}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                      Enregistrement...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save size={16} className="mr-1" />
                      Enregistrer
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      
      {/* Onglet Blocages (Périodes bloquées) */}
      {activeTab === 'blocked' && (
        <div className="space-y-4">
          {/* Liste des périodes bloquées */}
          <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={UI_CLASSES.HEADING_3}>Périodes bloquées</h3>
              <button
                onClick={createNewBlockedPeriod}
                className={UI_CLASSES.BUTTON_PRIMARY}
                disabled={isProcessing}
              >
                <Plus size={16} className="mr-1" />
                Ajouter
              </button>
            </div>
            
            {settings.blockedPeriods.length > 0 ? (
              <div className="overflow-x-auto">
                <table className={`${UI_CLASSES.TABLE} w-full`}>
                  <thead>
                    <tr>
                      <th className={UI_CLASSES.TABLE_HEADER}>Titre</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Début</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Fin</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Type</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Description</th>
                      <th className={UI_CLASSES.TABLE_HEADER}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.blockedPeriods.map((period) => (
                      <tr key={period.id} className={UI_CLASSES.TABLE_ROW}>
                        <td className={UI_CLASSES.TABLE_CELL}>{period.title}</td>
                        <td className={UI_CLASSES.TABLE_CELL}>
                          {new Date(period.startDate).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className={UI_CLASSES.TABLE_CELL}>
                          {new Date(period.endDate).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className={UI_CLASSES.TABLE_CELL}>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            period.blockingType === BlockingType.CLIENT_WORK
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                              : period.blockingType === BlockingType.PERSONAL
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                              : period.blockingType === BlockingType.HOLIDAY
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : period.blockingType === BlockingType.ADMINISTRATIVE
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                              : period.blockingType === BlockingType.TRAINING
                              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                          }`}>
                            {period.blockingType === BlockingType.CLIENT_WORK && 'Client'}
                            {period.blockingType === BlockingType.PERSONAL && 'Personnel'}
                            {period.blockingType === BlockingType.HOLIDAY && 'Congé'}
                            {period.blockingType === BlockingType.ADMINISTRATIVE && 'Admin'}
                            {period.blockingType === BlockingType.TRAINING && 'Formation'}
                            {period.blockingType === BlockingType.OTHER && 'Autre'}
                          </span>
                        </td>
                        <td className={UI_CLASSES.TABLE_CELL}>{period.description || '-'}</td>
                        <td className={UI_CLASSES.TABLE_CELL}>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingBlockedPeriod(period)}
                              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Modifier"
                              disabled={isProcessing}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteBlockedPeriod(period.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              title="Supprimer"
                              disabled={isProcessing}
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune période bloquée définie. Cliquez sur "Ajouter" pour commencer.
                </p>
              </div>
            )}
          </div>
          
          {/* Formulaire d'édition de période bloquée */}
          {editingBlockedPeriod && (
            <form 
              onSubmit={handleAddBlockedPeriod}
              className={`${UI_CLASSES.CARD} border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20`}
            >
              <h3 className={UI_CLASSES.HEADING_3}>
                {editingBlockedPeriod.id ? 'Modifier la période bloquée' : 'Nouvelle période bloquée'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div>
                  <label htmlFor="periodTitle" className={UI_CLASSES.LABEL}>Titre</label>
                  <input
                    type="text"
                    id="periodTitle"
                    className={UI_CLASSES.INPUT}
                    value={editingBlockedPeriod.title}
                    onChange={(e) => setEditingBlockedPeriod(prev => prev ? { ...prev, title: e.target.value } : null)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="blockingType" className={UI_CLASSES.LABEL}>Type</label>
                  <select
                    id="blockingType"
                    className={UI_CLASSES.INPUT}
                    value={editingBlockedPeriod.blockingType}
                    onChange={(e) => setEditingBlockedPeriod(prev => prev ? { ...prev, blockingType: e.target.value as BlockingType } : null)}
                    required
                  >
                    <option value={BlockingType.CLIENT_WORK}>Travail client</option>
                    <option value={BlockingType.PERSONAL}>Personnel</option>
                    <option value={BlockingType.HOLIDAY}>Congé / Vacances</option>
                    <option value={BlockingType.ADMINISTRATIVE}>Administratif</option>
                    <option value={BlockingType.TRAINING}>Formation</option>
                    <option value={BlockingType.OTHER}>Autre</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="startDateTime" className={UI_CLASSES.LABEL}>Date et heure de début</label>
                  <input
                    type="datetime-local"
                    id="startDateTime"
                    className={UI_CLASSES.INPUT}
                    value={editingBlockedPeriod.startDate.split('.')[0]}
                    onChange={(e) => setEditingBlockedPeriod(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="endDateTime" className={UI_CLASSES.LABEL}>Date et heure de fin</label>
                  <input
                    type="datetime-local"
                    id="endDateTime"
                    className={UI_CLASSES.INPUT}
                    value={editingBlockedPeriod.endDate.split('.')[0]}
                    onChange={(e) => setEditingBlockedPeriod(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className={UI_CLASSES.LABEL}>Description (optionnel)</label>
                  <textarea
                    id="description"
                    className={`${UI_CLASSES.INPUT} min-h-[100px]`}
                    value={editingBlockedPeriod.description || ''}
                    onChange={(e) => setEditingBlockedPeriod(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Détails supplémentaires..."
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingBlockedPeriod(null)}
                  className={UI_CLASSES.BUTTON_SECONDARY}
                  disabled={isProcessing}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={UI_CLASSES.BUTTON_PRIMARY}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                      Enregistrement...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save size={16} className="mr-1" />
                      Enregistrer
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
          
          {/* Notes et recommandations */}
          <div className={`${UI_CLASSES.CARD} border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600`}>
            <div className="flex items-start">
              <AlertTriangle size={20} className="mr-3 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Recommandations</h4>
                <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                  <li>Bloquez les périodes où vous êtes indisponible pour maintenir un calendrier à jour</li>
                  <li>Pour les congés prolongés, utilisez plutôt les règles de disponibilité pour périodes spécifiques</li>
                  <li>Pensez à bloquer du temps pour les tâches administratives et la formation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;