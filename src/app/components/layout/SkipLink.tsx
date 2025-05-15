'use client';

import React from 'react';

/**
 * SkipLink - Lien d'accessibilité pour sauter au contenu principal
 * 
 * Ce composant permet aux utilisateurs de clavier de sauter la navigation
 * et d'accéder directement au contenu principal pour une meilleure accessibilité
 */
const SkipLink: React.FC = () => {
  return (
    <a 
      href="#main-content"
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50
        bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white
      "
    >
      Aller au contenu principal
    </a>
  );
};

export default SkipLink;