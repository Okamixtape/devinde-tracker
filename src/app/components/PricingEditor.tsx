import React, { useState, useEffect, useCallback } from "react";
import { 
  Edit, 
  Trash2, 
  PlusCircle, 
  X, 
  PackageCheck, 
  CheckCircle,
  Clock,
  Calendar
} from "lucide-react";
import { UI_CLASSES } from "../styles/ui-classes";
import useBusinessPlanData from "../hooks/useBusinessPlanData";

// Fonction pour générer un ID unique puisque uuid n'est pas disponible
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11) + 
         Date.now().toString(36);
};

// Types pour les éléments de tarification
export type PricingItem = {
  id: string;
  name: string;
  hourlyRate?: number;
  dailyRate?: number;
  minPrice?: number;
  maxPrice?: number;
  timeframe?: string;
  price?: number;
  included?: string[];
};

// Types pour les différentes catégories de tarification
export type PricingCategory = "hourlyRates" | "packages" | "subscriptions";

// Props pour le composant PricingEditor
interface PricingEditorProps {
  category: PricingCategory;
}

// État du modal
type ModalState = {
  isOpen: boolean;
  mode: "add" | "edit";
  currentItem: PricingItem | null;
};

/**
 * Composant d'édition de tarifs
 * Permet d'ajouter, modifier et supprimer différents types de tarification
 */
