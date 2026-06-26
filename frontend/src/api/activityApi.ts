import axios from 'axios';

export type ActivityEventIcon =
    | 'Truck'
    | 'CheckCircle2'
    | 'AlertTriangle'
    | 'DollarSign'
    | string;

export interface ActivityEvent {
    id: string;
    type?: string;
    event?: string;
    description?: string;
    message?: string;
    shipmentId?: string;
    shipment?: {
        id?: string;
        trackingNumber?: string;
    };
    createdAt: string; // ISO timestamp

    // Allow backend to send additional fields without breaking UI.
    [key: string]: unknown;
}

export interface ActivityResponse {
    data: ActivityEvent[];
    meta?: {
        limit?: number;
        total?: number;
        // Best-effort support for cursors/offsets.
        before?: string;
        [key: string]: unknown;
    };
}

export const activityApi = {
    async getActivity(params: { limit?: number; before?: string } = {}): Promise<ActivityResponse> {
        const queryParams = new URLSearchParams();

        if (typeof params.limit === 'number') queryParams.set('limit', String(params.limit));
        if (typeof params.before === 'string' && params.before.length > 0) queryParams.set('before', params.before);

        const res = await axios.get('/api/activity', {
            params: Object.fromEntries(queryParams.entries()),
        });

        const payload = (res.data ?? {}) as {
            data?: any[];
            meta?: any;
        };

        const itemsRaw = Array.isArray(payload.data) ? payload.data : [];

        const items: ActivityEvent[] = itemsRaw
            .map((e: any, idx: number) => {
                const id = e?.id ?? e?._id ?? e?.eventId ?? String(idx);
                const createdAt = e?.createdAt ?? e?.timestamp ?? e?.time;

                return {
                    id: String(id),
                    type: e?.type,
                    event: e?.event,
                    description: e?.description,
                    message: e?.message,
                    shipmentId: e?.shipmentId ?? e?.shipment?.id,
                    shipment: e?.shipment,
                    createdAt: String(createdAt ?? new Date().toISOString()),
                    ...e,
                } as ActivityEvent;
            })
            .filter((e: ActivityEvent) => typeof e.createdAt === 'string');

        return {
            data: items,
            meta: payload.meta ?? {},
        };
    },
};

