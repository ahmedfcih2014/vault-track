import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { useTheme } from '@/hooks/use-theme';
import {
  ACCOUNT_LABELS,
  savingTransactionFormSchema,
  type AccountType,
  type OperationType,
  type SavingTransactionFormValues,
  type SavingTransactionInput,
} from '@vault-track/shared';

interface SavingTransactionFormProps {
  defaultAccountType: AccountType;
  defaultOperationType?: OperationType;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (input: SavingTransactionInput) => Promise<void>;
}

const accountTypes: AccountType[] = ['usd', 'sar', 'gold_21'];

export function SavingTransactionForm({
  defaultAccountType,
  defaultOperationType = 'deposit',
  isSubmitting,
  errorMessage,
  onSubmit,
}: SavingTransactionFormProps) {
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SavingTransactionFormValues>({
    resolver: zodResolver(savingTransactionFormSchema),
    defaultValues: {
      accountType: defaultAccountType,
      operationType: defaultOperationType,
      amount: '',
      note: '',
    },
  });

  const operationType = watch('operationType');
  const accountType = watch('accountType');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clientTransactionIdRef = useRef(crypto.randomUUID());
  const submitLockRef = useRef(false);

  return (
    <View style={styles.form}>
      <View style={styles.row}>
        {(['deposit', 'withdraw'] as const).map((type) => (
          <Button
            key={type}
            variant={operationType === type ? 'default' : 'secondary'}
            label={type}
            onPress={() => setValue('operationType', type)}
            style={styles.half}
          />
        ))}
      </View>

      <View style={styles.field}>
        <Label>Account</Label>
        <View style={styles.row}>
          {accountTypes.map((type) => (
            <Pressable
              key={type}
              onPress={() => setValue('accountType', type)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    accountType === type ? theme.primary : theme.backgroundSelected,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={{ color: accountType === type ? '#fff' : theme.text, fontSize: 12 }}>
                {ACCOUNT_LABELS[type]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Label nativeID="amount">Amount ({ACCOUNT_LABELS[accountType]})</Label>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              accessibilityLabel="Amount"
              keyboardType="decimal-pad"
              placeholder="0.00"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.amount ? (
          <Text style={[styles.error, { color: theme.negative }]}>{errors.amount.message}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Label nativeID="note">Note (optional)</Label>
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input placeholder="Add a note" onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />
      </View>

      {submitError || errorMessage ? (
        <Text style={[styles.error, { color: theme.negative }]}>{submitError ?? errorMessage}</Text>
      ) : null}

      <Button
        label={isSubmitting ? 'Saving...' : 'Submit transaction'}
        disabled={isSubmitting}
        onPress={handleSubmit(async (values) => {
          if (submitLockRef.current || isSubmitting) {
            return;
          }

          submitLockRef.current = true;
          setSubmitError(null);
          try {
            await onSubmit({
              accountType: values.accountType,
              amount: values.amount,
              note: values.note ?? '',
              operationType: values.operationType,
              clientTransactionId: clientTransactionIdRef.current,
            });
          } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Transaction failed');
          } finally {
            submitLockRef.current = false;
          }
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  half: {
    flex: 1,
    width: undefined,
  },
  field: {
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  error: {
    fontSize: 14,
  },
});
