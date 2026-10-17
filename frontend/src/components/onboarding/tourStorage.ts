export interface TourStep {
  /** Unique id for the element to highlight (data-tour-id) */
  targetId: string;
  /** Heading displayed in the popover */
  heading: string;
  /** Body text (1-2 sentences) */
  body: string;
  /** Optional placement override; defaults to 'bottom' */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const STORAGE_KEY = 'navin_tour_complete';

/** Check whether the tour has already been completed */
export function isTourComplete(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Mark the tour as complete so it won't show again */
export function markTourComplete(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // localStorage unavailable – silently ignore
  }
}

/** Reset the tour flag (used by "Restart Tour" button) */
export function resetTourFlag(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
