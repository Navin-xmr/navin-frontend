/** Known city coordinates for common shipment endpoints in demo/fixture data. */
const CITY_COORDINATES: Record<string, [number, number]> = {
  'new york, ny': [40.7128, -74.006],
  'los angeles, ca': [34.0522, -118.2437],
  'chicago, il': [41.8781, -87.6298],
  'houston, tx': [29.7604, -95.3698],
  'seattle, wa': [47.6062, -122.3321],
  'miami, fl': [25.7617, -80.1918],
  'boston, ma': [42.3601, -71.0589],
  'denver, co': [39.7392, -104.9903],
  'san francisco, ca': [37.7749, -122.4194],
  'dallas, tx': [32.7767, -96.797],
  'atlanta, ga': [33.749, -84.388],
  'phoenix, az': [33.4484, -112.074],
  singapore: [1.3521, 103.8198],
};

/** Deterministic pseudo-coordinates when a city is not in the lookup table. */
function hashToCoords(seed: string): [number, number] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const lat = ((hash % 12000) / 100) - 60;
  const lng = (((hash >> 8) % 36000) / 100) - 180;
  return [lat, lng];
}

export function resolveLocationCoords(location: string): [number, number] {
  const normalized = location.trim().toLowerCase();
  return CITY_COORDINATES[normalized] ?? hashToCoords(normalized);
}

export function readNumericField(
  source: Record<string, unknown>,
  keys: string[],
): number | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}
