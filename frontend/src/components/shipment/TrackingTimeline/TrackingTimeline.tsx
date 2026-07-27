import React from 'react';
import { Truck, Package, FileCheck, CheckCircle, AlertTriangle, Clock, MapPin } from 'lucide-react';

export interface Milestone {
  id: string;
  name: string;
  timestamp: string;
  location: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface TrackingTimelineProps {
  milestones: Milestone[];
}

function getMilestoneIcon(name: string, status: Milestone['status']) {
  const upper = name.toUpperCase();
  const sizeClass = 'w-4 h-4';
  const iconProps = { className: sizeClass };

  let Icon = Package;
  if (upper.includes('PICK') || upper.includes('CARRIER')) Icon = Truck;
  else if (upper.includes('CUSTOMS')) Icon = FileCheck;
  else if (upper.includes('DELIVER')) Icon = CheckCircle;
  else if (upper.includes('DELAY')) Icon = AlertTriangle;

  if (status === 'upcoming') return <Icon {...iconProps} />;
  return <Icon {...iconProps} />;
}

const STATUS_CONFIG = {
  completed: {
    ring: 'bg-accent-blue border-accent-blue shadow-[0_0_10px_rgba(59,130,246,0.4)]',
    icon: 'text-white',
    connector: 'bg-accent-blue shadow-[0_0_6px_rgba(59,130,246,0.3)]',
    card: 'border-accent-blue/20 bg-accent-blue/5',
    label: 'text-text-primary',
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    badgeText: 'Completed',
  },
  current: {
    ring: 'bg-primary border-primary shadow-[0_0_16px_rgba(0,217,255,0.5)]',
    icon: 'text-[#07090d]',
    connector: 'connector-dashed',
    card: 'border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(0,217,255,0.08)]',
    label: 'text-text-primary',
    badge: 'bg-primary/20 text-primary border border-primary/40 animate-pulse',
    badgeText: 'Live',
  },
  upcoming: {
    ring: 'bg-transparent border-text-secondary/25',
    icon: 'text-text-secondary/40',
    connector: 'connector-dashed',
    card: 'border-transparent bg-transparent',
    label: 'text-text-secondary/60',
    badge: '',
    badgeText: '',
  },
};

const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ milestones }) => {
  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const progressPercent = milestones.length > 1
    ? Math.round((completedCount / (milestones.length - 1)) * 100)
    : 0;

  return (
    <div
      className="flex flex-col p-6 sm:p-4 max-w-[700px] w-full bg-background-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl"
      role="list"
      aria-label="Shipment tracking timeline"
    >
      {/* Step progress bar */}
      <div className="mb-6" aria-label={`Shipment progress: ${progressPercent}%`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Journey Progress
          </span>
          <span className="text-xs font-bold text-primary tabular-nums">
            {completedCount}/{milestones.length - 1} steps
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-blue to-primary transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Step dots row */}
        <div className="flex items-center justify-between mt-2 px-0.5">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                m.status === 'completed'
                  ? 'bg-accent-blue'
                  : m.status === 'current'
                  ? 'bg-primary shadow-[0_0_6px_rgba(0,217,255,0.6)] scale-125'
                  : 'bg-white/15'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Timeline items */}
      {milestones.map((milestone, index) => {
        const cfg = STATUS_CONFIG[milestone.status];
        const isLast = index === milestones.length - 1;

        return (
          <div
            key={milestone.id}
            className={`flex gap-4 relative group transition-all duration-300 ${
              milestone.status === 'upcoming' ? 'opacity-55' : 'opacity-100'
            }`}
            role="listitem"
            aria-label={milestone.name}
            aria-current={milestone.status === 'current' ? 'step' : undefined}
          >
            {/* Icon column */}
            <div className="flex flex-col items-center shrink-0 w-9">
              {/* Milestone dot / icon */}
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${cfg.ring}`}>
                {milestone.status === 'current' && (
                  <div className="absolute w-9 h-9 rounded-full bg-primary/20 animate-ping" aria-hidden="true" />
                )}
                <span className={cfg.icon}>
                  {getMilestoneIcon(milestone.name, milestone.status)}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`w-0.5 grow min-h-[48px] my-1 transition-colors duration-500 ${cfg.connector}`}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Content card */}
            <div className="grow pb-8 last:pb-0 pt-0.5">
              <div
                className={`p-4 rounded-xl border transition-all duration-300 group-hover:translate-x-0.5 ${cfg.card} ${
                  milestone.status !== 'upcoming'
                    ? 'hover:border-white/10 hover:bg-white/5'
                    : ''
                }`}
              >
                {/* Title row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className={`text-sm font-bold m-0 leading-snug ${cfg.label}`}>
                    {milestone.name}
                  </h3>
                  {cfg.badgeText && (
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-black leading-none ${cfg.badge}`}>
                      {cfg.badgeText}
                    </span>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs m-0 flex items-center gap-2 text-text-secondary/80">
                    <Clock className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    {milestone.timestamp}
                  </p>
                  <p className="text-xs m-0 flex items-center gap-2 text-text-secondary/80">
                    <MapPin className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    {milestone.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrackingTimeline;
