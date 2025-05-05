import React, { useCallback, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useToast } from '../../components/error/ToastManager';
import Dropdown from './Dropdown';

/**
 * Composant de sélection de langue permettant aux utilisateurs de changer la langue de l'application
 */
const LanguageSelector: React.FC = () => {
  const { locale, changeLocale, getAvailableLocales, t, isLoading } = useI18n();
  const { showSuccess, showError } = useToast();
  const [isChanging, setIsChanging] = useState(false);

  // Gérer le changement de langue
  const handleLanguageChange = useCallback(async (selectedLocale: string) => {
    if (selectedLocale === locale || isChanging) return;
    
    setIsChanging(true);
    try {
      const success = await changeLocale(selectedLocale);
      if (success) {
        showSuccess(
          t('settings.languageChanged', { fallback: 'Langue modifiée avec succès' })
        );
      } else {
        showError(
          t('settings.languageChangeFailed', { fallback: 'Échec de changement de langue' })
        );
      }
    } catch {
      showError(
        t('settings.languageChangeFailed', { fallback: 'Échec de changement de langue' })
      );
    } finally {
      setIsChanging(false);
    }
  }, [locale, isChanging, changeLocale, showSuccess, showError, t]);

  // Préparation des options de langue pour le dropdown
  const dropdownItems = getAvailableLocales().map((code) => ({
    id: code,
    label: t(`common.languages.${code}`),
    active: code === locale,
    onClick: () => handleLanguageChange(code)
  }));

  // Style conditionnel en fonction de l'état de chargement
  const buttonClassNames = `
    inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
    ${isLoading || isChanging ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
    border border-gray-300 dark:border-gray-600
    bg-white dark:bg-gray-800
    text-gray-700 dark:text-gray-200
  `;

  // Création du trigger personnalisé pour le dropdown
  const trigger = (
    <div className={buttonClassNames}>
      <span>{t(`common.languages.${locale}`)}</span>
      <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
      {(isLoading || isChanging) && (
        <div className="ml-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
  );

  return (
    <div className="relative inline-block">
      <Dropdown
        trigger={trigger}
        items={dropdownItems}
        align="right"
        width="w-32"
        className=""
      />
    </div>
  );
};

export default LanguageSelector;