const PricingEditor: React.FC<PricingEditorProps> = ({ category }) => {
  // Récupération des données du business plan et des fonctions de mise à jour
  const businessPlanHook = useBusinessPlanData();
  
  // États locaux
  const [items, setItems] = useState<PricingItem[]>([]);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    mode: "add",
    currentItem: null
  });
  const [newIncludedItem, setNewIncludedItem] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  
  // Titre et description en fonction de la catégorie
  const getCategoryInfo = () => {
    switch (category) {
      case "hourlyRates":
        return {
          title: "Tarifs horaires",
          description: "Définissez vos tarifs horaires pour différents types de services.",
          icon: <Clock size={20} className="text-blue-500" />
        };
      case "packages":
        return {
          title: "Forfaits par projet",
          description: "Créez des forfaits adaptés à différents types de projets.",
          icon: <PackageCheck size={20} className="text-green-500" />
        };
      case "subscriptions":
        return {
          title: "Abonnements mensuels",
          description: "Proposez des formules d'abonnement pour des services récurrents.",
          icon: <Calendar size={20} className="text-purple-500" />
        };
    }
  };
  
  const { title, description, icon } = getCategoryInfo();

  // Créer un élément vide selon la catégorie
  const createEmptyItem = (): PricingItem => {
    const baseItem = {
      id: generateId(),
      name: ""
    };
    
    switch (category) {
      case "hourlyRates":
        return {
          ...baseItem,
          hourlyRate: 0,
          dailyRate: 0
        };
      case "packages":
        return {
          ...baseItem,
          minPrice: 0,
          maxPrice: 0,
          timeframe: ""
        };
      case "subscriptions":
        return {
          ...baseItem,
          price: 0,
          included: []
        };
      default:
        return baseItem;
    }
  };
  
  // Convertir les chaînes de caractères en objets PricingItem
  const parseBusinessPlanItems = useCallback(() => {
    if (!businessPlanHook?.businessPlanData) return [];
    
    const stringItems = businessPlanHook.businessPlanData.businessModel[category] || [];
    
    return stringItems.map((item: string) => {
      try {
        return JSON.parse(item) as PricingItem;
      } catch {
        // Compatibilité avec l'ancien format (simples chaînes)
        return {
          id: generateId(),
          name: item
        } as PricingItem;
      }
    });
  }, [businessPlanHook?.businessPlanData, category]);
  
  // Charger les données initiales
  useEffect(() => {
    const parsedItems = parseBusinessPlanItems();
    setItems(parsedItems);
  }, [parseBusinessPlanItems]);
  
  // Sauvegarder les modifications dans le business plan
  const saveItems = useCallback((newItems: PricingItem[]) => {
    if (!businessPlanHook?.updateData) return;
    
    const stringItems = newItems.map(item => JSON.stringify(item));
    businessPlanHook.updateData("businessModel", category, stringItems);
    setItems(newItems);
  }, [businessPlanHook, category]);
  
  // Ouvrir le modal en mode ajout
  const handleAddItem = () => {
    setFormError(null);
    setModal({
      isOpen: true,
      mode: "add",
      currentItem: createEmptyItem()
    });
  };
  
  // Ouvrir le modal en mode édition
  const handleEditItem = (item: PricingItem) => {
    setFormError(null);
    setModal({
      isOpen: true,
      mode: "edit",
      currentItem: { ...item }
    });
  };
  
  // Supprimer un élément
  const handleDeleteItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    saveItems(newItems);
  };
  
  // Fermer le modal
  const handleCloseModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // Mettre à jour un champ de l'élément courant
  const updateItemField = (field: string, value: string | number | string[]) => {
    if (!modal.currentItem) return;
    
    setModal(prev => ({
      ...prev,
      currentItem: {
        ...prev.currentItem!,
        [field]: value
      }
    }));
    
    // Calcul automatique du taux journalier
    if (field === "hourlyRate" && category === "hourlyRates") {
      const hourlyRate = parseFloat(value as string);
      if (!isNaN(hourlyRate)) {
        setModal(prev => ({
          ...prev,
          currentItem: {
            ...prev.currentItem!,
            dailyRate: hourlyRate * 8
          }
        }));
      }
    }
  };
  
  // Ajouter un service inclus dans un abonnement
  const handleAddIncludedItem = () => {
    if (!newIncludedItem.trim() || !modal.currentItem) return;
    
    const included = [...(modal.currentItem.included || []), newIncludedItem.trim()];
    
    setModal(prev => ({
      ...prev,
      currentItem: {
        ...prev.currentItem!,
        included
      }
    }));
    
    setNewIncludedItem("");
  };
  
  // Supprimer un service inclus d'un abonnement
  const handleRemoveIncludedItem = (index: number) => {
    if (!modal.currentItem?.included) return;
    
    const included = [...modal.currentItem.included];
    included.splice(index, 1);
    
    setModal(prev => ({
      ...prev,
      currentItem: {
        ...prev.currentItem!,
        included
      }
    }));
  };
  
  // Valider et sauvegarder l'élément
  const handleSaveItem = () => {
    if (!modal.currentItem) return;
    
    // Validation de base
    if (!modal.currentItem.name.trim()) {
      setFormError("Le nom est obligatoire");
      return;
    }
    
    // Validation spécifique à chaque catégorie
    switch (category) {
      case "hourlyRates":
        if (!modal.currentItem.hourlyRate || modal.currentItem.hourlyRate <= 0) {
          setFormError("Le taux horaire doit être supérieur à 0");
          return;
        }
        break;
      case "packages":
        if (!modal.currentItem.minPrice || modal.currentItem.minPrice < 0) {
          setFormError("Le prix minimum doit être valide");
          return;
        }
        if (!modal.currentItem.maxPrice || modal.currentItem.maxPrice <= modal.currentItem.minPrice) {
          setFormError("Le prix maximum doit être supérieur au prix minimum");
          return;
        }
        if (!modal.currentItem.timeframe?.trim()) {
          setFormError("Le délai estimé est obligatoire");
          return;
        }
        break;
      case "subscriptions":
        if (!modal.currentItem.price || modal.currentItem.price <= 0) {
          setFormError("Le prix mensuel doit être supérieur à 0");
          return;
        }
        if (!modal.currentItem.included || modal.currentItem.included.length === 0) {
          setFormError("Ajoutez au moins un service inclus");
          return;
        }
        break;
    }
    
    // Tout est valide, on sauvegarde
    let newItems: PricingItem[];
    
    if (modal.mode === "add") {
      newItems = [...items, modal.currentItem];
    } else {
      newItems = items.map(item => 
        item.id === modal.currentItem!.id ? modal.currentItem! : item
      );
    }
    
    saveItems(newItems);
    handleCloseModal();
  };
  
  // Rendu du contenu du modal en fonction de la catégorie
  const renderModalContent = () => {
    if (!modal.currentItem) return null;
    
    return (
      <div className="space-y-4">
        {/* Champ nom (commun à toutes les catégories) */}
        <div>
          <label htmlFor="name" className={UI_CLASSES.LABEL}>
            {category === "hourlyRates" ? "Service" : 
             category === "packages" ? "Type de projet" : 
             "Formule d'abonnement"}
          </label>
          <input
            type="text"
            id="name"
            className={UI_CLASSES.INPUT}
            value={modal.currentItem.name}
            onChange={(e) => updateItemField("name", e.target.value)}
            placeholder={category === "hourlyRates" ? "ex: Développement Frontend" : 
                         category === "packages" ? "ex: Site vitrine" : 
                         "ex: Formule Standard"}
          />
        </div>
        
        {/* Champs spécifiques à chaque catégorie */}
        {category === "hourlyRates" && (
          <>
            <div>
              <label htmlFor="hourlyRate" className={UI_CLASSES.LABEL}>Taux horaire (€)</label>
              <input
                type="number"
                id="hourlyRate"
                className={UI_CLASSES.INPUT}
                value={modal.currentItem.hourlyRate || ""}
                onChange={(e) => updateItemField("hourlyRate", parseFloat(e.target.value))}
                min={0}
                step={5}
              />
            </div>
            <div>
              <label htmlFor="dailyRate" className={UI_CLASSES.LABEL}>
                Équivalent journalier (€) <span className="text-gray-500">(calculé automatiquement)</span>
              </label>
              <input
                type="number"
                id="dailyRate"
                className={UI_CLASSES.INPUT + " bg-gray-50 dark:bg-gray-800"}
                value={modal.currentItem.dailyRate || ""}
                disabled
              />
            </div>
          </>
        )}
        
        {category === "packages" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minPrice" className={UI_CLASSES.LABEL}>Prix minimum (€)</label>
                <input
                  type="number"
                  id="minPrice"
                  className={UI_CLASSES.INPUT}
                  value={modal.currentItem.minPrice || ""}
                  onChange={(e) => updateItemField("minPrice", parseFloat(e.target.value))}
                  min={0}
                  step={50}
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className={UI_CLASSES.LABEL}>Prix maximum (€)</label>
                <input
                  type="number"
                  id="maxPrice"
                  className={UI_CLASSES.INPUT}
                  value={modal.currentItem.maxPrice || ""}
                  onChange={(e) => updateItemField("maxPrice", parseFloat(e.target.value))}
                  min={0}
                  step={50}
                />
              </div>
            </div>
            <div>
              <label htmlFor="timeframe" className={UI_CLASSES.LABEL}>Délai estimé</label>
              <input
                type="text"
                id="timeframe"
                className={UI_CLASSES.INPUT}
                value={modal.currentItem.timeframe || ""}
                onChange={(e) => updateItemField("timeframe", e.target.value)}
                placeholder="ex: 2-3 semaines"
              />
            </div>
          </>
        )}
        
        {category === "subscriptions" && (
          <>
            <div>
              <label htmlFor="price" className={UI_CLASSES.LABEL}>Prix mensuel (€)</label>
              <input
                type="number"
                id="price"
                className={UI_CLASSES.INPUT}
                value={modal.currentItem.price || ""}
                onChange={(e) => updateItemField("price", parseFloat(e.target.value))}
                min={0}
                step={10}
              />
            </div>
            <div>
              <label className={UI_CLASSES.LABEL}>Services inclus</label>
              <div className="mb-2">
                {modal.currentItem.included?.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-sm mb-1"
                  >
                    <CheckCircle size={14} className="text-blue-500 mr-1" /> 
                    <span className="flex-grow">{item}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveIncludedItem(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex">
                <input
                  type="text"
                  value={newIncludedItem}
                  onChange={(e) => setNewIncludedItem(e.target.value)}
                  className={UI_CLASSES.INPUT + " rounded-r-none"}
                  placeholder="ex: 5 modifications par mois"
                  onKeyPress={(e) => e.key === "Enter" && handleAddIncludedItem()}
                />
                <button
                  type="button"
                  onClick={handleAddIncludedItem}
                  className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
                >
                  +
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* Message d'erreur */}
        {formError && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-2 rounded text-red-700 dark:text-red-300 text-sm">
            {formError}
          </div>
        )}
      </div>
    );
  };
  
  // Rendu d'un élément de tableau selon la catégorie
  const renderTableRow = (item: PricingItem) => {
    switch (category) {
      case "hourlyRates":
        return (
          <tr key={item.id} className={UI_CLASSES.TABLE_ROW}>
            <td className={UI_CLASSES.TABLE_CELL}>{item.name}</td>
            <td className={UI_CLASSES.TABLE_CELL}>{item.hourlyRate}€/h</td>
            <td className={UI_CLASSES.TABLE_CELL}>{item.dailyRate}€/jour</td>
            <td className={UI_CLASSES.TABLE_CELL}>
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => handleEditItem(item)}
                  className={UI_CLASSES.BUTTON_ICON}
                  title="Modifier"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className={UI_CLASSES.BUTTON_ICON + " text-red-500 hover:text-red-700"}
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        );
      
      case "packages":
        return (
          <tr key={item.id} className={UI_CLASSES.TABLE_ROW}>
            <td className={UI_CLASSES.TABLE_CELL}>{item.name}</td>
            <td className={UI_CLASSES.TABLE_CELL}>
              {item.minPrice}€ - {item.maxPrice}€
            </td>
            <td className={UI_CLASSES.TABLE_CELL}>{item.timeframe}</td>
            <td className={UI_CLASSES.TABLE_CELL}>
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => handleEditItem(item)}
                  className={UI_CLASSES.BUTTON_ICON}
                  title="Modifier"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className={UI_CLASSES.BUTTON_ICON + " text-red-500 hover:text-red-700"}
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        );
      
      case "subscriptions":
        return (
          <tr key={item.id} className={UI_CLASSES.TABLE_ROW}>
            <td className={UI_CLASSES.TABLE_CELL}>{item.name}</td>
            <td className={UI_CLASSES.TABLE_CELL}>{item.price}€/mois</td>
            <td className={UI_CLASSES.TABLE_CELL}>
              <div className="flex flex-wrap gap-1">
                {item.included?.map((service, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </td>
            <td className={UI_CLASSES.TABLE_CELL}>
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => handleEditItem(item)}
                  className={UI_CLASSES.BUTTON_ICON}
                  title="Modifier"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className={UI_CLASSES.BUTTON_ICON + " text-red-500 hover:text-red-700"}
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        );
      
      default:
        return null;
    }
  };

  // Rendu des en-têtes du tableau selon la catégorie
  const renderTableHeaders = () => {
    switch (category) {
      case "hourlyRates":
        return (
          <tr>
            <th className={UI_CLASSES.TABLE_HEADER}>Service</th>
            <th className={UI_CLASSES.TABLE_HEADER}>Taux horaire</th>
            <th className={UI_CLASSES.TABLE_HEADER}>Équivalent journalier</th>
            <th className={UI_CLASSES.TABLE_HEADER + " text-right"}>Actions</th>
          </tr>
        );
      
      case "packages":
        return (
          <tr>
            <th className={UI_CLASSES.TABLE_HEADER}>Type de projet</th>
            <th className={UI_CLASSES.TABLE_HEADER}>Fourchette de prix</th>
            <th className={UI_CLASSES.TABLE_HEADER}>Délai estimé</th>
            <th className={UI_CLASSES.TABLE_HEADER + " text-right"}>Actions</th>
          </tr>
        );
      
      case "subscriptions":
        return (
          <tr>
            <th className={UI_CLASSES.TABLE_HEADER}>Formule</th>
            <th className={UI_CLASSES.TABLE_HEADER}>Prix mensuel</th>
            <th className={UI_CLASSES.TABLE_HEADER}>Services inclus</th>
            <th className={UI_CLASSES.TABLE_HEADER + " text-right"}>Actions</th>
          </tr>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <h2 className={UI_CLASSES.HEADING_2}>{title}</h2>
        </div>
        
        <button
          onClick={handleAddItem}
          className={UI_CLASSES.BUTTON_PRIMARY + " flex items-center space-x-1"}
        >
          <PlusCircle size={18} />
          <span>Ajouter</span>
        </button>
      </div>
      
      <p className={UI_CLASSES.TEXT}>{description}</p>
      
      {/* Tableau des éléments */}
      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className={UI_CLASSES.TABLE}>
            <thead>
              {renderTableHeaders()}
            </thead>
            <tbody>
              {items.map(renderTableRow)}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={UI_CLASSES.CARD + " text-center py-8"}>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Aucun élément défini. Commencez par ajouter un nouveau tarif.
          </p>
          <button
            onClick={handleAddItem}
            className={UI_CLASSES.BUTTON_PRIMARY}
          >
            Ajouter un élément
          </button>
        </div>
      )}
      
      {/* Modal d'ajout/édition */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {modal.mode === "add" ? `Ajouter un ${category === "hourlyRates" ? "tarif horaire" : category === "packages" ? "forfait" : "abonnement"}` : 
                                        `Modifier ${modal.currentItem?.name || ""}`}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4">
              {renderModalContent()}
            </div>
            
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCloseModal}
                className={UI_CLASSES.BUTTON_SECONDARY}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveItem}
                className={UI_CLASSES.BUTTON_PRIMARY}
              >
                {modal.mode === "add" ? "Ajouter" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingEditor;
