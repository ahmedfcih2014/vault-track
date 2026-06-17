import { formatCurrency } from "@/domain/money";
import type { AccountType } from "@/domain/types";
import { ACCOUNT_LABELS } from "@/domain/saving";
import { Card, CardTitle, CardValue } from "@/presentation/components/ui/card";
import { cn } from "@/presentation/lib/utils";

interface BalanceCardProps {
  accountType: AccountType;
  balance: string;
  onSelect?: (accountType: AccountType) => void;
  testId?: string;
}

export function BalanceCard({ accountType, balance, onSelect, testId }: BalanceCardProps) {
  const content = (
    <>
      <CardTitle>{ACCOUNT_LABELS[accountType]}</CardTitle>
      <CardValue>{formatCurrency(balance, accountType)}</CardValue>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={cn("w-full min-h-11 text-left")}
        data-testid={testId}
        onClick={() => onSelect(accountType)}
      >
        <Card className="transition-colors hover:border-emerald-500/40">{content}</Card>
      </button>
    );
  }

  return <Card>{content}</Card>;
}
