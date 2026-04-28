# NotificationDropdown Component

A dropdown component that displays recent notifications in the dashboard top header.

## Features

- Bell icon with dynamic unread badge (hides when count is 0)
- Dropdown displays 5 most recent notifications
- Each notification shows:
  - Type-specific icon (shipment, payment, alert)
  - Message text (truncated to 1 line)
  - Time ago (e.g., "2h ago", "3d ago")
- "View All Notifications" link at the bottom
- Closes on outside click or ESC key press
- Smooth animations and transitions
- Responsive design for mobile devices

## Usage

```tsx
import NotificationDropdown from './components/notifications/NotificationDropdown/NotificationDropdown';

function TopHeader() {
  return (
    <div className="top-header-right">
      <NotificationDropdown />
    </div>
  );
}
```

## Mock Data

Currently uses mock notification data. In production, this should be replaced with real data from an API.

## Notification Types

- `shipment`: Blue package icon
- `payment`: Green dollar sign icon
- `alert`: Orange alert triangle icon

## Styling

The component uses CSS custom properties and follows the existing design system:
- Dark theme with `#0f121a` background
- Border color: `#1e2433`
- Hover states with smooth transitions
- Unread notifications have a blue accent border

## Testing

Run tests with:
```bash
npm run test -- NotificationDropdown.test.tsx
```

All 5 tests pass:
- Renders bell icon with unread badge
- Opens dropdown on click
- Displays 5 notifications
- Closes on close button click
- Closes on ESC key press
