"use client";
import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BusinessPlanData } from "../types";

interface ListManagerProps {
  section: keyof BusinessPlanData;
  field: string;
  items: string[];
  label: string;
  placeholder?: string;
  addListItem: (section: keyof BusinessPlanData, field: string) => void;
  removeListItem: (section: keyof BusinessPlanData, field: string, index: number) => void;
}

/**
 * Composant réutilisable pour gérer les listes (ajout/suppression d'éléments)
 * dans les différentes sections du business plan
 */
const ListManager: React.FC<ListManagerProps> = ({
  section,
  field,
  items,
  label,
  placeholder = "Ajouter un élément...",
  addListItem,
  removeListItem
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddClick = () => {
    setIsAdding(true);
    // Focus sur l'input après le rendu
    setTimeout(() => {
      const input = document.getElementById(`new-${section}-${field}`) as HTMLInputElement;
      if (input) input.focus();
    }, 50);
  };

  const handleAddItem = () => {
    addListItem(section, field);
    setIsAdding(false);
    // Effacer l'input après l'ajout
    const input = document.getElementById(`new-${section}-${field}`) as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddItem();
    } else if (e.key === "Escape") {
      setIsAdding(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{label}</h3>
        {!isAdding && (
          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded
                     text-indigo-700 bg-indigo-100 hover:bg-indigo-200
                     dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800
                     transition-colors"
            aria-label={`Ajouter un élément à ${label}`}
          >
            <Plus size={14} className="mr-1" />
            Ajouter
          </button>
        )}
      </div>

      {isAdding && (
        <div className="flex mb-3">
          <input
            id={`new-${section}-${field}`}
            type="text"
            placeholder={placeholder}
            className="flex-grow p-2 border border-gray-300 rounded-l-md
                     dark:border-gray-600 dark:bg-gray-700 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="px-4 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700
                     dark:bg-indigo-700 dark:hover:bg-indigo-800
                     transition-colors"
          >
            Ajouter
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="text-gray-500 dark:text-gray-400 italic">Aucun élément</li>
        ) : (
          items.map((item, index) => (
            <li 
              key={`${field}-${index}`}
              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 
                       border border-gray-200 dark:border-gray-700 rounded-md"
            >
              <span className="text-gray-800 dark:text-gray-200">{item}</span>
              <button
                type="button"
                onClick={() => removeListItem(section, field, index)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300
                         transition-colors"
                aria-label={`Supprimer ${item}`}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ListManager;
