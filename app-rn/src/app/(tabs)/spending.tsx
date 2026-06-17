import { useState } from 'react';
import { Plus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppBottomSheet } from '@/components/bottom-sheet';
import { ConfirmResetDialog } from '@/components/confirm-reset-dialog';
import { ScreenShell } from '@/components/screen-shell';
import { SpendingTransactionForm } from '@/components/spending-transaction-form';
import { Toast } from '@/components/toast';
import { TransactionList } from '@/components/transaction-list';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardValue } from '@/components/ui/card';
import { useSpendingIncome } from '@/hooks/use-spending-income';
import { useTheme } from '@/hooks/use-theme';
import { formatDisplayDate, formatSignedEgp } from '@vault-track/shared';

export default function SpendingScreen() {
  const theme = useTheme();
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
    return (
      <ScreenShell title="Spending">
        <Text style={{ color: theme.textSecondary }}>Loading...</Text>
      </ScreenShell>
    );
  }

  const balanceValue = Number(spendingIncome.balance);
  const isPositive = balanceValue >= 0;

  return (
    <>
      <ScreenShell
        title="Spending"
        subtitle={`Period started ${formatDisplayDate(spendingIncome.startedAt)}`}
        action={
          <Button variant="default" size="icon" onPress={() => setSheetOpen(true)}>
            <Plus color="#fff" size={20} />
          </Button>
        }>
        <Card>
          <CardTitle>Current balance</CardTitle>
          <CardValue color={isPositive ? theme.positive : theme.negative}>
            {formatSignedEgp(spendingIncome.balance)}
          </CardValue>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>History</Text>
          <TransactionList transactions={spendingIncome.transactions} variant="spending" />
        </View>

        <Button
          variant="destructive"
          label="End period"
          disabled={isSubmitting}
          onPress={() => setResetDialogOpen(true)}
        />
      </ScreenShell>

      <AppBottomSheet
        open={sheetOpen}
        title="Income or spending"
        onClose={() => setSheetOpen(false)}>
        <SpendingTransactionForm
          key={sheetOpen ? 'open' : 'closed'}
          isSubmitting={isSubmitting}
          errorMessage={error}
          onSubmit={async (input) => {
            await applyTransaction(input);
            setSheetOpen(false);
          }}
        />
      </AppBottomSheet>

      <ConfirmResetDialog
        open={resetDialogOpen}
        isSubmitting={isSubmitting}
        onCancel={() => setResetDialogOpen(false)}
        onConfirm={() => {
          void resetPeriod()
            .then(() => setResetDialogOpen(false))
            .catch(() => undefined);
        }}
      />

      <Toast message={successMessage} onDismiss={clearSuccess} />
    </>
  );
}

const styles = StyleSheet.create({
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
