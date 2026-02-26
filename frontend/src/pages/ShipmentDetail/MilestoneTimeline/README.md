# MilestoneTimeline Component

An expanded, detailed timeline component for displaying shipment milestones with blockchain verification, sensor readings, and expandable details.

## Features

- **Blockchain Verification**: Each milestone displays a truncated blockchain address (e.g., GABCD...WXYZ)
- **Visual Status States**: Completed, current, and upcoming milestones with distinct styling
- **Expandable Details**: Click to reveal additional notes and sensor readings
- **Sensor Monitoring**: Display temperature, humidity, pressure, and custom sensor data
- **Responsive Design**: Optimized for mobile, tablet, and desktop views
- **Accessibility**: Full keyboard navigation and ARIA labels

## Usage

```tsx
import MilestoneTimeline, { MilestoneDetail } from './MilestoneTimeline/MilestoneTimeline';

const milestones: MilestoneDetail[] = [
  {
    id: '1',
    name: 'Order Confirmed',
    timestamp: '2026-02-20 09:15 AM EST',
    location: 'New York, NY',
    blockchainAddress: 'GABCD1234567890WXYZ1234567890ABCDEF',
    status: 'completed',
    notes: 'Order successfully confirmed and payment verified.',
    sensorReadings: {
      temperature: '22°C',
      humidity: '45%',
      pressure: '1013 hPa',
    },
  },
  // ... more milestones
];

<MilestoneTimeline milestones={milestones} />
```

## Props

### MilestoneTimelineProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| milestones | `MilestoneDetail[]` | Yes | Array of milestone objects to display |

### MilestoneDetail

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | `string` | Yes | Unique identifier for the milestone |
| name | `string` | Yes | Display name of the milestone event |
| timestamp | `string` | Yes | Timestamp of the milestone |
| location | `string` | Yes | Geographic location of the milestone |
| blockchainAddress | `string` | Yes | Blockchain address that recorded the event |
| status | `'completed' \| 'current' \| 'upcoming'` | Yes | Visual state of the milestone |
| notes | `string` | No | Additional notes or description (shown when expanded) |
| sensorReadings | `object` | No | Sensor data readings (shown when expanded) |

### SensorReadings

The `sensorReadings` object accepts any key-value pairs where values are strings:

```tsx
sensorReadings: {
  temperature?: string;
  humidity?: string;
  pressure?: string;
  [key: string]: string | undefined;
}
```

## Status States

### Completed
- Blue checkmark icon
- Solid blue connector line
- Full color text and details
- Indicates milestone has been reached

### Current
- Pulsing cyan icon with glow effect
- Dashed connector line to next milestone
- Highlighted border on card
- Indicates active/in-progress milestone

### Upcoming
- Gray outlined icon
- Dashed gray connector line
- Muted text colors
- Indicates future milestone

## Expandable Details

Milestones with `notes` or `sensorReadings` display an expand/collapse button. Click to reveal:

- **Notes Section**: Detailed description or additional information
- **Sensor Readings Section**: Grid of sensor data with labels and values

## Blockchain Address Truncation

Long blockchain addresses are automatically truncated for readability:
- Full: `GABCD1234567890WXYZ1234567890ABCDEF`
- Displayed: `GABCD...CDEF`

Addresses 12 characters or shorter are displayed in full.

## Styling

The component uses custom CSS with design tokens from the Tailwind config:
- Background colors: `#0F1419` (card), `#050505` (page)
- Border colors: `#1E2433` (default), `rgba(0, 217, 255, 0.3)` (current)
- Accent colors: `#00D9FF` (primary), `#3B82F6` (completed)
- Text colors: `rgba(255, 255, 255, 0.87)` (primary), `#9CA3AF` (secondary)

## Responsive Breakpoints

- **Desktop** (>768px): Full layout with multi-column sensor grid
- **Tablet** (480px-768px): Adjusted spacing and single-column sensor grid
- **Mobile** (<480px): Compact layout with smaller icons and stacked elements

## Accessibility

- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- Focus indicators on interactive elements
- Screen reader friendly status icons
- Proper heading hierarchy

## Examples

See `MilestoneTimeline.example.tsx` for complete usage examples:
- Standard domestic shipment
- International shipment with customs
- Cold chain pharmaceutical delivery

## Testing

Run tests with:
```bash
pnpm run test MilestoneTimeline.test.tsx
```

The test suite covers:
- Rendering all milestones
- Blockchain address truncation
- Expand/collapse functionality
- Sensor readings display
- Status state styling
- Empty state handling
