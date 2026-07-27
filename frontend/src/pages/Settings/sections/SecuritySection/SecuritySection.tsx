import React from 'react';
import ChangePasswordForm from './ChangePasswordForm';
import TwoFactorSetup from './TwoFactorSetup';
import SessionList from './SessionList';

const SecuritySection: React.FC = () => (
  <div className="space-y-10">
    <h2 className="text-lg font-semibold">Security</h2>
    <ChangePasswordForm />
    <hr className="border-[rgba(98,255,255,0.1)]" />
    <TwoFactorSetup />
    <hr className="border-[rgba(98,255,255,0.1)]" />
    <SessionList />
  </div>
);

export default SecuritySection;
