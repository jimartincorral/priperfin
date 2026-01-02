import { describe, it, expect } from 'vitest';
import {
  parseDate,
  parseAmount,
  isDuplicate,
  autoMapHeaders,
  processRow,
} from './csv-utils';

describe('CSV Utilities', () => {
  // ============================================
  // parseDate() Tests
  // ============================================
  describe('parseDate', () => {
    it('should parse YYYY-MM-DD format', () => {
      const result = parseDate('2025-01-15', 'YYYY-MM-DD');

      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(0); // January
      expect(result?.getDate()).toBe(15);
    });

    it('should parse ISO 8601 with time', () => {
      const result = parseDate('2025-01-15T10:30:00', 'YYYY-MM-DD');

      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
    });

    it('should parse ISO 8601 with timezone', () => {
      const result = parseDate('2025-12-26T00:00:00+01:00', 'YYYY-MM-DD');

      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(11); // December
    });

    it('should parse DD.MM.YYYY format (European)', () => {
      const result = parseDate('15.01.2025', 'DD.MM.YYYY');

      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(0);
      expect(result?.getDate()).toBe(15);
    });

    it('should parse DD/MM/YYYY format (International)', () => {
      const result = parseDate('31/12/2025', 'DD/MM/YYYY');

      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(11); // December
      expect(result?.getDate()).toBe(31);
    });

    it('should parse MM/DD/YYYY format (US)', () => {
      const result = parseDate('12/31/2025', 'MM/DD/YYYY');

      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(11); // December
      expect(result?.getDate()).toBe(31);
    });

    it('should parse DD-MM-YYYY format', () => {
      const result = parseDate('25-06-2025', 'DD-MM-YYYY');

      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(5); // June
      expect(result?.getDate()).toBe(25);
    });

    it('should return null for empty string', () => {
      const result = parseDate('', 'YYYY-MM-DD');
      expect(result).toBeNull();
    });

    it('should return null for invalid date', () => {
      const result = parseDate('invalid-date', 'YYYY-MM-DD');
      expect(result).toBeNull();
    });

    it('should return null for incomplete date parts', () => {
      const result = parseDate('15.01', 'DD.MM.YYYY');
      expect(result).toBeNull();
    });
  });

  // ============================================
  // parseAmount() Tests
  // ============================================
  describe('parseAmount', () => {
    it('should parse US format (1,234.56)', () => {
      const result = parseAmount('1,234.56', 'dot');
      expect(result).toBe(1234.56);
    });

    it('should parse European format (1.234,56)', () => {
      const result = parseAmount('1.234,56', 'comma');
      expect(result).toBe(1234.56);
    });

    it('should remove currency symbols (€)', () => {
      const result = parseAmount('€50.00', 'dot');
      expect(result).toBe(50);
    });

    it('should remove currency symbols ($)', () => {
      const result = parseAmount('$1,000.50', 'dot');
      expect(result).toBe(1000.5);
    });

    it('should remove currency symbols (£)', () => {
      const result = parseAmount('£999.99', 'dot');
      expect(result).toBe(999.99);
    });

    it('should handle negative amounts', () => {
      const result = parseAmount('-150.00', 'dot');
      expect(result).toBe(-150);
    });

    it('should handle European negative amounts', () => {
      const result = parseAmount('-1.234,56', 'comma');
      expect(result).toBe(-1234.56);
    });

    it('should handle whitespace', () => {
      const result = parseAmount('  100.50  ', 'dot');
      expect(result).toBe(100.5);
    });

    it('should return 0 for invalid amount', () => {
      const result = parseAmount('invalid', 'dot');
      expect(result).toBe(0);
    });

    it('should handle simple decimal numbers', () => {
      const result = parseAmount('42.50', 'dot');
      expect(result).toBe(42.5);
    });

    it('should handle numbers without decimals', () => {
      const result = parseAmount('1000', 'dot');
      expect(result).toBe(1000);
    });
  });

  // ============================================
  // isDuplicate() Tests
  // ============================================
  describe('isDuplicate', () => {
    it('should return true for exact match', () => {
      const row = { date: '2025-01-15T00:00:00.000Z', amount: -50, description: 'Walmart' };
      const dup = { date: '2025-01-15T00:00:00.000Z', amount: -50, description: 'Walmart' };

      expect(isDuplicate(row, dup)).toBe(true);
    });

    it('should return true for matching date/amount/description', () => {
      const row = { date: '2025-01-15', amount: -100.50, description: 'Test Purchase' };
      const dup = { date: '2025-01-15', amount: -100.50, description: 'Test Purchase' };

      expect(isDuplicate(row, dup)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const row = { date: '2025-01-15', amount: -50, description: 'Test' };
      const dup = { date: '2025-01-15', amount: -51, description: 'Test' };

      expect(isDuplicate(row, dup)).toBe(false);
    });

    it('should return false for different dates', () => {
      const row = { date: '2025-01-15', amount: -50, description: 'Test' };
      const dup = { date: '2025-01-16', amount: -50, description: 'Test' };

      expect(isDuplicate(row, dup)).toBe(false);
    });

    it('should return false for different descriptions', () => {
      const row = { date: '2025-01-15', amount: -50, description: 'Test A' };
      const dup = { date: '2025-01-15', amount: -50, description: 'Test B' };

      expect(isDuplicate(row, dup)).toBe(false);
    });

    it('should handle floating point comparison within tolerance', () => {
      const row = { date: '2025-01-15', amount: -50.0001, description: 'Test' };
      const dup = { date: '2025-01-15', amount: -50.0002, description: 'Test' };

      expect(isDuplicate(row, dup)).toBe(true); // Within 0.001 tolerance
    });
  });

  // ============================================
  // autoMapHeaders() Tests
  // ============================================
  describe('autoMapHeaders', () => {
    it('should map standard headers', () => {
      const headers = ['Date', 'Amount', 'Description', 'Notes'];
      const result = autoMapHeaders(headers);

      expect(result.date).toBe('Date');
      expect(result.amount).toBe('Amount');
      expect(result.description).toBe('Description');
      expect(result.notes).toBe('Notes');
    });

    it('should handle case-insensitive matching', () => {
      const headers = ['DATE', 'AMOUNT', 'DESCRIPTION', 'NOTES'];
      const result = autoMapHeaders(headers);

      expect(result.date).toBe('DATE');
      expect(result.amount).toBe('AMOUNT');
    });

    it('should match partial keywords', () => {
      const headers = ['Transaction Date', 'Total Amount', 'Memo/Description'];
      const result = autoMapHeaders(headers);

      expect(result.date).toBe('Transaction Date');
      expect(result.amount).toBe('Total Amount');
      expect(result.description).toBe('Memo/Description');
    });

    it('should handle payee as description', () => {
      const headers = ['Date', 'Value', 'Payee Name'];
      const result = autoMapHeaders(headers);

      expect(result.description).toBe('Payee Name');
    });

    it('should handle narrative as description', () => {
      const headers = ['When', 'Cost', 'Narrative'];
      const result = autoMapHeaders(headers);

      expect(result.date).toBe('When');
      expect(result.amount).toBe('Cost');
      expect(result.description).toBe('Narrative');
    });

    it('should return empty string for unmatched fields', () => {
      const headers = ['Column1', 'Column2'];
      const result = autoMapHeaders(headers);

      expect(result.date).toBe('');
      expect(result.amount).toBe('');
    });

    it('should match reference for notes', () => {
      const headers = ['Date', 'Amount', 'Desc', 'Reference'];
      const result = autoMapHeaders(headers);

      expect(result.notes).toBe('Reference');
    });
  });

  // ============================================
  // processRow() Tests
  // ============================================
  describe('processRow', () => {
    const defaultMapping = {
      date: 'Date',
      amount: 'Amount',
      description: 'Description',
      notes: 'Notes',
    };

    it('should process valid row correctly', () => {
      const row = {
        Date: '2025-01-15',
        Amount: '-50.00',
        Description: 'Test Transaction',
        Notes: 'Some notes',
      };

      const result = processRow(row, defaultMapping, 'YYYY-MM-DD', 'dot');

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(-50);
      expect(result?.description).toBe('Test Transaction');
      expect(result?.notes).toBe('Some notes');
    });

    it('should return null for invalid date', () => {
      const row = {
        Date: 'invalid',
        Amount: '-50.00',
        Description: 'Test',
        Notes: '',
      };

      const result = processRow(row, defaultMapping, 'YYYY-MM-DD', 'dot');

      expect(result).toBeNull();
    });

    it('should return null for zero amount', () => {
      const row = {
        Date: '2025-01-15',
        Amount: '0',
        Description: 'Test',
        Notes: '',
      };

      const result = processRow(row, defaultMapping, 'YYYY-MM-DD', 'dot');

      expect(result).toBeNull();
    });

    it('should use default description when missing', () => {
      const row = {
        Date: '2025-01-15',
        Amount: '-50.00',
        Description: '',
        Notes: '',
      };

      const result = processRow(row, defaultMapping, 'YYYY-MM-DD', 'dot');

      expect(result?.description).toBe('Imported Transaction');
    });

    it('should handle European date and number formats', () => {
      const row = {
        Date: '15.01.2025',
        Amount: '1.234,56',
        Description: 'European Format',
        Notes: '',
      };

      const result = processRow(row, defaultMapping, 'DD.MM.YYYY', 'comma');

      expect(result).not.toBeNull();
      expect(result?.amount).toBe(1234.56);
    });
  });
});
