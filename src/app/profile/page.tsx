'use client';

import React from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import UserProfileForm from '@/app/components/profile/UserProfileForm';
import Card from '@/app/components/common/Card';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="grid gap-6">
        {/* User Profile Card */}
        <div>
          <UserProfileForm />
        </div>
        
        {/* Account Information Card */}
        <Card title="Account Information">
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm text-gray-500">Account ID</h3>
                <p className="font-medium">{user?.id}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Account Type</h3>
                <p className="font-medium capitalize">{user?.role}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Created</h3>
                <p className="font-medium">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Last Login</h3>
                <p className="font-medium">
                  {user?.lastLogin 
                    ? new Date(user.lastLogin).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
