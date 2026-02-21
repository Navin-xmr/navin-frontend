export interface DailyVolume {
  date: string;
  count: number;
}

/**
 * Generate deterministic mock daily-volume data using a simple seeded PRNG.
 * Counts range from 5 to 60 shipments per day.
 */
export function generateMockData(days: number): DailyVolume[] {
  const data: DailyVolume[] = [];
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  // Simple seeded pseudo-random (mulberry32)
  let seed = 42;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);

    const month = d.toLocaleString('en-US', { month: 'short' });
    const day = d.getDate();

    data.push({
      date: `${month} ${day}`,
      count: Math.floor(rand() * 56) + 5, // 5–60
    });
  }

  return data;
}

export const MOCK_VOLUME_DATA: DailyVolume[] = generateMockData(90);
