import React from 'react';
import { AlertCircle, Lock } from 'lucide-react';

export interface RoleAccessInfoProps {
  hasAccess: boolean;
  action: string;
  requiredRole?: string;
  userRole?: string;
  children?: React.ReactNode;
  className?: string;
}

const RoleAccessInfo: React.FC<RoleAccessInfoProps> = ({
  hasAccess,
  action,
  requiredRole = 'Company Account',
  userRole,
  children,
  className = '',
}) => {
  if (hasAccess) {
    return children ? <>{children}</> : null;
  }

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-lg border border-border/50 bg-background-card/50 backdrop-blur-sm ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-text-secondary/60 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Limited Access</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            <span className="font-medium">{action}</span> is only available to {requiredRole} users.
            {userRole && <span> You're currently logged in as a {userRole}.</span>}
          </p>
        </div>
        <Lock className="w-4 h-4 text-text-secondary/40 shrink-0" aria-hidden="true" />
      </div>
      {children && (
        <div className="text-xs text-text-secondary/70 pt-2 border-t border-border/30">
          {children}
        </div>
      )}
    </div>
  );
};

export default RoleAccessInfo;
