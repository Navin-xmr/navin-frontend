# Technical Specification: Robust Envelope Parsing for Anomaly API Endpoint

## Overview
This specification details the defensive envelope parsing mechanism for `anomalyApi.getAll` in `frontend/src/services/api/endpoints/anomalies.ts`. It resolves Issue #585 where API response envelope shape mismatches cause runtime crashes in `AnomalyAlertPanel`.

## Root Cause Analysis
The current implementation of `anomalyApi.getAll` assumes a single fixed payload structure `res.data.data` and `res.data.meta`.
When the backend API returns varied payload formats (e.g., flat `PaginatedAnomalies`, nested `{ data: [...], meta: ... }`, or raw arrays `Anomaly[]`), `res.data.data` can evaluate to `undefined` or a non-array, breaking downstream callers like `AnomalyAlertPanel` during `.sort()` or `.length`.

## Proposed Solution & Architecture
1. **Defensive Response Normalizer**:
   Implement a resilient parser inside `anomalyApi.getAll` that handles:
   - Nested Axios payloads: `{ data: { data: Anomaly[], meta: { ... } } }`
   - Standard envelope payloads: `{ data: Anomaly[], meta: { ... } }`
   - Flat array payloads: `Anomaly[]`
   - Fallback empty arrays if data is null/undefined.
2. **Type Safety & Backward Compatibility**:
   Ensure `anomalyApi.getAll` ALWAYS resolves to a valid `PaginatedAnomalies` object:
   ```ts
   {
     data: Anomaly[];
     meta: {
       nextCursor: string | null;
       hasMore: boolean;
     };
   }
   ```
3. **Single Response Normalization Helper**:
   Extract clean, zero-bloat helper function `normalizePaginatedAnomalies` to ensure 100% testability.

## Acceptance Criteria
- [x] `anomalyApi.getAll` safely parses nested envelope responses `{ data: { data: [...], meta: ... } }`.
- [x] `anomalyApi.getAll` safely parses standard envelope responses `{ data: [...], meta: ... }`.
- [x] `anomalyApi.getAll` safely parses flat array responses `[...]`.
- [x] `anomalyApi.getAll` defaults to empty array `{ data: [], meta: { nextCursor: null, hasMore: false } }` on invalid payloads without throwing runtime errors.
- [x] Unit test suite in `anomalies.test.ts` passes 100%.
