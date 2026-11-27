import * as crypto from 'crypto';
import { BankTransaction } from './interfaces/enable-banking.interface';
import { CreateTransactionDto } from '../transactions/create-transaction.dto';
import { normalizeIban } from './iban';

/** A mapped bank transaction, with the fields only bank sync sets. */
export type BankDto = CreateTransactionDto & {
  pending?: boolean;
  counterpartyIban?: string | null;
  merchantCategoryCode?: string | null;
};

/** A merchant category code as four digits ("742" → "0742"), or null. */
export function normalizeMcc(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const digits = String(value).trim();
  if (!/^\d{1,4}$/.test(digits)) return null;
  return digits.padStart(4, '0');
}

/**
 * Statuses that are not final yet but usually become a booked transaction:
 * a card hold, a pending transfer, a scheduled payment. They are imported
 * flagged as pending, since the amount can still change (tips, exchange
 * rates) and the booked version may arrive under another ID.
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
 * Maps a bank transaction to a PriPerFin transaction. Returns null for a zero
 * or unreadable amount. Callers check `bankTransactionState` first.
 */
export function mapBankTransaction(
  tx: BankTransaction,
  accountId: string,
): BankDto | null {
  const rawAmount = parseFloat(tx.transaction_amount?.amount || '0');
  if (isNaN(rawAmount) || rawAmount === 0) return null;

  const debit = isDebitTransaction(tx);
  const amount = debit ? -Math.abs(rawAmount) : Math.abs(rawAmount);
  const date = bankTransactionDate(tx);
  const { description, notes } = describeBankTransaction(tx);

  const externalId =
    tx.entry_reference ||
    tx.transaction_id ||
    fallbackTransactionId(accountId, date, amount, legacyDescription(tx));

  // The other party's account: where money went, or where it came from.
  const counterpartyIban = normalizeIban(
    debit ? tx.creditor_account?.iban : tx.debtor_account?.iban,
  );

  return {
    date: new Date(date).toISOString(),
    amount,
    description,
    accountId,
    notes: notes ?? undefined,
    externalId,
    counterpartyIban,
    merchantCategoryCode: normalizeMcc(tx.merchant_category_code),
  };
}

/**
 * The balance to treat as "what the bank says now", in order of preference:
 * closing booked, interim booked, expected, then the available balances. Codes
 * are ISO 20022; the Berlin Group names some banks send are accepted too.
 */
const BALANCE_PREFERENCE: Array<{ names: string[]; booked: boolean }> = [
  { names: ['CLBD', 'closingBooked'], booked: true },
  { names: ['ITBD', 'interimBooked'], booked: true },
  { names: ['XPCD', 'expected'], booked: false },
  { names: ['ITAV', 'interimAvailable'], booked: false },
  { names: ['CLAV', 'closingAvailable'], booked: false },
];

/**
 * @returns the amount, and whether it is a booked balance (one that leaves
 *   out pending transactions), or null when the bank sent none.
 */
export function pickBankBalance(
  balances: Array<{
    balance_type?: string;
    balance_amount?: { amount?: string };
  }>,
): { amount: number; booked: boolean } | null {
  if (!Array.isArray(balances) || balances.length === 0) return null;
  let chosen = balances[0];
  let booked = false;
  for (const { names, booked: isBooked } of BALANCE_PREFERENCE) {
    const hit = balances.find((b) =>
      names.some(
        (n) => (b.balance_type || '').toLowerCase() === n.toLowerCase(),
      ),
    );
    if (hit) {
      chosen = hit;
      booked = isBooked;
      break;
    }
  }
  const value = parseFloat(chosen?.balance_amount?.amount ?? '');
  return Number.isFinite(value) ? { amount: value, booked } : null;
}
