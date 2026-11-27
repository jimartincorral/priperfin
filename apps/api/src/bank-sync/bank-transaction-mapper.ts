import * as crypto from 'crypto';
import { BankTransaction } from './interfaces/enable-banking.interface';
import { CreateTransactionDto } from '../transactions/create-transaction.dto';

/**
 * Statuses that are not final yet but usually become a booked transaction:
 * a card hold, a pending transfer, a scheduled payment. Importing them would
 * store an amount that can still change (tips, exchange rates) under an ID
 * the booked version will not share, so they are left for a later sync.
 */
const NOT_YET_BOOKED = new Set(['PDNG', 'PENDING', 'HOLD', 'SCHD']);
/** Statuses that will never be booked. */
const NEVER_BOOKED = new Set(['CNCL', 'RJCT']);

export type BankTransactionState = 'booked' | 'pending' | 'void';

/** A transaction with no status is treated as booked: many banks omit it. */
export function bankTransactionState(
  tx: Pick<BankTransaction, 'status'>,
): BankTransactionState {
  const status = (tx.status || '').trim().toUpperCase();
  if (NOT_YET_BOOKED.has(status)) return 'pending';
  if (NEVER_BOOKED.has(status)) return 'void';
  return 'booked';
}

export function isDebitTransaction(tx: BankTransaction): boolean {
  const amount = parseFloat(tx.transaction_amount?.amount || '0');
  return (
    tx.credit_debit_indicator === 'DBIT' ||
    (tx.credit_debit_indicator === undefined && amount < 0)
  );
}

/** The date the transaction is filed under: value date first, as before. */
export function bankTransactionDate(tx: BankTransaction): string {
  return (
    tx.value_date ||
    tx.booking_date ||
    tx.transaction_date ||
    new Date().toISOString().split('T')[0]
  );
}

const clean = (v: unknown): string =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '';

/**
 * Description and notes for a bank transaction.
 *
 * The description is the other party: whoever was paid on money going out
 * (the creditor), whoever paid on money coming in (the debtor). The account
 * holder's own name, which some banks fill in on the other side, is only used
 * when the bank sent nothing else at all.
 */
export function describeBankTransaction(tx: BankTransaction): {
  description: string;
  notes: string | null;
} {
  const creditor = clean(tx.creditor?.name) || clean(tx.creditor_name);
  const debtor = clean(tx.debtor?.name) || clean(tx.debtor_name);
  const debit = isDebitTransaction(tx);
  const counterparty = debit ? creditor : debtor;
  const ownSide = debit ? debtor : creditor;

  const remittance = clean(
    (tx.remittance_information || []).filter(Boolean).join(' '),
  );

  const parts: string[] = [];
  for (const part of [
    counterparty,
    remittance,
    clean(tx.additional_information),
    clean(tx.note),
  ]) {
    if (part && !parts.some((p) => p.toLowerCase() === part.toLowerCase())) {
      parts.push(part);
    }
  }

  if (parts.length === 0) {
    return { description: ownSide || 'Bank Transaction', notes: null };
  }
  return {
    description: parts[0],
    notes: parts.slice(1).join(' - ') || null,
  };
}

/**
 * The description earlier versions picked (creditor first, whatever the
 * direction). Only used to rebuild the same fallback ID for transactions the
 * bank sends without a reference, so a sync after upgrading still recognises
 * what was imported before.
 */
function legacyDescription(tx: BankTransaction): string {
  const parts = [
    tx.creditor?.name,
    tx.debtor?.name,
    tx.remittance_information?.join(' '),
    tx.additional_information,
    tx.creditor_name,
    tx.debtor_name,
  ].filter(Boolean);
  return parts.length > 0 ? String(parts[0]).trim() : 'Bank Transaction';
}

export function fallbackTransactionId(
  accountId: string,
  date: string,
  amount: number,
  description: string,
): string {
  const raw = `${accountId}|${date}|${amount.toFixed(2)}|${description.trim().toLowerCase()}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Maps a booked bank transaction to a PriPerFin transaction. Returns null for
 * a zero or unreadable amount. Callers filter on `bankTransactionState` first.
 */
export function mapBankTransaction(
  tx: BankTransaction,
  accountId: string,
): CreateTransactionDto | null {
  const rawAmount = parseFloat(tx.transaction_amount?.amount || '0');
  if (isNaN(rawAmount) || rawAmount === 0) return null;

  const amount = isDebitTransaction(tx)
    ? -Math.abs(rawAmount)
    : Math.abs(rawAmount);
  const date = bankTransactionDate(tx);
  const { description, notes } = describeBankTransaction(tx);

  const externalId =
    tx.entry_reference ||
    tx.transaction_id ||
    fallbackTransactionId(accountId, date, amount, legacyDescription(tx));

  return {
    date: new Date(date).toISOString(),
    amount,
    description,
    accountId,
    notes,
    externalId,
  } as CreateTransactionDto;
}

/**
 * The balance to treat as "what the bank says now", in order of preference:
 * closing booked, interim booked, expected, then the available balances. Codes
 * are ISO 20022; the Berlin Group names some banks send are accepted too.
 */
const BALANCE_PREFERENCE = [
  ['CLBD', 'closingBooked'],
  ['ITBD', 'interimBooked'],
  ['XPCD', 'expected'],
  ['ITAV', 'interimAvailable'],
  ['CLAV', 'closingAvailable'],
];

export function pickBankBalance(
  balances: Array<{
    balance_type?: string;
    balance_amount?: { amount?: string };
  }>,
): number | null {
  if (!Array.isArray(balances) || balances.length === 0) return null;
  let chosen = balances[0];
  for (const names of BALANCE_PREFERENCE) {
    const hit = balances.find((b) =>
      names.some(
        (n) => (b.balance_type || '').toLowerCase() === n.toLowerCase(),
      ),
    );
    if (hit) {
      chosen = hit;
      break;
    }
  }
  const value = parseFloat(chosen?.balance_amount?.amount ?? '');
  return Number.isFinite(value) ? value : null;
}
