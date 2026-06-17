import { useState } from "react";
import { Plus } from "lucide-react";
import { formatDisplayDate, formatSignedEgp } from "@vault-track/shared";
import { BottomSheet } from "@/presentation/components/BottomSheet";
import { ConfirmResetDialog } from "@/presentation/components/ConfirmResetDialog";
import { SpendingTransactionForm } from "@/presentation/components/SpendingTransactionForm";
import { Toast } from "@/presentation/components/Toast";
import { TransactionList } from "@/presentation/components/TransactionList";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardTitle, CardValue } from "@/presentation/components/ui/card";
import { useSpendingIncome } from "@/presentation/hooks/use-spending-income";
import { cn } from "@/presentation/lib/utils";

export function SpendingPage() {
  const {
    spendingIncome,
    applyTransaction,
    resetPeriod,
    isSubmitting,
    error,
    successMessage,
    clearSuccess,
  } = useSpendingIncome();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  if (!spendingIncome) {
    return <PageLoading />;
  }

  const balanceValue = Number(spendingIncome.balance);
  const isPositive = balanceValue >= 0;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Spending</h1>
          <p className="mt-1 text-sm text-slate-400">
            Period started {formatDisplayDate(spendingIncome.startedAt)}
          </p>
        </div>
        <Button
          size="icon"
          aria-label="Add income or spending"
          data-testid="spending-add-button"
          onClick={() => setSheetOpen(true)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <Card>
        <CardTitle>Current balance</CardTitle>
        <CardValue className={cn(isPositive ? "text-emerald-400" : "text-rose-400")} data-testid="spending-balance">
          {formatSignedEgp(spendingIncome.balance)}
        </CardValue>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
          History
        </h2>
        <TransactionList transactions={spendingIncome.transactions} variant="spending" />
      </section>

      <Button
        variant="destructive"
        className="w-full"
        data-testid="end-period-button"
        onClick={() => setResetDialogOpen(true)}
        disabled={isSubmitting}
      >
        End period
      </Button>

      <BottomSheet
        open={sheetOpen}
        title="Income or spending"
        onClose={() => setSheetOpen(false)}
      >
        <SpendingTransactionForm
          key={sheetOpen ? "open" : "closed"}
          isSubmitting={isSubmitting}
          errorMessage={error}
          onSubmit={async (input) => {
            await applyTransaction(input);
            setSheetOpen(false);
          }}
        />
      </BottomSheet>

      <ConfirmResetDialog
        open={resetDialogOpen}
        isSubmitting={isSubmitting}
        onCancel={() => setResetDialogOpen(false)}
        onConfirm={() => {
          void resetPeriod()
            .then(() => setResetDialogOpen(false))
            .catch(() => {
              // Error state is handled in the hook.
            });
        }}
      />

      <Toast message={successMessage} onDismiss={clearSuccess} />
    </div>
  );
}

function PageLoading() {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center text-sm text-slate-400">
      Loading...
    </div>
  );
}
