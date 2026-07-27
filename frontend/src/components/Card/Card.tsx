import React from 'react';
import { Loader2, AlertTriangle, Inbox } from 'lucide-react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: boolean;
}

const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
  Loading: typeof CardLoading;
  Empty: typeof CardEmpty;
  Error: typeof CardError;
} = ({ 
  children, 
  className = '', 
  hover = false,
  glow = false,
  padding = false,
}) => {
  const baseStyles = 'bg-background-card border border-border rounded-2xl overflow-hidden';
  const hoverStyles = hover ? 'transition-all duration-300 hover:border-accent-blue hover:shadow-lg focus-within:border-accent-blue focus-within:shadow-lg' : '';
  const glowStyles = glow ? 'relative after:absolute after:top-0 after:right-0 after:w-24 after:h-24 after:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)] after:pointer-events-none' : '';
  const paddingStyles = padding ? 'p-5 sm:p-6' : '';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${glowStyles} ${paddingStyles} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`px-5 py-4 sm:px-6 sm:py-5 border-b border-border ${className}`}>
    {children}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`px-5 py-4 sm:px-6 sm:py-5 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`px-5 py-4 sm:px-6 sm:py-5 border-t border-border ${className}`}>
    {children}
  </div>
);

// Loading skeleton state
export interface CardLoadingProps {
  lines?: number;
  className?: string;
}

export const CardLoading: React.FC<CardLoadingProps> = ({ lines = 4, className = '' }) => (
  <Card className={className}>
    <div className="p-5 sm:p-6 space-y-4 animate-pulse" role="status" aria-label="Loading content">
      <div className="h-5 bg-background-elevated rounded-lg w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-background-elevated rounded-lg"
          style={{ width: `${85 - i * 10}%` }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  </Card>
);

// Empty state
export interface CardEmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardEmpty: React.FC<CardEmptyProps> = ({ 
  icon, 
  title, 
  description, 
  action,
  className = '' 
}) => (
  <Card className={className}>
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-background-elevated flex items-center justify-center mb-4 text-text-secondary">
        {icon ?? <Inbox size={28} />}
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-xs mb-5">{description}</p>
      )}
      {action}
    </div>
  </Card>
);

// Error state
export interface CardErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const CardError: React.FC<CardErrorProps> = ({ 
  title = 'Something went wrong', 
  message, 
  onRetry,
  className = '' 
}) => (
  <Card className={className}>
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-red-400" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary max-w-xs mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-semibold hover:bg-blue-600 transition-colors min-h-[44px]"
        >
          <Loader2 size={14} className="hidden group-loading:animate-spin" />
          Try again
        </button>
      )}
    </div>
  </Card>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Loading = CardLoading;
Card.Empty = CardEmpty;
Card.Error = CardError;

export default Card;
