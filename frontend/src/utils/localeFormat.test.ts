import { describe, expect, it } from 'vitest';
import { formatDate, formatCurrency, formatAddress } from './localeFormat';

describe('localeFormat helpers', () => {
  it('formats dates using the requested locale', () => {
    const expected = new Intl.DateTimeFormat('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date('2024-06-15T00:00:00Z'));

    expect(formatDate('2024-06-15T00:00:00Z', { month: 'short', day: 'numeric', year: 'numeric' }, 'en-GB')).toBe(expected);
  });

  it('formats currencies using the requested locale and currency', () => {
    const expected = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(1234.5);

    expect(formatCurrency(1234.5, 'EUR', 'fr-FR')).toBe(expected);
  });

  it('formats addresses with localized separators', () => {
    expect(formatAddress({ street: '123 Main St', city: 'New York', postalCode: '10001', country: 'USA' }, 'en-US')).toBe('123 Main St, New York, 10001, USA');
  });
});
