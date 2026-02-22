# Shipment Detail Design

Design for the full detail view of a single shipment. This document captures desktop and mobile mockups, layout decisions, and component behavior for the shipment detail page.

Design reference: https://www.figma.com/design/QkQC037evEB8rRN7pz0ToS/Navin?node-id=280-7&p=f

## Goals
- Present a clear shipment header with ID, status and route (origin → destination)
- Expanded milestone timeline showing completed, current and upcoming states
- IoT sensor data cards: temperature, humidity, GPS
- Payment status panel with amounts and status
- Delivery proof: photo upload area with preview and upload actions
- Responsive layouts for desktop and mobile

## Desktop mockup (description)

- Header: left-aligned shipment ID and status chip; right-aligned small action buttons
- Main area: two-column layout
  - Left (60%): Expanded milestone timeline (vertical) with timestamps and descriptions
  - Right (40%): Stack of cards: IoT sensors grid, Payment status, Delivery proof upload


