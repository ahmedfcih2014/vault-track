import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';
import {
  ACCOUNT_LABELS,
  formatCurrency,
  formatDisplayDate,
  formatSignedEgp,
  SPENDING_OPERATION_LABELS,
  type SavingTransaction,
  type SpendingIncomeTransaction,
} from '@vault-track/shared';

type TransactionItem = SavingTransaction | SpendingIncomeTransaction;

function isSavingTransaction(
  transaction: TransactionItem,
): transaction is SavingTransaction {
  return 'accountType' in transaction;
}

interface TransactionListProps {
  transactions: TransactionItem[];
  emptyMessage?: string;
  showAccountType?: boolean;
  variant?: 'saving' | 'spending';
}

export function TransactionList({
  transactions,
  emptyMessage = 'No transactions yet.',
  showAccountType = false,
  variant = 'saving',
}: TransactionListProps) {
  const theme = useTheme();

  if (transactions.length === 0) {
    return (
      <Card>
        <Text style={[styles.empty, { color: theme.textSecondary }]}>{emptyMessage}</Text>
      </Card>
    );
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const labelFor = (transaction: TransactionItem) => {
    if (variant === 'spending') {
      return SPENDING_OPERATION_LABELS[transaction.operationType];
    }
    return transaction.operationType;
  };

  return (
    <View style={styles.list}>
      {sorted.map((transaction) => {
        const isDeposit = transaction.operationType === 'deposit';
        const amountColor = isDeposit ? theme.positive : theme.negative;
        const amountPrefix = isDeposit ? '+' : '-';
        const amountText =
          showAccountType && isSavingTransaction(transaction)
            ? formatCurrency(transaction.amount, transaction.accountType)
            : formatSignedEgp(transaction.amount).replace(/^-/, '');

        return (
          <Card key={transaction.id} style={styles.row}>
            <View style={styles.details}>
              <Text style={[styles.label, { color: theme.text }]}>
                {labelFor(transaction)}
                {showAccountType && isSavingTransaction(transaction)
                  ? ` · ${ACCOUNT_LABELS[transaction.accountType]}`
                  : ''}
              </Text>
              {transaction.note ? (
                <Text style={[styles.note, { color: theme.textSecondary }]}>{transaction.note}</Text>
              ) : null}
              <Text style={[styles.date, { color: theme.textSecondary }]}>
                {formatDisplayDate(transaction.createdAt)}
              </Text>
            </View>
            <Text style={[styles.amount, { color: amountColor }]}>
              {amountPrefix}
              {amountText}
            </Text>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  note: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    fontSize: 14,
  },
});
