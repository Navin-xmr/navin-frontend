# AI Agent Instructions for Navin Frontend

**Navin** is a blockchain-powered logistics platform: React 19 + TypeScript + Vite. Real-time shipment dashboards, on-chain milestones, automated settlements (Stellar Soroban).

---

## Quick Commands

```bash
cd frontend
pnpm install              # Use pnpm ONLY (not npm/yarn)
pnpm run dev              # Start dev server
pnpm run build            # Production build
pnpm run lint             # ESLint check
pnpm run test             # Run tests (Vitest)
```

---

## Key Facts

| Aspect | Rules |
|--------|-------|
| **Components** | Each in own folder: `ComponentName.tsx` + barrel `index.ts`. Domain groups lowercase (`layout/`, `auth/`, `shipment/`). |
| **TypeScript** | `strict: true` enforced. No `any`. All props need exported `ComponentNameProps` interface. |
| **Styling** | **Tailwind only** — no per-component CSS. Design tokens in `tailwind.config.js`. |
| **Imports** | Use path aliases: `@components`, `@pages`, `@services`, `@hooks`, `@utils`, `@types`. |
| **Code Quality** | No dead code, unused imports, or commented-out blocks. Run `pnpm run lint -- --fix`. |
| **Tests** | Vitest + React Testing Library. Files: `ComponentName.test.tsx` (co-located). |

---

## Documentation

For detailed guidance, search the codebase or check:

- [COMPONENT_CONVENTIONS.md](docs/COMPONENT_CONVENTIONS.md) — Naming, exports, TS rules
- [FRONTEND_COMPONENT_CONVENTIONS.md](docs/FRONTEND_COMPONENT_CONVENTIONS.md) — Folder structure, styling
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution & PR process
- [vite.config.ts](frontend/vite.config.ts) — Build config, aliases, test setup
- [tsconfig.json](frontend/tsconfig.json) — TypeScript config

---

## Related Repos

- [navin-contracts](https://github.com/Navin-xmr/navin-contracts) — Soroban smart contracts
- [navin-backend](https://github.com/Navin-xmr/navin-backend) — REST API
