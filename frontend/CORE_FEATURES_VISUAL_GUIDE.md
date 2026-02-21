# Core Features Section - Visual Implementation Guide

## 🎨 Visual Layout

### Desktop View (>900px)
```
┌─────────────────────────────────────────────────────────────┐
│                      CORE FEATURES                          │
│     Everything you need for transparent, secure, and        │
│              automated logistics                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │                 │  │  Track every delivery, every     │  │
│  │   [Tracking     │  │  step of the way                 │  │
│  │    Visual]      │  │                                  │  │
│  │                 │  │  Description text...             │  │
│  │                 │  │                                  │  │
│  └─────────────────┘  │  ✓ Live status updates           │  │
│                       │  ✓ IoT-powered monitoring        │  │
│                       │  ✓ Cryptographically verified    │  │
│                       └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────┐  ┌─────────────────┐  │
│  │  Don't trust. Verify.            │  │                 │  │
│  │                                  │  │  [Blockchain    │  │
│  │  Description text...             │  │   Visual]       │  │
│  │                                  │  │                 │  │
│  │  ✓ SHA-256 hashes on-chain      │  │                 │  │
│  │  ✓ Frontend verifies             │  └─────────────────┘  │
│  │  ✓ Tamper-proof audit trail     │                       │
│  └──────────────────────────────────┘                       │
└──────────────────────────────────────────────────────────────┘

[Pattern continues for Escrow and Roles features...]
```

### Mobile View (≤768px)
```
┌────────────────────────┐
│   CORE FEATURES        │
│   Everything you need  │
└────────────────────────┘

┌────────────────────────┐
│  ┌──────────────────┐  │
│  │                  │  │
│  │  [Tracking       │  │
│  │   Visual]        │  │
│  │                  │  │
│  └──────────────────┘  │
│                        │
│  Track every delivery, │
│  every step of the way │
│                        │
│  Description text...   │
│                        │
│  ✓ Live status updates │
│  ✓ IoT monitoring      │
│  ✓ Verified records    │
└────────────────────────┘

[Stacked vertically for all features...]
```

## 🎬 Animation Behavior

### Scroll Animation Sequence:
```
User scrolls down
       ↓
Feature block enters viewport (10% visible)
       ↓
Intersection Observer triggers
       ↓
Block fades in (opacity: 0 → 1)
       +
Block slides up (translateY: 40px → 0)
       ↓
Animation duration: 0.8s ease
       ↓
Block remains visible
```

### Hover Animation:
```
User hovers over feature block
       ↓
Image wrapper scales up (1 → 1.02)
       +
Shadow appears (0 → 8px blur, teal glow)
       ↓
Transition: 0.3s ease
```

## 🎨 Color Palette

```css
/* Primary Colors */
Background:        #050505 (near black)
Accent:           #00d4c8 (teal)
Text Primary:     #ffffff (white)
Text Secondary:   rgba(200, 230, 240, 0.75) (light blue-gray)

/* Gradients */
Block Background: radial-gradient(
  ellipse at 30% 50%,
  rgba(10, 61, 58, 0.15) 0%,
  rgba(6, 30, 32, 0.08) 50%,
  transparent 100%
)

Alternate Block:  radial-gradient(
  ellipse at 70% 50%,
  rgba(0, 212, 200, 0.08) 0%,
  rgba(10, 61, 58, 0.05) 50%,
  transparent 100%
)
```

## 📐 Spacing System

```
Section Padding:
  Desktop:  120px top/bottom
  Tablet:   80px top/bottom
  Mobile:   60px top/bottom

Block Gaps:
  Desktop:  100px between blocks
  Tablet:   70px between blocks
  Mobile:   50px between blocks

Block Padding:
  Desktop:  60px 40px
  Tablet:   40px 30px
  Mobile:   30px 20px

Grid Gap:
  Desktop:  60px between columns
  Tablet:   40px between columns
  Mobile:   30px (stacked)
```

## 🔤 Typography Scale

```css
/* Section Title */
font-family: 'Bebas Neue', sans-serif
font-size: clamp(2.5rem, 6vw, 4rem)
letter-spacing: 0.04em
color: #ffffff

/* Section Subtitle */
font-family: 'DM Sans', sans-serif
font-size: clamp(1rem, 2vw, 1.2rem)
font-weight: 300
color: rgba(200, 230, 240, 0.7)

/* Feature Headline */
font-family: 'DM Sans', sans-serif
font-size: clamp(1.5rem, 3vw, 2rem)
font-weight: 500
color: #ffffff

/* Feature Description */
font-family: 'DM Sans', sans-serif
font-size: clamp(0.95rem, 1.5vw, 1.05rem)
font-weight: 300
color: rgba(200, 230, 240, 0.75)

/* Bullet Points */
font-family: 'DM Sans', sans-serif
font-size: clamp(0.9rem, 1.5vw, 1rem)
font-weight: 400
color: rgba(200, 230, 240, 0.85)
```

