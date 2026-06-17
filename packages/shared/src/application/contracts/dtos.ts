import type {
  AccountType,
  OperationType,
  Saving,
  SpendingIncome,
} from "../../domain/types";

export interface SavingTransactionInput {
  accountType: AccountType;
  amount: string;
  note: string;
  operationType: OperationType;
  clientTransactionId?: string;
}

export interface SavingTransactionPersistenceInput extends SavingTransactionInput {
  clientTransactionId: string;
  createdAt: string;
}

export interface SpendingIncomeTransactionInput {
  amount: string;
  note: string;
  operationType: OperationType;
  clientTransactionId?: string;
}

export interface SpendingIncomeTransactionPersistenceInput
  extends SpendingIncomeTransactionInput {
  clientTransactionId: string;
  createdAt: string;
}

export type SavingDto = Saving;
export type SpendingIncomeDto = SpendingIncome;

export interface BootstrapResult {
  saving: Saving;
  spendingIncome: SpendingIncome;
}
