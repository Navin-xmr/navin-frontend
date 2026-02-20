export type ShipmentStatus =
  | 'In Transit'
  | 'Delivered'
  | 'Pending Approval'
  | 'Cancelled';

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  createdAt: string;
}

export const MOCK_SHIPMENTS: Shipment[] = [
  { id: 'SHP-1001', origin: 'Singapore', destination: 'Rotterdam', status: 'In Transit', createdAt: '2026-02-19T09:20:00Z' },
  { id: 'SHP-1002', origin: 'Mumbai', destination: 'Dubai', status: 'Delivered', createdAt: '2026-02-18T07:10:00Z' },
  { id: 'SHP-1003', origin: 'Hamburg', destination: 'Chicago', status: 'Pending Approval', createdAt: '2026-02-17T12:45:00Z' },
  { id: 'SHP-1004', origin: 'Busan', destination: 'Long Beach', status: 'In Transit', createdAt: '2026-02-16T16:30:00Z' },
  { id: 'SHP-1005', origin: 'Antwerp', destination: 'Lagos', status: 'Cancelled', createdAt: '2026-02-15T10:05:00Z' },
  { id: 'SHP-1006', origin: 'Jakarta', destination: 'Melbourne', status: 'Delivered', createdAt: '2026-02-14T14:50:00Z' },
  { id: 'SHP-1007', origin: 'Los Angeles', destination: 'Tokyo', status: 'In Transit', createdAt: '2026-02-13T06:40:00Z' },
  { id: 'SHP-1008', origin: 'Shenzhen', destination: 'San Francisco', status: 'Pending Approval', createdAt: '2026-02-12T08:35:00Z' },
  { id: 'SHP-1009', origin: 'Durban', destination: 'Santos', status: 'Delivered', createdAt: '2026-02-11T11:25:00Z' },
  { id: 'SHP-1010', origin: 'Valencia', destination: 'Algiers', status: 'In Transit', createdAt: '2026-02-10T05:15:00Z' },
  { id: 'SHP-1011', origin: 'Manila', destination: 'Seattle', status: 'Cancelled', createdAt: '2026-02-09T13:00:00Z' },
  { id: 'SHP-1012', origin: 'Jebel Ali', destination: 'Mumbai', status: 'Delivered', createdAt: '2026-02-08T19:30:00Z' },
  { id: 'SHP-1013', origin: 'Ho Chi Minh City', destination: 'Osaka', status: 'In Transit', createdAt: '2026-02-07T09:55:00Z' },
  { id: 'SHP-1014', origin: 'Colombo', destination: 'Hamburg', status: 'Pending Approval', createdAt: '2026-02-06T04:45:00Z' },
  { id: 'SHP-1015', origin: 'Alexandria', destination: 'Piraeus', status: 'Delivered', createdAt: '2026-02-05T17:20:00Z' },
];

