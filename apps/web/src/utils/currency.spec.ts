import { describe, it, expect, beforeEach } from 'vitest';
import { currencySymbol, getStoredCurrency, CURRENCY_STORAGE_KEY } from './currency';

describe('currencySymbol', () => {
  it('maps every selectable currency to its symbol', () => {
    expect(currencySymbol('USD')).toBe('$');
    expect(currencySymbol('EUR')).toBe('€');
    expect(currencySymbol('GBP')).toBe('£');
    expect(currencySymbol('JPY')).toBe('¥');
    expect(currencySymbol('CAD')).toBe('$');
    expect(currencySymbol('AUD')).toBe('$');
  });

  it('is case-insensitive and falls back sensibly', () => {
    expect(currencySymbol('eur')).toBe('€');
    expect(currencySymbol('CHF')).toBe('CHF');
    expect(currencySymbol(null)).toBe('$');
    expect(currencySymbol(undefined)).toBe('$');
  });
});

describe('getStoredCurrency', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to USD', () => {
    expect(getStoredCurrency()).toBe('USD');
  });

  it('reads the stored code', () => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, 'GBP');
    expect(getStoredCurrency()).toBe('GBP');
  });
});
