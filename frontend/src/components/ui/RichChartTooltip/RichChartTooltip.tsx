import React from "react";
import { TrendingUp, TrendingDown, Minus, ExternalLink, Eye, Download } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TooltipDataPoint {
  /** Display label for this data point (e.g. "Jun 24") */
  label: string;
  /** Primary numeric value */
  value: number;
  /** Optional secondary value (e.g. target/comparison) */
  secondaryValue?: number;
  /** Optional unit suffix (e.g. "shipments", "$", "%") */
  unit?: string;
  /** Optional color indicator */
  color?: string;
  /** Trend direction */
  trend?: "up" | "down" | "neutral";
  /** Trend label (e.g. "+12% vs last period") */
  trendLabel?: string;
}

export interface TooltipAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface RichChartTooltipProps {
  /** Whether the tooltip is active/visible */
  active?: boolean;
  /** Title shown at the top of the tooltip */
  title?: string;
  /** Data points to display */
  items?: TooltipDataPoint[];
  /** Total label/value shown at the bottom */
  totalLabel?: string;
  totalValue?: string;
  /** Contextual action buttons */
  actions?: TooltipAction[];
  /** Optional className override */
  className?: string;
}

// ─── Default icons ──────────────────────────────────────────────────────────

const TREND_ICONS: Record<string, React.ReactNode> = {
  up: <TrendingUp size={12} className="text-[#10b981]" aria-hidden="true" />,
  down: <TrendingDown size={12} className="text-[#ef4444]" aria-hidden="true" />,
  neutral: <Minus size={12} className="text-[#64748b]" aria-hidden="true" />,
};

// ─── Component ──────────────────────────────────────────────────────────────

const RichChartTooltip: React.FC<RichChartTooltipProps> = ({
  active,
  title,
  items = [],
  totalLabel,
  totalValue,
  actions,
  className = "",
}) => {
  if (!active || items.length === 0) return null;

  const formatValue = (v: number, unit?: string): string => {
    if (unit === "$") return `${v.toLocaleString()}`;
    if (unit === "%") return `${v}%`;
    return `${v.toLocaleString()}${unit ? ` ${unit}` : ""}`;
  };

  return (
    <div
      className={`min-w-[180px] bg-[#0F1419] border border-[#1E2433] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-3 ${className}`}
      role="tooltip"
    >
      {/* Header */}
      {title && (
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b] mb-2 pb-2 border-b border-[#1E2433]">
          {title}
        </div>
      )}

      {/* Data rows */}
      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              {item.color && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
              )}
              <span className="text-[#94a3b8] truncate">{item.label}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-white whitespace-nowrap">
              <span>{formatValue(item.value, item.unit)}</span>
              {item.secondaryValue !== undefined && (
                <span className="text-[#64748b] text-xs font-normal">
                  / {formatValue(item.secondaryValue, item.unit)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trend indicator */}
      {items.some((i) => i.trend) && (
        <div className="mt-2 pt-2 border-t border-[#1E2433] space-y-1">
          {items
            .filter((i) => i.trend)
            .map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                {item.trend && TREND_ICONS[item.trend]}
                <span className="text-[#64748b]">
                  {item.trendLabel || `${item.label}: ${item.trend}`}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Total */}
      {totalLabel && totalValue !== undefined && (
        <div className="mt-2 pt-2 border-t border-[#1E2433] flex items-center justify-between text-sm">
          <span className="font-semibold text-[#94a3b8] uppercase text-[11px] tracking-wider">
            {totalLabel}
          </span>
          <span className="font-bold text-white">{totalValue}</span>
        </div>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[#1E2433] flex flex-wrap gap-1.5">
          {actions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className="
                inline-flex items-center gap-1 px-2 py-1
                text-[11px] font-medium
                bg-[rgba(59,130,246,0.1)] text-[#60a5fa]
                hover:bg-[rgba(59,130,246,0.2)]
                rounded-md transition-colors cursor-pointer
                border border-[rgba(59,130,246,0.2)]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]
              "
              aria-label={action.label}
            >
              {action.icon || <ExternalLink size={10} aria-hidden="true" />}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Helper components ──────────────────────────────────────────────────────

/** Pre-built action for viewing details */
export const ViewDetailsAction = (onClick: () => void): TooltipAction => ({
  label: "View Details",
  icon: <Eye size={10} aria-hidden="true" />,
  onClick,
});

/** Pre-built action for exporting */
export const ExportAction = (onClick: () => void): TooltipAction => ({
  label: "Export",
  icon: <Download size={10} aria-hidden="true" />,
  onClick,
});

export default RichChartTooltip;