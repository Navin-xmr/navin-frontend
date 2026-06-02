# Frontend-to-Backend Alignment Report & Guide

This guide explains in plain terms exactly what needs to be changed in the **Frontend** codebase so it can successfully connect to the **Backend** server and load real data instead of placeholders.

---

## 1. The Core Problems (In Plain English)

Right now, the frontend and backend are speaking slightly different dialects. If you try to connect them without these changes, the following three things will happen:
1. **The Browser Blocks Everything**: The browser's built-in security will block the frontend from talking to the backend because of missing credentials agreements (CORS).
2. **Dashboard Charts Break**: When fetching shipment alert warnings (anomalies), the backend wraps the data in a nested envelope, but the frontend expects it raw, leading to immediate frontend crashes.
3. **Creating Shipments Fails**: The backend validation expects certain fields (like tracking numbers and recipient signatures) that the frontend form doesn't send yet.

---

## 2. Immediate Developer Action Steps

To align the frontend, a developer needs to modify **only 2 files** in the `src/services/api/endpoints/` directory.

### File 1: [anomalies.ts](/frontend/src/services/api/endpoints/anomalies.ts)
*   **The Issue**: The frontend expects a raw payload structure, but the backend serves paginated data inside standard nested envelopes (`data` and `meta`).
*   **The Fix**: Update `anomalyApi.getAll` to parse the backend's nested variables:

```typescript
// CURRENT CODE:
getAll: async (params?: GetAnomaliesParams): Promise<PaginatedAnomalies> => {
    const res = await apiClient.get<PaginatedAnomalies>("/anomalies", { params });
    return res.data;
}

// NEW ALIGNED CODE:
getAll: async (params?: GetAnomaliesParams): Promise<PaginatedAnomalies> => {
    const res = await apiClient.get<{ data: Anomaly[], meta: { nextCursor: string | null, hasMore: boolean } }>("/anomalies", { params });
    return {
        data: res.data.data,
        nextCursor: res.data.meta.nextCursor,
        hasMore: res.data.meta.hasMore
    };
}
```

---

### File 2: [shipments.ts](/frontend/src/services/api/endpoints/shipments.ts)
*   **The Issue**: 
    1. **Pagination**: The frontend expects page/limit based math, but the backend sends cursor-based arrays.
    2. **Delivery Proof**: The backend requires `recipientSignatureName` to verify uploads, but the frontend currently uploads a generic text field called `notes`.
*   **The Fixes**:
    1. Adjust `shipmentApi.getAll` to extract the flat shipment array from `res.data.data` and pagination details from `res.data.meta`.
    2. Update `uploadProof` to pass `recipientSignatureName` instead of `notes` in the request:

```typescript
// CURRENT PROOF UPLOAD:
uploadProof: async (id: string, file: File, notes?: string): Promise<Shipment> => {
    const form = new FormData();
    form.append("file", file);
    if (notes) form.append("notes", notes);
    ...

// NEW ALIGNED PROOF UPLOAD:
uploadProof: async (id: string, file: File, recipientSignatureName: string): Promise<Shipment> => {
    const form = new FormData();
    form.append("file", file);
    form.append("recipientSignatureName", recipientSignatureName);
    ...
```

---

## 3. UI Page Status (Wired vs. Mocked)

Some pages on the dashboard are ready to go, while others are static visual mocks that need API wiring.

| Dashboard Tab | Status | Next Wiring Step |
| :--- | :--- | :--- |
| **Logistics Overview (Home)** | 🟡 Partially Mocked | Load the high-level cards (active, delivered counts) from a backend statistics endpoint. |
| **Shipments List & Details** | 🟢 Ready to Wire | Fully supported by backend. Adjust pagination fields to complete integration. |
| **Blockchain Ledger** | 🔴 Fully Mocked | Needs a new backend ledger route to list historic blocks. |
| **Settlements & Payments** | 🔴 Fully Mocked | Needs a backend escrow/settlement history database list route. |
| **Team Management** | 🟡 Partially Mocked | Hook the UI up to `/api/users` (the backend already has create/delete user actions ready). |

---

## 4. Frontend Developer Checklist

- [ ] **1. Align Auth Interceptors**
  - [ ] Ensure local storage token parses successfully without manual intervention.
  - [ ] Verify automatic redirection to `/login` when a backend call fails with a `401 Unauthorized` token.
- [ ] **2. Update Service Schemas**
  - [ ] Apply the `anomalies.ts` parser fix (see Section 2).
  - [ ] Apply the `shipments.ts` pagination and upload signature fix (see Section 2).
- [ ] **3. Hook Up Team Management**
  - [ ] Replace static users list in `UserManagement.tsx` with a `GET` call fetching real organization members.
