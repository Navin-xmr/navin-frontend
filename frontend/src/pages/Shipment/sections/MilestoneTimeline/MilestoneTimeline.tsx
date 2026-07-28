import React, { useState, useMemo } from 'react';
import { CheckCircle2, Circle, Package, Truck, MapPin, Flag, ZoomIn, ZoomOut, RotateCcw, Filter } from 'lucide-react';
import { MilestoneTimelineProps, Milestone } from './types';

const statusIcons: Record<string, React.ReactNode> = {
  Created: <Package className="w-5 h-5" />,
  'In Transit': <Truck className="w-5 h-5" />,
  'At Checkpoint': <MapPin className="w-5 h-5" />,
  Delivered: <Flag className="w-5 h-5" />,
};

type ViewFilter = 'all' | 'completed' | 'current' | 'upcoming';
type ZoomLevel = 'compact' | 'normal' | 'expanded';

const ZOOM_CONFIG: Record<ZoomLevel, { nodeSize: string; spacing: string; cardPad: string }> = {
  compact: { nodeSize: 'w-8 h-8', spacing: 'pb-6', cardPad: 'p-3' },
  normal: { nodeSize: 'w-10 h-10', spacing: 'pb-10', cardPad: 'p-5' },
  expanded: { nodeSize: 'w-12 h-12', spacing: 'pb-14', cardPad: 'p-6' },
};

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  const [activeFilter, setActiveFilter] = useState<ViewFilter>('all');
  const [zoom, setZoom] = useState<ZoomLevel>('normal');

  const zoomConfig = ZOOM_CONFIG[zoom];

  const filtered = useMemo<Milestone[]>(() => {
    if (activeFilter === 'all') return milestones;
    if (activeFilter === 'completed') return milestones.filter(m => m.isCompleted);
    if (activeFilter === 'current') return milestones.filter(m => m.isCurrent);
    return milestones.filter(m => !m.isCompleted && !m.isCurrent);
  }, [milestones, activeFilter]);

  const counts = useMemo(() => ({
    completed: milestones.filter(m => m.isCompleted).length,
    current: milestones.filter(m => m.isCurrent).length,
    upcoming: milestones.filter(m => !m.isCompleted && !m.isCurrent).length,
  }), [milestones]);

  const isDirty = activeFilter !== 'all' || zoom !== 'normal';

  const filterOptions: { label: string; value: ViewFilter; count: number }[] = [
    { label: 'All', value: 'all', count: milestones.length },
    { label: 'Completed', value: 'completed', count: counts.completed },
    { label: 'In Progress', value: 'current', count: counts.current },
    { label: 'Upcoming', value: 'upcoming', count: counts.upcoming },
  ];

  const zoomLevels: ZoomLevel[] = ['compact', 'normal', 'expanded'];

  const handleZoomIn = () => {
    const idx = zoomLevels.indexOf(zoom);
    if (idx < zoomLevels.length - 1) setZoom(zoomLevels[idx + 1]);
  };

  const handleZoomOut = () => {
    const idx = zoomLevels.indexOf(zoom);
    if (idx > 0) setZoom(zoomLevels[idx - 1]);
  };

  return (
    <div className="w-full py-8">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter milestones">
          <Filter className="w-3.5 h-3.5 text-text-secondary/60 shrink-0" aria-hidden="true" />
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer
                ${activeFilter === opt.value
                  ? 'bg-primary/15 border-primary/50 text-primary'
                  : 'bg-transparent border-border/50 text-text-secondary hover:border-border hover:text-text-primary'
                }`}
              onClick={() => setActiveFilter(opt.value)}
              aria-pressed={activeFilter === opt.value}
            >
              {opt.label}
              <span className={`text-[10px] font-bold ${activeFilter === opt.value ? 'text-primary' : 'text-text-secondary/50'}`}>
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1" role="group" aria-label="Zoom timeline">
          <button
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-border/50 bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleZoomOut}
            disabled={zoom === 'compact'}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-text-secondary/60 px-2 min-w-[56px] text-center font-medium capitalize">
            {zoom}
          </span>
          <button
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-border/50 bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleZoomIn}
            disabled={zoom === 'expanded'}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {isDirty && (
            <button
              className="flex items-center justify-center w-7 h-7 ml-1 rounded-lg border border-border/50 bg-transparent text-text-secondary hover:text-primary transition-all duration-200 cursor-pointer"
              onClick={() => { setActiveFilter('all'); setZoom('normal'); }}
              aria-label="Reset filters and zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Filter className="w-8 h-8 text-text-secondary/30 mb-3" aria-hidden="true" />
          <p className="text-text-secondary text-sm m-0">No milestones match this filter.</p>
          <button className="mt-3 text-xs text-primary underline bg-transparent border-none cursor-pointer" onClick={() => setActiveFilter('all')}>
            Clear filter
          </button>
        </div>
      )}

      {/* Desktop View: Vertical Timeline */}
      <div
        className="hidden md:flex flex-col space-y-0 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border"
        role="list"
        aria-label="Shipment milestone timeline"
      >
        {filtered.map((milestone) => (
          <div key={milestone.id} className={`relative flex items-start gap-6 ${zoomConfig.spacing} last:pb-0`} role="listitem">
            {/* Timeline Node */}
            <div className="relative z-10 flex items-center justify-center">
              {milestone.isCompleted ? (
                <div className={`${zoomConfig.nodeSize} rounded-full bg-accent-blue flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : milestone.isCurrent ? (
                <div className={`${zoomConfig.nodeSize} rounded-full bg-primary flex items-center justify-center text-background shadow-[0_0_15px_rgba(0,217,255,0.5)] animate-pulse`}>
                  {statusIcons[milestone.status] ?? <Circle className="w-5 h-5" />}
                </div>
              ) : (
                <div className={`${zoomConfig.nodeSize} rounded-full bg-background-card border-2 border-border flex items-center justify-center text-text-secondary`}>
                  <Circle className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${zoomConfig.cardPad} rounded-2xl border transition-all duration-300 ${
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
                <span>{milestone.location ?? 'Location pending'}</span>
              </div>

              {milestone.isCurrent && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Live Updates Enabled</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View: Card list */}
      <div className="md:hidden flex flex-col gap-4 pb-4" role="list" aria-label="Shipment milestones">
        {filtered.map((milestone) => (
          <div
            key={milestone.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              milestone.isCurrent
                ? 'bg-background-card border-primary/40 shadow-glow-blue'
                : 'bg-background-card border-border'
            } ${!milestone.isCompleted && !milestone.isCurrent ? 'opacity-60' : ''}`}
            role="listitem"
          >
            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              milestone.isCompleted
                ? 'bg-accent-blue text-white'
                : milestone.isCurrent
                ? 'bg-primary text-background'
                : 'bg-background-secondary text-text-secondary'
            }`}>
              {milestone.isCompleted
                ? <CheckCircle2 className="w-6 h-6" />
                : (statusIcons[milestone.status] ?? <Circle className="w-6 h-6" />)
              }
            </div>

            <div className="flex-1 min-w-0">
              <h4 className={`font-bold truncate ${milestone.isCurrent ? 'text-primary' : 'text-text-primary'}`}>
                {milestone.label}
              </h4>
              <p className="text-xs text-text-secondary truncate">{milestone.location}</p>
              <p className="text-[10px] text-text-secondary mt-1">{milestone.timestamp}</p>
            </div>

            {milestone.isCurrent && (
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#00D9FF]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneTimeline;
