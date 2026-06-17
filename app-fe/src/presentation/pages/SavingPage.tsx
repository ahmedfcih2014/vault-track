import { useState } from "react";
import { Plus } from "lucide-react";
import type { AccountType } from "@vault-track/shared";
import { BottomSheet } from "@/presentation/components/BottomSheet";
import { BalanceCard } from "@/presentation/components/BalanceCard";
import { SavingTransactionForm } from "@/presentation/components/SavingTransactionForm";
import { Toast } from "@/presentation/components/Toast";
import { TransactionList } from "@/presentation/components/TransactionList";
import { Button } from "@/presentation/components/ui/button";
import { useSaving } from "@/presentation/hooks/use-saving";

export function SavingPage() {
  const {
    saving,
    applyTransaction,
    isSubmitting,
    error,
    successMessage,
    clearSuccess,
  } = useSaving();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountType>("usd");

  if (!saving) {
    return <PageLoading />;
  }

  const openSheet = (accountType: AccountType) => {
    setSelectedAccount(accountType);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Saving</h1>
          <p className="mt-1 text-sm text-slate-400">
            Track USD, SAR, and gold balances.
          </p>
        </div>
        <Button
          size="icon"
          aria-label="Add saving transaction"
          data-testid="saving-add-button"
          onClick={() => openSheet("usd")}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <section className="grid gap-3">
        <BalanceCard
          accountType="usd"
          balance={saving.balance.usd}
          onSelect={openSheet}
          testId="balance-usd"
        />
        <BalanceCard
          accountType="sar"
          balance={saving.balance.sar}
          onSelect={openSheet}
        />
        <BalanceCard
          accountType="gold_21"
          balance={saving.balance.gold_21}
          onSelect={openSheet}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
          History
        </h2>
        <TransactionList transactions={saving.transactions} showAccountType />
      </section>

      <BottomSheet
        open={sheetOpen}
        title="Saving transaction"
        onClose={() => setSheetOpen(false)}
      >
        <SavingTransactionForm
          key={`${selectedAccount}-${sheetOpen ? "open" : "closed"}`}
          defaultAccountType={selectedAccount}
          isSubmitting={isSubmitting}
          errorMessage={error}
          onSubmit={async (input) => {
            await applyTransaction(input);
            setSheetOpen(false);
          }}
        />
      </BottomSheet>

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
