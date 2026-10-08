/**
 * Currency presentation helpers shared by every view and component.
 *
 * The Settings screen offers USD, EUR, GBP, JPY, CAD and AUD. The symbols
 * match the labels shown there; the two dollar variants deliberately render
 * as a plain "$", as in those labels.
 */
const SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: '$',
  AUD: '$',
};

export const CURRENCY_STORAGE_KEY = 'priperfin_currency';

/** Symbol for an ISO 4217 code; falls back to the code itself for unknown ones. */
export function currencySymbol(code: string | null | undefined): string {
  if (!code) return '$';
  return SYMBOLS[code.toUpperCase()] ?? code;
}

/** The currency the user picked in Settings, as cached in localStorage. */
export function getStoredCurrency(): string {
  try {
    return localStorage.getItem(CURRENCY_STORAGE_KEY) || 'USD';
  } catch {
    return 'USD';
  }
}
