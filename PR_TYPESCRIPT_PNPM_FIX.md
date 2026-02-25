# PR: Fix TypeScript Configuration and Dependency Management

## Issue
Fixes #[issue-number] - TypeScript configuration and dependency management

## Summary
Standardized the frontend package manager to pnpm and ensured proper TypeScript configuration. This resolves the mixed package manager usage (pnpm-lock.yaml existed but npm was used in scripts) and ensures consistent dependency resolution across all development environments.

## Changes Made

### 1. Package Manager Standardization
- ✅ Removed `package-lock.json` to avoid conflicts with `pnpm-lock.yaml`
- ✅ Added `packageManager: "pnpm@10.24.0"` field to `package.json`
- ✅ Created `.npmrc` with pnpm configuration
- ✅ Ran `pnpm install` to ensure clean dependency installation

### 2. TypeScript Configuration
- ✅ Added `resolveJsonModule: true` to `tsconfig.json` for JSON imports
- ✅ Kept `skipLibCheck: true` (required for third-party packages with broken types)
- ✅ Verified module resolution works correctly with bundler mode

### 3. Documentation Updates
- ✅ Updated `CONTRIBUTING.md` with pnpm installation instructions
- ✅ Changed all command examples from `npm` to `pnpm`
- ✅ Added "Package Manager" section explaining pnpm requirements
- ✅ Created comprehensive migration documentation

## Why These Changes?

### skipLibCheck: true is Required
The `@stellar/freighter-api` package has internal type errors (missing `@shared/api/types` module). Since we cannot fix third-party type definitions, `skipLibCheck: true` is the standard practice. This skips type checking in `node_modules` while still type-checking our own code.

### pnpm Benefits
1. **Faster installations** - Content-addressable package store
2. **Disk space efficiency** - Hard-linked packages from global store
3. **Strict dependency resolution** - Prevents phantom dependencies
4. **Better consistency** - More reliable lockfile format

## Verification

### ✅ Build Success
```bash
$ pnpm run build
> tsc -b && vite build
✓ 2431 modules transformed.
✓ built in 28.35s
```
**Result:** No TypeScript errors

### ✅ Lint Success
```bash
$ pnpm run lint
> eslint .
```
**Result:** No linting errors

### ⚠️ Test Status
```bash
$ pnpm run test
Test Files  1 failed | 7 passed (8)
      Tests  2 failed | 34 passed (36)
```
**Result:** 34/36 tests pass. The 2 failures are pre-existing issues in `TrackingTimeline.test.tsx` (unrelated to this PR).

## Files Changed

### Modified
- `frontend/package.json` - Added packageManager field
- `frontend/tsconfig.json` - Added resolveJsonModule
- `CONTRIBUTING.md` - Updated with pnpm instructions

### Added
- `frontend/.npmrc` - pnpm configuration
- `docs/TYPESCRIPT_PNPM_FIX.md` - Detailed technical documentation
- `docs/PNPM_MIGRATION_BEFORE_AFTER.md` - Before/after comparison

### Removed
- `frontend/package-lock.json` - Removed to avoid conflicts

## Breaking Changes
None. All scripts remain the same, only the package manager changes.

## Migration Instructions for Contributors

If you have an existing clone:

1. Install pnpm:
   ```bash
   npm install -g pnpm
   ```

2. Clean old dependencies:
   ```bash
   rm -rf frontend/node_modules
   rm frontend/package-lock.json  # if exists
   ```

3. Install with pnpm:
   ```bash
   cd frontend
   pnpm install
   ```

4. Verify:
   ```bash
   pnpm run build
   pnpm run lint
   ```

## Acceptance Criteria

- ✅ pnpm install runs without errors
- ✅ pnpm run build completes successfully with no TypeScript errors
- ✅ pnpm run lint passes
- ⚠️ pnpm run test passes (34/36 - 2 pre-existing failures)
- ✅ All type declarations properly resolved for third-party libraries
- ✅ CONTRIBUTING.md updated with clear pnpm installation instructions
- ✅ Package manager standardized to pnpm
- ✅ tsconfig.json updated with proper module resolution

## Screenshots

### Before: Mixed Package Manager
```
frontend/
├── package.json (scripts use npm)
├── package-lock.json ❌
├── pnpm-lock.yaml ✅
```

### After: Standardized to pnpm
```
frontend/
├── package.json (packageManager: pnpm@10.24.0)
├── .npmrc ✅
├── pnpm-lock.yaml ✅
```

### Build Output (After)
```
> navin-frontend@0.1.0 build
> tsc -b && vite build

vite v7.3.1 building client environment for production...
✓ 2431 modules transformed.
dist/index.html                   0.62 kB │ gzip:   0.38 kB
dist/assets/index-dLZdf127.css   65.66 kB │ gzip:  12.91 kB
dist/assets/index-D_gxaXoY.js   723.27 kB │ gzip: 220.06 kB
✓ built in 28.35s
```

## Related Documentation

- `docs/TYPESCRIPT_PNPM_FIX.md` - Technical details and troubleshooting
- `docs/PNPM_MIGRATION_BEFORE_AFTER.md` - Before/after comparison
- `CONTRIBUTING.md` - Updated contributor guidelines

## Checklist

- ✅ Package manager standardized to pnpm
- ✅ tsconfig.json updated with proper module resolution
- ✅ All TypeScript errors resolved
- ✅ Build succeeds: `pnpm run build`
- ⚠️ Tests pass: `pnpm run test` (34/36 - 2 pre-existing failures)
- ✅ Lint passes: `pnpm run lint`
- ✅ CONTRIBUTING.md updated with pnpm instructions
- ✅ PR description explains what was fixed and why
- ✅ Before/after documentation included
- ✅ Migration instructions provided

## Notes

The 2 test failures in `TrackingTimeline.test.tsx` are pre-existing and unrelated to this PR. They involve multiple elements with the same text/label in the test assertions. These should be addressed in a separate PR focused on test fixes.
