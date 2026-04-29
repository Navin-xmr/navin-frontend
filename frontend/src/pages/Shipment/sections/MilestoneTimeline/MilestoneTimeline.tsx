import React from 'react';
import { CheckCircle2, Circle, Package, Truck, MapPin, Flag } from 'lucide-react';
import { MilestoneTimelineProps } from './types';

const statusIcons: Record<string, React.ReactNode> = {
  'Created': <Package className="w-5 h-5" />,
  'In Transit': <Truck className="w-5 h-5" />,
  'At Checkpoint': <MapPin className="w-5 h-5" />,
  'Delivered': <Flag className="w-5 h-5" />,
};

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  return (
    <div className="w-full py-8">
      {/* Desktop View: Vertical Timeline */}
      <div className="hidden md:flex flex-col space-y-0 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="relative flex items-start gap-6 pb-10 last:pb-0">
            {/* Timeline Node */}
            <div className="relative z-10 flex items-center justify-center">
              {milestone.isCompleted ? (
                <div className="w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : milestone.isCurrent ? (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background shadow-[0_0_15px_rgba(0,217,255,0.5)] animate-pulse">
                  {statusIcons[milestone.status] || <Circle className="w-6 h-6" />}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-background-card border-2 border-border flex items-center justify-center text-text-secondary">
                  <Circle className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 p-5 rounded-2xl border transition-all duration-300 ${
              milestone.isCurrent 
                ? 'bg-background-card border-primary/30 shadow-[0_0_20px_rgba(0,217,255,0.1)]' 
                : milestone.isCompleted 
                ? 'bg-background-card border-border hover:border-accent-blue/30' 
                : 'bg-background-secondary/50 border-border/50 opacity-60'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-lg font-semibold ${milestone.isCompleted ? 'text-text-primary' : milestone.isCurrent ? 'text-primary' : 'text-text-secondary'}`}>
                  {milestone.label}
                </h3>
                <span className="text-sm font-medium text-text-secondary">
                  {milestone.timestamp}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <MapPin className="w-4 h-4" />
                <span>{milestone.location || 'Location pending'}</span>
              </div>

              {milestone.isCurrent && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Live Updates Enabled</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View: Horizontal Card List */}
      <div className="md:hidden flex flex-col gap-4 overflow-x-auto pb-4">
        {milestones.map((milestone) => (
          <div 
            key={milestone.id} 
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              milestone.isCurrent 
                ? 'bg-background-card border-primary/40 shadow-glow-blue' 
                : 'bg-background-card border-border'
            } ${!milestone.isCompleted && !milestone.isCurrent ? 'opacity-60' : ''}`}
          >
            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              milestone.isCompleted ? 'bg-accent-blue text-white' : milestone.isCurrent ? 'bg-primary text-background' : 'bg-background-secondary text-text-secondary'
            }`}>
              {milestone.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : (statusIcons[milestone.status] || <Circle className="w-6 h-6" />)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold truncate ${milestone.isCurrent ? 'text-primary' : 'text-text-primary'}`}>
                {milestone.label}
              </h4>
              <p className="text-xs text-text-secondary truncate">{milestone.location}</p>
              <p className="text-[10px] text-text-secondary mt-1">{milestone.timestamp}</p>
            </div>

            {milestone.isCurrent && (
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#00D9FF]"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneTimeline;
