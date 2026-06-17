import { nowIso } from "@/domain/date";
import { DOMAIN_ERROR_CODES, DomainError } from "@/domain/errors";
import {
  addMoney,
  compareMoney,
  formatMoney,
  normalizeAmountForAccount,
  subtractMoney,
} from "@/domain/money";
import type {
  AccountType,
  OperationType,
  Saving,
  SavingTransaction,
} from "@/domain/types";

export function createEmptySaving(id: string): Saving {
  return {
    id,
    balance: {
      usd: "0",
      sar: "0",
      gold_21: "0",
    },
    transactions: [],
    updatedAt: nowIso(),
    version: 1,
  };
}

export function createSavingTransaction(
  input: Omit<SavingTransaction, "id" | "createdAt"> & { id: string; createdAt: string },
): SavingTransaction {
  return { ...input };
}

export const ACCOUNT_LABELS: Record<AccountType, string> = {
  usd: "USD",
  sar: "SAR",
  gold_21: "Gold 21k (g)",
};

export interface ApplySavingTransactionInput {
  accountType: AccountType;
  amount: string;
  note: string;
  operationType: OperationType;
  id: string;
  createdAt: string;
}

export function applyDeposit(saving: Saving, accountType: AccountType, amount: string): Saving {
  return applySavingTransaction(saving, {
    accountType,
    amount: normalizeAmountForAccount(amount, accountType),
    note: "",
    operationType: "deposit",
    id: crypto.randomUUID(),
    createdAt: nowIso(),
  });
}

export function applyWithdraw(saving: Saving, accountType: AccountType, amount: string): Saving {
  return applySavingTransaction(saving, {
    accountType,
    amount: normalizeAmountForAccount(amount, accountType),
    note: "",
    operationType: "withdraw",
    id: crypto.randomUUID(),
    createdAt: nowIso(),
  });
}

export function applySavingTransaction(
  saving: Saving,
  input: ApplySavingTransactionInput,
): Saving {
  const normalizedAmount = normalizeAmountForAccount(input.amount, input.accountType);
  const currentBalance = saving.balance[input.accountType];

  const nextBalance =
    input.operationType === "deposit"
      ? addMoney(currentBalance, normalizedAmount)
      : subtractMoney(currentBalance, normalizedAmount);

  if (input.operationType === "withdraw" && compareMoney(nextBalance, "0") < 0) {
    throw new DomainError(
      DOMAIN_ERROR_CODES.INSUFFICIENT_BALANCE,
      `Insufficient ${ACCOUNT_LABELS[input.accountType]} balance for withdrawal`,
      {
        accountType: input.accountType,
        available: currentBalance,
        requested: normalizedAmount,
      },
    );
  }

  const decimals = input.accountType === "gold_21" ? 3 : 2;
  const transaction = createSavingTransaction({
    id: input.id,
    accountType: input.accountType,
    amount: normalizedAmount,
    note: input.note,
    operationType: input.operationType,
    createdAt: input.createdAt,
    syncStatus: "local",
  });

  return {
    ...saving,
    balance: {
      ...saving.balance,
      [input.accountType]: formatMoney(nextBalance, decimals),
    },
    transactions: [...saving.transactions, transaction],
    updatedAt: input.createdAt,
    version: (saving.version ?? 1) + 1,
  };
}
