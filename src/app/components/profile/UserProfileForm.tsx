'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import Select from '../common/Select';
import { AuthServiceImpl, UserData, UserPreferences } from '@/app/services/core/auth-service';
import { useToast } from '../error/ToastManager';
import { useAsyncHandler } from '@/app/hooks/useAsyncHandler';
import { useI18n } from '@/app/hooks/useI18n';

type ProfileTab = 'info' | 'password' | 'preferences';

const UserProfileForm: React.FC = () => {
  const { user } = useAuth();
  const authService = new AuthServiceImpl();
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [success, setSuccess] = useState<string | null>(null);
  const { showError } = useToast();
  const { t } = useI18n();

  // Form states
  const [profileData, setProfileData] = useState<Partial<UserData>>({
    name: '',
    email: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    notifications: true,
    language: 'en',
    dashboardLayout: 'default',
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Utilisation du hook useAsyncHandler pour les opérations asynchrones
  const { 
    execute: updateProfile,
    isLoading: isUpdatingProfile,
    error: updateProfileError
  } = useAsyncHandler(
    async (data: Partial<UserData>) => {
      return await authService.updateUserProfile(data);
    },
    {
      successMessage: t('profile.profileUpdated'),
      errorMessage: t('profile.errors.updateFailed')
    }
  );

  const { 
    execute: changePassword,
    isLoading: isChangingPassword,
    error: changePasswordError
  } = useAsyncHandler(
    async (currentPassword: string, newPassword: string) => {
      return await authService.changePassword(currentPassword, newPassword);
    },
    {
      successMessage: t('profile.passwordChanged'),
      errorMessage: t('profile.errors.passwordChangeFailed')
    }
  );

  const { 
    execute: updatePreferences,
    isLoading: isUpdatingPreferences,
    error: updatePreferencesError
  } = useAsyncHandler(
    async (prefs: UserPreferences) => {
      return await authService.updateUserPreferences(prefs);
    },
    {
      successMessage: t('profile.preferences.updateSuccess'),
      errorMessage: t('profile.preferences.updateFailed')
    }
  );

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    setSuccess(null);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (
    name: keyof UserPreferences, 
    value: string | boolean
  ) => {
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const validateProfileData = (): boolean => {
    if (profileData.email && !profileData.email.includes('@')) {
      showError(t('profile.validation.invalidEmail'));
      return false;
    }
    return true;
  };

  const validatePasswordData = (): boolean => {
    if (!passwordData.currentPassword) {
      showError(t('profile.validation.currentPasswordRequired'));
      return false;
    }
    
    if (passwordData.newPassword.length < 8) {
      showError(t('profile.validation.passwordLength'));
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError(t('profile.validation.passwordsDoNotMatch'));
      return false;
    }
    
    return true;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileData()) {
      return;
    }

    const result = await updateProfile(profileData);
    if (result) {
      setSuccess(t('profile.profileUpdated'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordData()) {
      return;
    }
    
    const result = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );
    
    if (result) {
      setSuccess(t('profile.passwordChanged'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await updatePreferences(preferences);
    if (result) {
      setSuccess(t('profile.preferences.updateSuccess'));
    }
  };

  if (!user) {
    return (
      <Card title={t('profile.title')}>
        <p className="text-center py-4">{t('profile.pleaseLogin')}</p>
      </Card>
    );
  }

  return (
    <Card title={t('profile.yourProfile')}>
      <div className="mb-4 border-b">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'info'
                  ? 'border-primary text-primary'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('info')}
            >
              {t('profile.personalInfo')}
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'password'
                  ? 'border-primary text-primary'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('password')}
            >
              {t('profile.changePassword')}
            </button>
          </li>
          <li>
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'preferences'
                  ? 'border-primary text-primary'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('preferences')}
            >
              {t('profile.preferencesPage')}
            </button>
          </li>
        </ul>
      </div>

      {/* Display errors and success messages */}
      {updateProfileError && activeTab === 'info' && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {updateProfileError.message || t('profile.errors.updateFailed')}
        </div>
      )}

      {changePasswordError && activeTab === 'password' && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {changePasswordError.message || t('profile.errors.passwordChangeFailed')}
        </div>
      )}

      {updatePreferencesError && activeTab === 'preferences' && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {updatePreferencesError.message || t('profile.preferences.updateFailed')}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {activeTab === 'info' && (
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <Input
              label={t('profile.fields.fullName')}
              type="text"
              name="name"
              value={profileData.name || ''}
              onChange={handleProfileChange}
              placeholder={t('profile.fields.fullNamePlaceholder')}
            />
          </div>
          <div className="mb-4">
            <Input
              label={t('profile.fields.email')}
              type="email"
              name="email"
              value={profileData.email || ''}
              onChange={handleProfileChange}
              placeholder={t('profile.fields.emailPlaceholder')}
            />
          </div>
          <div className="mt-6">
            <Button type="submit" variant="primary" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? t('common.buttons.updating') : t('profile.updateProfile')}
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword}>
          <div className="mb-4">
            <Input
              label={t('common.labels.currentPassword')}
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder={t('profile.fields.currentPasswordPlaceholder')}
            />
          </div>
          <div className="mb-4">
            <Input
              label={t('common.labels.newPassword')}
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder={t('profile.fields.newPasswordPlaceholder')}
            />
          </div>
          <div className="mb-4">
            <Input
              label={t('common.labels.confirmPassword')}
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder={t('profile.fields.confirmPasswordPlaceholder')}
            />
          </div>
          <div className="mt-6">
            <Button type="submit" variant="primary" disabled={isChangingPassword}>
              {isChangingPassword ? t('profile.changingPassword') : t('profile.changePassword')}
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'preferences' && (
        <form onSubmit={handleUpdatePreferences}>
          <div className="mb-4">
            <Select
              label={t('profile.preferences.theme')}
              name="theme"
              value={preferences.theme || 'light'}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              options={[
                { value: 'light', label: t('profile.preferences.themes.light') },
                { value: 'dark', label: t('profile.preferences.themes.dark') },
              ]}
            />
          </div>
          <div className="mb-4">
            <Select
              label={t('common.labels.language')}
              name="language"
              value={preferences.language || 'en'}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              options={[
                { value: 'en', label: t('common.languages.en') },
                { value: 'fr', label: t('common.languages.fr') },
              ]}
            />
          </div>
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                name="notifications"
                checked={preferences.notifications}
                onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notifications" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                {t('profile.preferences.enableNotifications')}
              </label>
            </div>
          </div>
          <div className="mb-4">
            <Select
              label={t('profile.preferences.dashboardLayout')}
              name="dashboardLayout"
              value={preferences.dashboardLayout || 'default'}
              onChange={(e) => handlePreferenceChange('dashboardLayout', e.target.value)}
              options={[
                { value: 'default', label: t('profile.preferences.layouts.default') },
                { value: 'compact', label: t('profile.preferences.layouts.compact') },
                { value: 'wide', label: t('profile.preferences.layouts.wide') },
              ]}
            />
          </div>
          <div className="mt-6">
            <Button type="submit" variant="primary" disabled={isUpdatingPreferences}>
              {isUpdatingPreferences ? t('common.buttons.saving') : t('common.buttons.save')}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default UserProfileForm;
