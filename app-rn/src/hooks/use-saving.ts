import { useCallback, useState } from 'react';
import type { SavingTransactionInput } from '@vault-track/shared';
import { DomainError } from '@vault-track/shared';

import { appContainer } from '@/app/container';
import { useAppStore } from '@/hooks/use-app-store';

export function useSaving() {
  const saving = useAppStore((state) => state.saving);
  const setSaving = useAppStore((state) => state.setSaving);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const applyTransaction = useCallback(
    async (input: SavingTransactionInput) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const updated = await appContainer.applySavingTransaction.execute(input);
        setSaving(updated);
        setSuccessMessage(
          `${input.operationType === 'deposit' ? 'Deposit' : 'Withdrawal'} recorded`,
        );
      } catch (err) {
        const message =
          err instanceof DomainError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to save transaction';
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [setSaving],
  );

  const clearFeedback = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    saving,
    applyTransaction,
    isSubmitting,
    error,
    successMessage,
    clearFeedback,
    clearSuccess: () => setSuccessMessage(null),
  };
}
