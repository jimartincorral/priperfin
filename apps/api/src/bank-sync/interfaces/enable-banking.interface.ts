export interface Aspsp {
  name: string;
  country: string;
  logo?: string;
  bic?: string;
  flags?: string[];
  /** Longest consent this bank grants, in seconds (90 or 180 days for most). */
  maximum_consent_validity?: number;
  psu_types?: string[];
  beta?: boolean;
}

/**
 * Who is at the keyboard. Sent as `Psu-*` headers on requests a person started,
 * so the bank counts them as user-present instead of against the PSD2 limit on
 * unattended (background) access.
 */
export interface PsuContext {
  ipAddress?: string;
  userAgent?: string;
}

/** `GET /sessions/{id}` */
export interface SessionStatusResponse {
  status?: string;
  access?: AuthAccess;
  accounts?: string[];
}

export interface AuthAccess {
  valid_until?: string;
  balances?: boolean;
  transactions?: boolean;
}

export interface AuthRequest {
  access: AuthAccess;
  aspsp: {
    name: string;
    country: string;
  };
  redirect_url: string;
  state: string;
  psu_type?: 'personal' | 'business';
}

export interface AuthResponse {
  url: string;
  authorization_id?: string;
}

export interface SessionResponse {
  session_id: string;
  access: AuthAccess;
  aspsp: {
    name: string;
    country: string;
  };
  accounts: string[]; // List of account UIDs
  created: string;
  status: string;
}

export interface BankAccountDetails {
  uid: string;
  account_id?: {
    iban?: string;
    bban?: string;
    other?: string;
  };
  currency?: string;
  name?: string;
  product?: string;
  cash_account_type?: string;
  balances?: Array<{
    balance_amount: {
      amount: string;
      currency: string;
    };
    balance_type: string;
    last_change_date_time?: string;
  }>;
}

export interface BankTransactionAmount {
  amount: string;
  currency: string;
}

export interface BankParty {
  name?: string;
}

export interface BankTransaction {
  entry_reference?: string | null;
  transaction_id?: string | null;
  booking_date?: string | null;
  value_date?: string | null;
  transaction_date?: string | null;
  transaction_amount: BankTransactionAmount;
  credit_debit_indicator?: 'CRDT' | 'DBIT';
  /** BOOK once final; PDNG, HOLD, SCHD, CNCL, RJCT or OTHR otherwise. */
  status?: string | null;
  remittance_information?: string[] | null;
  creditor?: BankParty | null;
  debtor?: BankParty | null;
  /** Older or non-standard responses put the names at the top level. */
  creditor_name?: string | null;
  debtor_name?: string | null;
  creditor_account?: {
    iban?: string;
  } | null;
  debtor_account?: {
    iban?: string;
  } | null;
  bank_transaction_code?:
    | string
    | { description?: string; code?: string; sub_code?: string }
    | null;
  proprietary_bank_transaction_code?: string | null;
  merchant_category_code?: string | null;
  balance_after_transaction?: BankTransactionAmount | null;
  additional_information?: string | null;
  note?: string | null;
}

export interface TransactionsResponse {
  transactions: BankTransaction[];
  continuation_key?: string;
}

export interface BankSyncSettingsDto {
  appId?: string;
  key?: string;
  redirectUrl?: string;
  autoSyncEnabled?: boolean;
  initialLookbackDays?: number;
}

export interface BankSyncSettingsResponse {
  hasAppId: boolean;
  hasKey: boolean;
  redirectUrl: string | null;
  autoSyncEnabled: boolean;
  initialLookbackDays: number;
}
