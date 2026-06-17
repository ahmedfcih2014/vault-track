import type { IArchiveService, ISpendingIncomeRepository, ArchiveMeta } from "@/application/ports/repositories";
import { closePeriodSnapshot } from "@/domain/archive";
import { nowIso } from "@/domain/date";
import { createFreshSpendingIncome } from "@/domain/spending-income";
import type { SpendingIncome } from "@/domain/types";

export class ResetSpendingIncomePeriodUseCase {
  private readonly spendingIncomeRepository: ISpendingIncomeRepository;
  private readonly archiveService: IArchiveService;

  constructor(
    spendingIncomeRepository: ISpendingIncomeRepository,
    archiveService: IArchiveService,
  ) {
    this.spendingIncomeRepository = spendingIncomeRepository;
    this.archiveService = archiveService;
  }

  async execute(): Promise<{
    freshPeriod: SpendingIncome;
    archive: ArchiveMeta;
  }> {
    const current = await this.spendingIncomeRepository.getCurrent();

    if (current.resetedAt !== null) {
      throw new Error("Cannot reset a period that is already closed");
    }

    const resetedAt = nowIso();
    const snapshot = closePeriodSnapshot(current, resetedAt);
    const freshPeriod = createFreshSpendingIncome(crypto.randomUUID());

    const archive = await this.spendingIncomeRepository.resetPeriodWithArchive(
      snapshot,
      freshPeriod,
    );

    void this.archiveService.exportToFile(archive.id).catch(() => {
      // Export is best-effort and must not roll back the reset.
    });

    return { freshPeriod, archive };
  }
}
