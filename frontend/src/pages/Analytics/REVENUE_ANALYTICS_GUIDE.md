# Revenue Analytics Dashboard - Quick Start Guide

## 📍 Access the Dashboard

### URL
```
http://localhost:5173/dashboard/analytics/revenue
```

### Prerequisites
- Must be logged in as a company user
- Must be on the company dashboard

### Navigation
From the company dashboard:
1. Navigate to `/dashboard/analytics/revenue`
2. Or add a link in the Analytics menu to this page

## 🎯 Features Overview

### KPI Cards (Top Section)
- **Total Revenue**: Shows overall revenue in the selected period
- **Month-over-Month Change**: Percentage change from previous month (green for increase, red for decrease)
- **Avg Revenue per Shipment**: Average revenue generated per shipment

### Charts Section

#### 1. Monthly Revenue Bar Chart
- **Left chart**: Shows actual vs target revenue over last 12 months
- **Interaction**: Hover to see exact values
- **Colors**: Blue = Actual, Green = Target

#### 2. Revenue by Service Type Donut Chart  
- **Right chart**: Breakdown of revenue by service type
- **Categories**: Express (blue), Standard (green), Economy (amber)
- **Legend**: Below the chart with exact revenue amounts

#### 3. Revenue by Region Line Chart
- **Bottom left**: Revenue trends across 4 regions
- **Regions**: North, South, East, West
- **Interactive**: Click on legend to toggle regions

#### 4. Top 10 Customers Table
- **Bottom right**: Ranked list of top customers by revenue
- **Ranking**: #1 to #10
- **Data**: Customer name and revenue amount

## 🎛️ Date Range Filter

### How to Use
1. Locate the date picker in the top right
2. Click the start date field and select a date
3. Click the end date field and select a date
4. All charts update automatically (300ms delay for performance)

### Default Range
- **Start**: 30 days ago from today
- **End**: Today

## 📥 PDF Export

### How to Export
1. Click the **"Export PDF"** button (top right)
2. Browser will download `revenue-analytics.pdf`
3. File contains all visible charts and KPI data
4. Landscape orientation for optimal readability

### Export Contents
- All KPI cards
- All four chart visualizations
- Current date range filter values
- Timestamp of export

## 📱 Responsive Design

### Desktop (Full Width)
- 3-column KPI layout
- 2-column chart grid (2 charts per row)
- Optimal spacing and typography

### Tablet (max-lg)
- Single column layout
- Charts stack vertically
- Optimized spacing for medium screens

### Mobile (max-md)
- Single column layout
- All elements full width
- Touch-friendly controls
- Optimized padding and margins

## 🔄 Data Updates

### Auto-Refresh
- Charts update when date range changes
- 300ms debounce to prevent excessive re-renders
- Smooth loading states with spinner

### Loading State
- Shows loading spinner while fetching data
- "Loading revenue data..." message
- Typical load time: <300ms

## 🎨 Design System

### Colors
- **Primary Background**: Dark slate (`#0f172a`)
- **Card Background**: Slate-900 (`#111827`)
- **Borders**: Slate-800 (`#1e293b`)
- **Text**: White / Slate-400
- **Accents**:
  - Blue: #3b82f6 (primary)
  - Green: #10b981 (success/positive)
  - Amber: #f59e0b (warning)
  - Red: #ef4444 (negative)
  - Purple: #8b5cf6 (secondary)

### Typography
- **Heading**: 3xl, semibold, tracking-tight
- **Subheading**: lg, semibold
- **Labels**: sm, medium, slate-400
- **Body**: sm, normal

## 🧪 Testing the Component

### Manual Testing Checklist
- [ ] Navigate to `/dashboard/analytics/revenue`
- [ ] Verify all KPI cards display with correct formatting
- [ ] Check all four charts render without errors
- [ ] Test date range filter (change dates and verify charts update)
- [ ] Test PDF export (download and verify content)
- [ ] Test responsive design (resize browser window)
- [ ] Test on mobile device (check layout and spacing)
- [ ] Verify loading state appears briefly
- [ ] Check console for any errors

### Unit Tests
```bash
pnpm run test src/pages/Analytics/RevenueAnalytics.test.tsx
```

## 🐛 Troubleshooting

### Charts Not Displaying
1. Check browser console for errors
2. Verify Recharts is installed: `pnpm install recharts`
3. Clear browser cache and reload

### PDF Export Not Working
1. Verify html2pdf.js is installed: `pnpm install html2pdf.js`
2. Check if browser allows downloads
3. Try a different browser

### Date Filter Not Working
1. Verify date inputs have correct values
2. Check browser console for JavaScript errors
3. Ensure date format is YYYY-MM-DD

### Styling Issues
1. Verify Tailwind CSS is properly configured
2. Clear Tailwind cache: `rm -rf .tailwindcache`
3. Rebuild: `pnpm run dev`

## 📚 Related Files

- **Main Component**: `/frontend/src/pages/Analytics/RevenueAnalytics.tsx`
- **Tests**: `/frontend/src/pages/Analytics/RevenueAnalytics.test.tsx`
- **Route Config**: `/frontend/src/App.tsx`
- **Documentation**: `/frontend/src/pages/Analytics/REVENUE_ANALYTICS_IMPLEMENTATION.md`

## 🔗 Integration Notes

- Component is lazy-loaded for performance
- Protected by RoleGuard (company role only)
- Uses mock data for demonstration (replace with real API calls in production)
- Fully typed with TypeScript for better DX
- Follows Navin design system and conventions

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the implementation documentation
3. Check browser console for error messages
4. Review component test file for expected behavior
