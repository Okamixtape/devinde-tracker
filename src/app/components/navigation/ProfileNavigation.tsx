import React from 'react';
import { FiChevronDown, FiUser, FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { UserData } from '../../services/core/auth-service';
import Dropdown from '../common/Dropdown';
import { useI18n } from '../../hooks/useI18n';

interface ProfileNavigationProps {
  user: UserData | null;
  onLogout: () => Promise<void>;
}

/**
 * Composant de navigation pour le profil utilisateur
 * Utilise le composant Dropdown réutilisable
 * Affiche des options différentes selon l'état d'authentification
 */
const ProfileNavigation: React.FC<ProfileNavigationProps> = ({ user, onLogout }) => {
  const { t } = useI18n();
  const isAuthenticated = !!user;

  // Définition des options du profil en fonction de l'état d'authentification
  const profileItems = isAuthenticated
    ? [
        { 
          id: 'profile', 
          label: t('profile.title'), 
          href: '/profile', 
          icon: <FiUser />
        },
        { 
          id: 'logout', 
          label: t('auth.logout'), 
          onClick: () => onLogout(),
          icon: <FiLogOut />
        }
      ]
    : [
        { 
          id: 'login', 
          label: t('auth.login'), 
          href: '/login', 
          icon: <FiLogIn />
        },
        { 
          id: 'register', 
          label: t('auth.register'), 
          href: '/register', 
          icon: <FiUserPlus />
        }
      ];

  // Composant trigger pour le dropdown, adapté selon l'état d'authentification
  const trigger = (
    <div className="flex items-center rounded-full border border-blue-600 bg-blue-700/30 hover:bg-blue-700/50 px-3 py-1 transition-colors duration-150 ease-in-out">
      <span className="text-sm font-medium text-white mr-1">
        {isAuthenticated 
          ? (user?.name || user?.email?.split('@')[0]) 
          : t('auth.account')}
      </span>
      <FiChevronDown className="h-4 w-4 text-blue-300" />
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
