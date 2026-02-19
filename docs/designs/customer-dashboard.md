# Customer Dashboard Design - Issue #5

## Goal
Design a premium end-customer dashboard with a dark neon blue visual system that improves shipment visibility, search speed, and status awareness on both desktop and mobile.

## Visual Theme
- Background: deep navy gradients (`#031127`, `#061B3A`, `#041633`)
- Accent: neon cyan (`#00D1FF`) with aqua glow (`#54FFE0`)
- Text: high-contrast cool white and desaturated blue for secondary copy
- Panels: translucent dark glass cards with subtle border glow

---

## Desktop Mockup

```text
+------------------------------------------------------------------------------------------------------+
| Sidebar (Desktop)      | Main Content                                       | Right Rail             |
|------------------------|----------------------------------------------------|------------------------|
| Navin logo             | Header: Hello Thomas + profile + bell             | Weekly Shipments       |
| Dashboard              | ------------------------------------------------- | Avg. Order Value       |
| Shipments              | [ Notification Banner: delayed shipments ]         | Delivered Today        |
| Fleet                  | ------------------------------------------------- | Dispatch Timeline      |
| Analytics              | [ Search ] [Status] [Date] [Filters]              | Quick Shipment CTA     |
| Settings               | ------------------------------------------------- |                        |
|                        | [ Line Chart: Delivery Performance (7d) ]          |                        |
| Promo card             | [ Bar Chart: Shipment Volume by Route ]            |                        |
|                        | ------------------------------------------------- |                        |
|                        | Active Shipments (3-column cards):                 |                        |
|                        |  - In Transit                                     |                        |
|                        |  - Delayed                                        |                        |
|                        |  - Delivered                                      |                        |
+------------------------------------------------------------------------------------------------------+
```

---

## Mobile Mockup

```text
+--------------------------------------+
| [Menu] Hello Thomas      [Bell][Me]  |
|--------------------------------------|
| Notification Banner                  |
|--------------------------------------|
| Search shipments...                  |
| [Status] [Date] [Filters]            |
|--------------------------------------|
| Delivery Performance (line chart)    |
|--------------------------------------|
| Shipment Volume (bar chart)          |
|--------------------------------------|
| Active Shipment Card - In Transit    |
| Active Shipment Card - Delayed       |
| Active Shipment Card - Delivered     |
|--------------------------------------|
| Bottom Nav: Home | Shipments | Alerts|
+--------------------------------------+
```

Mobile uses bottom navigation for thumb-friendly access and hides desktop sidebar.

---

## Active Shipment Card States

### In Transit
- Blue status chip with truck icon
- ETA + progress bar
- Actions: `Track Live`, `Contact`

### Delayed
- Amber status chip with alert icon
- Delay reason and duration
- Actions: `Resolve`, `Notify`

### Delivered
- Green status chip with check icon
- Delivery timestamp and confirmation context
- Actions: `View Receipt`, `Reorder`

All states use color + icon + label to avoid color-only communication.

---

## Layout Decisions (for PR description)
- Alerts are prioritized at the top to surface operational risk immediately.
- Search and filters are placed above content cards for quick narrowing of shipments.
- Charts are placed before cards to provide trend context before item-level actions.
- Shipment cards are state-first and action-oriented to reduce interaction steps.
- Desktop uses a 3-pane layout (sidebar, content, right rail) for scan efficiency.
- Mobile simplifies to a single column with persistent bottom navigation.

---

## Acceptance Mapping
- Desktop and mobile mockups: Yes (see mockups above)
- Active shipment states shown: Yes (`in transit`, `delayed`, `delivered`)
- Design document in `docs/designs/`: Yes (`customer-dashboard.md`)
