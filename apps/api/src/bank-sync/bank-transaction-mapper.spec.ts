import * as crypto from 'crypto';
import {
  bankTransactionState,
  describeBankTransaction,
  mapBankTransaction,
  pickBankBalance,
} from './bank-transaction-mapper';
import { BankTransaction } from './interfaces/enable-banking.interface';

const tx = (over: Partial<BankTransaction>): BankTransaction => ({
  transaction_amount: { amount: '10.00', currency: 'EUR' },
  booking_date: '2026-11-02',
  ...over,
});

describe('bankTransactionState', () => {
  it('treats a missing status as booked', () => {
    expect(bankTransactionState({})).toBe('booked');
    expect(bankTransactionState({ status: 'BOOK' })).toBe('booked');
  });

  it('holds back pending, held and scheduled transactions', () => {
    for (const status of ['PDNG', 'pdng', 'HOLD', 'SCHD', 'PENDING']) {
      expect(bankTransactionState({ status })).toBe('pending');
    }
  });

  it('drops cancelled and rejected transactions', () => {
    expect(bankTransactionState({ status: 'CNCL' })).toBe('void');
    expect(bankTransactionState({ status: 'RJCT' })).toBe('void');
  });
});

describe('describeBankTransaction', () => {
  it('names the payee on money going out', () => {
    const result = describeBankTransaction(
      tx({
        credit_debit_indicator: 'DBIT',
        creditor: { name: 'Corner Shop' },
        debtor: { name: 'Account Holder' },
        remittance_information: ['Card 1234'],
      }),
    );
    expect(result).toEqual({ description: 'Corner Shop', notes: 'Card 1234' });
  });

  it('names the payer on money coming in, not the account holder', () => {
    const result = describeBankTransaction(
      tx({
        credit_debit_indicator: 'CRDT',
        creditor: { name: 'Account Holder' },
        debtor: { name: 'Acme Payroll' },
        remittance_information: ['Salary November'],
      }),
    );
    expect(result).toEqual({
      description: 'Acme Payroll',
      notes: 'Salary November',
    });
  });

  it('falls back to the remittance text when the other party is missing', () => {
    const result = describeBankTransaction(
      tx({
        credit_debit_indicator: 'CRDT',
        creditor: { name: 'Account Holder' },
        remittance_information: ['Refund order 42'],
      }),
    );
    expect(result).toEqual({ description: 'Refund order 42', notes: null });
  });

  it('reads top-level names and skips repeated text', () => {
    const result = describeBankTransaction(
      tx({
        credit_debit_indicator: 'DBIT',
        creditor_name: 'Utility Co',
        remittance_information: ['UTILITY CO'],
        additional_information: 'Direct debit',
      }),
    );
    expect(result).toEqual({
      description: 'Utility Co',
      notes: 'Direct debit',
    });
  });

  it("uses the holder's own name only when nothing else was sent", () => {
    expect(
      describeBankTransaction(
        tx({
          credit_debit_indicator: 'CRDT',
          creditor: { name: 'Account Holder' },
        }),
      ).description,
    ).toBe('Account Holder');
    expect(describeBankTransaction(tx({})).description).toBe(
      'Bank Transaction',
    );
  });
});

describe('mapBankTransaction', () => {
  it('signs the amount by direction and prefers value_date', () => {
    const dto = mapBankTransaction(
      tx({
        transaction_id: 'abc',
        credit_debit_indicator: 'DBIT',
        value_date: '2026-11-01',
        transaction_amount: { amount: '45.50', currency: 'EUR' },
      }),
      'acc-1',
    );
    expect(dto).toMatchObject({
      amount: -45.5,
      date: new Date('2026-11-01').toISOString(),
      externalId: 'abc',
      accountId: 'acc-1',
    });
  });

  it('returns null for a zero amount', () => {
    expect(
      mapBankTransaction(
        tx({ transaction_amount: { amount: '0', currency: 'EUR' } }),
        'acc-1',
      ),
    ).toBeNull();
  });

  it('keeps the fallback ID earlier versions built for unreferenced transactions', () => {
    const dto = mapBankTransaction(
      tx({
        credit_debit_indicator: 'CRDT',
        creditor: { name: 'Account Holder' },
        debtor: { name: 'Acme Payroll' },
        transaction_amount: { amount: '1500.00', currency: 'EUR' },
      }),
      'acc-1',
    );
    // Earlier versions described this as the creditor, and hashed that.
    const legacy = crypto
      .createHash('sha256')
      .update('acc-1|2026-11-02|1500.00|account holder')
      .digest('hex');
    expect(dto?.description).toBe('Acme Payroll');
    expect(dto?.externalId).toBe(legacy);
  });
});

describe('pickBankBalance', () => {
  it('prefers closing booked, then interim booked, over available', () => {
    expect(
      pickBankBalance([
        { balance_type: 'ITAV', balance_amount: { amount: '90' } },
        { balance_type: 'ITBD', balance_amount: { amount: '100' } },
      ]),
    ).toEqual({ amount: 100, booked: true });
    expect(
      pickBankBalance([
        { balance_type: 'ITBD', balance_amount: { amount: '100' } },
        { balance_type: 'closingBooked', balance_amount: { amount: '120' } },
      ]),
    ).toEqual({ amount: 120, booked: true });
    expect(
      pickBankBalance([
        { balance_type: 'XPCD', balance_amount: { amount: '80' } },
        { balance_type: 'ITAV', balance_amount: { amount: '90' } },
      ]),
    ).toEqual({ amount: 80, booked: false });
  });

  it('falls back to the first balance, and to null when there is none', () => {
    expect(
      pickBankBalance([
        { balance_type: 'OTHR', balance_amount: { amount: '-5.5' } },
      ]),
    ).toEqual({ amount: -5.5, booked: false });
    expect(pickBankBalance([])).toBeNull();
    expect(pickBankBalance(undefined as any)).toBeNull();
  });
});
