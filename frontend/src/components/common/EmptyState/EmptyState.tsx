import React from 'react';
import Button from '@components/Button';
import type { EmptyStateProps } from './types';

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  cta,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-16 px-6 text-center ${className}`}
    >
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background-elevated border border-border text-text-secondary">
          {icon}
        </div>
      )}

      <div className="flex flex-col gap-2 max-w-sm">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && (
          <p className="text-sm text-text-secondary">{description}</p>
        )}
      </div>

      {cta && (
        <Button variant="primary" size="md" onClick={cta.onClick}>
          {cta.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
export type { EmptyStateProps } from './types';
