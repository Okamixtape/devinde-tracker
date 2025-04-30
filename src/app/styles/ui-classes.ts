// Définitions de classes utilitaires Tailwind réutilisables pour l'ensemble de l'application
// Ces classes assurent la cohérence visuelle entre les composants et garantissent
// une bonne lisibilité dans les modes clair et sombre

export const UI_CLASSES = {
  // Conteneurs et cartes
  CARD: "bg-white dark:bg-gray-800 rounded-lg shadow p-4",
  CARD_HIGHLIGHT: "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4",
  CONTAINER: "p-4 sm:p-6",
  
  // Textes et typographie
  HEADING_1: "text-2xl font-bold text-gray-900 dark:text-white mb-4",
  HEADING_2: "text-xl font-semibold text-gray-800 dark:text-white mb-3",
  HEADING_3: "text-lg font-semibold text-gray-800 dark:text-white mb-2",
  HEADING_4: "text-base font-medium text-gray-800 dark:text-white mb-2",
  TEXT: "text-gray-700 dark:text-gray-300 select-text",
  TEXT_SMALL: "text-sm text-gray-600 dark:text-gray-400 select-text",
  TEXT_HIGHLIGHT: "text-blue-700 dark:text-blue-300 select-text",
  
  // Tableaux
  TABLE: "w-full border-collapse",
  TABLE_HEADER: "bg-gray-100 dark:bg-gray-700 text-left text-gray-800 dark:text-gray-200 select-text p-3",
  TABLE_ROW: "border-b border-gray-200 dark:border-gray-700",
  TABLE_CELL: "p-3 text-gray-700 dark:text-gray-300 select-text",
  TABLE_CELL_HIGHLIGHT: "p-3 text-blue-600 dark:text-blue-300 font-medium select-text",
  
  // Boutons
  BUTTON_PRIMARY: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium",
  BUTTON_SECONDARY: "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md font-medium",
  BUTTON_DANGER: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium",
  BUTTON_ICON: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded",
  
  // Formulaires
  INPUT: "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500",
  LABEL: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
  
  // Badge et indicateurs
  BADGE: "px-2 py-1 text-xs font-medium rounded-full",
  BADGE_SUCCESS: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  BADGE_WARNING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
  BADGE_INFO: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  
  // Sélection de texte (garantit que la sélection est toujours lisible)
  SELECTABLE: "select-text"
};
