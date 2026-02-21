# Core Features Section

## Overview

The Core Features section is a comprehensive, visually striking showcase of Navin's four main capabilities. This section serves as the primary selling point of the platform, communicating exactly what Navin does and why it matters to logistics companies, carriers, and customers.

## Implementation Details

### Components

1. **CoreFeatures.tsx** - Main container component that renders the section header and all feature blocks
2. **FeatureBlock.tsx** - Reusable component for individual feature blocks with scroll animations
3. **CoreFeatures.css** - Complete styling with responsive design and accessibility features

### Features Showcased

#### 1. Real-Time Shipment Tracking
- **Headline**: "Track every delivery, every step of the way"
- **Visual**: Animated delivery route with checkpoints and milestones
- **Key Points**:
  - Live status updates at every checkpoint
  - IoT-powered temperature and condition monitoring
  - Cryptographically verified records

#### 2. Blockchain-Verified Data Integrity (Hash-and-Emit)
- **Headline**: "Don't trust. Verify."
- **Visual**: Data flow diagram showing Backend → Hash → Blockchain → Verification
- **Key Points**:
  - SHA-256 hashes published on-chain
  - Frontend independently verifies against Stellar RPC
  - Tamper-proof audit trail

#### 3. Smart Escrow Payments
- **Headline**: "Payments that release themselves"
- **Visual**: Escrow flow illustration (Lock → Transit → Deliver → Auto-Release)
- **Key Points**:
  - Funds locked on shipment creation
  - Auto-release on delivery confirmation
  - Built-in dispute resolution with on-chain transparency

#### 4. Role-Based Multi-Party Collaboration
- **Headline**: "Everyone sees what they need to see"
- **Visual**: Diagram showing four roles and their capabilities
- **Key Points**:
  - On-chain role assignment with contract-level enforcement
  - Multi-carrier handoff support
  - Company-level carrier whitelisting

## Design Features

### Layout
- **Zigzag Pattern**: Alternating image-left/text-right layout on desktop
- **Responsive Stacking**: Vertical layout on mobile with image always on top
- **Spacing**: 100px gap between blocks on desktop, reduced on smaller screens

### Animations
- **Scroll-Triggered**: Each block fades in and slides up when scrolled into view
- **Intersection Observer**: Uses native browser API for performance
- **Reduced Motion**: Respects user's motion preferences

### Styling
- **Design System**: Uses Bebas Neue for headlines, DM Sans for body text
- **Color Palette**: Teal accent (#00d4c8) on dark background (#050505)
- **Gradients**: Subtle radial gradients for visual depth
- **Alternating Backgrounds**: Even/odd blocks have different gradient directions

### Accessibility
- **Semantic HTML**: Proper heading hierarchy and list structure
- **Alt Text**: Descriptive alt text for all images
- **Keyboard Navigation**: Fully keyboard accessible
- **High Contrast**: Enhanced borders and colors in high contrast mode
- **Reduced Motion**: Animations disabled when user prefers reduced motion

## Responsive Breakpoints

- **Desktop**: 1200px max-width container, 2-column grid
- **Tablet** (≤900px): Reduced spacing, smaller images
- **Mobile** (≤768px): Single column stack, image on top
- **Small Mobile** (≤480px): Further reduced spacing and padding

## Testing

Test file: `CoreFeatures.test.tsx`

Tests cover:
- Section title and subtitle rendering
- All 4 feature blocks present
- Feature descriptions rendered correctly
- All bullet points displayed
- Images with correct alt text

Run tests:
```bash
npm run test
```

## Integration

The CoreFeatures section is integrated into the landing page:

```tsx
// LandingPage.tsx
import Hero from './sections/Hero/Hero';
import CoreFeatures from './sections/CoreFeatures/CoreFeatures';

const LandingPage: React.FC = () => {
  return (
    <main>
      <Hero />
      <CoreFeatures />
    </main>
  );
};
```

## Assets

SVG illustrations located in: `frontend/public/images/core-features/`
- `tracking.svg` - Shipment tracking visualization
- `blockchain.svg` - Hash-and-emit data flow
- `escrow.svg` - Smart escrow payment flow
- `roles.svg` - Role-based collaboration diagram

## Performance Considerations

- **Lazy Loading**: Images use `loading="lazy"` attribute
- **Intersection Observer**: Animations only trigger when in viewport
- **CSS Transitions**: Hardware-accelerated transforms for smooth animations
- **Minimal Re-renders**: Uses `useRef` and `useState` efficiently

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Intersection Observer API (widely supported)
- CSS Grid and Flexbox
- CSS custom properties (CSS variables)

## Future Enhancements

Potential improvements:
- Add animated SVGs with CSS or JavaScript
- Implement parallax scrolling effects
- Add video demonstrations for each feature
- Create interactive demos or prototypes
