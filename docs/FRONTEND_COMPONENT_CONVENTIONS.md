# Frontend Component and Styling Conventions

> **Issue:** [#114 — \[DOCS:\] Frontend Component and Styling Conventions](https://github.com/Navin-xmr/navin-frontend/issues/114)
>
> This document is the authoritative reference for how components, pages, and hooks are structured, named, styled, and imported in the Navin frontend. All new contributions must follow these conventions. See also [`COMPONENT_CONVENTIONS.md`](./COMPONENT_CONVENTIONS.md) for TypeScript and export rules.

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Naming Rules](#2-naming-rules)
3. [Styling Standard — Tailwind CSS](#3-styling-standard--tailwind-css)
4. [Legacy CSS — Migration Policy](#4-legacy-css--migration-policy)
5. [Path Aliases and Imports](#5-path-aliases-and-imports)
6. [Quick Reference](#6-quick-reference)

---

## 1. Folder Structure

### `src/components/`

Reusable UI components that are shared across multiple pages. Organised into domain sub-folders.

```
src/components/
├── index.ts                          ← root barrel (re-exports everything)
│
├── Button/
│   ├── Button.tsx
│   └── index.ts
│
├── Card/
│   ├── Card.tsx
│   └── index.ts
│
├── Navbar/
│   ├── Navbar.tsx
│   └── index.ts
│
├── layout/                           ← lowercase: structural/layout group
│   ├── DashboardLayout.tsx
│   ├── Sidebar/
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   └── TopHeader/
│       ├── TopHeader.tsx
│       └── index.ts
│
├── auth/                             ← lowercase: domain group
│   ├── ProtectedRoute/
│   │   ├── ProtectedRoute.tsx
│   │   └── index.ts
│   └── WalletConnectButton/
│       ├── WalletConnectButton.tsx
│       └── index.ts
│
├── dashboard/                        ← lowercase: domain group
│   ├── StatCard/
│   │   ├── StatCard.tsx
│   │   └── index.ts
│   └── Charts/
│       ├── ShipmentVolumeChart/
│       └── DeliverySuccessChart/
│
├── notifications/
│   └── NotificationDropdown/
│       ├── NotificationDropdown.tsx
│       └── index.ts
│
└── shipment/
    ├── TrackingTimeline/
    │   ├── TrackingTimeline.tsx
    │   └── index.ts
    └── StatusUpdate/
        ├── StatusUpdate.tsx
        └── index.ts
```

**Rules:**
- Every component lives in its own folder named after the component (PascalCase).
- Domain group folders (`auth/`, `dashboard/`, `layout/`, etc.) use lowercase.
- Every component folder must contain an `index.ts` barrel export.
- Tests co-locate with the component: `ComponentName.test.tsx`.
- Optional usage examples: `ComponentName.example.tsx`.

### `src/pages/`

Page-level components — one folder per route. Pages may contain page-scoped sub-components that are not shared elsewhere.

```
src/pages/
├── Home/
│   └── Home.tsx
├── Shipments/
│   └── Shipments.tsx
├── ShipmentDetail/
│   ├── ShipmentDetail.tsx
│   ├── index.ts
│   ├── MilestoneTimeline/
│   ├── ShipmentMap/
│   ├── ShipmentDetailHeader/
│   └── DeliveryProofUpload/
├── dashboard/
│   ├── Dashboard.tsx
│   ├── Company/
│   │   ├── CompanyDashboard.tsx
│   │   ├── CreateShipment/
│   │   ├── RecentShipments/
│   │   ├── UserManagement/
│   │   └── Settings/
│   └── Customer/
│       ├── CustomerDashboard.tsx
│       ├── ActiveShipments/
│       └── Profile/
├── auth/
│   ├── Login/
│   ├── Signup/
│   └── ForgotPassword/
├── Payments/
│   ├── PaymentHistory/
│   └── PaymentDetailModal/
├── Settings/
│   └── NotificationPreferences/
├── Notifications/
├── Analytics/
├── BlockchainLedger/
├── Settlements/
└── HelpCenter/
```

**Rules:**
- Page folders use PascalCase (e.g., `ShipmentDetail/`).
- Domain group folders inside `pages/` use lowercase (e.g., `dashboard/`, `auth/`).
- Sub-components that are only used by one page live inside that page's folder.
- If a sub-component is needed by two or more pages, move it to `src/components/`.
- Pages do not need a root barrel — import directly from the page folder's `index.ts` (if present) or the `.tsx` file.

### `src/hooks/`

Custom React hooks shared across the application.

```
src/hooks/
├── index.ts      ← barrel export for all hooks
└── useAuth.ts
```

**Rules:**
- One hook per file.
- All hooks exported from `src/hooks/index.ts`.

---

## 2. Naming Rules

| Thing | Convention | Example |
|---|---|---|
| Component file | PascalCase | `StatusUpdate.tsx` |
| Component folder | PascalCase | `StatusUpdate/` |
| Domain group folder | lowercase | `dashboard/`, `auth/`, `layout/` |
| Page file | PascalCase | `ShipmentDetail.tsx` |
| Props interface | `ComponentNameProps` | `StatusUpdateProps` |
| Hook file | camelCase, `use` prefix | `useAuth.ts` |
| Utility file | camelCase | `formatDate.ts` |
| Barrel file | always `index.ts` | `index.ts` |
| Test file | `ComponentName.test.tsx` | `TrackingTimeline.test.tsx` |
| Example file | `ComponentName.example.tsx` | `TrackingTimeline.example.tsx` |
| CSS (legacy only) | kebab-case | `dashboard-layout.css` |

---

## 3. Styling Standard — Tailwind CSS

**Tailwind CSS utility classes are the sole styling method for all new components and pages.**

The project's design tokens are defined in `frontend/tailwind.config.js`. Always use these tokens instead of raw hex values or arbitrary CSS.

### Design Tokens

```js
// tailwind.config.js — key tokens
colors: {
  primary: { DEFAULT: '#00D9FF', dark: '#008080', light: '#60C9CD' },
  accent:  { blue: '#3B82F6', green: '#10B981', red: '#EF4444', teal: '#00C2CB' },
  background: { DEFAULT: '#050505', secondary: '#0A0A0A', card: '#0F1419', elevated: '#121620' },
  border:  { DEFAULT: '#1E2433', light: 'rgba(0, 217, 255, 0.1)' },
  text:    { primary: 'rgba(255,255,255,0.87)', secondary: '#9CA3AF' },
}
```

### Preferred vs. Discouraged

| Approach | Status | Reason |
|---|---|---|
| Tailwind utility classes in `className` | ✅ Preferred | Inline, tree-shaken, uses design tokens |
| Design tokens from `tailwind.config.js` | ✅ Preferred | Consistent colours and spacing across the app |
| Responsive variants (`md:`, `lg:`) | ✅ Preferred | Mobile-first, no media query boilerplate |
| Arbitrary values (`w-[456px]`, `bg-[#FF0000]`) | ⚠️ Use sparingly | Only when no token exists; document why |
| `@apply` in a `.css` file | ❌ Discouraged | Defeats tree-shaking; hides styles from JSX |
| Per-component `.css` files | ❌ Discouraged | Adds CSS sprawl; use Tailwind utilities instead |
| Inline `style={{}}` props | ❌ Discouraged | Not tree-shaken; bypasses design tokens |
| Global `index.css` / `App.css` for component styles | ❌ Discouraged | Reserved for keyframes and third-party overrides only |

### Common Patterns

**Card:**
```tsx
<div className="bg-background-card border border-border rounded-2xl p-6">
  {children}
</div>
```

**Status badge:**
```tsx
<span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase bg-accent-blue/10 text-blue-400">
  In Transit
</span>
```

**Glassmorphism button:**
```tsx
<button className="px-8 py-3.5 bg-[rgba(1,56,59)] text-[#E5FFFF] font-bold rounded-full border border-[#60C9CD] shadow-glow-blue shadow-inset-teal hover:shadow-glow-blue-hover hover:-translate-y-0.5 transition-all duration-300">
  Connect Wallet
</button>
```

**Responsive layout:**
```tsx
{/* Mobile-first: column on small screens, row on md+ */}
<div className="flex flex-col md:flex-row gap-4">
```

### When `index.css` / `App.css` Is Acceptable

Only use global CSS files for:
- `@keyframes` animations that cannot be expressed as Tailwind utilities.
- Third-party library style overrides (e.g., a chart library).
- Font-face declarations.

Everything else belongs in `className`.

---

## 4. Legacy CSS — Migration Policy

Several existing components were built before Tailwind was adopted. They still carry `.css` files:

| Component | Legacy CSS file |
|---|---|
| `layout/DashboardLayout` | `DashboardLayout.css` |
| `layout/Sidebar` | `Sidebar.css` |
| `layout/TopHeader` | `TopHeader.css` |
| `auth/WalletConnectButton` | `WalletConnectButton.css` |
| `auth/ProtectedRoute` | `ProtectedRoute.css` |
| `notifications/NotificationDropdown` | `NotificationDropdown.css` |
| `pages/dashboard` | `Dashboard.css` |
| `pages/ShipmentDetail/ShipmentMap` | `ShipmentMap.css` |
| `pages/Payments/PaymentDetailModal` | `PaymentDetailModal.css` |
| `pages/Settings/NotificationPreferences` | `NotificationPreferences.css` |

**These components are migration-bound.** Do not add new styles to their `.css` files.

When you refactor or touch one of these components:
1. Convert all CSS rules to Tailwind utility classes.
2. Delete the `.css` file.
3. Remove the CSS `import` from the `.tsx` file.
4. Verify visually and run `pnpm run build` + `pnpm run lint`.

Follow the step-by-step conversion guide in [`TAILWIND_MIGRATION.md`](./TAILWIND_MIGRATION.md) and use the before/after examples in [`TAILWIND_BEFORE_AFTER.md`](./TAILWIND_BEFORE_AFTER.md).

---

## 5. Path Aliases and Imports

Path aliases are configured in both `tsconfig.json` and `vite.config.ts`. Always use aliases — never relative `../../` paths that cross directory boundaries.

### Available Aliases

| Alias | Resolves to |
|---|---|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@pages/*` | `src/pages/*` |
| `@hooks/*` | `src/hooks/*` |
| `@services/*` | `src/services/*` |
| `@context/*` | `src/context/*` |
| `@types/*` | `src/types/*` |
| `@utils/*` | `src/utils/*` |

### Usage Examples

```ts
// ✅ Preferred — alias import
import { Button } from '@components/Button';
import { useAuth } from '@hooks/useAuth';
import type { Shipment } from '@types/shipment';

// ❌ Discouraged — deep relative path
import { Button } from '../../../components/Button';
```

### Import Casing Rules

- Import paths must match the exact casing of the file/folder on disk.
- Component folders are PascalCase → `@components/Button`, `@components/Navbar`.
- Domain group folders are lowercase → `@components/dashboard/StatCard`.
- Never use all-lowercase for a PascalCase folder (breaks on case-sensitive Linux filesystems).

### Import Order Convention

Group imports in this order (enforced by ESLint):

```ts
// 1. React and third-party libraries
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal aliases — components, pages, hooks, services
import { Button } from '@components/Button';
import { useAuth } from '@hooks/useAuth';

// 3. Types
import type { ShipmentProps } from '@types/shipment';
```

---

## 6. Quick Reference

| Question | Answer |
|---|---|
| Where do shared UI components live? | `src/components/<Domain>/<ComponentName>/` |
| Where do page-only sub-components live? | Inside the page folder, e.g. `src/pages/ShipmentDetail/MilestoneTimeline/` |
| Where do custom hooks live? | `src/hooks/` |
| What styling method do I use? | Tailwind CSS utility classes only |
| Can I create a new `.css` file? | No — only `index.css`/`App.css` for keyframes/global overrides |
| What do I do with a legacy `.css` component? | Migrate to Tailwind when you next touch it |
| How do I import a component? | Use path aliases: `@components/Button` |
| What casing for component files? | PascalCase: `MyComponent.tsx` |
| What casing for hook files? | camelCase with `use` prefix: `useMyHook.ts` |

---

## Related Documents

- [`VERIFICATION_UI_STATES.md`](./VERIFICATION_UI_STATES.md) — Verification badge states, Stellar Explorer linking rules, and graceful failure behavior for on-chain data
- [`COMPONENT_CONVENTIONS.md`](./COMPONENT_CONVENTIONS.md) — TypeScript, exports, props, and dead code rules
- [`TAILWIND_MIGRATION.md`](./TAILWIND_MIGRATION.md) — Step-by-step CSS → Tailwind conversion guide
- [`TAILWIND_BEFORE_AFTER.md`](./TAILWIND_BEFORE_AFTER.md) — Side-by-side migration examples
- [`TAILWIND_PR_CHECKLIST.md`](./TAILWIND_PR_CHECKLIST.md) — PR checklist for Tailwind migrations
