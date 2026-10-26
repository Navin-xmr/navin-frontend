import { describe, expect, it } from 'vitest';
import type { Shipment } from '@services/api/endpoints/shipments';
import { buildComparisonShipments, toComparisonShipment, toMilestoneDetails } from './comparisonShipments';

const shipment = (overrides: Partial<Shipment> = {}): Shipment => ({
  _id: 'ship-1',
  id: 'ship-1',
  trackingNumber: 'NAV-1',
  origin: 'Lagos',
  destination: 'Accra',
  enterpriseId: 'ent-1',
  logisticsId: 'log-1',
  status: 'IN_TRANSIT',
  milestones: [],
  createdAt: '2024-03-15T10:30:00.000Z',
  updatedAt: '2024-03-15T10:30:00.000Z',
  ...overrides,
});

describe('toMilestoneDetails', () => {
  const milestones = [
    { name: 'Picked Up', timestamp: '2024-03-15T10:00:00.000Z', description: 'Lagos hub' },
    { name: 'In Transit', timestamp: '2024-03-16T10:00:00.000Z' },
  ];

  it('marks earlier milestones completed and the last one current while in transit', () => {
    const result = toMilestoneDetails(shipment({ milestones }));

    expect(result.map((m) => m.status)).toEqual(['completed', 'current']);
    expect(result[0]).toMatchObject({ id: '1', name: 'Picked Up', location: 'Lagos hub' });
    expect(result[1].location).toBe('');
  });

  it('marks every milestone completed once delivered', () => {
    const result = toMilestoneDetails(shipment({ status: 'DELIVERED', milestones }));

    expect(result.map((m) => m.status)).toEqual(['completed', 'completed']);
  });

  it('returns nothing when the shipment has no milestones', () => {
    expect(toMilestoneDetails(shipment())).toEqual([]);
  });
});

describe('toComparisonShipment', () => {
  it('uses the shipment\'s own fields and formats its dates', () => {
    const result = toComparisonShipment(shipment({ expectedDelivery: '2024-03-20T00:00:00.000Z' }));

    expect(result).toMatchObject({
      id: 'ship-1',
      shipmentId: '#NAV-1',
      origin: 'Lagos',
      destination: 'Accra',
      status: 'IN_TRANSIT',
      createdAt: 'Mar 15, 2024',
      expectedDelivery: 'Mar 20, 2024',
    });
  });

  it('shows a dash instead of a made-up date when none is known', () => {
    const result = toComparisonShipment(shipment({ createdAt: '' }));

    expect(result.createdAt).toBe('—');
    expect(result.expectedDelivery).toBe('—');
  });

  it('falls back to the id when there is no tracking number', () => {
    expect(toComparisonShipment(shipment({ trackingNumber: '' })).shipmentId).toBe('#ship-1');
  });
});

describe('buildComparisonShipments', () => {
  const current = toComparisonShipment(shipment());

  it('lists the current shipment first, then the other real ones, without repeating it', () => {
    const others = [shipment(), shipment({ _id: 'ship-2', id: 'ship-2', trackingNumber: 'NAV-2' })];

    const result = buildComparisonShipments(current, others);

    expect(result.map((s) => s.id)).toEqual(['ship-1', 'ship-2']);
  });

  it('returns an empty list when there is nothing else to compare with', () => {
    expect(buildComparisonShipments(current, [])).toEqual([]);
    expect(buildComparisonShipments(current, [shipment()])).toEqual([]);
  });
});
