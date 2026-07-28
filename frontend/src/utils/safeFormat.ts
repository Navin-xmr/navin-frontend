import {
  formatAddress as formatLocalizedAddress,
  formatCurrency as formatLocalizedCurrency,
  formatDate as formatLocalizedDate,
} from './localeFormat';

const DEFAULT_LOCALE = 'en-US';

/**
 * Safely formats a date string, returning "N/A" for null/undefined/invalid dates
 * Prevents crashes when backend returns null for optional date fields
 */
export const safeFormatDate = (
  dateString: string | null | undefined | Date,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
  locale = DEFAULT_LOCALE,
): string => {
  if (!dateString) return 'N/A';
  if (typeof dateString !== 'string' && !(dateString instanceof Date)) return 'N/A';

  try {
    return formatLocalizedDate(dateString, options, locale);
  } catch {
    return 'N/A';
  }
};

export const safeFormatCurrency = (
  value: number,
  currency: string,
  locale = DEFAULT_LOCALE,
): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
  return formatLocalizedCurrency(value, currency, locale);
};

export const safeFormatAddress = (address: Record<string, string | undefined>, locale = DEFAULT_LOCALE): string => {
  return formatLocalizedAddress(address, locale);
};

/**
 * Safely parses a date for sorting, returning 0 for null/invalid dates
 */
export const safeDateCompare = (
  a: string | null | undefined,
  b: string | null | undefined
): number => {
  const timeA = a ? new Date(a).getTime() : 0;
  const timeB = b ? new Date(b).getTime() : 0;
  if (isNaN(timeA)) return isNaN(timeB) ? 0 : 1;
  if (isNaN(timeB)) return -1;
  return timeA - timeB;
};

/**
 * Safely renders a rating, returning 0 for null/undefined
 */
export const safeRating = (rating: number | null | undefined): number => {
  if (rating === null || rating === undefined || typeof rating !== 'number') return 0;
  return rating;
};
