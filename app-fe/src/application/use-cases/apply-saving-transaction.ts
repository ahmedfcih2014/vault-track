import type { SavingTransactionInput } from "@/application/contracts/dtos";
import type { ISavingRepository } from "@/application/ports/repositories";
import { validateSavingTransactionInput } from "@/application/validators/validate-saving-transaction";
import { nowIso } from "@/domain/date";
import type { Saving } from "@/domain/types";

export class ApplySavingTransactionUseCase {
  private readonly savingRepository: ISavingRepository;

  constructor(savingRepository: ISavingRepository) {
    this.savingRepository = savingRepository;
  }

  async execute(input: SavingTransactionInput): Promise<Saving> {
    const current = await this.savingRepository.get();
    const validated = validateSavingTransactionInput(input, current);

    const clientTransactionId = validated.clientTransactionId ?? crypto.randomUUID();
    const existing = current.transactions.find((tx) => tx.id === clientTransactionId);
    if (existing) {
      return current;
    }

    return this.savingRepository.applyTransaction({
      ...validated,
      clientTransactionId,
      createdAt: nowIso(),
    });
  }
}
