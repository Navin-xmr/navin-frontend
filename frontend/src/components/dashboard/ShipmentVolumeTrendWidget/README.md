# ShipmentVolumeTrendWidget

A dashboard widget that displays shipment volume trends over time with completed vs cancelled shipments visualization.

## Features

- **Area Chart Visualization**: Uses Recharts to render two overlapping area series
- **Granularity Toggle**: Switch between Daily, Weekly, and Monthly views
- **Time Range Selector**: Last 7 days, 30 days, 90 days, or 12 months
- **Percentage Change**: Shows trend indicator (up/down/neutral) compared to previous period
- **Interactive Tooltip**: Hover to see exact shipment counts for each series
- **Legend**: Color-coded legend for Completed (green) and Cancelled (red) shipments

## Usage

```tsx
import ShipmentVolumeTrendWidget from '@components/dashboard/ShipmentVolumeTrendWidget';

// With default mock data
<ShipmentVolumeTrendWidget />

// With custom data
<ShipmentVolumeTrendWidget data={customTrendData} />
```

## Props

### `ShipmentVolumeTrendWidgetProps`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `Record<TimeRange, Record<Granularity, TrendDataPoint[]>>` | No | `MOCK_TREND_DATA` | Shipment volume data organized by time range and granularity |

## Types

### `TimeRange`
```typescript
type TimeRange = '7d' | '30d' | '90d' | '12m';
```

### `Granularity`
```typescript
type Granularity = 'daily' | 'weekly' | 'monthly';
```

### `TrendDataPoint`
```typescript
interface TrendDataPoint {
  date: string;         // Formatted date string (e.g., "Jan 15", "Week 3", "Jan 2024")
  completed: number;    // Count of completed shipments
  cancelled: number;    // Count of cancelled shipments
}
```

## Component Structure

```
ShipmentVolumeTrendWidget/
├── ShipmentVolumeTrendWidget.tsx       # Main component
├── ShipmentVolumeTrendWidget.test.tsx  # Vitest + RTL tests
├── mockTrendData.ts                    # Mock data generator
├── index.ts                            # Barrel export
└── README.md                           # This file
```

## Styling

- Uses **Tailwind CSS only** (no component-specific CSS files)
- Follows Navin design system tokens from `tailwind.config.js`
- Colors:
  - Completed: `#10B981` (accent-green)
  - Cancelled: `#EF4444` (accent-red)
  - Background: `#0F1419` (background-card)
  - Border: `#1E2433`

## Accessibility

- Semantic HTML with proper `role` and `aria-label` attributes
- Keyboard navigable controls
- Screen reader friendly tooltips

## Testing

Run tests with:

```bash
pnpm run test
```

Tests cover:
- Component rendering
- Granularity toggle functionality
- Time range selector updates
- Percentage change calculations
- Data prop handling
- Accessibility features

## Percentage Change Calculation

The percentage change compares the average shipment volume between:
- **First half** of the selected time range
- **Second half** of the selected time range

Trend indicators:
- **Up (green)**: Volume increased > 0.5%
- **Down (red)**: Volume decreased > 0.5%
- **Neutral (gray)**: Change < 0.5%

## Mock Data

The widget includes comprehensive mock data generated with:
- Deterministic pseudo-random number generation
- Upward trend simulation
- Weekly seasonality (weekday boost for daily data)
- Proper aggregation for weekly/monthly views

## Future Enhancements

Potential improvements:
- Integration with real API endpoints
- Export chart as image/PDF
- Custom date range picker
- Additional series (pending, in-transit, etc.)
- Comparison with previous period overlay
- Drill-down functionality to detailed shipment list
