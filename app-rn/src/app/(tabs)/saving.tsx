import { useState } from 'react';
import { Plus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppBottomSheet } from '@/components/bottom-sheet';
import { BalanceCard } from '@/components/balance-card';
import { SavingTransactionForm } from '@/components/saving-transaction-form';
import { ScreenShell } from '@/components/screen-shell';
import { Toast } from '@/components/toast';
import { TransactionList } from '@/components/transaction-list';
import { Button } from '@/components/ui/button';
import { useSaving } from '@/hooks/use-saving';
import { useTheme } from '@/hooks/use-theme';
import type { AccountType } from '@vault-track/shared';

export default function SavingScreen() {
  const theme = useTheme();
  const {
    saving,
    applyTransaction,
    isSubmitting,
    error,
    successMessage,
    clearSuccess,
  } = useSaving();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountType>('usd');

  if (!saving) {
    return (
      <ScreenShell title="Saving">
        <Text style={{ color: theme.textSecondary }}>Loading...</Text>
      </ScreenShell>
    );
  }

  const openSheet = (accountType: AccountType) => {
    setSelectedAccount(accountType);
    setSheetOpen(true);
  };

  return (
    <>
      <ScreenShell
        title="Saving"
        subtitle="Track USD, SAR, and gold balances."
        action={
          <Button variant="default" size="icon" onPress={() => openSheet('usd')}>
            <Plus color="#fff" size={20} />
          </Button>
        }>
        <View style={styles.cards}>
          <BalanceCard accountType="usd" balance={saving.balance.usd} onSelect={openSheet} />
          <BalanceCard accountType="sar" balance={saving.balance.sar} onSelect={openSheet} />
          <BalanceCard accountType="gold_21" balance={saving.balance.gold_21} onSelect={openSheet} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>History</Text>
          <TransactionList transactions={saving.transactions} showAccountType />
        </View>
      </ScreenShell>

      <AppBottomSheet open={sheetOpen} title="Saving transaction" onClose={() => setSheetOpen(false)}>
        <SavingTransactionForm
          key={`${selectedAccount}-${sheetOpen ? 'open' : 'closed'}`}
          defaultAccountType={selectedAccount}
          isSubmitting={isSubmitting}
          errorMessage={error}
          onSubmit={async (input) => {
            await applyTransaction(input);
            setSheetOpen(false);
          }}
        />
      </AppBottomSheet>

      <Toast message={successMessage} onDismiss={clearSuccess} />
    </>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: 12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
