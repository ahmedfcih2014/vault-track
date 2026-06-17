import { Pressable, StyleSheet } from 'react-native';

import { Card, CardTitle, CardValue } from '@/components/ui/card';
import { TouchTarget } from '@/constants/theme';
import {
  ACCOUNT_LABELS,
  formatCurrency,
  type AccountType,
} from '@vault-track/shared';

interface BalanceCardProps {
  accountType: AccountType;
  balance: string;
  onSelect?: (accountType: AccountType) => void;
  testID?: string;
}

export function BalanceCard({ accountType, balance, onSelect, testID }: BalanceCardProps) {
  const content = (
    <Card>
      <CardTitle>{ACCOUNT_LABELS[accountType]}</CardTitle>
      <CardValue>{formatCurrency(balance, accountType)}</CardValue>
    </Card>
  );

  if (!onSelect) {
    return content;
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      style={styles.pressable}
      onPress={() => onSelect(accountType)}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: TouchTarget,
  },
});
