import React from 'react';
import {
  Truck,
  Package,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type MilestoneEventType =
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'CUSTOMS'
  | 'DELIVERED'
  | 'DELAYED';

export type MilestoneStatus = 'completed' | 'active' | 'pending';

export interface TimelineMilestone {
  id: string;
  eventType: MilestoneEventType;
  /** Human-readable event name, e.g. "Picked up by carrier". */
  name: string;
  /** Pre-formatted timestamp string. */
  timestamp: string;
  location?: string;
  status: MilestoneStatus;
  /** Stellar transaction hash backing this milestone, if it has been anchored on-chain. */
  txHash?: string;
}

export interface MilestoneTimelineProps {
  milestones: TimelineMilestone[];
  className?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STELLAR_EXPERT_TX_BASE = 'https://stellar.expert/explorer/public/tx';

const EVENT_ICONS: Record<MilestoneEventType, LucideIcon> = {
  PICKED_UP: Truck,
  IN_TRANSIT: Package,
  CUSTOMS: FileCheck,
  DELIVERED: CheckCircle,
  DELAYED: AlertTriangle,
};

/** Colour applied to a node + its connector once a milestone is completed/active. */
const EVENT_COLORS: Record<MilestoneEventType, string> = {
  PICKED_UP: 'text-cyan-400',
  IN_TRANSIT: 'text-primary',
  CUSTOMS: 'text-purple-400',
  DELIVERED: 'text-emerald-400',
  DELAYED: 'text-amber-400',
};

const CONNECTOR_COLORS: Record<MilestoneEventType, string> = {
  PICKED_UP: 'bg-cyan-400',
  IN_TRANSIT: 'bg-primary',
  CUSTOMS: 'bg-purple-400',
  DELIVERED: 'bg-emerald-400',
  DELAYED: 'bg-amber-400',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function truncateHash(hash: string, chars = 6): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}…${hash.slice(-chars)}`;
}

// ─── Node ───────────────────────────────────────────────────────────────────

interface NodeProps {
  milestone: TimelineMilestone;
  isLast: boolean;
}

function MilestoneNode({ milestone, isLast }: NodeProps) {
  const Icon = EVENT_ICONS[milestone.eventType] ?? Package;
  const accent = EVENT_COLORS[milestone.eventType];
  const connector = CONNECTOR_COLORS[milestone.eventType];

  const isCompleted = milestone.status === 'completed';
  const isActive = milestone.status === 'active';
  const isPending = milestone.status === 'pending';

  return (
    <li className="flex gap-4" role="listitem">
      {/* Marker column */}
      <div className="flex flex-col items-center shrink-0">
        <div className="relative flex items-center justify-center w-10 h-10">
          {/* Pulsing ring for the active milestone */}
          {isActive && (
            <span
              className={`absolute inset-0 rounded-full ${connector} opacity-60 animate-ping`}
              aria-hidden="true"
            />
          )}
          <span
            className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
              isCompleted || isActive
                ? `${accent} border-current ${
                    isCompleted ? 'bg-current/15' : 'bg-current/25'
                  }`
                : 'text-text-secondary border-dashed border-current bg-transparent'
            }`}
          >
            <Icon size={18} className={isPending ? 'text-text-secondary' : accent} />
          </span>
        </div>

        {/* Connector */}
        {!isLast && (
          <span
            className={`w-0.5 grow min-h-[2.5rem] my-1 ${
              isCompleted
                ? connector
                : 'bg-[repeating-linear-gradient(to_bottom,currentColor_0,currentColor_4px,transparent_4px,transparent_8px)] text-text-secondary/40'
            }`}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content */}
      <div className={`grow ${isLast ? 'pb-0' : 'pb-8'}`}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3
            className={`text-base font-semibold leading-tight ${
              isPending ? 'text-text-secondary' : 'text-text-primary'
            }`}
          >
            {milestone.name}
          </h3>
          {isActive && (
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${accent}`}>
              In progress
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-text-secondary">{milestone.timestamp}</p>
        {milestone.location && (
          <p className="text-sm text-text-secondary">{milestone.location}</p>
        )}

        {/* Blockchain verification badge */}
        {milestone.txHash && (
          <a
            href={`${STELLAR_EXPERT_TX_BASE}/${milestone.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium transition-colors hover:border-emerald-400/60 hover:bg-emerald-500/20"
            aria-label={`Blockchain verified — view transaction ${milestone.txHash} on Stellar Expert`}
            title={milestone.txHash}
          >
            <CheckCircle size={12} />
            <span className="font-mono">{truncateHash(milestone.txHash)}</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </li>
  );
}

// ─── Timeline ───────────────────────────────────────────────────────────────

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  className = '',
}) => {
  if (milestones.length === 0) {
    return (
      <p className="text-sm text-text-secondary text-center py-8">
        No milestones recorded yet.
      </p>
    );
  }

  return (
    <ol
      className={`flex flex-col w-full max-w-[640px] mx-auto ${className}`}
      role="list"
      aria-label="Shipment milestone timeline"
    >
      {milestones.map((milestone, index) => (
        <MilestoneNode
          key={milestone.id}
          milestone={milestone}
          isLast={index === milestones.length - 1}
        />
      ))}
    </ol>
  );
};

export default MilestoneTimeline;
