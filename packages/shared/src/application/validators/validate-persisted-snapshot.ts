import {
  savingSchema,
  spendingIncomeSchema,
} from "./schemas";
import { DOMAIN_ERROR_CODES, DomainError } from "../../domain/errors";
import type { Saving, SpendingIncome } from "../../domain/types";

export function validatePersistedSnapshot(snapshot: {
  saving: Saving;
  spendingIncome: SpendingIncome;
}): { saving: Saving; spendingIncome: SpendingIncome } {
  const savingResult = savingSchema.safeParse(snapshot.saving);
  if (!savingResult.success) {
    throw new DomainError(
      DOMAIN_ERROR_CODES.CORRUPT_DATA,
      "Saving data is corrupted and could not be loaded",
      { issues: savingResult.error.issues },
    );
  }

  const spendingResult = spendingIncomeSchema.safeParse(snapshot.spendingIncome);
  if (!spendingResult.success) {
    throw new DomainError(
      DOMAIN_ERROR_CODES.CORRUPT_DATA,
      "Spending data is corrupted and could not be loaded",
      { issues: spendingResult.error.issues },
    );
  }

  return {
    saving: savingResult.data,
    spendingIncome: spendingResult.data,
  };
}
