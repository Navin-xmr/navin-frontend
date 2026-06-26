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

export const MOCK_ROUTE_COST_DATA: RouteCostData[] = [
  {
    route: 'New York, NY → Los Angeles, CA',
    origin: 'New York, NY',
    destination: 'Los Angeles, CA',
    base: 4200,
    fuel: 1800,
    customs: 650,
    insurance: 420,
    revenue: 9800,
    shipments: [
      { id: 'ship-001', trackingNumber: 'NV-001', cost: 7070, revenue: 9800 },
      { id: 'ship-010', trackingNumber: 'NV-010', cost: 6200, revenue: 8900 },
    ],
  },
  {
    route: 'Chicago, IL → Houston, TX',
    origin: 'Chicago, IL',
    destination: 'Houston, TX',
    base: 3100,
    fuel: 1200,
    customs: 280,
    insurance: 310,
    revenue: 6200,
    shipments: [
      { id: 'ship-002', trackingNumber: 'NV-002', cost: 4890, revenue: 6200 },
    ],
  },
  {
    route: 'Seattle, WA → Miami, FL',
    origin: 'Seattle, WA',
    destination: 'Miami, FL',
    base: 5100,
    fuel: 2400,
    customs: 920,
    insurance: 540,
    revenue: 11200,
    shipments: [
      { id: 'ship-003', trackingNumber: 'NV-003', cost: 8960, revenue: 11200 },
      { id: 'ship-011', trackingNumber: 'NV-011', cost: 8100, revenue: 10400 },
    ],
  },
  {
    route: 'Boston, MA → Denver, CO',
    origin: 'Boston, MA',
    destination: 'Denver, CO',
    base: 2800,
    fuel: 1100,
    customs: 210,
    insurance: 260,
    revenue: 5400,
    shipments: [
      { id: 'ship-004', trackingNumber: 'NV-004', cost: 4370, revenue: 5400 },
    ],
  },
  {
    route: 'San Francisco, CA → Dallas, TX',
    origin: 'San Francisco, CA',
    destination: 'Dallas, TX',
    base: 3600,
    fuel: 1500,
    customs: 430,
    insurance: 350,
    revenue: 7100,
    shipments: [
      { id: 'ship-005', trackingNumber: 'NV-005', cost: 5880, revenue: 7100 },
    ],
  },
  {
    route: 'Atlanta, GA → Phoenix, AZ',
    origin: 'Atlanta, GA',
    destination: 'Phoenix, AZ',
    base: 2500,
    fuel: 980,
    customs: 180,
    insurance: 220,
    revenue: 4800,
    shipments: [
      { id: 'ship-006', trackingNumber: 'NV-006', cost: 3880, revenue: 4800 },
    ],
  },
  {
    route: 'Singapore → Los Angeles, CA',
    origin: 'Singapore',
    destination: 'Los Angeles, CA',
    base: 6800,
    fuel: 3200,
    customs: 2100,
    insurance: 780,
    revenue: 15400,
    shipments: [
      { id: 'ship-007', trackingNumber: 'NV-007', cost: 12880, revenue: 15400 },
    ],
  },
  {
    route: 'Houston, TX → Seattle, WA',
    origin: 'Houston, TX',
    destination: 'Seattle, WA',
    base: 3300,
    fuel: 1400,
    customs: 360,
    insurance: 300,
    revenue: 6900,
    shipments: [
      { id: 'ship-008', trackingNumber: 'NV-008', cost: 5360, revenue: 6900 },
    ],
  },
  {
    route: 'Miami, FL → Chicago, IL',
    origin: 'Miami, FL',
    destination: 'Chicago, IL',
    base: 2900,
    fuel: 1150,
    customs: 250,
    insurance: 240,
    revenue: 5600,
    shipments: [
      { id: 'ship-009', trackingNumber: 'NV-009', cost: 4540, revenue: 5600 },
    ],
  },
  {
    route: 'Denver, CO → Boston, MA',
    origin: 'Denver, CO',
    destination: 'Boston, MA',
    base: 2400,
    fuel: 900,
    customs: 160,
    insurance: 190,
    revenue: 4300,
    shipments: [
      { id: 'ship-012', trackingNumber: 'NV-012', cost: 3650, revenue: 4300 },
    ],
  },
  {
    route: 'Dallas, TX → San Francisco, CA',
    origin: 'Dallas, TX',
    destination: 'San Francisco, CA',
    base: 2700,
    fuel: 1050,
    customs: 200,
    insurance: 210,
    revenue: 5000,
    shipments: [
      { id: 'ship-013', trackingNumber: 'NV-013', cost: 4160, revenue: 5000 },
    ],
  },
];
