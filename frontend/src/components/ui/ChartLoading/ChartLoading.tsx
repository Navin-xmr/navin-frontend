import React from "react";

export interface ChartLoadingProps {
  /** Number of skeleton bars/rows to render */
  rows?: number;
  /** Height of the skeleton area in pixels */
  height?: number;
  /** Optional descriptive label for screen readers */
  label?: string;
}

const ChartLoading: React.FC<ChartLoadingProps> = ({
  rows = 5,
  height = 300,
  label = "Loading chart…",
}) => {
  return (
    <div
      className="w-full animate-pulse"
      style={{ height }}
      role="status"
      aria-label={label}
    >
      {/* Header skeleton */}
      <div className="px-6 py-5 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-[18px] h-[18px] rounded-full bg-[#1e293b]" />
          <div className="h-5 w-[160px] rounded bg-[#1e293b]" />
        </div>
        <div className="flex gap-1 bg-[#1a1f2e] rounded-lg p-[3px]">
          <div className="w-8 h-6 rounded-md bg-[#1e293b]" />
          <div className="w-8 h-6 rounded-md bg-[#1e293b]" />
          <div className="w-8 h-6 rounded-md bg-[#1e293b]" />
        </div>
      </div>

      {/* Chart area skeleton */}
      <div className="p-5" style={{ height: height - 80 }}>
        <svg className="w-full h-full" aria-hidden="true">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`grid-${i}`}
              x1="0"
              y1={`${(i / 4) * 100}%`}
              x2="100%"
              y2={`${(i / 4) * 100}%`}
              stroke="#1e2433"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ))}
          {/* Skeleton bars/area */}
          {Array.from({ length: rows }).map((_, i) => {
            const barHeight = 30 + Math.sin(i * 1.2) * 20 + 20;
            const x = (i / rows) * 85 + 8;
            return (
              <rect
                key={i}
                x={`${x}%`}
                y={`${100 - barHeight}%`}
                width={`${70 / rows}%`}
                height={`${barHeight}%`}
                rx="4"
                className="fill-[#1e293b]"
              />
            );
          })}
        </svg>
      </div>

      {/* Legend skeleton */}
      <div className="px-6 pb-5 flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-[3px] bg-[#1e293b]" />
            <div className="flex justify-between items-center flex-1">
              <div className="h-4 w-24 rounded bg-[#1e293b]" />
              <div className="h-4 w-12 rounded bg-[#1e293b]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartLoading;
