# Core Features Component Structure

## Component Hierarchy

```
CoreFeatures (section)
├── core-features__header
│   ├── core-features__title (h2)
│   └── core-features__subtitle (p)
└── core-features__blocks
    ├── FeatureBlock #1 (image-left)
    │   ├── feature-block__image-wrapper
    │   │   └── feature-block__image (img)
    │   └── feature-block__content
    │       ├── feature-block__headline (h3)
    │       ├── feature-block__description (p)
    │       └── feature-block__bullets (ul)
    │           └── feature-block__bullet (li) × 3
    │               ├── feature-block__bullet-icon (svg)
    │               └── span (text)
    ├── FeatureBlock #2 (image-right)
    ├── FeatureBlock #3 (image-left)
    └── FeatureBlock #4 (image-right)
```

## Data Flow

```
CoreFeatures Component
    │
    ├─→ features[] array (4 items)
    │   └─→ Each feature object contains:
    │       ├─ headline: string
    │       ├─ description: string
    │       ├─ bullets: string[]
    │       ├─ imagePath: string
    │       └─ imageAlt: string
    │
    ├─→ IntersectionObserver
    │   └─→ Tracks visibility of each block
    │       └─→ Updates visibleBlocks Set
    │
    └─→ Maps features to FeatureBlock components
        └─→ Passes props + visibility state
```

## State Management

```typescript
// Visibility tracking for scroll animations
const [visibleBlocks, setVisibleBlocks] = useState<Set<number>>(new Set());

// Ref for section element
const sectionRef = useRef<HTMLElement>(null);
```

## Props Interface (FeatureBlock)

```typescript
interface FeatureBlockProps {
  index: number;           // For zigzag layout and visibility tracking
  headline: string;        // Main feature title
  description: string;     // Detailed explanation
  bullets: string[];       // Array of 3 bullet points
  imagePath: string;       // Path to SVG illustration
  imageAlt: string;        // Accessibility alt text
  isVisible: boolean;      // Controls animation trigger
}
```

## CSS Class Structure

### CoreFeatures Component
- `.core-features` - Main section container
- `.core-features__header` - Header wrapper
- `.core-features__title` - Section title (h2)
- `.core-features__subtitle` - Section subtitle (p)
- `.core-features__blocks` - Container for all feature blocks

### FeatureBlock Component
- `.feature-block` - Block container (grid)
- `.feature-block--image-left` - Modifier for left image layout
- `.feature-block--image-right` - Modifier for right image layout
- `.feature-block--visible` - Modifier when block is in viewport
- `.feature-block__image-wrapper` - Image container
- `.feature-block__image` - The actual image element
- `.feature-block__content` - Text content container
- `.feature-block__headline` - Feature title (h3)
- `.feature-block__description` - Feature description (p)
- `.feature-block__bullets` - Bullet list (ul)
- `.feature-block__bullet` - Individual bullet item (li)
- `.feature-block__bullet-icon` - Checkmark SVG icon

## Animation Flow

```
1. Component mounts
   └─→ IntersectionObserver created
       └─→ Observes all .feature-block elements

2. User scrolls down
   └─→ Block enters viewport (20% visible)
       └─→ Observer callback fires
           └─→ Block index added to visibleBlocks Set
               └─→ Component re-renders
                   └─→ isVisible prop becomes true
                       └─→ .feature-block--visible class applied
                           └─→ CSS transition triggers
                               ├─ opacity: 0 → 1
                               └─ transform: translateY(40px) → translateY(0)

3. Component unmounts
   └─→ Observer disconnected (cleanup)
```

## Grid Layout Logic

```css
/* Desktop (default) */
.feature-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

/* Zigzag pattern */
.feature-block--image-left {
  grid-template-areas: 'image content';
}

.feature-block--image-right {
  grid-template-areas: 'content image';
}

/* Mobile (<768px) */
@media (max-width: 768px) {
  .feature-block {
    grid-template-columns: 1fr;
    grid-template-areas:
      'image'
      'content';
  }
}
```

## Responsive Behavior

| Viewport Width | Layout | Columns | Image Position |
|---------------|--------|---------|----------------|
| > 900px | Grid | 2 | Alternating |
| 768px - 900px | Grid | 2 | Alternating (reduced gaps) |
| < 768px | Stack | 1 | Always on top |

## Performance Optimizations

1. **Lazy Loading**: Images use `loading="lazy"` attribute
2. **GPU Acceleration**: Animations use `transform` and `opacity`
3. **Observer Cleanup**: IntersectionObserver disconnected on unmount
4. **Efficient Re-renders**: Only updates when visibility changes
5. **CSS Containment**: Blocks are isolated for paint optimization

## Accessibility Features

1. **Semantic HTML**: Proper use of section, h2, h3, ul, li
2. **Heading Hierarchy**: h2 (section) → h3 (features)
3. **Alt Text**: All images have descriptive alt attributes
4. **ARIA Hidden**: Decorative icons marked with aria-hidden="true"
5. **Keyboard Navigation**: All interactive elements are focusable
6. **Color Contrast**: Text meets WCAG AA standards

## Browser Support

| Feature | Requirement | Fallback |
|---------|-------------|----------|
| IntersectionObserver | Chrome 51+, Firefox 55+, Safari 12.1+ | Blocks visible by default |
| CSS Grid | All modern browsers | Flexbox fallback possible |
| CSS Custom Properties | All modern browsers | Hard-coded values |
| SVG | Universal support | PNG fallback possible |

## Testing Strategy

```typescript
// Unit Tests (CoreFeatures.test.tsx)
describe('CoreFeatures', () => {
  it('renders section title and subtitle')
  it('renders all four feature blocks')
  it('renders feature descriptions')
  it('renders bullet points for each feature')
  it('renders images with proper alt text')
  it('applies correct CSS classes for zigzag layout')
})
```

## Integration Points

### Parent Component (LandingPage.tsx)
```typescript
import CoreFeatures from './sections/CoreFeatures/CoreFeatures';

const LandingPage: React.FC = () => {
  return (
    <main>
      <Hero />
      <CoreFeatures />  {/* Inserted here */}
      {/* Future sections: Features grid, How It Works, etc. */}
    </main>
  );
};
```

### Design System Integration
- Uses same fonts as Hero section (DM Sans, Bebas Neue)
- Matches color palette (#00d4c8 teal accent)
- Consistent spacing scale (16px, 24px, 40px, 60px, 80px, 100px, 120px)
- Same dark background gradients

## File Dependencies

```
CoreFeatures.tsx
├── React (useState, useEffect, useRef)
├── FeatureBlock.tsx
└── CoreFeatures.css

FeatureBlock.tsx
└── React

CoreFeatures.css
└── Google Fonts (DM Sans, Bebas Neue)

CoreFeatures.test.tsx
├── @testing-library/react
├── vitest
└── CoreFeatures.tsx
```

## Future Enhancement Hooks

Areas designed for easy extension:

1. **Animation Variants**: Add more animation types by modifying CSS transitions
2. **Interactive Demos**: Replace static images with interactive components
3. **Video Support**: Swap SVG images for video elements
4. **Modal Dialogs**: Add "Learn More" buttons that open detailed modals
5. **Parallax Effects**: Enhance scroll animations with parallax
6. **Theme Toggle**: Add light/dark theme support
7. **Internationalization**: Extract strings for i18n support
