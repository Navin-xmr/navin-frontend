import React, { useState } from 'react';

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

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedMilestones(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const truncateAddress = (address: string) =>
    address.length <= 12 ? address : `${address.slice(0, 5)}...${address.slice(-4)}`;

  const getStatusIcon = (status: MilestoneDetail['status']) => {
    const base = 'w-8 h-8 shrink-0 z-10';
    switch (status) {
      case 'completed':
        return (
          <svg className={`${base} text-accent-blue`} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Completed">
            <circle cx="16" cy="16" r="14" fill="currentColor" />
            <path d="M10 16l5 5 7-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'current':
        return (
          <svg className={`${base} text-primary animate-pulse-glow`} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Current">
            <circle cx="16" cy="16" r="14" fill="currentColor" />
            <circle cx="16" cy="16" r="6" fill="white" />
          </svg>
        );
      case 'upcoming':
        return (
          <svg className={`${base} text-text-secondary`} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Upcoming">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" fill="none" />
          </svg>
        );
    }
  };

  const hasExpandableContent = (m: MilestoneDetail) => !!(m.notes || m.sensorReadings);
  //build
  return (
    <div className="flex flex-col p-6 w-full max-w-[900px] md:p-4 sm:p-3" role="list" aria-label="Detailed shipment milestone timeline">
      {milestones.map((milestone, index) => {
        const isExpanded = expandedMilestones.has(milestone.id);
        const canExpand = hasExpandableContent(milestone);
        const isUpcoming = milestone.status === 'upcoming';
        const isCurrent = milestone.status === 'current';

        return (
          <div key={milestone.id} className="flex gap-6 relative md:gap-4 sm:gap-3" role="listitem">
            {/* Marker */}
            <div className="flex flex-col items-center shrink-0 pt-1">
              {getStatusIcon(milestone.status)}
              {index < milestones.length - 1 && (
                <div
                  className={`w-[3px] grow min-h-[60px] mt-1.5 mb-1.5 ${
                    milestone.status === 'completed' ? 'bg-accent-blue' : 'connector-dashed-milestone'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Content wrapper */}
            <div className="grow pb-10 last:pb-0 sm:pb-8">
              <div className={`rounded-xl p-5 border transition-all duration-300 md:p-4 sm:p-3.5 ${
                isCurrent
                  ? 'bg-background-card border-[rgba(0,217,255,0.3)] shadow-[0_0_20px_rgba(0,217,255,0.1)]'
                  : isUpcoming
                  ? 'bg-[rgba(15,20,25,0.5)] border-[rgba(30,36,51,0.5)]'
                  : 'bg-background-card border-border'
              }`}>
                {/* Header row */}
                <div className="flex justify-between items-start mb-4 gap-4 sm:flex-col sm:gap-2">
                  <h3 className={`text-[1.125rem] font-semibold m-0 leading-[1.4] md:text-base sm:text-[0.9375rem] ${
                    isUpcoming ? 'text-text-secondary' : 'text-text-primary'
                  }`}>
                    {milestone.name}
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
                      <svg
                        width="20" height="20" viewBox="0 0 20 20" fill="none"
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Info rows */}
                <div className="flex flex-col gap-2.5 sm:gap-2">
                  {[
                    {
                      icon: (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      ),
                      text: milestone.timestamp,
                    },
                    {
                      icon: (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M8 1C5.79 1 4 2.79 4 5c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <circle cx="8" cy="5" r="1.5" fill="currentColor" />
                        </svg>
                      ),
                      text: milestone.location,
                    },
                  ].map(({ icon, text }, i) => (
                    <p key={i} className={`flex items-center gap-2 text-[0.9375rem] m-0 leading-[1.5] sm:text-sm sm:flex-wrap ${
                      isUpcoming ? 'text-[#6B7280]' : 'text-text-secondary'
                    }`}>
                      <span className={`shrink-0 ${isCurrent ? 'text-primary' : 'text-[#6B7280]'}`}>{icon}</span>
                      {text}
                    </p>
                  ))}

                  {/* Blockchain address */}
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
                    <code className={`text-sm px-2 py-0.5 rounded font-['Courier_New',monospace] ${
                      isUpcoming
                        ? 'bg-[rgba(107,114,128,0.1)] text-[#6B7280]'
                        : 'bg-[rgba(0,217,255,0.1)] text-primary'
                    }`}>
                      {truncateAddress(milestone.blockchainAddress)}
                    </code>
                  </p>
                </div>

                {/* Expandable details */}
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
