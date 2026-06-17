import type { SpendingIncomeTransactionInput } from "../contracts/dtos";
import { spendingIncomeTransactionFormSchema } from "./schemas";
import { DOMAIN_ERROR_CODES, DomainError } from "../../domain/errors";
import type { SpendingIncome } from "../../domain/types";

export function validateSpendingIncomeTransactionInput(
  input: SpendingIncomeTransactionInput,
): SpendingIncomeTransactionInput {
  const parsed = spendingIncomeTransactionFormSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid transaction input";
    throw new DomainError(DOMAIN_ERROR_CODES.VALIDATION_ERROR, firstIssue, {
      issues: parsed.error.issues,
    });
  }

  return parsed.data;
}

export function validateSpendingIncomePeriod(period: SpendingIncome) {
  if (period.resetedAt !== null) {
    throw new DomainError(
      DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      "Cannot add transactions to a closed period",
    );
  }
  return period;
}
