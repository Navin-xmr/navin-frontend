import React from 'react';
import { CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import type { AutosaveStatus } from '@hooks/useFormAutosave';

export interface AutosaveBannerProps {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  className?: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * AutosaveBanner
 *
 * A compact, accessible status indicator for multi-step form autosave.
 * Renders inline (not a toast) so it stays visible as users move between steps.
 */
const AutosaveBanner: React.FC<AutosaveBannerProps> = ({ status, lastSavedAt, className = '' }) => {
  const config: Record<
    AutosaveStatus,
    { icon: React.ReactNode; text: string; classes: string }
  > = {
    idle: {
      icon: <Clock size={13} />,
      text: lastSavedAt ? `Last saved at ${formatTime(lastSavedAt)}` : 'Changes will be autosaved',
      classes: 'text-text-secondary',
    },
    saving: {
      icon: <Loader2 size={13} className="animate-spin" />,
      text: 'Saving…',
      classes: 'text-accent-blue',
    },
    saved: {
      icon: <CheckCircle size={13} />,
      text: lastSavedAt ? `Saved at ${formatTime(lastSavedAt)}` : 'Saved',
      classes: 'text-accent-green',
    },
    error: {
      icon: <AlertCircle size={13} />,
      text: 'Could not save — check your browser storage settings',
      classes: 'text-accent-red',
    },
  };

  const { icon, text, classes } = config[status];

  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`inline-flex items-center gap-1.5 text-xs font-medium select-none ${classes} ${className}`}
    >
      {icon}
      <span>{text}</span>
    </span>
  );
};

export default AutosaveBanner;
