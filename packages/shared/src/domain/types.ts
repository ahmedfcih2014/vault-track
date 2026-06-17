export type AccountType = "usd" | "sar" | "gold_21";
export type OperationType = "deposit" | "withdraw";
export type SyncStatus = "local" | "pending" | "synced" | "failed";

export interface BaseTransaction {
  id: string;
  amount: string;
  note: string;
  operationType: OperationType;
  createdAt: string;
  syncStatus?: SyncStatus;
  serverId?: string;
}

export interface SavingTransaction extends BaseTransaction {
  accountType: AccountType;
}

export type SpendingIncomeTransaction = BaseTransaction;

export interface Saving {
  id: string;
  balance: Record<AccountType, string>;
  transactions: SavingTransaction[];
  updatedAt: string;
  version?: number;
}

export interface SpendingIncome {
  id: string;
  startedAt: string;
  resetedAt: string | null;
  balance: string;
  transactions: SpendingIncomeTransaction[];
  updatedAt: string;
  version?: number;
}

export interface ArchiveRef {
  id: string;
  filename: string;
  archivedAt: string;
}

export interface ArchiveRecord extends ArchiveRef {
  snapshot: SpendingIncome;
}

export interface AppMeta {
  key: "app";
  schemaVersion: number;
  deviceId: string;
  lastModifiedAt: string;
}

export const ACTIVE_DOCUMENT_KEY = "active" as const;
