import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@context/AuthContext';
import CustomerProfile from '@pages/dashboard/Customer/Profile/CustomerProfile';

export interface ProfileDispatcherProps {}

export const ProfileDispatcher: React.FC<ProfileDispatcherProps> = () => {
  const { role } = useAuthContext();

  if (role === 'company') {
    return <Navigate to="/dashboard/settings?tab=profile" replace />;
  }

  return <CustomerProfile />;
};

export default ProfileDispatcher;
