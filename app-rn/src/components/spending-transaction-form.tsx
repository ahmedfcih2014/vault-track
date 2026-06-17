import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { useTheme } from '@/hooks/use-theme';
import {
  SPENDING_OPERATION_LABELS,
  spendingIncomeTransactionFormSchema,
  type OperationType,
  type SpendingIncomeTransactionFormValues,
  type SpendingIncomeTransactionInput,
} from '@vault-track/shared';

interface SpendingTransactionFormProps {
  defaultOperationType?: OperationType;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (input: SpendingIncomeTransactionInput) => Promise<void>;
}

export function SpendingTransactionForm({
  defaultOperationType = 'withdraw',
  isSubmitting,
  errorMessage,
  onSubmit,
}: SpendingTransactionFormProps) {
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SpendingIncomeTransactionFormValues>({
    resolver: zodResolver(spendingIncomeTransactionFormSchema),
    defaultValues: {
      operationType: defaultOperationType,
      amount: '',
      note: '',
    },
  });

  const operationType = watch('operationType');
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
            label={SPENDING_OPERATION_LABELS[type]}
            onPress={() => setValue('operationType', type)}
            style={styles.half}
          />
        ))}
      </View>

      <View style={styles.field}>
        <Label nativeID="spending-amount">Amount (EGP)</Label>
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
        <Label nativeID="spending-note">Note (optional)</Label>
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
        label={isSubmitting ? 'Saving...' : `Record ${SPENDING_OPERATION_LABELS[operationType]}`}
        disabled={isSubmitting}
        onPress={handleSubmit(async (values) => {
          if (submitLockRef.current || isSubmitting) {
            return;
          }

          submitLockRef.current = true;
          setSubmitError(null);
          try {
            await onSubmit({
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
  },
  half: {
    flex: 1,
    width: undefined,
  },
  field: {
    gap: 8,
  },
  error: {
    fontSize: 14,
  },
});
