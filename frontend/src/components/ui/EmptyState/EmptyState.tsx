import React from 'react';
import Button from '@components/Button';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

// ── Icons ────────────────────────────────────────────────────────────────────

const NoShipmentsIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-8 h-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3H8l-2 4h12l-2-4z" />
  </svg>
);

const NoResultsIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-8 h-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6M15 9l-6 6" />
  </svg>
);

const NoPaymentsIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-8 h-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 15h4" />
  </svg>
);

const NoNotificationsIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-8 h-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

const EmptyState: React.FC<EmptyStateProps> & {
  NoShipments: React.FC<Partial<EmptyStateProps>>;
  NoResults: React.FC<Partial<EmptyStateProps>>;
  NoPayments: React.FC<Partial<EmptyStateProps>>;
  NoNotifications: React.FC<Partial<EmptyStateProps>>;
} = ({ icon, title, description, action, className = '' }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-16 px-6 text-center ${className}`}
      role="status"
      aria-label={title}
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
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

// ── Preset variants ───────────────────────────────────────────────────────────

EmptyState.NoShipments = (props) => (
  <EmptyState
    icon={NoShipmentsIcon}
    title="No shipments found"
    description="You don't have any shipments yet. Create one to get started."
    {...props}
  />
);
EmptyState.NoShipments.displayName = 'EmptyState.NoShipments';

EmptyState.NoResults = (props) => (
  <EmptyState
    icon={NoResultsIcon}
    title="No results found"
    description="Try adjusting your search or filter criteria."
    {...props}
  />
);
EmptyState.NoResults.displayName = 'EmptyState.NoResults';

EmptyState.NoPayments = (props) => (
  <EmptyState
    icon={NoPaymentsIcon}
    title="No payments found"
    description="There are no payment records to display right now."
    {...props}
  />
);
EmptyState.NoPayments.displayName = 'EmptyState.NoPayments';

EmptyState.NoNotifications = (props) => (
  <EmptyState
    icon={NoNotificationsIcon}
    title="No notifications"
    description="You're all caught up! Check back later for updates."
    {...props}
  />
);
EmptyState.NoNotifications.displayName = 'EmptyState.NoNotifications';

export default EmptyState;
