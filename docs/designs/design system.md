# Navin Design System

This file documents the visual foundation for the Navin frontend: color palettes, typography scale, spacing, radii, and shadow tokens.

Design reference: Figma Design (paste your Figma link here) — message me for edit access if needed.

---

## Color System

Colors are provided as the project theme + semantic tokens and neutral grayscale. Use these tokens consistently across components.

- **Brand (Teal Theme)**
	- `--color-brand-main`: #0A3D3D — main teal color (primary brand color)
	- `--color-brand-sub`: #208080 — sub / medium teal (used for hover, borders)
	- `--color-brand-highlight`: #62FFFF — highlight / accent light teal (used for highlights, subtle glows)

- **UI / Text / Surface**
	- `--color-bg`: #010101 — application background (deep)
	- `--color-header-text`: #F8FFFF — header / large text on dark backgrounds
	- `--color-body-text`: #E5FFFF — body text on dark backgrounds

- **Semantic (defaults kept, adjust as needed)**
	- `--color-success-500`: #22C55E
	- `--color-warning-500`: #FFB020
	- `--color-error-500`: #EF4444

- **Neutral (Grayscale)** — useful for borders, disabled text, surfaces (kept for contrast hierarchy)
	- `--color-neutral-900`: #111827 (text-primary)
	- `--color-neutral-700`: #374151
	- `--color-neutral-500`: #6B7280
	- `--color-neutral-300`: #D1D5DB
	- `--color-neutral-100`: #F3F4F6

Usage examples:
- Brand main (`--color-brand-main`): primary buttons (filled), active nav item backgrounds on dark surfaces
- Brand sub (`--color-brand-sub`): borders, subtle accents, secondary filled buttons
- Brand highlight (`--color-brand-highlight`): subtle highlights, focus rings, badges
- Background (`--color-bg`): app background and dark surfaces
- Header/body text (`--color-header-text`, `--color-body-text`): text on dark backgrounds
- Semantic: alerts, toasts, validation states

Color swatches (replace these placeholders with your exported swatch images):

![Colors - Brand & Semantic](./images/colors-swatches-brand-semantic.png)
![Colors - Neutral Scale](./images/colors-swatches-neutral.png)

---

## Typography

Font stack:

```
font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

Scale (desktop base 16px):

- `xs` — 12px / 0.75rem — line-height 16px — `font-weight: 400` — UI labels
- `sm` — 14px / 0.875rem — line-height 20px — `font-weight: 400` — captions, form helper
- `base` — 16px / 1rem — line-height 24px — `font-weight: 400` — body copy
- `lg` — 18px / 1.125rem — line-height 28px — `font-weight: 500` — subhead
- `xl` — 20px / 1.25rem — line-height 28px — `font-weight: 600` — section heading
- `2xl` — 24px / 1.5rem — line-height 32px — `font-weight: 700` — page heading
- `3xl` — 30px / 1.875rem — line-height 40px — `font-weight: 700` — hero/title

Weights used:
- `400` — Regular
- `500` — Medium (UI emphasis)
- `600` — Semibold (strong emphasis)
- `700` — Bold (headings)

Example text (rendered previews — add the exported image to show actual font rendering):

![Typography scale preview](./images/typography-scale.png)

CSS variables example:

```
:root {
	--font-family-base: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	--text-xs: 0.75rem;
	--text-sm: 0.875rem;
	--text-base: 1rem;
	--text-lg: 1.125rem;
	--text-xl: 1.25rem;
	--text-2xl: 1.5rem;
	--text-3xl: 1.875rem;
}
```

---

## Spacing (4px base grid)

All spacing tokens follow a 4px base grid. Use these tokens for margin/padding and layout spacing.

| Token | px | Rem | Use |
|---|---:|---:|---|
| `space-1` | 4px | 0.25rem | tight gaps, icon spacing |
| `space-2` | 8px | 0.5rem | small padding, gap between items |
| `space-3` | 12px | 0.75rem | compact groups |
| `space-4` | 16px | 1rem | default padding, vertical rhythm |
| `space-5` | 20px | 1.25rem | larger buttons/pads |
| `space-6` | 24px | 1.5rem | section spacing |
| `space-8` | 32px | 2rem | page sections, large gaps |
| `space-10` | 40px | 2.5rem | generous spacing |
| `space-12` | 48px | 3rem | large containers |
| `space-16` | 64px | 4rem | hero / full-bleed spacing |

Add spacing preview image here: `./images/spacing-grid.png`

---

## Border Radius

Roundness tokens used across components:

- `radius-sm`: 4px — small controls, buttons
- `radius-md`: 8px — cards, input fields
- `radius-lg`: 12px — large containers, modals
- `radius-full`: 9999px — pills, avatars

