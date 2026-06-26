import { describe, expect, it } from 'vitest';
import { resolveLocationCoords } from './routeCoordinates';

describe('resolveLocationCoords', () => {
  it('returns known city coordinates', () => {
    expect(resolveLocationCoords('New York, NY')).toEqual([40.7128, -74.006]);
    expect(resolveLocationCoords('Los Angeles, CA')).toEqual([34.0522, -118.2437]);
  });

  it('returns deterministic fallback coordinates for unknown locations', () => {
    const first = resolveLocationCoords('Unknown City');
    const second = resolveLocationCoords('Unknown City');
    expect(first).toEqual(second);
  });
});
