import { describe, it, expect } from 'vitest';
import {
  isOfxFilename,
  parseOfxDate,
  detectOfxCharset,
  extractOfxAccountId,
  parseOfxTransactions,
  readOfxFile,
} from './ofx-utils';

const SGML_OFX = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKACCTFROM>
<BANKID>0049
<ACCTID>1234567890
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240115120000[0:GMT]
<TRNAMT>-45.99
<FITID>2024011500001
<NAME>Grocery Store
<MEMO>Weekly shop
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20240116
<TRNAMT>1500.00
<FITID>2024011600002
<NAME>Salary
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240117
<TRNAMT>0.00
<FITID>2024011700003
<NAME>Zero amount row, should be skipped
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

const XML_OFX = `<?xml version="1.0" encoding="UTF-8"?>
<?OFX OFXHEADER="200" VERSION="211" SECURITY="NONE" OLDFILEUID="NONE" NEWFILEUID="NONE"?>
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKACCTFROM>
          <BANKID>0049</BANKID>
          <ACCTID>9876543210</ACCTID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20240220</DTPOSTED>
            <TRNAMT>-12.50</TRNAMT>
            <FITID>abc123</FITID>
            <PAYEE>Coffee Shop</PAYEE>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

describe('OFX Utilities', () => {
  describe('isOfxFilename', () => {
    it('accepts .ofx and .qfx regardless of case', () => {
      expect(isOfxFilename('statement.ofx')).toBe(true);
      expect(isOfxFilename('statement.QFX')).toBe(true);
      expect(isOfxFilename('statement.csv')).toBe(false);
      expect(isOfxFilename('statement')).toBe(false);
    });
  });

  describe('parseOfxDate', () => {
    it('parses a bare YYYYMMDD date', () => {
      const date = parseOfxDate('20240116');
      expect(date?.getFullYear()).toBe(2024);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(16);
    });

    it('parses a date with time and timezone suffix', () => {
      const date = parseOfxDate('20240115120000[0:GMT]');
      expect(date?.getFullYear()).toBe(2024);
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(15);
    });

    it('returns null for empty or malformed input', () => {
      expect(parseOfxDate('')).toBeNull();
      expect(parseOfxDate('not-a-date')).toBeNull();
    });
  });

  describe('detectOfxCharset', () => {
    it('maps CHARSET:1252 to windows-1252', () => {
      expect(detectOfxCharset('CHARSET:1252')).toBe('windows-1252');
    });

    it('maps CHARSET:8859-1 to iso-8859-1', () => {
      expect(detectOfxCharset('CHARSET:8859-1')).toBe('iso-8859-1');
    });

    it('defaults to utf-8 when no CHARSET header is present', () => {
      expect(detectOfxCharset('<OFX></OFX>')).toBe('utf-8');
    });
  });

  describe('extractOfxAccountId', () => {
    it('extracts ACCTID from a BANKACCTFROM block', () => {
      expect(extractOfxAccountId(SGML_OFX)).toBe('1234567890');
    });

    it('extracts ACCTID from XML-style OFX', () => {
      expect(extractOfxAccountId(XML_OFX)).toBe('9876543210');
    });

    it('returns null when no account block is present', () => {
      expect(extractOfxAccountId('<OFX></OFX>')).toBeNull();
    });
  });

  describe('parseOfxTransactions', () => {
    it('parses SGML-style (OFX 1.x) transactions', () => {
      const rows = parseOfxTransactions(SGML_OFX);

      expect(rows).toHaveLength(2); // zero-amount row skipped
      expect(rows[0]).toMatchObject({
        amount: -45.99,
        description: 'Grocery Store',
        notes: 'Weekly shop',
        externalId: 'ofx:2024011500001',
      });
      expect(new Date(rows[0].date).getDate()).toBe(15);

      expect(rows[1]).toMatchObject({
        amount: 1500,
        description: 'Salary',
        notes: '',
        externalId: 'ofx:2024011600002',
      });
    });

    it('parses XML-style (OFX 2.x) transactions', () => {
      const rows = parseOfxTransactions(XML_OFX);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        amount: -12.5,
        description: 'Coffee Shop',
        externalId: 'ofx:abc123',
      });
    });

    it('returns an empty array when there are no transactions', () => {
      expect(parseOfxTransactions('<OFX></OFX>')).toEqual([]);
    });

    it('omits externalId when FITID is missing', () => {
      const noFitId = `<STMTTRN><DTPOSTED>20240101<TRNAMT>10.00<NAME>Test</STMTTRN>`;
      const rows = parseOfxTransactions(noFitId);
      expect(rows[0].externalId).toBeUndefined();
    });
  });

  describe('readOfxFile', () => {
    it('decodes a plain utf-8 OFX file', async () => {
      const file = new File([XML_OFX], 'statement.ofx', { type: 'application/x-ofx' });
      const text = await readOfxFile(file);
      expect(text).toContain('Coffee Shop');
    });
  });
});