## 🖼️ Image Specifications

### SVG Assets:
```
Location: frontend/public/images/core-features/

tracking.svg    - 400x300px - Delivery route with checkpoints
blockchain.svg  - 400x300px - Data flow diagram
escrow.svg      - 400x300px - Payment flow illustration
roles.svg       - 400x300px - Role collaboration diagram

All SVGs use:
- Teal accent color (#00d4c8)
- Dark backgrounds (rgba(10, 61, 58, 0.3))
- Consistent stroke widths (2px)
- DM Sans font for labels
```

## 🎯 Component Structure

```
CoreFeatures (Section Container)
│
├─ core-features__container (Max-width wrapper)
│  │
│  ├─ core-features__header
│  │  ├─ core-features__title (h2)
│  │  └─ core-features__subtitle (p)
│  │
│  └─ core-features__blocks
│     │
│     ├─ FeatureBlock (Real-Time Tracking)
│     │  ├─ feature-block__image-wrapper
│     │  │  └─ feature-block__image
│     │  └─ feature-block__content
│     │     ├─ feature-block__headline (h3)
│     │     ├─ feature-block__description (p)
│     │     └─ feature-block__bullets (ul)
│     │        └─ feature-block__bullet (li) × 3
│     │
│     ├─ FeatureBlock (Blockchain) [--reverse]
│     ├─ FeatureBlock (Escrow)
│     └─ FeatureBlock (Roles) [--reverse]
```

## 🔄 State Management

```typescript
// FeatureBlock Component
const [isVisible, setIsVisible] = useState(false);
const blockRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect(); // One-time animation
      }
    },
    { threshold: 0.1 } // Trigger at 10% visibility
  );

  if (blockRef.current) {
    observer.observe(blockRef.current);
  }

  return () => observer.disconnect();
}, []);
```

## 📱 Responsive Behavior

### Grid Layout Changes:
```
Desktop (>900px):
  grid-template-columns: 1fr 1fr
  gap: 60px

Tablet (≤900px):
  grid-template-columns: 1fr 1fr
  gap: 40px

Mobile (≤768px):
  grid-template-columns: 1fr
  gap: 30px
  [Image always on top]
```

### Image Size Adjustments:
```
Desktop:  max-width: 400px
Tablet:   max-width: 320px
Mobile:   max-width: 100%
```

## ♿ Accessibility Features

### Semantic HTML:
```html
<section class="core-features">
  <div class="core-features__container">
    <div class="core-features__header">
      <h2>Core Features</h2>
      <p>Subtitle text</p>
    </div>
    <div class="core-features__blocks">
      <div class="feature-block">
        <div class="feature-block__image-wrapper">
          <img alt="Descriptive alt text" loading="lazy" />
        </div>
        <div class="feature-block__content">
          <h3>Feature Headline</h3>
          <p>Description</p>
          <ul>
            <li>Bullet point</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>
```

### ARIA & Focus:
- Proper heading hierarchy (h2 → h3)
- Descriptive alt text for all images
- Semantic list structure for bullets
- Keyboard navigation support
- Focus indicators on interactive elements

### Motion Preferences:
```css
@media (prefers-reduced-motion: reduce) {
  .feature-block {
    transition: opacity 0.3s ease;
    transform: none; /* No slide animation */
  }
}
```

## 🎯 Performance Optimizations

1. **Lazy Loading**: Images use `loading="lazy"` attribute
2. **Intersection Observer**: Native browser API, no external library
3. **CSS Transforms**: Hardware-accelerated (translateY, scale)
4. **One-time Animations**: Observer disconnects after triggering
5. **Efficient Re-renders**: Minimal state updates
6. **CSS Grid**: Modern, performant layout system

## 📊 Browser Compatibility

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

Features used:
- CSS Grid (widely supported)
- Intersection Observer API (96%+ support)
- CSS Custom Properties (98%+ support)
- CSS clamp() (95%+ support)

## 🎉 Final Result

A visually striking, fully responsive, accessible Core Features section that:
- Clearly communicates Navin's value proposition
- Engages users with smooth scroll animations
- Works flawlessly on all devices
- Follows accessibility best practices
- Maintains design system consistency
- Performs efficiently across browsers
