import type { SpendingIncomeTransactionInput } from "../contracts/dtos";
import type { ISpendingIncomeRepository } from "../ports/repositories";
import {
  validateSpendingIncomePeriod,
  validateSpendingIncomeTransactionInput,
} from "../validators/validate-spending-income-transaction";
import { nowIso } from "../../domain/date";
import type { SpendingIncome } from "../../domain/types";

export class ApplySpendingIncomeTransactionUseCase {
  private readonly spendingIncomeRepository: ISpendingIncomeRepository;

  constructor(spendingIncomeRepository: ISpendingIncomeRepository) {
    this.spendingIncomeRepository = spendingIncomeRepository;
  }

  async execute(input: SpendingIncomeTransactionInput): Promise<SpendingIncome> {
    const current = await this.spendingIncomeRepository.getCurrent();
    validateSpendingIncomePeriod(current);
    const validated = validateSpendingIncomeTransactionInput(input);

    const clientTransactionId = validated.clientTransactionId ?? crypto.randomUUID();
    const existing = current.transactions.find((tx) => tx.id === clientTransactionId);
    if (existing) {
      return current;
    }

    return this.spendingIncomeRepository.applyTransaction({
      ...validated,
      clientTransactionId,
      createdAt: nowIso(),
    });
  }
}
