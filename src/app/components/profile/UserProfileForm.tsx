'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import Select from '../common/Select';
import { AuthServiceImpl, UserData, UserPreferences } from '@/app/services/core/auth-service';
import { toast } from 'react-hot-toast';

type ProfileTab = 'info' | 'password' | 'preferences';

const UserProfileForm: React.FC = () => {
  const { user } = useAuth();
  const authService = new AuthServiceImpl();
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    setError(null);
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

  const validateProfileData = () => {
    if (profileData.email && !profileData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validatePasswordData = () => {
    if (!passwordData.currentPassword) {
      setError('Current password is required');
      return false;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileData()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await authService.updateUserProfile(profileData);
      
      if (result.success) {
        setSuccess('Profile updated successfully');
        toast.success('Profile updated successfully');
      } else {
        setError(result.error?.message || 'Failed to update profile');
        toast.error(result.error?.message || 'Failed to update profile');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordData()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        setSuccess('Password changed successfully');
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(result.error?.message || 'Failed to change password');
        toast.error(result.error?.message || 'Failed to change password');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await authService.updateUserPreferences(preferences);
      
      if (result.success) {
        setSuccess('Preferences updated successfully');
        toast.success('Preferences updated successfully');
      } else {
        setError(result.error?.message || 'Failed to update preferences');
        toast.error(result.error?.message || 'Failed to update preferences');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card title="Profile">
        <p className="text-center py-4">Please log in to view your profile.</p>
      </Card>
    );
  }

  return (
    <Card title="Your Profile">
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
              Personal Information
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
              Change Password
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
              Preferences
            </button>
          </li>
        </ul>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
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
              label="Full Name"
              type="text"
              name="name"
              value={profileData.name || ''}
              onChange={handleProfileChange}
              placeholder="Your full name"
            />
          </div>
          <div className="mb-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={profileData.email || ''}
              onChange={handleProfileChange}
              placeholder="Your email address"
            />
          </div>
          <div className="mt-6">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword}>
          <div className="mb-4">
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Your current password"
            />
          </div>
          <div className="mb-4">
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="New password"
            />
          </div>
          <div className="mb-4">
            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
            />
          </div>
          <div className="mt-6">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'preferences' && (
        <form onSubmit={handleUpdatePreferences}>
          <div className="mb-4">
            <Select
              label="Theme"
              name="theme"
              value={preferences.theme || 'light'}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </div>
          <div className="mb-4">
            <Select
              label="Language"
              name="language"
              value={preferences.language || 'en'}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'Français' },
                { value: 'es', label: 'Español' },
              ]}
            />
          </div>
          <div className="mb-4">
            <Select
              label="Dashboard Layout"
              name="dashboardLayout"
              value={preferences.dashboardLayout || 'default'}
              onChange={(e) => handlePreferenceChange('dashboardLayout', e.target.value)}
              options={[
                { value: 'default', label: 'Default' },
                { value: 'compact', label: 'Compact' },
                { value: 'expanded', label: 'Expanded' },
              ]}
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!!preferences.notifications}
                onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Enable Notifications</span>
            </label>
          </div>
          <div className="mt-6">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default UserProfileForm;
