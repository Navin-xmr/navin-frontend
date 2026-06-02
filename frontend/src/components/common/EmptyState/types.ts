import React from 'react';

export interface EmptyStateCTA {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  cta?: EmptyStateCTA;
  className?: string;
}
