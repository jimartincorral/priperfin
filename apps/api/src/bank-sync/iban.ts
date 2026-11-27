/** IBANs compare without spaces and case. */
export function normalizeIban(iban: unknown): string | null {
  if (typeof iban !== 'string') return null;
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  return clean.length >= 8 ? clean : null;
}

/** The IBAN of an entry in a bank connection's `accountsJson`. */
export function ibanOfBankAccount(entry: any): string | null {
  return normalizeIban(entry?.account_id?.iban ?? entry?.iban);
}

/**
 * A name and account type for a bank account: the bank's own name for it
 * (or product, or the bank's name) with the last four IBAN digits, and
 * CREDIT when the bank reports a card (ISO 20022 cash account type CARD).
 */
export function describeBankAccount(
  entry: any,
  bankName: string,
): { name: string; type: 'DEBIT' | 'CREDIT' } {
  const card = String(entry?.cash_account_type || '').toUpperCase() === 'CARD';
  const base =
    [entry?.name, entry?.product, entry?.details]
      .map((v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : ''))
      .find(Boolean) || bankName;
  const iban = ibanOfBankAccount(entry);
  const tail = iban ? ` ··${iban.slice(-4)}` : '';
  const name = `${base}${tail}`.slice(0, 80);
  return { name, type: card ? 'CREDIT' : 'DEBIT' };
}

export function parseBankAccounts(json: string | null | undefined): any[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * IBAN → PriPerFin account, for the accounts linked to a bank. The IBAN comes
 * from what the bank reported for the linked bank account when it was
 * connected. Accounts without a bank link have no known IBAN.
 */
export function ownIbanMap(
  accounts: Array<{
    id: string;
    bankAccountUid: string | null;
    bankConnection: { accountsJson: string } | null;
  }>,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const account of accounts) {
    if (!account.bankAccountUid || !account.bankConnection) continue;
    const entry = parseBankAccounts(account.bankConnection.accountsJson).find(
      (e) => e?.uid === account.bankAccountUid,
    );
    const iban = ibanOfBankAccount(entry);
    if (iban) map.set(iban, account.id);
  }
  return map;
}
