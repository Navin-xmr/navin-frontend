# NotificationDropdown Component Structure

## Component Hierarchy

```
NotificationDropdown
├── Bell Button (icon-box)
│   ├── Bell Icon (lucide-react)
│   └── Badge (notification-badge) - shows unread count
│
└── Dropdown (notification-dropdown) - shown when open
    ├── Header (notification-dropdown-header)
    │   ├── Title: "Notifications"
    │   └── Close Button (X icon)
    │
    ├── Notification List (notification-list)
    │   └── Notification Items (5 items)
    │       ├── Icon Wrapper
    │       │   └── Type Icon (Package/DollarSign/AlertTriangle)
    │       └── Content
    │           ├── Message (truncated to 1 line)
    │           └── Time Ago (e.g., "2h ago")
    │
    └── Footer (notification-dropdown-footer)
        └── "View All Notifications" Button
```

## State Management

```typescript
const [isOpen, setIsOpen] = useState(false);
const [notifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
const dropdownRef = useRef<HTMLDivElement>(null);
```

## Event Handlers

1. **handleToggle()** - Opens/closes dropdown on bell click
2. **handleClickOutside()** - Closes dropdown when clicking outside
3. **handleEscKey()** - Closes dropdown on ESC key press
4. **handleViewAll()** - Navigates to full notifications page (placeholder)

## Notification Interface

```typescript
interface Notification {
  id: string;
  type: 'shipment' | 'payment' | 'alert';
  message: string;
  timestamp: Date;
  read: boolean;
}
```

## Helper Functions

1. **getTimeAgo(timestamp: Date): string**
   - Converts timestamp to relative time format
   - Returns: "Xm ago", "Xh ago", or "Xd ago"

2. **getNotificationIcon(type: Notification['type'])**
   - Returns appropriate icon component based on notification type
   - Shipment: Package icon (blue)
   - Payment: DollarSign icon (green)
   - Alert: AlertTriangle icon (orange)

## CSS Classes

### Main Container
- `.notification-dropdown-container` - Wrapper with relative positioning

### Bell Button
- `.notification-bell` - Bell icon button
- `.notification-badge` - Red badge with unread count

### Dropdown
- `.notification-dropdown` - Main dropdown container
- `.notification-dropdown-header` - Header with title and close button
- `.notification-list` - Scrollable list container
- `.notification-item` - Individual notification item
- `.notification-item.unread` - Unread notification styling
- `.notification-dropdown-footer` - Footer with "View All" button

### Icons & Content
- `.notification-icon-wrapper` - Icon container
- `.notification-icon` - Base icon styling
- `.notification-icon.shipment` - Blue shipment icon
- `.notification-icon.payment` - Green payment icon
- `.notification-icon.alert` - Orange alert icon
- `.notification-content` - Message and time container
- `.notification-message` - Truncated message text
- `.notification-time` - Time ago text

## Responsive Behavior

### Desktop (> 768px)
- Dropdown width: 380px
- Full padding and spacing

### Mobile (≤ 768px)
- Dropdown width: 320px
- Reduced padding
- Adjusted positioning

## Accessibility Features

- `aria-label="Notifications"` on bell button
- `aria-haspopup="true"` on bell button
- `aria-expanded={isOpen}` on bell button
- `aria-label="Close notifications"` on close button
- Keyboard navigation support (ESC key)
- Focus management
