import React, { useState } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Clock, 
  Tag, 
  AlertCircle,
  Filter,
  ChevronDown
} from "lucide-react";
import { UI_CLASSES } from "../styles/ui-classes";
import { useI18n } from "../hooks/useI18n";
import type { BusinessPlanData } from "./types";

// Types pour les jalons
type Milestone = {
  id: string;
  title: string;
  date: string; // format YYYY-MM-DD
  status: "completed" | "in-progress" | "planned";
  category: "business" | "technical" | "marketing" | "admin" | "financial";
  description?: string;
};

// Types pour les filtres
type FilterStatus = "all" | "completed" | "in-progress" | "planned";
type FilterCategory = "all" | "business" | "technical" | "marketing" | "admin" | "financial";

// Props du composant
type Props = {
  data: BusinessPlanData["actionPlan"];
  updateData: (section: keyof BusinessPlanData, field: string, value: string[]) => void;
};

export const ActionPlanTimeline: React.FC<Props> = ({ data, updateData }) => {
  const { t } = useI18n();
  
  // État local pour le formulaire
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Filtres
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  
  // Conversion des chaînes en objets structurés pour les jalons
  const parseMilestones = (): Milestone[] => {
    return data.milestones.map((item, index) => {
      try {
        // Tentative de parsing JSON d'abord (pour les jalons déjà structurés)
        const parsed = JSON.parse(item);
        return {
          ...parsed,
          id: parsed.id || `milestone-${index}`,
          status: parsed.status || "planned",
          category: parsed.category || "business"
        } as Milestone;
      } catch {
        // Parsing manuel pour les anciens formats
        // Tentative d'extraction d'une date (exemple : "Mai 2025 - Dépôt demande ARCE")
        const dateMatch = item.match(/(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\s+(\d{4})/i);
        
        // Détermination du mois
        let month = 1;
        if (dateMatch && dateMatch[1]) {
          const monthNames = [
            t('common.months.january').toLowerCase(),
            t('common.months.february').toLowerCase(),
            t('common.months.march').toLowerCase(),
            t('common.months.april').toLowerCase(),
            t('common.months.may').toLowerCase(),
            t('common.months.june').toLowerCase(),
            t('common.months.july').toLowerCase(),
            t('common.months.august').toLowerCase(),
            t('common.months.september').toLowerCase(),
            t('common.months.october').toLowerCase(),
            t('common.months.november').toLowerCase(),
            t('common.months.december').toLowerCase()
          ];
          month = monthNames.findIndex(m => m === dateMatch[1].toLowerCase()) + 1;
        }
        
        // Année
        const year = dateMatch && dateMatch[2] ? parseInt(dateMatch[2]) : 2025;
        
        // Extraction du titre (tout ce qui vient après le tiret)
        const titleMatch = item.match(/\s+-\s+(.*)/);
        const title = titleMatch && titleMatch[1] ? titleMatch[1] : item;
        
        // Création d'une date au format YYYY-MM-DD
        const date = `${year}-${month.toString().padStart(2, '0')}-01`;
        
        return {
          id: `milestone-${index}`,
          title,
          date,
          status: "planned",
          category: "business" as "business" | "technical" | "marketing" | "admin" | "financial",
          description: ""
        };
      }
    });
  };

  // Conversion des jalons en chaînes pour le stockage
  const milestonesToStrings = (milestones: Milestone[]): string[] => {
    return milestones.map(milestone => JSON.stringify(milestone));
  };

  // Gestion de la sauvegarde d'un jalon
  const saveMilestone = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const titleInput = form.elements.namedItem('title') as HTMLInputElement;
    const dateInput = form.elements.namedItem('date') as HTMLInputElement;
    const statusInput = form.elements.namedItem('status') as HTMLSelectElement;
    const categoryInput = form.elements.namedItem('category') as HTMLSelectElement;
    const descriptionInput = form.elements.namedItem('description') as HTMLTextAreaElement;
    
    if (titleInput.value && dateInput.value) {
      // Création du nouvel objet jalon
      const newMilestone: Milestone = {
        id: `milestone-${Date.now()}`,
        title: titleInput.value,
        date: dateInput.value,
        status: statusInput.value as "completed" | "in-progress" | "planned",
        category: categoryInput.value as "business" | "technical" | "marketing" | "admin" | "financial",
        description: descriptionInput.value || undefined,
      };
      
      // Récupération des jalons existants
      const milestones = parseMilestones();
      
      if (editingIndex !== null) {
        // Mise à jour d'un jalon existant
        milestones[editingIndex] = { 
          ...newMilestone, 
          id: milestones[editingIndex].id 
        };
      } else {
        // Ajout d'un nouveau jalon
        milestones.push(newMilestone);
      }
      
      // Tri des jalons par date
      milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Conversion en chaînes et mise à jour
      updateData("actionPlan", "milestones", milestonesToStrings(milestones));
      
      // Réinitialisation du formulaire
      setShowForm(false);
      setEditingIndex(null);
      form.reset();
    }
  };

  // Suppression d'un jalon
  const deleteMilestone = (index: number) => {
    const milestones = parseMilestones();
    milestones.splice(index, 1);
    updateData("actionPlan", "milestones", milestonesToStrings(milestones));
  };

  // Édition d'un jalon
  const editMilestone = (index: number) => {
    setEditingIndex(index);
    setShowForm(true);
  };

  // Filtrage des jalons par statut et catégorie
  const filterMilestones = (milestones: Milestone[]): Milestone[] => {
    return milestones.filter(milestone => {
      const statusMatches = filterStatus === "all" || milestone.status === filterStatus;
      const categoryMatches = filterCategory === "all" || milestone.category === filterCategory;
      return statusMatches && categoryMatches;
    });
  };

  // Obtention d'une couleur pour chaque catégorie
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "business":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "technical":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "marketing":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "admin":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "financial":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Obtention de la couleur de statut
  const getStatusColor = (status: "completed" | "in-progress" | "planned"): string => {
    switch (status) {
      case "completed":
        return "bg-green-500 dark:bg-green-600";
      case "in-progress":
        return "bg-blue-500 dark:bg-blue-600";
      case "planned":
        return "bg-yellow-500 dark:bg-yellow-600";
      default:
        return "bg-gray-500 dark:bg-gray-600";
    }
  };

  // Parsing des jalons
  const milestones = parseMilestones();

  // Tri des jalons par date
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Filtrage des jalons
  const filteredMilestones = filterMilestones(sortedMilestones);

  // Calcul de la progression globale
  const completedCount = milestones.filter(m => m.status === "completed").length;
  const progressPercentage = milestones.length > 0 
    ? Math.round((completedCount / milestones.length) * 100) 
    : 0;

  // Catégories uniques présentes dans les jalons
  const uniqueCategories = Array.from(
    new Set(milestones.map(m => m.category))
  ) as FilterCategory[];

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className={UI_CLASSES.HEADING_2}>{t('business_plan.action_plan.title')}</h2>
          <p className={UI_CLASSES.TEXT_SMALL}>{t('business_plan.action_plan.description')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Filtres */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button 
                className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm space-x-1"
                onClick={() => {
                  const dropdown = document.getElementById('status-dropdown');
                  if (dropdown) {
                    dropdown.classList.toggle('hidden');
                  }
                }}
              >
                <Filter size={16} />
                <span>{t('business_plan.action_plan.status')}: {filterStatus === "all" ? t('common.all') : 
                                filterStatus === "completed" ? t('common.status.completed') : 
                                filterStatus === "in-progress" ? t('common.status.in_progress') : t('common.status.planned')}</span>
                <ChevronDown size={14} />
              </button>
              
              <div id="status-dropdown" className="absolute z-10 mt-1 hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg w-48">
                <div className="py-1">
                  <button 
                    className={`px-4 py-2 text-sm w-full text-left ${filterStatus === "all" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    onClick={() => {
                      setFilterStatus("all");
                      document.getElementById('status-dropdown')?.classList.add('hidden');
                    }}
                  >
                    {t('common.all')}
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm w-full text-left ${filterStatus === "completed" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    onClick={() => {
                      setFilterStatus("completed");
                      document.getElementById('status-dropdown')?.classList.add('hidden');
                    }}
                  >
                    {t('common.status.completed')}
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm w-full text-left ${filterStatus === "in-progress" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    onClick={() => {
                      setFilterStatus("in-progress");
                      document.getElementById('status-dropdown')?.classList.add('hidden');
                    }}
                  >
                    {t('common.status.in_progress')}
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm w-full text-left ${filterStatus === "planned" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    onClick={() => {
                      setFilterStatus("planned");
                      document.getElementById('status-dropdown')?.classList.add('hidden');
                    }}
                  >
                    {t('common.status.planned')}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <button 
                className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm space-x-1"
                onClick={() => {
                  const dropdown = document.getElementById('category-dropdown');
                  if (dropdown) {
                    dropdown.classList.toggle('hidden');
                  }
                }}
              >
                <Tag size={16} />
                <span>{t('business_plan.action_plan.category')}: {filterCategory === "all" ? t('common.all') : 
                                  filterCategory === "business" ? t('common.category.business') : 
                                  filterCategory === "technical" ? t('common.category.technical') : 
                                  filterCategory === "marketing" ? t('common.category.marketing') : 
                                  filterCategory === "admin" ? t('common.category.admin') : t('common.category.financial')}</span>
                <ChevronDown size={14} />
              </button>
              
              <div id="category-dropdown" className="absolute z-10 mt-1 hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg w-48">
                <div className="py-1">
                  <button 
                    className={`px-4 py-2 text-sm w-full text-left ${filterCategory === "all" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    onClick={() => {
                      setFilterCategory("all");
                      document.getElementById('category-dropdown')?.classList.add('hidden');
                    }}
                  >
                    {t('common.all')}
                  </button>
                  {uniqueCategories.map((category) => (
                    <button 
                      key={category}
                      className={`px-4 py-2 text-sm w-full text-left ${filterCategory === category ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                      onClick={() => {
                        setFilterCategory(category);
                        document.getElementById('category-dropdown')?.classList.add('hidden');
                      }}
                    >
                      {category === "business" ? t('common.category.business') : 
                       category === "technical" ? t('common.category.technical') : 
                       category === "marketing" ? t('common.category.marketing') : 
                       category === "admin" ? t('common.category.admin') : t('common.category.financial')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <button
            className={UI_CLASSES.BUTTON_PRIMARY + " flex items-center"}
            onClick={() => {
              setEditingIndex(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? <X size={16} className="mr-1" /> : <Plus size={16} className="mr-1" />}
            {showForm ? t('common.cancel') : t('business_plan.action_plan.add_milestone')}
          </button>
        </div>
      </div>
      
      {/* Progression globale */}
      <div className={UI_CLASSES.CARD}>
        <div className="flex justify-between items-center mb-2">
          <h3 className={UI_CLASSES.HEADING_3 + " !mb-0"}>{t('business_plan.action_plan.global_progress')}</h3>
          <span className={`text-sm font-medium ${progressPercentage >= 70 ? "text-green-600 dark:text-green-400" : 
                                                 progressPercentage >= 30 ? "text-blue-600 dark:text-blue-400" : 
                                                 "text-yellow-600 dark:text-yellow-400"}`}>
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${
              progressPercentage >= 70 ? "bg-green-500 dark:bg-green-600" : 
              progressPercentage >= 30 ? "bg-blue-500 dark:bg-blue-600" : 
              "bg-yellow-500 dark:bg-yellow-600"
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{completedCount} sur {milestones.length} {t('business_plan.action_plan.milestones_completed')}</span>
          <span>{t('business_plan.action_plan.objective')}: 100%</span>
        </div>
      </div>
      
      {/* Formulaire d'ajout/édition */}
      {showForm && (
        <div className={UI_CLASSES.CARD + " border border-blue-200 dark:border-blue-800 shadow-md animate-fadeIn"}>
          <h3 className={UI_CLASSES.HEADING_3}>{editingIndex !== null ? t('business_plan.action_plan.edit_milestone') : t('business_plan.action_plan.add_milestone')}</h3>
          <form onSubmit={saveMilestone} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="title" className={UI_CLASSES.LABEL}>{t('business_plan.action_plan.title')}</label>
                <input 
                  type="text" 
                  id="title"
                  name="title" 
                  className={UI_CLASSES.INPUT}
                  placeholder={t('business_plan.action_plan.title_placeholder')} 
                  defaultValue={editingIndex !== null ? milestones[editingIndex].title : ""}
                  required 
                />
              </div>
              <div>
                <label htmlFor="date" className={UI_CLASSES.LABEL}>{t('business_plan.action_plan.date')}</label>
                <input 
                  type="date" 
                  id="date"
                  name="date" 
                  className={UI_CLASSES.INPUT}
                  defaultValue={editingIndex !== null ? milestones[editingIndex].date : ""}
                  required 
                />
              </div>
              <div>
                <label htmlFor="status" className={UI_CLASSES.LABEL}>{t('business_plan.action_plan.status')}</label>
                <select 
                  id="status"
                  name="status" 
                  className={UI_CLASSES.INPUT}
                  defaultValue={editingIndex !== null ? milestones[editingIndex].status : "planned"}
                >
                  <option value="planned">{t('common.status.planned')}</option>
                  <option value="in-progress">{t('common.status.in_progress')}</option>
                  <option value="completed">{t('common.status.completed')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className={UI_CLASSES.LABEL}>{t('business_plan.action_plan.category')}</label>
                <select 
                  id="category"
                  name="category" 
                  className={UI_CLASSES.INPUT}
                  defaultValue={editingIndex !== null ? milestones[editingIndex].category : "business"}
                >
                  <option value="business">{t('common.category.business')}</option>
                  <option value="technical">{t('common.category.technical')}</option>
                  <option value="marketing">{t('common.category.marketing')}</option>
                  <option value="admin">{t('common.category.admin')}</option>
                  <option value="financial">{t('common.category.financial')}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className={UI_CLASSES.LABEL}>{t('business_plan.action_plan.description')}</label>
                <textarea 
                  id="description"
                  name="description" 
                  className={UI_CLASSES.INPUT}
                  rows={3}
                  placeholder={t('business_plan.action_plan.description_placeholder')} 
                  defaultValue={editingIndex !== null ? milestones[editingIndex].description || "" : ""}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                type="button" 
                className={UI_CLASSES.BUTTON_SECONDARY}
                onClick={() => {
                  setShowForm(false);
                  setEditingIndex(null);
                }}
              >
                {t('common.cancel')}
              </button>
              <button 
                type="submit" 
                className={UI_CLASSES.BUTTON_PRIMARY + " flex items-center"}
              >
                <Save size={16} className="mr-2" />
                {editingIndex !== null ? t('common.save') : t('business_plan.action_plan.add_milestone')}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Message quand aucun jalon n'est défini */}
      {milestones.length === 0 && (
        <div className={UI_CLASSES.CARD + " py-8 text-center"}>
          <AlertCircle className="mx-auto mb-4 text-yellow-500 dark:text-yellow-400" size={48} />
          <h3 className="text-lg font-medium mb-2">{t('business_plan.action_plan.no_milestones')}</h3>
          <p className={UI_CLASSES.TEXT + " mb-6"}>
            {t('business_plan.action_plan.no_milestones_description')}
          </p>
          <button
            className={UI_CLASSES.BUTTON_PRIMARY + " flex items-center mx-auto"}
            onClick={() => {
              setEditingIndex(null);
              setShowForm(true);
            }}
          >
            <Plus size={16} className="mr-1" />
            {t('business_plan.action_plan.add_milestone')}
          </button>
        </div>
      )}
      
      {/* Timeline */}
      {filteredMilestones.length > 0 && (
        <div className="relative pb-10">
          {/* Ligne verticale */}
          <div className="absolute left-8 sm:left-12 top-8 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-900/50"></div>
          
          {/* Jalons */}
          <div className="space-y-8">
            {filteredMilestones.map((milestone, index) => (
              <div 
                key={milestone.id} 
                className="relative flex items-start group"
              >
                {/* Indicateur de statut */}
                <div className={`absolute left-8 sm:left-12 w-4 h-4 rounded-full mt-1.5 -ml-2 shadow-sm transition-all duration-300 group-hover:scale-125 ${getStatusColor(milestone.status)}`}></div>
                
                {/* Date à gauche */}
                <div className="w-16 sm:w-24 text-right pr-6 flex-shrink-0">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(milestone.date).toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {new Date(milestone.date).toLocaleDateString('fr-FR', { day: 'numeric' })}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(milestone.date).getFullYear()}
                  </span>
                </div>
                
                {/* Contenu du jalon */}
                <div className="ml-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-500 dark:border-blue-700 w-full transition-all duration-200 hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={14} className="mr-1" />
                          {milestone.status === "completed" ? t('common.status.completed') : 
                           milestone.status === "in-progress" ? t('common.status.in_progress') : t('common.status.planned')}
                        </div>
                        
                        {milestone.category && (
                          <div className={`flex items-center text-xs px-2 py-0.5 rounded-full ${getCategoryColor(milestone.category)}`}>
                            <Tag size={12} className="mr-1" />
                            {milestone.category === "business" ? t('common.category.business') : 
                             milestone.category === "technical" ? t('common.category.technical') : 
                             milestone.category === "marketing" ? t('common.category.marketing') : 
                             milestone.category === "admin" ? t('common.category.admin') : t('common.category.financial')}
                          </div>
                        )}
                      </div>
                      
                      {milestone.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
                      )}
                    </div>
                    
                    <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                      <button 
                        className="p-1.5 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => editMilestone(index)}
                        aria-label={t('common.edit')}
                        title={t('common.edit')}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => {
                          if (window.confirm(t('business_plan.action_plan.confirm_delete'))) {
                            deleteMilestone(index);
                          }
                        }}
                        aria-label={t('common.delete')}
                        title={t('common.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPlanTimeline;