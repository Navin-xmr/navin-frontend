import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Package } from "lucide-react";
import {
  getStatusBadgeClass,
  getStatusDotClass,
  getStatusDisplayLabel,
} from "../../../utils/shipmentStatus";

export interface ShipmentStickyBarProps {
  /**
   * The ref of the element whose disappearance from the viewport triggers
   * the bar to become visible (typically the main page header section).
   */
  sentinelRef: React.RefObject<HTMLElement | null>;
  shipmentId: string;
  status: string;
  originAddress?: string;
  destinationAddress?: string;
  expectedDeliveryDate?: string;
  priority?: "URGENT" | "STANDARD" | "ECONOMY";
}

const PRIORITY_STYLES: Record<string, { pill: string }> = {
  URGENT: { pill: "bg-red-500/15 text-red-400 border border-red-500/30" },
  STANDARD: { pill: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
  ECONOMY: { pill: "bg-slate-500/15 text-slate-400 border border-slate-500/30" },
};

const ShipmentStickyBar: React.FC<ShipmentStickyBarProps> = ({
  sentinelRef,
  shipmentId,
  status,
  originAddress,
  destinationAddress,
  expectedDeliveryDate,
  priority,
}) => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Two-frame mount delay so the initial hidden→visible CSS transition fires
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // IntersectionObserver: bar appears when the sentinel scrolls out of view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" }, // 64 px = approx TopHeader height
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sentinelRef]);

  const handleBackToTop = () => {
    sentinelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const priorityStyle = priority ? PRIORITY_STYLES[priority] : undefined;

  return (
    <div
      role="complementary"
      aria-label="Shipment summary bar"
      aria-hidden={!visible}
      className={[
        // Layout
        "fixed top-0 left-0 right-0 z-50",
        // Glass background
        "bg-[rgba(6,30,32,0.85)] backdrop-blur-md",
        // Border
        "border-b border-[rgba(0,180,160,0.25)]",
        // Shadow
        "shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        // Transition — slide down from -top
        "transition-all duration-300 ease-in-out",
        mounted && visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-full opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <div className="max-w-[1280px] mx-auto px-6 py-2.5 flex items-center gap-4 flex-wrap sm:gap-2 sm:px-4">
        {/* Shipment icon + ID */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[rgba(0,212,200,0.12)] flex items-center justify-center">
            <Package size={14} className="text-[#00d4c8]" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-white font-mono">{shipmentId}</span>
        </div>

        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${getStatusBadgeClass(status)}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${getStatusDotClass(status)}`}
            aria-hidden="true"
          />
          {getStatusDisplayLabel(status)}
        </span>

        {/* Priority badge */}
        {priorityStyle && priority && (
          <span
            className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide shrink-0 ${priorityStyle.pill}`}
          >
            {priority}
          </span>
        )}

        {/* Route */}
        {originAddress && destinationAddress && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[rgba(200,230,240,0.6)] min-w-0 flex-1">
            <span className="truncate max-w-[180px]" title={originAddress}>
              {originAddress}
            </span>
            <ArrowRight size={12} className="text-[#00d4c8] shrink-0" aria-hidden="true" />
            <span className="truncate max-w-[180px]" title={destinationAddress}>
              {destinationAddress}
            </span>
          </div>
        )}

        {/* ETA */}
        {expectedDeliveryDate && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs shrink-0 ml-auto">
            <span className="text-[rgba(200,230,240,0.45)] uppercase tracking-wide font-medium">
              ETA
            </span>
            <span className="text-white font-medium">{expectedDeliveryDate}</span>
          </div>
        )}

        {/* Back to top */}
        <button
          type="button"
          onClick={handleBackToTop}
          aria-label="Scroll back to top of page"
          className={[
            "ml-auto shrink-0 inline-flex items-center gap-1.5",
            "px-3 py-1.5 rounded-lg text-xs font-medium",
            "bg-[rgba(0,212,200,0.1)] hover:bg-[rgba(0,212,200,0.2)]",
            "text-[#00d4c8] border border-[rgba(0,212,200,0.25)]",
            "transition-colors duration-150 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4c8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#061e20]",
          ].join(" ")}
        >
          <ArrowUp size={12} aria-hidden="true" />
          <span className="hidden sm:inline">Top</span>
        </button>
      </div>
    </div>
  );
};

export default ShipmentStickyBar;
