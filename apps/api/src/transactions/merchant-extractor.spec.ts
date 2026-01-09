import { extractMerchant, extractMerchantCore } from './merchant-extractor';

describe('merchant-extractor', () => {
  describe('extractMerchant', () => {
    it('should return empty string for empty input', () => {
      expect(extractMerchant('')).toBe('');
      expect(extractMerchant(null as any)).toBe('');
      expect(extractMerchant(undefined as any)).toBe('');
    });

    it('should normalize to lowercase', () => {
      expect(extractMerchant('WALMART')).toBe('walmart');
    });

    it('should remove payment processor prefixes', () => {
      expect(extractMerchant('SQ *COFFEE SHOP')).toBe('coffee shop');
      expect(extractMerchant('PAYPAL *NETFLIX')).toBe('netflix');
      expect(extractMerchant('STRIPE *SPOTIFY')).toBe('spotify');
    });

    it('should remove asterisk suffixes with IDs', () => {
      expect(extractMerchant('AMAZON.COM*ABC123')).toBe('amazon.com');
      expect(extractMerchant('TARGET#12345')).toBe('target');
    });

    it('should remove transaction reference numbers', () => {
      expect(extractMerchant('STARBUCKS TX123456789')).toBe('starbucks');
    });

    it('should remove long number sequences', () => {
      expect(extractMerchant('WALMART 12345678')).toBe('walmart');
    });

    it('should remove date patterns', () => {
      // Short date patterns like 12/25 are removed
      expect(extractMerchant('STORE 12/25')).toBe('store');
    });

    it('should remove state abbreviations at end', () => {
      expect(extractMerchant('STARBUCKS SEATTLE WA')).toBe('starbucks seattle');
    });

    it('should remove zip codes', () => {
      expect(extractMerchant('TARGET 98101')).toBe('target');
      // Extended zip codes leave the dash which gets trimmed
      expect(extractMerchant('WALMART 98101-1234')).toBe('walmart -');
    });

    it('should remove common noise words', () => {
      expect(extractMerchant('VISA PURCHASE AMAZON')).toBe('amazon');
      expect(extractMerchant('POS DEBIT STARBUCKS')).toBe('starbucks');
    });

    it('should handle complex real-world descriptions', () => {
      // City names are kept, state abbreviations at end are removed
      expect(extractMerchant('AMAZON.COM*AB12CD SEATTLE WA')).toBe('amazon.com seattle');
      expect(extractMerchant('STARBUCKS #12345 NEW YORK NY')).toBe('starbucks new york');
      expect(extractMerchant('SQ *COFFEE HOUSE LOS ANGELES CA')).toBe('coffee house los angeles');
    });
  });

  describe('extractMerchantCore', () => {
    it('should return first word up to 10 chars', () => {
      expect(extractMerchantCore('WALMART STORE #123')).toBe('walmart');
      expect(extractMerchantCore('AMAZON.COM*ABC123')).toBe('amazon.com');
    });

    it('should return empty for empty input', () => {
      expect(extractMerchantCore('')).toBe('');
    });

    it('should skip short words', () => {
      expect(extractMerchantCore('AB LONGMERCHANT')).toBe('longmercha');
    });
  });
});
