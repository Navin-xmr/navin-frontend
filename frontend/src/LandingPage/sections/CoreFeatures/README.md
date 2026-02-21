# Core Features Section

## Overview

The Core Features section is a comprehensive, visually striking showcase of Navin's main capabilities. It's designed to communicate exactly what the platform does and why it matters to logistics companies, carriers, and customers.

## Components

### CoreFeatures.tsx
Main container component that:
- Manages scroll-triggered animations using IntersectionObserver
- Renders the section header with title and subtitle
- Maps through feature data and renders FeatureBlock components
- Tracks visibility state for each block to trigger animations

### FeatureBlock.tsx
Reusable component for each feature that:
- Accepts feature data as props (headline, description, bullets, image)
- Implements zigzag layout (alternating image-left/image-right)
- Renders feature content with proper semantic HTML
- Includes custom checkmark icons for bullet points

### CoreFeatures.css
Comprehensive styling that includes:
- Dark theme with teal accent colors matching the Hero section
- Responsive grid layout for desktop (2 columns)
- Stacked layout for mobile devices
- Smooth scroll animations (fade-in + slide-up)
- Glassmorphism effects with backdrop blur
- Design system tokens (DM Sans font, consistent spacing)

## Features Showcased

1. **Real-Time Shipment Tracking**
   - Live status updates at every checkpoint
   - IoT-powered temperature and condition monitoring
   - Cryptographically verified records

2. **Blockchain-Verified Data Integrity (Hash-and-Emit)**
   - SHA-256 hashes published on-chain
   - Frontend independent verification
   - Tamper-proof audit trail

3. **Smart Escrow Payments**
   - Funds locked on shipment creation
   - Auto-release on delivery confirmation
   - Built-in dispute resolution

4. **Role-Based Multi-Party Collaboration**
   - On-chain role assignment
   - Multi-carrier handoff support
   - Company-level carrier whitelisting

## Visual Assets

All feature illustrations are located in `frontend/public/images/core-features/`:
- `tracking.svg` - Animated delivery route with checkpoints
- `blockchain.svg` - Data flow diagram showing hash-and-emit architecture
- `escrow.svg` - Smart contract escrow payment flow
- `roles.svg` - Four-role permission system diagram

Each SVG includes:
- Consistent color scheme (#00d4c8 teal accent)
- Animations where appropriate
- Accessible design with proper contrast
- Responsive sizing

## Layout Pattern

The section uses a zigzag layout:
- Feature 1: Image Left, Content Right
- Feature 2: Content Left, Image Right
- Feature 3: Image Left, Content Right
- Feature 4: Content Left, Image Right

On mobile (<768px), all blocks stack vertically with image on top.

## Animations

Scroll-triggered animations are implemented using IntersectionObserver:
- Blocks fade in and slide up when they enter the viewport
- 20% threshold with 100px bottom margin for optimal timing
- Smooth 0.8s ease transition
- Once visible, blocks remain visible (no re-animation on scroll up)

## Accessibility

- Semantic HTML structure (section, h2, h3, ul, li)
- Proper heading hierarchy
- Alt text for all images
- ARIA hidden for decorative icons
- Keyboard navigation support
- Sufficient color contrast ratios

## Responsive Breakpoints

- Desktop: 1200px max-width container, 2-column grid
- Tablet (≤900px): Reduced padding and gaps
- Mobile (≤768px): Single column stack, optimized spacing

## Testing

Test file: `CoreFeatures.test.tsx`

Tests cover:
- Section title and subtitle rendering
- All four feature blocks present
- Feature descriptions and bullet points
- Image rendering with proper alt text
- Correct CSS classes for zigzag layout

## Integration

The CoreFeatures section is imported and rendered in `LandingPage.tsx`:

```tsx
import CoreFeatures from './sections/CoreFeatures/CoreFeatures';

const LandingPage: React.FC = () => {
  return (
    <main>
      <Hero />
      <CoreFeatures />
      {/* Other sections */}
    </main>
  );
};
```

## Design System Tokens

Following the established design system from Hero section:

- **Font Family**: 'DM Sans' for body, 'Bebas Neue' for titles
- **Primary Color**: #00d4c8 (teal)
- **Background**: Dark gradients (#000, #0a1a1f)
- **Text Colors**: 
  - Primary: #ffffff
  - Secondary: rgba(200, 230, 240, 0.7-0.85)
- **Spacing**: Consistent 16px, 24px, 40px, 60px, 80px, 100px, 120px
- **Border Radius**: 8px, 12px, 16px
- **Transitions**: 0.8s ease for animations

## Performance Considerations

- Images use `loading="lazy"` for better performance
- IntersectionObserver is cleaned up on component unmount
- CSS animations use transform and opacity (GPU-accelerated)
- SVG images are optimized and inline where possible

## Future Enhancements

Potential improvements:
- Add parallax scrolling effects
- Implement more complex animations (stagger, bounce)
- Add video demonstrations instead of static images
- Include interactive demos or code snippets
- Add "Learn More" links to detailed documentation
