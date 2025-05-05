import { useState, useEffect } from 'react';

/**
 * Hook qui permet de déclencher une action après un délai d'inactivité
 * Utile pour limiter les appels API pendant que l'utilisateur tape
 * 
 * @param value La valeur à débouncer
 * @param delay Le délai en millisecondes
 * @returns La valeur après le délai d'inactivité
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Timer pour mettre à jour la valeur après le délai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
