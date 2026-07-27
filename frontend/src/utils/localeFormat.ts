export interface LocaleAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

const getLocale = (locale?: string): string => locale ?? 'en-US';

export const formatDate = (
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
  locale?: string,
): string => {
  if (!value) return 'N/A';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return new Intl.DateTimeFormat(getLocale(locale), options).format(date);
};

export const formatCurrency = (
  value: number,
  currency: string,
  locale?: string,
  options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
): string => {
  if (Number.isNaN(value)) return 'N/A';

  return new Intl.NumberFormat(getLocale(locale), {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
};

export const formatAddress = (
  address: LocaleAddress,
  locale?: string,
): string => {
  const parts = [address.street, address.city, [address.state, address.postalCode].filter(Boolean).join(' '), address.country]
    .filter((part): part is string => Boolean(part && part.trim()));

  if (parts.length === 0) return 'N/A';

  const separator = locale?.toLowerCase().startsWith('fr') ? ' · ' : ', ';
  return parts.join(separator);
};
