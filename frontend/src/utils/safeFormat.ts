/**
 * Safely formats a date string, returning "N/A" for null/undefined/invalid dates
 * Prevents crashes when backend returns null for optional date fields
 */
export const safeFormatDate = (
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string => {
  if (!dateString || typeof dateString !== 'string') return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 
'N/A';
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return 'N/A';
  }
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
  if (rating === null || rating === undefined || typeof rating !== 
'number') return 0;
  return rating;
};
