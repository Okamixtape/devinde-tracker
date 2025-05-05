'use client';

import React, { Fragment, ReactNode, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  showCloseButton?: boolean;
}

/**
 * Composant Modal
 * 
 * Une fenêtre modale réutilisable qui s'affiche par-dessus le contenu principal.
 * 
 * @example
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Titre de la modale"
 *   footer={<Button onClick={() => setIsOpen(false)}>Fermer</Button>}
 * >
 *   Contenu de la modale
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  className,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (closeOnEsc && isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    
    // Bloquer le défilement du body quand la modale est ouverte
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEsc]);
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };
  
  const modalClassName = twMerge(
    'fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50',
    className
  );
  
  const contentClassNames = twMerge(
    'bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col w-full',
    sizeStyles[size],
    contentClassName
  );
  
  const headerClassNames = twMerge(
    'flex items-center justify-between p-4 border-b',
    headerClassName
  );
  
  const bodyClassNames = twMerge(
    'p-4 overflow-auto',
    bodyClassName
  );
  
  const footerClassNames = twMerge(
    'p-4 border-t flex items-center justify-end space-x-3',
    footerClassName
  );
  
  return (
    <div className={modalClassName} onClick={handleBackdropClick} aria-modal="true" role="dialog">
      <div className={contentClassNames} ref={modalRef}>
        {title && (
          <div className={headerClassNames}>
            <h3 className="text-lg font-medium text-gray-900">
              {title}
            </h3>
            
            {showCloseButton && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
                aria-label="Fermer"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        <div className={bodyClassNames}>
          {children}
        </div>
        
        {footer && (
          <div className={footerClassNames}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
