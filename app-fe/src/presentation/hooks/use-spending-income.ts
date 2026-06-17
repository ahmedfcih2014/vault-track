import { useCallback, useState } from "react";
import type { SpendingIncomeTransactionInput } from "@/application/contracts/dtos";
import { appContainer } from "@/app/container";
import { SPENDING_OPERATION_LABELS } from "@/domain/spending-income";
import { DomainError } from "@/domain/errors";
import { useAppStore } from "@/presentation/hooks/use-app-store";

export function useSpendingIncome() {
  const spendingIncome = useAppStore((state) => state.spendingIncome);
  const setSpendingIncome = useAppStore((state) => state.setSpendingIncome);
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
              : "Failed to save transaction";
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
      setSuccessMessage("Period ended. Archive created.");
      return freshPeriod;
    } catch (err) {
      const message =
        err instanceof DomainError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to end period";
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [setSpendingIncome]);

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
