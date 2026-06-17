import { nowIso } from "./date";
import { addMoney, formatMoney, subtractMoney } from "./money";
import type {
  OperationType,
  SpendingIncome,
  SpendingIncomeTransaction,
} from "./types";

export function createFreshSpendingIncome(id: string): SpendingIncome {
  const startedAt = nowIso();
  return {
    id,
    startedAt,
    resetedAt: null,
    balance: "0",
    transactions: [],
    updatedAt: startedAt,
    version: 1,
  };
}

export const SPENDING_OPERATION_LABELS: Record<OperationType, string> = {
  deposit: "Income",
  withdraw: "Spending",
};

const SPENDING_DECIMALS = 2;

export interface ApplySpendingIncomeTransactionInput {
  id: string;
  amount: string;
  note: string;
  operationType: OperationType;
  createdAt: string;
}

export function normalizeSpendingAmount(amount: string): string {
  return formatMoney(amount, SPENDING_DECIMALS);
}

export function createSpendingIncomeTransaction(
  input: Omit<SpendingIncomeTransaction, "id" | "createdAt"> & {
    id: string;
    createdAt: string;
  },
): SpendingIncomeTransaction {
  return { ...input };
}

export function applySpendingIncomeTransaction(
  period: SpendingIncome,
  input: ApplySpendingIncomeTransactionInput,
): SpendingIncome {
  const normalizedAmount = normalizeSpendingAmount(input.amount);
  const nextBalance =
    input.operationType === "deposit"
      ? addMoney(period.balance, normalizedAmount)
      : subtractMoney(period.balance, normalizedAmount);

  const transaction = createSpendingIncomeTransaction({
    id: input.id,
    amount: normalizedAmount,
    note: input.note,
    operationType: input.operationType,
    createdAt: input.createdAt,
    syncStatus: "local",
  });

  return {
    ...period,
    balance: formatMoney(nextBalance, SPENDING_DECIMALS),
    transactions: [...period.transactions, transaction],
    updatedAt: input.createdAt,
    version: (period.version ?? 1) + 1,
  };
}
