import type { ShipmentStatus as APIShipmentStatus } from '../services/api/endpoints/shipments';

export type ShipmentStatus = APIShipmentStatus;

const DISPLAY_LABELS: Record<ShipmentStatus, string> = {
    CREATED: 'Pending Approval',
    IN_TRANSIT: 'In Transit',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
};

const BADGE_CLASSES: Record<ShipmentStatus, string> = {
    CREATED: 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.12)]',
    IN_TRANSIT: 'bg-[rgba(59,130,246,0.1)] text-[#3b82f6] border border-[rgba(59,130,246,0.12)]',
    DELIVERED: 'bg-[rgba(16,185,129,0.1)] text-[#10b981] border border-[rgba(16,185,129,0.12)]',
    CANCELLED: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.12)]',
};

const DOT_CLASSES: Record<ShipmentStatus, string> = {
    CREATED: 'bg-[#f59e0b]',
    IN_TRANSIT: 'bg-[#3b82f6]',
    DELIVERED: 'bg-[#10b981]',
    CANCELLED: 'bg-[#ef4444]',
};

export function getStatusDisplayLabel(status: ShipmentStatus | string): string {
    if (!status) return 'Unknown';
    return (DISPLAY_LABELS as Record<string, string>)[status] ?? String(status);
}

export function getStatusBadgeClass(status: ShipmentStatus | string): string {
    return (BADGE_CLASSES as Record<string, string>)[status] ?? 'bg-text-secondary/10 text-text-secondary border border-text-secondary/10';
}

export function getStatusDotClass(status: ShipmentStatus | string): string {
    return (DOT_CLASSES as Record<string, string>)[status] ?? 'bg-text-secondary';
}

export default {
    getStatusDisplayLabel,
    getStatusBadgeClass,
    getStatusDotClass,
};
