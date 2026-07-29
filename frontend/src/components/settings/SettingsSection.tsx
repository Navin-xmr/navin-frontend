import React from 'react';

export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, children, className }) => {
  return (
    <div className={`space-y-4${className ? ` ${className}` : ''}`}>
      <div className="border-b border-[#1E2433] pb-4 mb-6">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default SettingsSection;
