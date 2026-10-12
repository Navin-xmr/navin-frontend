export interface RouteShipment {
  id: string;
  trackingNumber: string;
  cost: number;
  revenue: number;
}

export interface RouteCostData {
  route: string;
  origin: string;
  destination: string;
  base: number;
  fuel: number;
  customs: number;
  insurance: number;
  revenue: number;
  shipments: RouteShipment[];
}
