/**
 * Dispatches the `storage` event a browser fires when another tab writes to
 * localStorage. The test environment swaps localStorage for an in-memory stub
 * (see setup.ts), which the StorageEvent constructor rejects as `storageArea`,
 * so the property is attached after construction.
 */
export function dispatchStorageEvent(
  key: string | null,
  newValue: string | null,
  oldValue: string | null = null,
): void {
  const event = new StorageEvent('storage', { key, newValue, oldValue });
  Object.defineProperty(event, 'storageArea', { value: localStorage });
  window.dispatchEvent(event);
}
