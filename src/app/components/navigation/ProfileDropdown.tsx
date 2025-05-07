import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronDown, FiUser, FiLogOut } from 'react-icons/fi';
import { UserData } from '@/app/services/core/authService';

interface ProfileDropdownProps {
  user: UserData | null;
  onLogout: () => Promise<void>;
}

/**
 * Composant de menu déroulant pour le profil utilisateur
 * Affiche le nom de l'utilisateur et permet d'accéder aux fonctionnalités du profil
 */
const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
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

  const handleLogout = async () => {
    await onLogout();
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">
          {user?.name || user?.email}
        </span>
        <FiChevronDown 
          className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
          <Link
            href="/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <FiUser className="mr-2" />
            Profil
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiLogOut className="mr-2" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
