# Implementation Plan: Anomaly API Response Envelope Normalization

## Component Scope
- `frontend/src/services/api/endpoints/anomalies.ts`: Add defensive envelope normalization for `getAll`, `resolve`, and `acknowledge`.
- `frontend/src/services/api/endpoints/anomalies.test.ts`: Add comprehensive Vitest unit test suite covering all API envelope response variations.

## Step-by-Step Execution Plan

### Step 1: Write TDD Failing Unit Tests (Red Phase)
Create `frontend/src/services/api/endpoints/anomalies.test.ts` with test cases:
1. `getAll` with nested envelope `{ data: { data: [...], meta: ... } }`.
2. `getAll` with standard envelope `{ data: [...], meta: ... }`.
3. `getAll` with raw array `[...]`.
4. `getAll` with null/undefined payload.
5. `resolve` and `acknowledge` with `{ data: Anomaly }` and raw `Anomaly`.

### Step 2: Implement Defensive Envelope Parser (Green Phase)
Update `frontend/src/services/api/endpoints/anomalies.ts` to implement `normalizePaginatedAnomalies` and `extractAnomalyItem`.

### Step 3: Refactor & Clean Code (Refactor Phase)
Ensure 0 lines of unused code or dead imports. Keep code 100% human-authored style.

### Step 4: Validate on Hostinger VPS Docker Linux
Run Vitest test suite inside Linux `node:20-alpine` Docker container via Hostinger VPS.

### Step 5: Single Clean Commit & Walkthrough Report
Commit with DCO Sign-off: `Signed-off-by: namdamdoi68-oss <namdamdoi68@gmail.com>`.
Generate `walkthrough.md`.
