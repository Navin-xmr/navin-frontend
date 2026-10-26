import { describe, expect, it } from 'vitest';
import { buildPaymentSummaryCards } from './buildPaymentSummaryCards';

const base = { totalReleased: 0, totalInEscrow: 0, totalPending: 0, sparkline: [] };

describe('buildPaymentSummaryCards', () => {
  it('maps each bucket to a labelled, formatted card', () => {
    const cards = buildPaymentSummaryCards({
      ...base,
      totalReleased: 1234567.891,
      totalInEscrow: 300,
      totalPending: 75.5,
    });

    expect(cards.map((c) => [c.label, c.value])).toEqual([
      ['Released this month', '1,234,567.89'],
      ['In escrow this month', '300'],
      ['Pending this month', '75.5'],
    ]);
  });

  it('keeps a zero bucket when another bucket has activity', () => {
    const cards = buildPaymentSummaryCards({ ...base, totalPending: 10 });

    expect(cards).toHaveLength(3);
    expect(cards[0].value).toBe('0');
  });

  it('returns no cards when every bucket is empty', () => {
    expect(buildPaymentSummaryCards(base)).toEqual([]);
  });
});
