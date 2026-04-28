export type StatusBadgeStatus =
  | 'In Transit'
  | 'Delivered'
  | 'Pending'
  | 'Delayed'
  | 'Failed'
  | string;

interface BadgeVariant {
  bg: string;
  text: string;
}

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  'In Transit': {
    bg: 'bg-accent-blue/10',
    text: 'text-blue-400',
  },
  Delivered: {
    bg: 'bg-accent-green/10',
    text: 'text-green-400',
  },
  Pending: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
  },
  Delayed: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
  },
  Failed: {
    bg: 'bg-accent-red/10',
    text: 'text-red-400',
  },
};

const NEUTRAL: BadgeVariant = {
  bg: 'bg-text-secondary/10',
  text: 'text-text-secondary',
};

export function getStatusVariant(status: string): BadgeVariant {
  return STATUS_VARIANTS[status] ?? NEUTRAL;
}
