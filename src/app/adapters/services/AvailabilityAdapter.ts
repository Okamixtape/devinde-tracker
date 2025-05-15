/**
 * AvailabilityAdapter - Adaptateur pour les données de disponibilité des services
 * 
 * Transforme les données entre le format service (dataModels) et le format UI (interfaces/services).
 * Implémente les conventions définies dans /docs/CONVENTIONS.md
 *
 * @version 1.0
 * @standardized true
 */

import { BusinessPlanData } from '../../services/interfaces/dataModels';
import {
  AvailabilityRuleType,
  BlockedTimeSlot,
  ServiceCapacity,
  UIDayAvailability,
  UIDateRangeAvailability,
  UIAvailabilitySettings,
  ServiceAvailabilityData,
  ServiceAvailabilityResult,
  AvailabilityStatus,
  AvailableTimeSlot
} from '../../interfaces/services/availability';

/**
 * Adaptateur pour la gestion des disponibilités
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * (BusinessPlanData) et le format UI (UIAvailabilitySettings, etc.).
 */
export class AvailabilityAdapter {
  /**
   * Génère un ID unique pour une nouvelle règle de disponibilité
   * @private
   */
  private static _generateRuleId(): string {
    return `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Crée une structure vide pour les données de disponibilité
   * @private
   */
  private static _createEmptyAvailabilityData(): ServiceAvailabilityData {
    return {
      availabilityRules: [],
      blockedPeriods: [],
      serviceCapacities: [],
      businessPlanId: ''
    };
  }

  /**
   * Transforme les données du format service vers le format UI
   * 
   * @param serviceData Données provenant du service
   * @returns Données formatées pour l'UI
   */
  static toUI(serviceData: ServiceAvailabilityData | null | undefined): UIAvailabilitySettings {
    if (!serviceData) {
      return {
        defaultWeeklyRules: [],
        customRules: [],
        blockedPeriods: [],
        serviceCapacities: []
      };
    }

    // Séparer les règles hebdomadaires des règles personnalisées
    const defaultWeeklyRules = serviceData.availabilityRules
      .filter(rule => rule.type === 'weekly')
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    const customRules = serviceData.availabilityRules
      .filter(rule => rule.type !== 'weekly')
      .sort((a, b) => b.priority - a.priority);

    return {
      defaultWeeklyRules,
      customRules,
      blockedPeriods: serviceData.blockedPeriods,
      serviceCapacities: serviceData.serviceCapacities
    };
  }

  /**
   * Transforme les données du format UI vers le format service
   * 
   * @param uiData Données provenant de l'UI
   * @param businessPlanId ID du plan d'affaires
   * @returns Données formatées pour le service
   */
  static toService(uiData: UIAvailabilitySettings, businessPlanId: string): ServiceAvailabilityData {
    if (!uiData) {
      return AvailabilityAdapter._createEmptyAvailabilityData();
    }

    // Combiner toutes les règles
    const availabilityRules: AvailabilityRuleType[] = [
      ...uiData.defaultWeeklyRules,
      ...uiData.customRules
    ];

    return {
      availabilityRules,
      blockedPeriods: uiData.blockedPeriods,
      serviceCapacities: uiData.serviceCapacities,
      businessPlanId
    };
  }

  /**
   * Calcule les disponibilités pour une plage de dates
   * 
   * @param serviceData Données de disponibilité
   * @param startDate Date de début (format ISO)
   * @param endDate Date de fin (format ISO)
   * @returns Résultat du calcul de disponibilité
   */
  static calculateAvailability(
    serviceData: ServiceAvailabilityData,
    startDate: string, 
    endDate: string
  ): ServiceAvailabilityResult {
    if (!serviceData || !startDate || !endDate) {
      return {
        dateRange: { startDate, endDate },
        availableDays: [],
        blockedPeriods: []
      };
    }

    // Tableau pour stocker la disponibilité de chaque jour
    const availableDays: UIDayAvailability[] = [];
    
    // Convertir les dates en objets Date
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Pour chaque jour dans la plage de dates
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const isoDate = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay(); // 0 = Dimanche, 6 = Samedi
      
      // Trouver les règles hebdomadaires pour ce jour
      const weeklyRules = serviceData.availabilityRules
        .filter(rule => 
          rule.type === 'weekly' && 
          rule.dayOfWeek === dayOfWeek &&
          rule.isActive
        );
      
      // Trouver les règles spécifiques à cette date
      const dateRules = serviceData.availabilityRules
        .filter(rule => 
          rule.type === 'dateRange' &&
          rule.isActive &&
          new Date(rule.startDate) <= currentDate &&
          new Date(rule.endDate) >= currentDate
        )
        .sort((a, b) => b.priority - a.priority); // Trier par priorité décroissante
      
      // Trouver les périodes bloquées qui chevauchent cette date
      const dayBlockedPeriods = serviceData.blockedPeriods
        .filter(period => {
          const blockStart = new Date(period.startDate);
          const blockEnd = new Date(period.endDate);
          return blockStart <= new Date(`${isoDate}T23:59:59`) && 
                 blockEnd >= new Date(`${isoDate}T00:00:00`);
        });
      
      // Calculer les plages horaires disponibles
      let availableSlots: AvailableTimeSlot[] = [];
      let availableHours = 0;
      
      // Par défaut, si aucune règle n'est définie, la journée est indisponible
      let status = AvailabilityStatus.UNAVAILABLE;
      
      // Si des règles hebdomadaires existent pour ce jour
      if (weeklyRules.length > 0) {
        availableSlots = weeklyRules.map(rule => ({
          date: isoDate,
          startTime: rule.startTime,
          endTime: rule.endTime,
          duration: AvailabilityAdapter._calculateDurationInMinutes(rule.startTime, rule.endTime),
          serviceTypes: rule.serviceTypes || []
        }));
        
        // Calculer les heures disponibles
        availableHours = availableSlots.reduce(
          (sum, slot) => sum + slot.duration / 60, 
          0
        );
        
        status = AvailabilityStatus.AVAILABLE;
      }
      
      // Si des règles spécifiques existent pour cette date, elles ont priorité
      if (dateRules.length > 0) {
        const highestPriorityRule = dateRules[0]; // Déjà trié par priorité
        status = highestPriorityRule.status;
        
        if (status === AvailabilityStatus.AVAILABLE || status === AvailabilityStatus.PARTIALLY_AVAILABLE) {
          if (highestPriorityRule.startTime && highestPriorityRule.endTime) {
            availableSlots = [{
              date: isoDate,
              startTime: highestPriorityRule.startTime,
              endTime: highestPriorityRule.endTime,
              duration: AvailabilityAdapter._calculateDurationInMinutes(
                highestPriorityRule.startTime,
                highestPriorityRule.endTime
              ),
              serviceTypes: highestPriorityRule.serviceTypes || []
            }];
            
            availableHours = availableSlots[0].duration / 60;
          }
        } else {
          // Si la règle indique indisponible, effacer les plages disponibles
          availableSlots = [];
          availableHours = 0;
        }
      }
      
      // Si des périodes bloquées existent, mettre à jour en conséquence
      if (dayBlockedPeriods.length > 0) {
        // Si toute la journée est bloquée
        if (dayBlockedPeriods.some(period => 
          new Date(period.startDate) <= new Date(`${isoDate}T00:00:00`) &&
          new Date(period.endDate) >= new Date(`${isoDate}T23:59:59`)
        )) {
          availableSlots = [];
          availableHours = 0;
          status = AvailabilityStatus.UNAVAILABLE;
        } else {
          // Logique plus complexe pour bloquer partiellement serait implémentée ici
          // Pour cette version simple, on considère qu'il y a au moins une heure bloquée
          if (availableSlots.length > 0) {
            status = AvailabilityStatus.PARTIALLY_AVAILABLE;
          }
        }
      }
      
      // Ajouter la disponibilité de cette journée
      availableDays.push({
        date: isoDate,
        status,
        availableHours,
        availableSlots,
        blockedSlots: dayBlockedPeriods
      });
      
      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      dateRange: { startDate, endDate },
      availableDays,
      blockedPeriods: serviceData.blockedPeriods
    };
  }

  /**
   * Calcule la durée en minutes entre deux heures au format "HH:MM"
   * @private
   */
  private static _calculateDurationInMinutes(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  }

  /**
   * Extrait les données de disponibilité à partir des données d'un plan d'affaires
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Données de disponibilité
   */
  static extractFromBusinessPlan(businessPlanData: BusinessPlanData): ServiceAvailabilityData {
    if (!businessPlanData) {
      return AvailabilityAdapter._createEmptyAvailabilityData();
    }

    // Pour l'instant, cette méthode est un emplacement pour extraire les données
    // du modèle de plan d'affaires existant. Dans une version ultérieure,
    // cette logique pourrait être adaptée au format des données réel.
    
    // Vérifier si des données standardisées existent
    if (businessPlanData.standardized && businessPlanData.standardized.availability) {
      return businessPlanData.standardized.availability as ServiceAvailabilityData;
    }
    
    return {
      availabilityRules: [],
      blockedPeriods: [],
      serviceCapacities: [],
      businessPlanId: businessPlanData.id || ''
    };
  }

  /**
   * Met à jour le plan d'affaires avec les données de disponibilité
   * 
   * @param businessPlanData Données du plan d'affaires
   * @param availabilityData Données de disponibilité
   * @returns Plan d'affaires mis à jour
   */
  static updateBusinessPlanWithAvailability(
    businessPlanData: BusinessPlanData,
    availabilityData: ServiceAvailabilityData
  ): BusinessPlanData {
    if (!businessPlanData) {
      return {} as BusinessPlanData;
    }

    // Créer une copie des données du plan d'affaires
    const updatedBusinessPlan = { ...businessPlanData };

    // Assurer que l'objet standardized existe
    if (!updatedBusinessPlan.standardized) {
      updatedBusinessPlan.standardized = {};
    }

    // Mettre à jour les données de disponibilité
    updatedBusinessPlan.standardized.availability = availabilityData;

    return updatedBusinessPlan;
  }
}

export default AvailabilityAdapter;