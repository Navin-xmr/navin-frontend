# Verification-Aware UI States and Explorer Linking Guide

> **Issue:** [#115 — \[DOCS:\] Verification-Aware UI States and Explorer Linking Guide](https://github.com/Navin-xmr/navin-frontend/issues/115)
>
> This document defines the standard for rendering blockchain verification states and Stellar Explorer links across the Navin frontend. All components that surface on-chain data — payment rows, payment modals, shipment milestones, and status cards — must follow these conventions.

---

## Table of Contents

1. [Verification States](#1-verification-states)
2. [Stellar Explorer Linking](#2-stellar-explorer-linking)
3. [UI Context Examples](#3-ui-context-examples)
   - [Payment History Table (Compact)](#31-payment-history-table-compact)
   - [Payment Detail Modal (Full Breakdown)](#32-payment-detail-modal-full-breakdown)
   - [Shipment Status Card (Trust Data)](#33-shipment-status-card-trust-data)
4. [Graceful Failure Behavior](#4-graceful-failure-behavior)

---

## 1. Verification States

Every piece of on-chain data must be accompanied by a verification badge that communicates its trust status at a glance. Four states are defined.

### State Definitions

| State | Semantic | Color Token | Icon | Label Copy |
|---|---|---|---|---|
| **Verified** | Data confirmed on-chain | `accent-green` (`#10B981`) | `ShieldCheck` (Lucide) | "Verified" |
| **Pending** | Transaction submitted, awaiting confirmation | `#fbbf24` (amber-400) | `Clock` (Lucide) | "Pending" |
| **Mismatch** | On-chain data conflicts with off-chain record | `accent-red` (`#EF4444`) | `AlertTriangle` (Lucide) | "Mismatch" |
| **Unavailable** | Chain data could not be fetched | `text-secondary` (`#9CA3AF`) | `Minus` (Lucide) | "Unavailable" |

### Visual Specification

Each state renders as a pill badge. Use these exact Tailwind classes:

```tsx
// Verified
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                 bg-accent-green/10 text-accent-green border border-accent-green/30">
  <ShieldCheck size={12} />
  Verified
</span>

// Pending
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                 bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border border-[rgba(245,158,11,0.3)]">
  <Clock size={12} />
  Pending
</span>

// Mismatch
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                 bg-accent-red/10 text-accent-red border border-accent-red/30">
  <AlertTriangle size={12} />
  Mismatch
</span>

// Unavailable
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                 bg-text-secondary/10 text-text-secondary border border-text-secondary/20">
  <Minus size={12} />
  Unavailable
</span>
```

### TypeScript Type

Define this union type in `src/types/` and import it wherever verification state is needed:

```ts
// src/types/verification.ts
export type VerificationState = 'verified' | 'pending' | 'mismatch' | 'unavailable';
```

### Accessibility Requirements

- Every badge must include an `aria-label` that describes the state in context, e.g. `aria-label="Transaction verified on-chain"`.
- Do not rely on color alone — the icon and text label must always be present alongside the color.
- Mismatch state must additionally render a tooltip or inline note explaining the discrepancy when space allows.

---

## 2. Stellar Explorer Linking

### Base URL

All transaction links point to the Stellar Expert public explorer:

```
https://stellar.expert/explorer/public/tx/{txHash}
```

For Stellar account (address) links:

```
https://stellar.expert/explorer/public/account/{address}
```

### Required Link Attributes

Every external explorer link **must** include these attributes — no exceptions:

```tsx
<a
  href={`https://stellar.expert/explorer/public/tx/${txHash}`}
  target="_blank"
  rel="noopener noreferrer"
>
```

`rel="noopener noreferrer"` prevents the opened tab from accessing `window.opener` and suppresses the `Referer` header. Omitting it is a security issue.

### Hash Display: Short vs. Full

| Context | Format | Example | Rule |
|---|---|---|---|
| Table row (compact) | Short — first 6 + last 4 chars | `0x4a9b...e5d7` | Space is limited; full hash adds no value at a glance |
| Modal / detail view | Medium — first 12 + last 8 chars | `0x4a9b2f81c3e5...9b2f81c3` | More context without overwhelming the layout |
| Tooltip / copy-on-click | Full hash | `0x4a9b2f81c3e5d7a9b2f81c3e5d7a9b2f81c3e5d7` | User explicitly requested the full value |
| Stellar account address | Short — first 4 + last 4 chars | `GBST...4X7P` | Stellar addresses are 56 chars; always truncate in UI |

### Utility Functions

```ts
// src/utils/blockchain.ts

/** Short hash for table rows */
export const shortHash = (hash: string): string =>
  `${hash.slice(0, 6)}...${hash.slice(-4)}`;

/** Medium hash for modals */
export const mediumHash = (hash: string): string =>
  `${hash.slice(0, 12)}...${hash.slice(-8)}`;

/** Short Stellar account address */
export const shortAddress = (address: string): string =>
  `${address.slice(0, 4)}...${address.slice(-4)}`;

/** Stellar transaction explorer URL */
export const stellarTxUrl = (hash: string): string =>
  `https://stellar.expert/explorer/public/tx/${hash}`;

/** Stellar account explorer URL */
export const stellarAccountUrl = (address: string): string =>
  `https://stellar.expert/explorer/public/account/${address}`;
```

### Link Appearance

Explorer links must always include the `ExternalLink` icon (Lucide, size 12–14) to signal they open in a new tab:

```tsx
<a
  href={stellarTxUrl(txHash)}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-1.5 text-text-secondary hover:text-[#62ffff]
             font-mono text-xs transition-colors"
  aria-label={`View transaction ${shortHash(txHash)} on Stellar Explorer`}
>
  {shortHash(txHash)}
  <ExternalLink size={12} className="text-[#62ffff] shrink-0" />
</a>
```

---

## 3. UI Context Examples

### 3.1 Payment History Table (Compact)

The table row is space-constrained. Show the payment status badge and a short hash link. Verification state is surfaced via the status badge — no separate verification column needed at this level.

```tsx
// Payment status badge — maps PaymentStatus to verification-aware styling
const statusClasses: Record<PaymentStatus, string> = {
  Released: 'bg-accent-green/10 text-accent-green border border-accent-green/30',   // Verified
  Escrowed: 'bg-[rgba(98,255,255,0.15)] text-[#62ffff] border border-[rgba(98,255,255,0.3)]', // Pending (in escrow)
  Pending:  'bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border border-[rgba(245,158,11,0.3)]', // Pending
  Failed:   'bg-accent-red/10 text-accent-red border border-accent-red/30',          // Mismatch / Failed
};

// Table row — Transaction Hash cell
<td className="px-6 py-4 font-mono text-xs border-b border-[rgba(98,255,255,0.2)]">
  <a
    href={stellarTxUrl(payment.txHash)}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-text-secondary hover:text-[#62ffff] transition-colors"
    aria-label={`View transaction ${shortHash(payment.txHash)} on Stellar Explorer`}
  >
    {shortHash(payment.txHash)}
    <ExternalLink size={12} className="text-[#62ffff] shrink-0" />
  </a>
</td>
```

### 3.2 Payment Detail Modal (Full Breakdown)

The modal has space for a full verification breakdown. Show the medium hash, both wallet addresses (truncated), and an explicit verification badge alongside the "Verify on Blockchain" CTA.

```tsx
// Verification badge — driven by VerificationState
const verificationBadge = (state: VerificationState) => {
  const config = {
    verified:    { classes: 'bg-accent-green/10 text-accent-green border-accent-green/30',       icon: <ShieldCheck size={12} />, label: 'Verified' },
    pending:     { classes: 'bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border-[rgba(245,158,11,0.3)]', icon: <Clock size={12} />,       label: 'Pending' },
    mismatch:    { classes: 'bg-accent-red/10 text-accent-red border-accent-red/30',             icon: <AlertTriangle size={12} />, label: 'Mismatch' },
    unavailable: { classes: 'bg-text-secondary/10 text-text-secondary border-text-secondary/20', icon: <Minus size={12} />,         label: 'Unavailable' },
  }[state];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.classes}`}
      aria-label={`Transaction ${config.label.toLowerCase()} on-chain`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

// Inside the modal detail section
<div className="flex flex-col gap-3">
  {/* Transaction row */}
  <div className="flex justify-between items-center">
    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Transaction</span>
    <div className="flex items-center gap-2">
      {verificationBadge(verificationState)}  {/* e.g. 'verified' | 'pending' */}
      <a
        href={stellarTxUrl(payment.txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-text-secondary hover:text-[#62ffff] transition-colors"
        aria-label={`View transaction on Stellar Explorer`}
      >
        {mediumHash(payment.txHash)}
        <ExternalLink size={14} className="text-[#62ffff] shrink-0" />
      </a>
    </div>
  </div>

  {/* Payer address row */}
  <div className="flex justify-between items-center">
    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Payer</span>
    <a
      href={stellarAccountUrl(payment.payerAddress)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-mono text-xs text-text-secondary hover:text-[#62ffff] transition-colors"
      aria-label={`View payer account on Stellar Explorer`}
    >
      {shortAddress(payment.payerAddress)}
      <ExternalLink size={12} className="text-[#62ffff] shrink-0" />
    </a>
  </div>
</div>

{/* Footer CTA */}
<a
  href={stellarTxUrl(payment.txHash)}
  target="_blank"
  rel="noopener noreferrer"
  className="px-6 py-3 rounded-lg bg-accent-teal/20 border border-accent-teal/40 text-[#62ffff]
             font-semibold text-sm hover:bg-accent-teal/30 transition-colors inline-flex items-center gap-2"
>
  Verify on Blockchain
  <ExternalLink size={14} />
</a>
```

### 3.3 Shipment Status Card (Trust Data Integration)

Each milestone in `MilestoneTimeline` has a `blockchainAddress` field. Surface it as a verified on-chain anchor alongside the milestone's completion state.

The milestone `status` field (`'completed' | 'current' | 'upcoming'`) maps to verification state as follows:

| Milestone Status | Verification State | Rationale |
|---|---|---|
| `completed` | `verified` | Milestone is immutably recorded on-chain |
| `current` | `pending` | Transaction submitted, awaiting finality |
| `upcoming` | `unavailable` | Not yet on-chain |

```tsx
// Inside MilestoneTimeline — expanded milestone detail panel
const milestoneVerificationState = (status: MilestoneDetail['status']): VerificationState => {
  if (status === 'completed') return 'verified';
  if (status === 'current')   return 'pending';
  return 'unavailable';
};

// Blockchain anchor row within the expanded detail panel
{milestone.blockchainAddress && milestone.status !== 'upcoming' && (
  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
    <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">On-chain Record</span>
    <div className="flex items-center gap-2">
      {verificationBadge(milestoneVerificationState(milestone.status))}
      <a
        href={stellarAccountUrl(milestone.blockchainAddress)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-text-secondary hover:text-[#62ffff] transition-colors"
        aria-label={`View milestone record on Stellar Explorer`}
      >
        {shortAddress(milestone.blockchainAddress)}
        <ExternalLink size={12} className="text-[#62ffff] shrink-0" />
      </a>
    </div>
  </div>
)}
```

---

## 4. Graceful Failure Behavior

When chain data is missing, a node is unreachable, or a fetch times out, the UI must degrade gracefully. Never show a broken link, an empty cell, or an unhandled error.

### Failure Scenarios and Required Behavior

| Scenario | Required UI Behavior |
|---|---|
| `txHash` is `null` or empty string | Render `Unavailable` badge; omit the explorer link entirely |
| Explorer fetch returns non-2xx | Render `Unavailable` badge; keep the hash text but disable the link (`<span>` instead of `<a>`) |
| Network timeout / node unreachable | Render `Unavailable` badge with tooltip: "Chain data temporarily unavailable" |
| Hash present but on-chain record not found | Render `Mismatch` badge with note: "Transaction not found on Stellar network" |
| `blockchainAddress` missing on a `completed` milestone | Render `Unavailable` badge; do not render the "On-chain Record" row at all |

### Implementation Pattern

```tsx
// Defensive explorer link — handles missing hash
const ExplorerLink: React.FC<{ hash: string | null | undefined; display: string }> = ({ hash, display }) => {
  if (!hash) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                   bg-text-secondary/10 text-text-secondary border border-text-secondary/20"
        aria-label="Chain data unavailable"
      >
        <Minus size={12} />
        Unavailable
      </span>
    );
  }

  return (
    <a
      href={stellarTxUrl(hash)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-mono text-xs text-text-secondary hover:text-[#62ffff] transition-colors"
      aria-label={`View ${display} on Stellar Explorer`}
    >
      {display}
      <ExternalLink size={12} className="text-[#62ffff] shrink-0" />
    </a>
  );
};
```

### Loading State

While chain data is being fetched, render a skeleton placeholder — never an empty cell:

```tsx
// Skeleton for a hash cell while loading
<div className="h-4 w-28 rounded animate-pulse bg-text-secondary/20" aria-label="Loading transaction data" />
```

---

## Related Documents

- [`FRONTEND_COMPONENT_CONVENTIONS.md`](./FRONTEND_COMPONENT_CONVENTIONS.md) — Folder structure, naming, Tailwind styling, and path aliases
- [`COMPONENT_CONVENTIONS.md`](./COMPONENT_CONVENTIONS.md) — TypeScript, exports, and props rules
- [`TAILWIND_MIGRATION.md`](./TAILWIND_MIGRATION.md) — CSS → Tailwind conversion guide
