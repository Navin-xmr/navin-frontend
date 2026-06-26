import React, { useState } from 'react';
import { Truck, Package, FileCheck, CheckCircle, AlertTriangle, Clock, MapPin, ExternalLink, ChevronDown } from 'lucide-react';

export interface MilestoneDetail {
  id: string;
  name: string;
  timestamp: string;
  location: string;
  blockchainAddress: string;
  status: 'completed' | 'current' | 'upcoming';
  notes?: string;
  sensorReadings?: {
    temperature?: string;
    humidity?: string;
    pressure?: string;
    [key: string]: string | undefined;
  };
}

export interface MilestoneTimelineProps {
  milestones: MilestoneDetail[];
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  PICKED_UP: <Truck className="w-4 h-4" />,
  IN_TRANSIT: <Package className="w-4 h-4" />,
  CUSTOMS: <FileCheck className="w-4 h-4" />,
  DELIVERED: <CheckCircle className="w-4 h-4" />,
  DELAYED: <AlertTriangle className="w-4 h-4" />,
};

const FALLBACK_ICON = <Package className="w-4 h-4" />;

function getEventIcon(name: string): React.ReactNode {
  const upper = name.toUpperCase();
  for (const [key, icon] of Object.entries(EVENT_ICONS)) {
    if (upper.includes(key)) return icon;
  }
  return FALLBACK_ICON;
}

