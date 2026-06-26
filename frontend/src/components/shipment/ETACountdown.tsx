import React from "react";
import type { ShipmentStatus } from "../../utils/shipmentStatus";

export interface ETACountdownProps {
    expectedDelivery: string; // ISO date
    status: ShipmentStatus;
}


function formatRemainingTime(diffMs: number) {
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
}

const ETACountdown: React.FC<ETACountdownProps> = ({ expectedDelivery, status }) => {
    const isInTransit = status === "IN_TRANSIT";
    const isDelivered = status === "DELIVERED";

    const targetDate = React.useMemo(() => {
        const d = new Date(expectedDelivery);
        return Number.isNaN(d.getTime()) ? null : d;
    }, [expectedDelivery]);

    const [nowTs, setNowTs] = React.useState(() => Date.now());

    React.useEffect(() => {
        if (!isInTransit || !targetDate) return;

        const intervalId = window.setInterval(() => {
            setNowTs(Date.now());
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [isInTransit, targetDate]);

    if (isDelivered) {
        const deliveredDate = new Date(expectedDelivery);
        const hasValidDate = !Number.isNaN(deliveredDate.getTime());
        return (
            <p className="text-sm md:text-base text-text-primary text-white/80">
                Delivered on {hasValidDate ? deliveredDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) : expectedDelivery}
            </p>
        );
    }

    if (!isInTransit || !targetDate) {
        return (
            <p className="text-sm md:text-base text-text-primary text-white/80">
                ETA: {expectedDelivery}
            </p>
        );
    }

    const diffMs = targetDate.getTime() - nowTs;

    if (diffMs > 0) {
        const { days, hours, minutes, seconds } = formatRemainingTime(diffMs);
        return (
            <div className="text-sm md:text-base text-text-primary text-white/80">
                ETA countdown: <span className="font-semibold">{days}d</span> {hours}h {minutes}m {seconds}s
            </div>
        );
    }

    // Overdue (still IN_TRANSIT)
    const overdueHoursTotal = Math.ceil(Math.abs(diffMs) / 3600000);
    const overdueText = `Delivery overdue by ${overdueHoursTotal} hour${overdueHoursTotal === 1 ? "" : "s"}`;

    return (
        <div className="text-sm md:text-base font-semibold text-red-400" role="status" aria-live="polite">
            {overdueText}
        </div>
    );
};


export default ETACountdown;
