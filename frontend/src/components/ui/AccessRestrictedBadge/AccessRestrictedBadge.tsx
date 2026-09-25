import React from 'react';
import { Lock } from 'lucide-react';

export interface AccessRestrictedBadgeProps {
  reason?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'block' | 'tooltip';
}

const AccessRestrictedBadge: React.FC<AccessRestrictedBadgeProps> = ({
  reason = 'This action is restricted to your account role',
  size = 'md',
  variant = 'inline',
}) => {
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (variant === 'block') {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-border bg-background-card gap-3">
        <Lock className={`${iconSizes[size]} text-text-secondary/50`} />
        <div className="text-center">
          <p className="text-sm font-medium text-text-secondary mb-1">Access Restricted</p>
          <p className="text-xs text-text-secondary/70">{reason}</p>
        </div>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-border/20 text-text-secondary text-xs font-medium border border-border/50 cursor-help`}
      title={reason}
    >
      <Lock className="w-3 h-3" />
      Restricted
    </span>
  );
};

export default AccessRestrictedBadge;
