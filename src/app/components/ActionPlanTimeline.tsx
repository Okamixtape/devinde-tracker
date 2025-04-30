import React, { useState } from "react";
import { Plus, Edit, Trash2, Save, X, Calendar, Clock, Tag, CheckCircle } from "lucide-react";
import type { BusinessPlanData } from "./types";

// Types pour les jalons
type Milestone = {
  id: string;
  title: string;
  description?: string;
  date: string; // Format YYYY-MM-DD
  status: "completed" | "in-progress" | "planned";
  category?: string;
};

// Props du composant
type Props = {
  data: BusinessPlanData["actionPlan"];
  updateData: (section: keyof BusinessPlanData, field: string, value: string[]) => void;
};

const ActionPlanTimeline: React.FC<Props> = ({ data, updateData }) => {
  // État local pour le formulaire
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Filtres
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "in-progress" | "planned">("all");
  
  // Conversion des chaînes en objets structurés pour les jalons
  const parseMilestones = (): Milestone[] => {
    return data.milestones.map((item, index) => {
      // Tentative d'extraction d'une date (exemple : "Mai 2025 - Dépôt demande ARCE")
      const dateMatch = item.match(/(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\s+(\d{4})/i);
      
      // Détermination du mois
      let month = 1;
      if (dateMatch && dateMatch[1]) {
        const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        month = monthNames.findIndex(m => m === dateMatch[1].toLowerCase()) + 1;
      }
      
      // Année
      const year = dateMatch && dateMatch[2] ? parseInt(dateMatch[2]) : 2025;
      
      // Extraction du titre (tout ce qui vient après le tiret)
      const titleMatch = item.match(/\s+-\s+(.*)/);
      const title = titleMatch && titleMatch[1] ? titleMatch[1] : item;
      
      // Création d'une date au format YYYY-MM-DD
      const date = `${year}-${month.toString().padStart(2, '0')}-01`;
      
      // Statut par défaut (tout est planifié pour l'instant)
      const status = "planned";
      
      return {
        id: `milestone-${index}`,
        title,
        date,
        status,
        category: "business", // Catégorie par défaut
      };
    });
  };
  
  // Conversion des jalons en chaînes pour le stockage
  const milestonesToStrings = (milestones: Milestone[]): string[] => {
    return milestones.map(milestone => {
      // Conversion de la date en format lisible
      const date = new Date(milestone.date);
      const month = date.toLocaleString('fr-FR', { month: 'long' });
      const year = date.getFullYear();
      
      return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year} - ${milestone.title}`;
    });
  };
  
  // Gestion de la sauvegarde d'un jalon
  const saveMilestone = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const titleInput = form.elements.namedItem('title') as HTMLInputElement;
    const dateInput = form.elements.namedItem('date') as HTMLInputElement;
    const statusInput = form.elements.namedItem('status') as HTMLSelectElement;
    const descriptionInput = form.elements.namedItem('description') as HTMLTextAreaElement;
    const categoryInput = form.elements.namedItem('category') as HTMLSelectElement;
    
    if (titleInput.value && dateInput.value) {
      // Création du nouvel objet jalon
      const newMilestone: Milestone = {
        id: `milestone-${Date.now()}`,
        title: titleInput.value,
        date: dateInput.value,
        status: statusInput.value as "completed" | "in-progress" | "planned",
        description: descriptionInput.value || undefined,
        category: categoryInput.value || "business",
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
  
  // Obtention d'une couleur pour chaque catégorie
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "business":
        return "bg-blue-100 text-blue-800";
      case "technical":
        return "bg-purple-100 text-purple-800";
      case "marketing":
        return "bg-green-100 text-green-800";
      case "admin":
        return "bg-orange-100 text-orange-800";
      case "financial":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Obtention de la couleur de statut
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "planned":
        return "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };
  
  // Formatage des dates
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  // Parsing des jalons
  const milestones = parseMilestones();
  
  // Tri des jalons par date
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Filtrage des jalons
  const filteredMilestones = filterStatus === "all" 
    ? sortedMilestones 
    : sortedMilestones.filter(m => m.status === filterStatus);
  
  // Calcul de la progression globale
  const completedCount = milestones.filter(m => m.status === "completed").length;
  const progressPercentage = milestones.length > 0 
    ? Math.round((completedCount / milestones.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Plan d&apos;action</h2>
          <p className="text-gray-500">Suivi des jalons importants de votre activité</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white border rounded-md p-1">
            <button 
              className={`px-3 py-1 rounded ${filterStatus === "all" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
              onClick={() => setFilterStatus("all")}
            >
              Tous
            </button>
            <button 
              className={`px-3 py-1 rounded ${filterStatus === "completed" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
              onClick={() => setFilterStatus("completed")}
            >
              Terminés
            </button>
            <button 
              className={`px-3 py-1 rounded ${filterStatus === "in-progress" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
              onClick={() => setFilterStatus("in-progress")}
            >
              En cours
            </button>
            <button 
              className={`px-3 py-1 rounded ${filterStatus === "planned" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
              onClick={() => setFilterStatus("planned")}
            >
              Planifiés
            </button>
          </div>
          
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded-md flex items-center"
            onClick={() => {
              setEditingIndex(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? <X size={16} className="mr-1" /> : <Plus size={16} className="mr-1" />}
            {showForm ? "Annuler" : "Ajouter un jalon"}
          </button>
        </div>
      </div>
      
      {/* Progression globale */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Progression globale</h3>
          <span className="text-sm font-medium">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{completedCount} sur {milestones.length} jalons terminés</span>
          <span>Objectif: 100%</span>
        </div>
      </div>
      
      {/* Formulaire d'ajout/édition */}
      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-medium mb-4">{editingIndex !== null ? "Modifier le jalon" : "Ajouter un jalon"}</h3>
          <form onSubmit={saveMilestone}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input 
                  type="text" 
                  name="title" 
                  className="w-full p-2 border rounded" 
                  placeholder="Ex: Dépôt demande ARCE" 
                  defaultValue={editingIndex !== null ? milestones[editingIndex].title : ""}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  className="w-full p-2 border rounded" 
                  defaultValue={editingIndex !== null ? milestones[editingIndex].date : ""}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select 
                  name="status" 
                  className="w-full p-2 border rounded"
                  defaultValue={editingIndex !== null ? milestones[editingIndex].status : "planned"}
                >
                  <option value="planned">Planifié</option>
                  <option value="in-progress">En cours</option>
                  <option value="completed">Terminé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <select 
                  name="category" 
                  className="w-full p-2 border rounded"
                  defaultValue={editingIndex !== null ? milestones[editingIndex].category : "business"}
                >
                  <option value="business">Business</option>
                  <option value="technical">Technique</option>
                  <option value="marketing">Marketing</option>
                  <option value="admin">Administratif</option>
                  <option value="financial">Financier</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description (optionnelle)</label>
                <textarea 
                  name="description" 
                  className="w-full p-2 border rounded" 
                  rows={3}
                  placeholder="Détails supplémentaires sur ce jalon..."
                  defaultValue={editingIndex !== null ? milestones[editingIndex].description || "" : ""}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                onClick={() => {
                  setShowForm(false);
                  setEditingIndex(null);
                }}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm flex items-center"
              >
                <Save size={16} className="mr-1" />
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Timeline */}
      {filteredMilestones.length > 0 ? (
        <div className="relative">
          {/* Ligne verticale */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          {/* Jalons */}
          <div className="space-y-8">
            {filteredMilestones.map((milestone, index) => (
              <div key={milestone.id} className="relative flex items-start">
                {/* Indicateur de statut */}
                <div className={`absolute left-7 w-3 h-3 rounded-full mt-1.5 -ml-1.5 ${getStatusColor(milestone.status)}`}></div>
                
                {/* Contenu du jalon */}
                <div className="ml-12 bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{milestone.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(milestone.date)}
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock size={14} className="mr-1" />
                          {milestone.status === "completed" ? "Terminé" : 
                           milestone.status === "in-progress" ? "En cours" : "Planifié"}
                        </div>
                        
                        {milestone.category && (
                          <div className={`flex items-center text-xs px-2 py-0.5 rounded-full ${getCategoryColor(milestone.category)}`}>
                            <Tag size={12} className="mr-1" />
                            {milestone.category.charAt(0).toUpperCase() + milestone.category.slice(1)}
                          </div>
                        )}
                      </div>
                      
                      {milestone.description && (
                        <p className="mt-2 text-sm text-gray-600">{milestone.description}</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      <button 
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                        onClick={() => editMilestone(index)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        onClick={() => deleteMilestone(index)}
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
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-medium mb-2">Aucun jalon trouvé</h3>
          <p className="text-gray-500">
            {filterStatus !== "all" 
              ? `Aucun jalon avec le statut "${filterStatus === "completed" ? "Terminé" : filterStatus === "in-progress" ? "En cours" : "Planifié"}".` 
              : "Ajoutez votre premier jalon pour commencer à construire votre plan d'action."}
          </p>
          {filterStatus !== "all" && (
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={() => setFilterStatus("all")}
            >
              Voir tous les jalons
            </button>
          )}
        </div>
      )}
      
      {/* Conseils */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Conseil pour votre plan d&apos;action</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Un bon plan d&apos;action pour un développeur indépendant devrait inclure :</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Des jalons administratifs (création d&apos;entreprise, demande ARCE)</li>
                <li>Des objectifs de marketing et acquisition client</li>
                <li>Des jalons techniques (portfolio, projets personnels)</li>
                <li>Des dates de révision de votre business plan et tarification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPlanTimeline;