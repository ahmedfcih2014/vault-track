import type { SavingTransactionInput } from "@/application/contracts/dtos";
import { savingTransactionFormSchema } from "@/application/validators/schemas";
import { DOMAIN_ERROR_CODES, DomainError } from "@/domain/errors";
import { compareMoney, normalizeAmountForAccount } from "@/domain/money";
import type { Saving } from "@/domain/types";

export function validateSavingTransactionInput(
  input: SavingTransactionInput,
  saving: Saving,
): SavingTransactionInput {
  const parsed = savingTransactionFormSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid transaction input";
    throw new DomainError(DOMAIN_ERROR_CODES.VALIDATION_ERROR, firstIssue, {
      issues: parsed.error.issues,
    });
  }

  if (parsed.data.operationType === "withdraw") {
    const available = saving.balance[parsed.data.accountType];
    const requested = normalizeAmountForAccount(
      parsed.data.amount,
      parsed.data.accountType,
    );
    if (compareMoney(available, requested) < 0) {
      throw new DomainError(
        DOMAIN_ERROR_CODES.INSUFFICIENT_BALANCE,
        "Insufficient balance for this withdrawal",
        {
          accountType: parsed.data.accountType,
          available,
          requested,
        },
      );
    }
  }

  return parsed.data;
}
