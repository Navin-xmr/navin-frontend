# Component Conventions

This document defines the naming, export, and typing standards for the Navin frontend.

---

## File & Folder Structure

Each reusable component lives in its own folder:

```
src/components/ComponentName/
  ComponentName.tsx   ← implementation
  index.ts            ← barrel export
```

Pages follow the same pattern:

```
src/pages/PageName/
  PageName.tsx
  index.ts
```

---

## Naming Rules

| Thing | Convention | Example |
|---|---|---|
| Component file | PascalCase | `Button.tsx` |
| Component folder | PascalCase | `Button/` |
| Props interface | `ComponentNameProps` | `ButtonProps` |
| Hook file | camelCase, `use` prefix | `useAuth.ts` |
| CSS (global only) | kebab-case | `index.css` |

---

## Exports

### Named exports are preferred for reusable components

```ts
// Good
export const Button: React.FC<ButtonProps> = ({ ... }) => { ... };
export default Button;
```

### Every component folder must have an `index.ts` barrel

```ts
// components/Button/index.ts
export { default } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';
```

### Props interfaces must be exported

```ts
// Good
export interface ButtonProps { ... }

// Bad
interface ButtonProps { ... }
```

---

## TypeScript

- `strict: true` is enabled — do not disable it.
- Avoid `any`. If unavoidable, add a comment explaining why.
- All component props must use a named, exported interface (`ComponentNameProps`).
- Hooks must declare explicit return types when the inferred type is non-obvious.
- Prefer `React.FC<Props>` for function components.

```ts
// Good
export const MyComponent: React.FC<MyComponentProps> = ({ foo }) => { ... };

// Also acceptable (explicit return type)
export function MyComponent({ foo }: MyComponentProps): React.ReactElement { ... }
```

---

## Styling

- Use Tailwind CSS utility classes exclusively for component-level styling.
- Do **not** create per-component `.css` files — use `index.css` or `App.css` only for global keyframes and animations that cannot be expressed as Tailwind utilities.
- Use design tokens from `tailwind.config.js` (e.g. `bg-background-card`, `text-text-secondary`, `border-border`).

---

## Dead Code Policy

- No unused imports.
- No commented-out code blocks.
- No orphaned variables or unreachable branches.
- Remove assets not referenced by any component, page, or test.

---

## Barrel Export Locations

| Path | Purpose |
|---|---|
| `src/components/index.ts` | All reusable components |
| `src/hooks/index.ts` | All custom hooks |

Pages do not require a root barrel — import directly from the page folder's `index.ts`.
