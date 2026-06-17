import { useCallback, useState } from 'react';
import type { SpendingIncomeTransactionInput } from '@vault-track/shared';
import { DomainError, SPENDING_OPERATION_LABELS } from '@vault-track/shared';

import { appContainer } from '@/app/container';
import { useAppStore } from '@/hooks/use-app-store';

export function useSpendingIncome() {
  const spendingIncome = useAppStore((state) => state.spendingIncome);
  const setSpendingIncome = useAppStore((state) => state.setSpendingIncome);
  const bumpArchivesRevision = useAppStore((state) => state.bumpArchivesRevision);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const applyTransaction = useCallback(
    async (input: SpendingIncomeTransactionInput) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const updated = await appContainer.applySpendingIncomeTransaction.execute(input);
        setSpendingIncome(updated);
        setSuccessMessage(`${SPENDING_OPERATION_LABELS[input.operationType]} recorded`);
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
    [setSpendingIncome],
  );

  const clearFeedback = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const resetPeriod = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { freshPeriod } = await appContainer.resetSpendingIncomePeriod.execute();
      setSpendingIncome(freshPeriod);
      bumpArchivesRevision();
      setSuccessMessage('Period ended. Archive created.');
      return freshPeriod;
    } catch (err) {
      const message =
        err instanceof DomainError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to end period';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [setSpendingIncome, bumpArchivesRevision]);

  return {
    spendingIncome,
    applyTransaction,
    resetPeriod,
    isSubmitting,
    error,
    successMessage,
    clearFeedback,
    clearSuccess: () => setSuccessMessage(null),
  };
}
