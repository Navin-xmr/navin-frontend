import type { SettlementStatus } from '@services/api/endpoints/settlements';

export type ShipmentStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export type ShipmentStatusEvent = {
  type: 'shipment:status';
  shipmentId: string;
  newStatus: ShipmentStatus;
  timestamp: string;
};

export type MilestoneEvent = {
  type: 'shipment:milestone';
  shipmentId: string;
  milestoneId: string;
  event: string;
  txHash?: string;
};

export type SettlementEvent = {
  type: 'settlement:status';
  settlementId: string;
  newStatus: SettlementStatus;
  txHash?: string;
};

export type RealtimeNotification = {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
};

export type NotificationEvent = {
  type: 'notification:new';
  notification: RealtimeNotification;
};

export type AnomalyEvent = {
  type: 'anomaly:detected';
  shipmentId: string;
  anomalyType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type LocationUpdateEvent = {
  type: 'location:update';
  shipmentId: string;
  lat: number;
  lng: number;
  timestamp: string;
};

export type RealtimeEvent =
  | ShipmentStatusEvent
  | MilestoneEvent
  | SettlementEvent
  | NotificationEvent
  | AnomalyEvent
  | LocationUpdateEvent;

export type RealtimeEventType = RealtimeEvent['type'];
