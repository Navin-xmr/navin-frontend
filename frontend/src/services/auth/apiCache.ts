const AUTHENTICATED_API_CACHE_NAMES = [
  'telemetry-latest',
  'shipment-detail',
  'shipments-list',
  'notifications',
  'settlements',
];

export async function clearAuthenticatedApiCaches(): Promise<void> {
  if (typeof caches === 'undefined') return;

  try {
    const existingCaches = await caches.keys();
    const authenticatedCaches = existingCaches.filter((name) =>
      AUTHENTICATED_API_CACHE_NAMES.includes(name),
    );
    await Promise.all(authenticatedCaches.map((name) => caches.delete(name)));
  } catch {
    // Logout must still complete if Cache Storage is unavailable.
  }
}