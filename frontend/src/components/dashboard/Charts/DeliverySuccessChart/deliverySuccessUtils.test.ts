import { describe, expect, it } from 'vitest';
import { calculateSuccessRate } from './deliverySuccessUtils';
import { DELIVERY_OUTCOMES_FIXTURE } from '@/test/fixtures/deliveryOutcomesFixture';

describe('calculateSuccessRate', () => {
  it('is delivered divided by total, rounded', () => {
    // 956 of 1459
    expect(calculateSuccessRate(DELIVERY_OUTCOMES_FIXTURE)).toBe(66);
  });

  it('is 0 when there is no data', () => {
    expect(calculateSuccessRate([])).toBe(0);
  });

  it('is 0 when nothing was delivered', () => {
    expect(calculateSuccessRate([{ status: 'Failed', count: 4, color: '#ef4444' }])).toBe(0);
  });
});
