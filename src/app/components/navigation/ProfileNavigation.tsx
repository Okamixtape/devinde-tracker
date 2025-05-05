import React from 'react';
import { FiChevronDown, FiUser, FiLogOut } from 'react-icons/fi';
import { UserData } from '../../services/core/auth-service';
import Dropdown from '../common/Dropdown';

interface ProfileNavigationProps {
  user: UserData | null;
  onLogout: () => Promise<void>;
}

/**
 * Composant de navigation pour le profil utilisateur
 * Utilise le composant Dropdown réutilisable
 */
const ProfileNavigation: React.FC<ProfileNavigationProps> = ({ user, onLogout }) => {
  // Définition des options du profil
  const profileItems = [
    { 
      id: 'profile', 
      label: 'Profil', 
      href: '/profile', 
      icon: <FiUser />
    },
    { 
      id: 'logout', 
      label: 'Déconnexion', 
      onClick: () => onLogout(),
      icon: <FiLogOut />
    }
  ];

  // Composant trigger pour le dropdown
  const trigger = (
    <div className="flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-700">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">
        {user?.name || user?.email}
      </span>
      <FiChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
    </div>
  );

  return (
    <Dropdown 
      trigger={trigger} 
      items={profileItems}
      align="right"
      width="w-48" 
      className="z-50"
    />
  );
};

export default ProfileNavigation;
