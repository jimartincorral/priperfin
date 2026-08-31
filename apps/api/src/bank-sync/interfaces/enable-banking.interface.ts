export interface Aspsp {
  name: string;
  country: string;
  logo?: string;
  bic?: string;
  flags?: string[];
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

export interface BankTransaction {
  entry_reference?: string;
  transaction_id?: string;
  booking_date?: string;
  value_date?: string;
  transaction_amount: BankTransactionAmount;
  credit_debit_indicator?: 'CRDT' | 'DBIT';
  remittance_information?: string[];
  creditor_name?: string;
  debtor_name?: string;
  creditor_account?: {
    iban?: string;
  };
  debtor_account?: {
    iban?: string;
  };
  bank_transaction_code?: string;
  proprietary_bank_transaction_code?: string;
  additional_information?: string;
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
