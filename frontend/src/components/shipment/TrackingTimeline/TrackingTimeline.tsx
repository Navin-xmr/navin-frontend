import React from 'react';

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

const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ milestones }) => {
  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return (
          <div className="relative flex items-center justify-center">
            <div className="absolute w-8 h-8 bg-accent-blue/10 rounded-full scale-110" />
            <svg
              className="w-6 h-6 shrink-0 z-10 text-accent-blue"
              width="24" height="24" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg" aria-label="Completed"
            >
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      case 'current':
        return (
          <div className="relative flex items-center justify-center">
            <div className="absolute w-8 h-8 bg-accent-blue/20 rounded-full animate-ping" />
            <svg
              className="w-6 h-6 shrink-0 z-10 text-accent-blue animate-timeline-pulse"
              width="24" height="24" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg" aria-label="Current"
            >
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <circle cx="12" cy="12" r="4" fill="white" />
            </svg>
          </div>
        );
      case 'upcoming':
        return (
          <div className="relative flex items-center justify-center">
            <svg
              className="w-6 h-6 shrink-0 z-10 text-text-secondary/40"
              width="24" height="24" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg" aria-label="Upcoming"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col p-6 sm:p-4 max-w-[700px] w-full bg-background-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl" role="list" aria-label="Shipment tracking timeline">
      {milestones.map((milestone, index) => (
        <div
          key={milestone.id}
          className={`flex gap-6 sm:gap-4 relative group transition-all duration-300 ${
            milestone.status === 'upcoming' ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'
          }`}
          role="listitem"
          aria-label={milestone.name}
          aria-current={milestone.status === 'current' ? 'step' : undefined}
        >
          {/* Vertical Line Connector */}
          <div className="flex flex-col items-center shrink-0 w-8">
            {getStatusIcon(milestone.status)}
            {index < milestones.length - 1 && (
              <div
                className={`w-0.5 grow min-h-[50px] my-1 transition-colors duration-500 ${
                  milestone.status === 'completed'
                    ? 'bg-accent-blue shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                    : 'connector-dashed'
                }`}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Milestone Details Card-like content */}
          <div className="grow pb-10 last:pb-0 pt-0.5 group-hover:translate-x-1 transition-transform duration-300">
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              milestone.status === 'current' 
                ? 'bg-accent-blue/5 border-accent-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
            }`}>
              <h3 className={`text-base font-bold m-0 mb-1.5 flex items-center gap-2 ${
                milestone.status === 'upcoming' ? 'text-text-secondary' : 'text-text-primary'
              }`}>
                {milestone.name}
                {milestone.status === 'current' && (
                  <span className="text-[10px] uppercase tracking-wider bg-accent-blue text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                    Live
                  </span>
                )}
              </h3>
              
              <div className="flex flex-col gap-1.5">
                <p className={`text-xs sm:text-[0.8125rem] m-0 flex items-center gap-2 font-medium ${
                  milestone.status === 'upcoming' ? 'text-text-secondary/70' : 'text-text-secondary'
                }`}>
                  <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {milestone.timestamp}
                </p>
                <p className={`text-xs sm:text-[0.8125rem] m-0 flex items-center gap-2 font-medium ${
                  milestone.status === 'upcoming' ? 'text-text-secondary/70' : 'text-text-secondary'
                }`}>
                  <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {milestone.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackingTimeline;
