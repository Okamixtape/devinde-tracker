import React, { useState, useRef, useEffect, ReactNode } from 'react';
import Link from 'next/link';

interface DropdownItem {
  id: string;
  label: React.ReactNode;
  onClick?: () => void;
  href?: string;
  icon?: ReactNode;
  active?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: string;
  className?: string;
}

/**
 * Composant réutilisable pour créer des menus déroulants
 * Peut être utilisé pour le profil, la navigation, ou d'autres menus
 */
const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'left',
  width = 'w-56',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="w-full cursor-pointer focus:outline-none" 
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>

      {isOpen && (
        <div 
          className="absolute mt-2 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          style={{
            width: width === 'w-56' ? '14rem' : width === 'w-64' ? '16rem' : '14rem',
            [align === 'left' ? 'left' : 'right']: 0
          }}
        >
          {items.map((item) => (
            item.href ? (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  flex items-center px-4 py-2 text-sm
                  ${item.active 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                `}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  }
                  setIsOpen(false);
                }}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                className={`
                  flex items-center w-full px-4 py-2 text-sm text-left
                  ${item.active 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                `}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  }
                  setIsOpen(false);
                }}
                type="button"
                role="menuitem"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
