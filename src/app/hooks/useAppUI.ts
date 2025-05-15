'use client';

import { useAppState } from '@/app/contexts/AppStateContext';
import { useCallback, useEffect } from 'react';
import { Section } from '@/app/services/interfaces/service-interfaces';

/**
 * Hook for interacting with UI state through the global state
 * Provides methods to manage UI state like sections, theme, navigation
 */
export function useAppUI() {
  const { state, dispatch } = useAppState();

  // Set up theme from local storage and system preference
  useEffect(() => {
    // Check for saved preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      if (!state.ui.darkMode) {
        dispatch({ type: 'TOGGLE_DARK_MODE' });
      }
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.ui.darkMode, dispatch]);

  /**
   * Toggle dark/light mode
   */
  const toggleDarkMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
    
    // Update localStorage and document class
    if (!state.ui.darkMode) {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  }, [state.ui.darkMode, dispatch]);

  /**
   * Toggle navigation expanded/collapsed state
   */
  const toggleNavigation = useCallback(() => {
    dispatch({ type: 'TOGGLE_NAVIGATION' });
  }, [dispatch]);

  /**
   * Set the active section
   */
  const setActiveSection = useCallback((sectionId: string) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: sectionId });
  }, [dispatch]);

  /**
   * Get sections for the current navigation state
   */
  const getNavigationSections = useCallback((): Section[] => {
    // Filter and sort sections for navigation
    return state.sections
      .filter(section => section.key !== 'settings' && section.key !== 'help')
      .sort((a, b) => a.order - b.order);
  }, [state.sections]);

  /**
   * Get utility sections (settings, help, etc.)
   */
  const getUtilitySections = useCallback((): Section[] => {
    // Filter for utility sections
    return state.sections
      .filter(section => section.key === 'settings' || section.key === 'help')
      .sort((a, b) => a.order - b.order);
  }, [state.sections]);

  /**
   * Check if a section is active
   */
  const isSectionActive = useCallback((sectionId: string): boolean => {
    return state.ui.activeSection === sectionId;
  }, [state.ui.activeSection]);

  return {
    // State
    darkMode: state.ui.darkMode,
    navigationCollapsed: state.ui.navigationCollapsed,
    activeSection: state.ui.activeSection,
    
    // Actions
    toggleDarkMode,
    toggleNavigation,
    setActiveSection,
    
    // Data access
    getNavigationSections,
    getUtilitySections,
    isSectionActive
  };
}

export default useAppUI;