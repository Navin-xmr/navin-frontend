# Legacy CSS Migration Guide

## Overview

This guide documents the migration strategy for converting legacy CSS files to Tailwind CSS utility classes across the Navin frontend. The Features component serves as the reference implementation for this migration pattern.

## Migration Status

As of the production readiness cleanup, **1 of 17** components have been migrated to Tailwind CSS:

✅ **Migrated (1)**:
- `Features` - Landing page features section

⬜ **Remaining (16)**:
- Various components throughout the application (see component inventory below)

## Why Tailwind CSS?

- **Design System Consistency**: All components use the same design tokens from `tailwind.config.js`
- **Smaller Bundle Size**: Tree-shaking automatically removes unused styles
- **Maintainability**: No CSS file sprawl - styles live with components
- **Developer Experience**: Faster development with utility-first approach

## Features Component: Reference Migration

### Before (CSS)

```css
.features {
    padding: 5rem 1rem;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(16, 16, 16, 1) 100%);
}

.features__container {
    max-width: 1280px;
    margin: 0 auto;
}

.features__heading {
    font-size: 1.5rem;
    font-weight: 400;
    text-align: center;
    margin-bottom: 3rem;
    color: #f8ffff;
}

.features__grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: 1fr;
}

.features__card {
    background: rgba(19, 186, 186, 0.1);
    border-radius: 1.25rem;
    padding: 2rem 1.5rem;
    box-shadow: inset 0 0 20px 0px #008080;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.features__card:hover {
    transform: translateY(-4px);
    box-shadow: inset 0 0 30px 0px #008080;
}
```

### After (Tailwind)

```tsx
<section 
    id="features" 
    className="py-20 px-4 bg-gradient-to-b from-black/95 to-[#101010] md:py-24 lg:py-32"
>
    <div className="max-w-screen-xl mx-auto">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-normal text-center mb-12 text-[#f8ffff]">
            Key <span className="text-[#62ffff]">Features</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-6">
            <article 
                className="bg-[rgba(19,186,186,0.1)] rounded-[1.25rem] p-8 md:p-10 lg:p-8 shadow-[inset_0_0_20px_0px_#008080] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_0_30px_0px_#008080]"
            >
                {/* Card content */}
            </article>
        </div>
    </div>
</section>
```

## Common CSS-to-Tailwind Patterns

### Layout

| CSS | Tailwind |
|-----|----------|
| `display: flex;` | `flex` |
| `flex-direction: column;` | `flex-col` |
| `align-items: center;` | `items-center` |
| `justify-content: center;` | `justify-center` |
| `display: grid;` | `grid` |
| `grid-template-columns: repeat(4, 1fr);` | `grid-cols-4` |
| `gap: 1.5rem;` | `gap-6` |
| `max-width: 1280px;` | `max-w-screen-xl` |
| `margin: 0 auto;` | `mx-auto` |

### Spacing

| CSS | Tailwind |
|-----|----------|
| `padding: 1rem;` | `p-4` |
| `padding: 2rem 1.5rem;` | `py-8 px-6` |
| `margin-bottom: 3rem;` | `mb-12` |
| `padding: 5rem 1rem;` | `py-20 px-4` |

### Typography

| CSS | Tailwind |
|-----|----------|
| `font-size: 1.5rem;` | `text-2xl` |
| `font-size: 3.25rem;` | `text-5xl` |
| `font-weight: 600;` | `font-semibold` |
| `text-align: center;` | `text-center` |
| `line-height: 1.6;` | `leading-relaxed` |
| `color: #f8ffff;` | `text-[#f8ffff]` |

### Borders & Radius

| CSS | Tailwind |
|-----|----------|
| `border-radius: 1.25rem;` | `rounded-[1.25rem]` or `rounded-2xl` |
| `border: 1.5px solid rgba(6, 255, 255, 0.4);` | `border-[1.5px] border-[rgba(6,255,255,0.4)]` |

### Shadows & Effects

| CSS | Tailwind |
|-----|----------|
| `box-shadow: inset 0 0 20px 0px #008080;` | `shadow-[inset_0_0_20px_0px_#008080]` |
| `transition: transform 0.3s ease;` | `transition-all duration-300` |
| `transform: translateY(-4px);` | `-translate-y-1` |

### Backgrounds

| CSS | Tailwind |
|-----|----------|
| `background: rgba(19, 186, 186, 0.1);` | `bg-[rgba(19,186,186,0.1)]` |
| `background: linear-gradient(...)` | `bg-gradient-to-b from-black/95 to-[#101010]` |

### Responsive Design

| CSS Media Query | Tailwind Prefix |
|-----------------|-----------------|
| `@media (min-width: 768px)` | `md:` |
| `@media (min-width: 1024px)` | `lg:` |

Example:
```tsx
className="text-2xl md:text-4xl lg:text-5xl"
// Mobile: text-2xl
// Tablet: text-4xl  
// Desktop: text-5xl
```

## Migration Checklist

For each component migration:

1. **Read the existing CSS file** to understand all styles
2. **Map CSS properties to Tailwind utilities** using the patterns above
3. **Update the component JSX** with Tailwind classes
4. **Remove the CSS import** statement
5. **Delete the CSS file**
6. **Test visual appearance** - should be identical to original
7. **Run TypeScript check**: `pnpm exec tsc --noEmit`
8. **Run linter**: `pnpm run lint`
9. **Commit changes** with descriptive message

## Best Practices

- **Use arbitrary values sparingly**: `text-[#f8ffff]` when design tokens don't cover it
- **Prefer design tokens**: Use `text-primary` instead of `text-[#62ffff]` when possible
- **Keep classes readable**: Break long className strings across multiple lines if needed
- **Maintain visual fidelity**: The migrated component must look identical to the original
- **Use responsive prefixes**: `md:` and `lg:` for tablet and desktop breakpoints
- **Group related utilities**: padding/margin together, colors together, etc.

## Common Gotchas

1. **Font faces**: Don't migrate `@font-face` declarations - keep them in global CSS
2. **Complex gradients**: Use arbitrary values: `bg-gradient-to-b from-black/95 to-[#101010]`
3. **Custom shadows**: Use arbitrary values: `shadow-[inset_0_0_20px_0px_#008080]`
4. **Hover states**: Use `hover:` prefix: `hover:-translate-y-1`
5. **Transitions**: Combine `transition-all` with `duration-300` for smooth animations

## Getting Help

- Check [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- Reference the Features component migration as a template
- Ask in the team's Telegram group for migration questions
- Use the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) VS Code extension

## Future Work

The remaining 16 components should be migrated incrementally as they are touched for feature work or bug fixes. Complete migration is not required for production deployment but is recommended for long-term maintainability.
