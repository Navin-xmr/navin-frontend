import React, { useState } from 'react';
import { Camera, Save, CheckCircle2, Loader2, Link as LinkIcon, Bell, Building2 } from 'lucide-react';
import { WalletConnectButton } from '../../../../components/auth/WalletConnectButton/WalletConnectButton';
import './CompanySettings.css';

const CompanySettings: React.FC = () => {
  return (
    <div className="company-settings-container">
      <div className="settings-header">
        <h1>Company Settings</h1>
        <p>Manage your company profile, notifications, and connected wallets.</p>
      </div>
    </div>
  );
};

export default CompanySettings;
