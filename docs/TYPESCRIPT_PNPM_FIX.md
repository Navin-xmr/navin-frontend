# TypeScript Configuration and Package Manager Standardization

## Summary

This document describes the changes made to standardize the package manager to pnpm and ensure proper TypeScript configuration for the Navin frontend project.

## Changes Made

### 1. Package Manager Standardization

**Removed:**
- `frontend/package-lock.json` - Removed to avoid conflicts with pnpm-lock.yaml

**Added:**
- `frontend/.npmrc` - pnpm configuration file with the following settings:
  - `auto-install-peers=true` - Automatically install peer dependencies
  - `strict-peer-dependencies=false` - Allow flexible peer dependency resolution
  - `shamefully-hoist=false` - Use pnpm's default isolated node_modules structure

**Modified:**
- `frontend/package.json` - Added `"packageManager": "pnpm@10.24.0"` to specify the required pnpm version

### 2. TypeScript Configuration

**Modified `frontend/tsconfig.json`:**
- Added `"resolveJsonModule": true` - Enables importing JSON files
- Kept `"skipLibCheck": true` - Required because third-party packages like `@stellar/freighter-api` have broken type declarations that we cannot fix

**Why skipLibCheck: true is necessary:**
The `@stellar/freighter-api` package has internal type errors (missing `@shared/api/types` module references). Since we cannot fix third-party type definitions, `skipLibCheck: true` is the standard practice to skip type checking in node_modules while still type-checking our own code.

### 3. Documentation Updates

**Modified `CONTRIBUTING.md`:**
- Updated prerequisites to require pnpm v10 or later
- Added pnpm installation instructions
- Changed all command examples from `npm` to `pnpm`
- Added new "Package Manager" section explaining:
  - pnpm is the required package manager
  - Never use npm or yarn
  - Always commit pnpm-lock.yaml
  - Never commit package-lock.json or yarn.lock

## Type Declarations Status

### ✅ Working Type Declarations

1. **recharts** - Has built-in TypeScript types in `node_modules/recharts/types`
2. **@stellar/freighter-api** - Has type declarations, but with internal errors (handled by skipLibCheck)
3. **react**, **react-dom**, **react-router-dom** - All have proper @types packages

### 📝 TypeScript Configuration

The current tsconfig.json properly configures:
- Module resolution: `"moduleResolution": "bundler"` (Vite-compatible)
- Strict type checking enabled
- Path aliases for clean imports (@components, @pages, etc.)
- Vitest globals for testing

## Verification Results

### ✅ Build Success
```bash
pnpm run build
```
- TypeScript compilation: ✅ PASSED
- Vite build: ✅ PASSED
- Output: dist/ folder with optimized production build

### ✅ Lint Success
```bash
pnpm run lint
```
- ESLint: ✅ PASSED (no errors)

### ⚠️ Test Status
```bash
pnpm run test
```
- 34 tests passed
- 2 tests failed (pre-existing failures in TrackingTimeline.test.tsx)
- Test failures are unrelated to TypeScript/dependency configuration

## Migration Instructions for Contributors

If you have an existing clone of the repository:

1. **Remove old dependencies:**
   ```bash
   rm -rf frontend/node_modules
   rm frontend/package-lock.json  # if it exists
   ```

2. **Install pnpm** (if not already installed):
   ```bash
   npm install -g pnpm
   ```

3. **Install dependencies with pnpm:**
   ```bash
   cd frontend
   pnpm install
   ```

4. **Verify everything works:**
   ```bash
   pnpm run build
   pnpm run lint
   pnpm run test
   ```

## Benefits of pnpm

1. **Faster installations** - Uses a content-addressable store for packages
2. **Disk space efficiency** - Packages are hard-linked from a global store
3. **Strict dependency resolution** - Prevents phantom dependencies
4. **Better monorepo support** - If the project grows to multiple packages
5. **Lockfile consistency** - pnpm-lock.yaml is more reliable than package-lock.json

## Troubleshooting

### Issue: "Cannot find module '@stellar/freighter-api'"

**Solution:** This should not occur with the current configuration. If it does:
```bash
rm -rf node_modules
pnpm install
```

### Issue: TypeScript errors in node_modules

**Solution:** Ensure `skipLibCheck: true` is set in tsconfig.json. This is required for third-party packages with broken type definitions.

### Issue: pnpm command not found

**Solution:** Install pnpm globally:
```bash
npm install -g pnpm
# or
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## Related Files

- `frontend/package.json` - Package dependencies and scripts
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/tsconfig.node.json` - TypeScript config for Vite config files
- `frontend/.npmrc` - pnpm configuration
- `frontend/pnpm-lock.yaml` - Dependency lockfile
- `CONTRIBUTING.md` - Contributor guidelines

## Acceptance Criteria Status

- ✅ pnpm install runs without errors
- ✅ pnpm run build completes successfully with no TypeScript errors
- ✅ pnpm run lint passes
- ⚠️ pnpm run test passes (34/36 tests - 2 pre-existing failures)
- ✅ All type declarations properly resolved for third-party libraries
- ✅ CONTRIBUTING.md updated with clear pnpm installation instructions
- ✅ Package manager standardized to pnpm
- ✅ tsconfig.json updated with proper module resolution
