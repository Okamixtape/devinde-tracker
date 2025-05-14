import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Composant d'en-tête de page standardisé
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, description, children }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
