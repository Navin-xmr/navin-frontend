/**
 * resolveNotificationLink.ts
 *
 * Issue #225 — Notifications must navigate to the correct shipment detail page
 * regardless of whether the backend stored the link with a trackingNumber
 * (e.g. `/dashboard/shipments/NV-9920`) or a MongoDB _id
 * (e.g. `/dashboard/shipments/6641a...`).
 *
 * The router uses `/dashboard/shipments/:id` where `:id` is the MongoDB _id
 * (normalised to `id` by the apiClient response interceptor in client.ts).
 *
 * Resolution priority:
 *   1. If `shipmentId` is present  → `/dashboard/shipments/<shipmentId>`
 *   2. If `trackingNumber` is present → `/dashboard/shipments/<trackingNumber>`
 *      (accepted as a fallback; the ShipmentDetail page or backend can resolve it)
 *   3. If `link` is a well-formed dashboard path → return it unchanged
 *   4. Otherwise → null (caller should not navigate)
 */

export interface NotificationLinkProps {
  /** MongoDB _id of the related shipment (mapped from _id by apiClient). */
  shipmentId?: string;
  /** Human-readable tracking number, e.g. "NV-9920". */
  trackingNumber?: string;
  /**
   * Raw link stored by the backend, e.g. "/dashboard/shipments/NV-9920".
   * Used as a last-resort fallback.
   */
  link?: string;
}

/**
 * Returns the best navigation path for a notification, or `null` if no
 * valid path can be resolved.
 *
 * @param props - Notification fields used to build the link.
 * @returns A valid `/dashboard/…` path string, or `null`.
 */
export function resolveNotificationLink(props: NotificationLinkProps): string | null {
  const { shipmentId, trackingNumber, link } = props;

  // 1. Prefer the stable MongoDB _id — the router param this app uses.
  if (shipmentId && shipmentId.trim() !== "") {
    return `/dashboard/shipments/${encodeURIComponent(shipmentId.trim())}`;
  }

  // 2. Fall back to trackingNumber — useful when shipmentId is missing from
  //    older notification records and the backend can accept it as a lookup key.
  if (trackingNumber && trackingNumber.trim() !== "") {
    return `/dashboard/shipments/${encodeURIComponent(trackingNumber.trim())}`;
  }

  // 3. Keep the raw link if it already points inside the dashboard.
  if (link && link.trim().startsWith("/dashboard/")) {
    return link.trim();
  }

  // 4. No usable path available.
  return null;
}
