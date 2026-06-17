import { formatDisplayDate } from "@/domain/date";
import { formatCurrency, formatSignedEgp } from "@/domain/money";
import { ACCOUNT_LABELS } from "@/domain/saving";
import { SPENDING_OPERATION_LABELS } from "@/domain/spending-income";
import type { SavingTransaction, SpendingIncomeTransaction } from "@/domain/types";
import { Card } from "@/presentation/components/ui/card";

type TransactionItem = SavingTransaction | SpendingIncomeTransaction;

function isSavingTransaction(
  transaction: TransactionItem,
): transaction is SavingTransaction {
  return "accountType" in transaction;
}

interface TransactionListProps {
  transactions: TransactionItem[];
  emptyMessage?: string;
  showAccountType?: boolean;
  variant?: "saving" | "spending";
}

export function TransactionList({
  transactions,
  emptyMessage = "No transactions yet.",
  showAccountType = false,
  variant = "saving",
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Card className="text-center text-sm text-slate-400">{emptyMessage}</Card>
    );
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const labelFor = (transaction: TransactionItem) => {
    if (variant === "spending") {
      return SPENDING_OPERATION_LABELS[transaction.operationType];
    }
    return transaction.operationType;
  };

  return (
    <ul className="space-y-2">
      {sorted.map((transaction) => (
        <li key={transaction.id}>
          <Card className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-100">
                {labelFor(transaction)}
                {showAccountType && isSavingTransaction(transaction)
                  ? ` · ${ACCOUNT_LABELS[transaction.accountType]}`
                  : ""}
              </p>
              {transaction.note ? (
                <p className="mt-1 text-sm text-slate-400">{transaction.note}</p>
              ) : null}
              <p className="mt-1 text-xs text-slate-500">
                {formatDisplayDate(transaction.createdAt)}
              </p>
            </div>
            <p
              className={
                transaction.operationType === "deposit"
                  ? "text-sm font-semibold text-emerald-400"
                  : "text-sm font-semibold text-rose-400"
              }
            >
              {transaction.operationType === "deposit" ? "+" : "-"}
              {showAccountType && isSavingTransaction(transaction)
                ? formatCurrency(transaction.amount, transaction.accountType)
                : formatSignedEgp(transaction.amount).replace(/^-/, "")}
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