function truncateAddress(address: string) {
  if (address.length <= 12) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

function getStellarExpertUrl(address: string): string {
  return `https://stellar.expert/explorer/public/account/${address}`;
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedMilestones(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const hasExpandableContent = (m: MilestoneDetail) => !!(m.notes || m.sensorReadings);

  return (
    <div className="flex flex-col p-6 w-full max-w-[900px] md:p-4 sm:p-3" role="list" aria-label="Detailed shipment milestone timeline">
      {milestones.map((milestone, index) => {
        const isExpanded = expandedMilestones.has(milestone.id);
        const canExpand = hasExpandableContent(milestone);
        const isUpcoming = milestone.status === 'upcoming';
        const isCurrent = milestone.status === 'current';

        return (
          <div key={milestone.id} className="flex gap-6 relative md:gap-4 sm:gap-3" role="listitem">
            <div className="flex flex-col items-center shrink-0 pt-1">
              <div className="relative flex items-center justify-center">
                {milestone.status === 'completed' && (
                  <div className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center z-10">
                    {getEventIcon(milestone.name)}
                  </div>
                )}
                {milestone.status === 'current' && (
                  <div className="relative flex items-center justify-center z-10">
                    <div className="absolute w-10 h-10 rounded-full bg-accent-blue/20 animate-ping" />
                    <div className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                      {getEventIcon(milestone.name)}
                    </div>
                  </div>
                )}
                {milestone.status === 'upcoming' && (
                  <div className="w-8 h-8 rounded-full border-2 border-text-secondary/40 flex items-center justify-center z-10 bg-transparent">
                    <span className="text-text-secondary/40">{getEventIcon(milestone.name)}</span>
                  </div>
                )}
              </div>
              {index < milestones.length - 1 && (
                <div
                  className={`w-0.5 grow min-h-[60px] mt-1.5 mb-1.5 ${
                    milestone.status === 'completed'
                      ? 'bg-accent-blue'
                      : 'connector-dashed-milestone'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="grow pb-10 last:pb-0 sm:pb-8">
              <div className={`rounded-xl p-5 border transition-all duration-300 md:p-4 sm:p-3.5 ${
                isCurrent
                  ? 'bg-background-card border-[rgba(0,217,255,0.3)] shadow-[0_0_20px_rgba(0,217,255,0.1)]'
                  : isUpcoming
                  ? 'bg-[rgba(15,20,25,0.5)] border-[rgba(30,36,51,0.5)]'
                  : 'bg-background-card border-border'
              }`}>
                <div className="flex justify-between items-start mb-4 gap-4 sm:flex-col sm:gap-2">
                  <h3 className={`text-[1.125rem] font-semibold m-0 leading-[1.4] md:text-base sm:text-[0.9375rem] flex items-center gap-2 ${
                    isUpcoming ? 'text-text-secondary' : 'text-text-primary'
                  }`}>
                    {getEventIcon(milestone.name)}
                    {milestone.name}
                    {isCurrent && (
                      <span className="text-[10px] uppercase tracking-wider bg-accent-blue text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                        LIVE
                      </span>
                    )}
                  </h3>
                  {canExpand && (
                    <button
                      className={`bg-none border-none p-1 cursor-pointer transition-all duration-200 shrink-0 rounded hover:text-primary hover:bg-[rgba(0,217,255,0.1)] focus:outline-[2px] focus:outline-primary focus:outline-offset-2 ${
                        isUpcoming ? 'text-text-secondary' : 'text-text-secondary'
                      } sm:self-start`}
                      onClick={() => toggleExpanded(milestone.id)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                    >
                      <ChevronDown
                        className={`transition-transform duration-200 w-5 h-5 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 sm:gap-2">
                  <p className={`flex items-center gap-2 text-[0.9375rem] m-0 leading-[1.5] sm:text-sm sm:flex-wrap ${
                    isUpcoming ? 'text-[#6B7280]' : 'text-text-secondary'
                  }`}>
                    <Clock className={`shrink-0 w-4 h-4 ${isCurrent ? 'text-primary' : 'text-[#6B7280]'}`} />
                    {milestone.timestamp}
                  </p>
                  <p className={`flex items-center gap-2 text-[0.9375rem] m-0 leading-[1.5] sm:text-sm sm:flex-wrap ${
                    isUpcoming ? 'text-[#6B7280]' : 'text-text-secondary'
                  }`}>
                    <MapPin className={`shrink-0 w-4 h-4 ${isCurrent ? 'text-primary' : 'text-[#6B7280]'}`} />
                    {milestone.location}
                  </p>

                  <p className={`flex items-center gap-2 text-[0.9375rem] m-0 leading-[1.5] font-[Inter,monospace] sm:text-[0.8125rem] sm:flex-wrap ${
                    isUpcoming ? 'text-[#6B7280]' : 'text-text-secondary'
                  }`}>
                    <span className={`shrink-0 ${isCurrent ? 'text-primary' : 'text-[#6B7280]'}`}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="font-medium">Blockchain:</span>
                    {isUpcoming ? (
                      <code className={`text-sm px-2 py-0.5 rounded font-['Courier_New',monospace] bg-[rgba(107,114,128,0.1)] text-[#6B7280]`}>
                        {truncateAddress(milestone.blockchainAddress)}
                      </code>
                    ) : (
                      <a
                        href={getStellarExpertUrl(milestone.blockchainAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm px-2 py-0.5 rounded font-['Courier_New',monospace] bg-[rgba(0,217,255,0.1)] text-primary hover:bg-[rgba(0,217,255,0.2)] transition-colors no-underline"
                      >
                        {truncateAddress(milestone.blockchainAddress)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </p>
                </div>

                {canExpand && isExpanded && (
                  <div className="mt-5 pt-5 border-t border-border animate-slide-down">
                    {milestone.notes && (
                      <div className="mb-4 last:mb-0">
                        <h4 className="text-sm font-semibold text-primary m-0 mb-2 uppercase tracking-[0.05em]">Notes</h4>
                        <p className="text-[0.9375rem] text-[#D1D5DB] m-0 leading-[1.6]">{milestone.notes}</p>
                      </div>
                    )}
                    {milestone.sensorReadings && (
                      <div className="mb-4 last:mb-0">
                        <h4 className="text-sm font-semibold text-primary m-0 mb-2 uppercase tracking-[0.05em]">Sensor Readings</h4>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 sm:grid-cols-1">
                          {Object.entries(milestone.sensorReadings).map(([key, value]) =>
                            value ? (
                              <div key={key} className="flex flex-col gap-1 bg-[rgba(0,217,255,0.05)] p-3 rounded-lg border border-[rgba(0,217,255,0.1)]">
                                <span className="text-[0.8125rem] text-text-secondary font-medium">
                                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                                </span>
                                <span className="text-base text-text-primary font-semibold">{value}</span>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MilestoneTimeline;
