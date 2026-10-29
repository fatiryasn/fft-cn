// types/transaction.ts
export type TransactionPurpose = "income" | "expense" | "account_transfer";
export type TransactionPurposeFilter = TransactionPurpose | "semua";

export interface TransactionFilters {
  purpose: TransactionPurposeFilter
  categoryIds: string[];
  accountIds: string[];
  dateFrom: string | null;
  dateTo: string | null;
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  purpose: "semua",
  categoryIds: [],
  accountIds: [],
  dateFrom: null,
  dateTo: null,
};

export interface Transaction {
  id: string;
  purpose: TransactionPurpose;
  category_name: string | null;
  note: string | null;
  amount: number;
  transaction_date: string;
  transaction_time: string | null;
  created_at: string;
  updated_at: string;
  code?: string;
}
