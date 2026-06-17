import {
  ApplySavingTransactionUseCase,
  ApplySpendingIncomeTransactionUseCase,
  ResetSpendingIncomePeriodUseCase,
} from "@vault-track/shared";
import { IndexedDbArchiveService } from "@/infrastructure/archive/indexed-db-archive-service";
import { DexieSavingRepository } from "@/infrastructure/repositories/dexie-saving-repository";
import { DexieSpendingIncomeRepository } from "@/infrastructure/repositories/dexie-spending-income-repository";

const savingRepository = new DexieSavingRepository();
const spendingIncomeRepository = new DexieSpendingIncomeRepository();
const archiveService = new IndexedDbArchiveService();

export const appContainer = {
  savingRepository,
  spendingIncomeRepository,
  archiveService,
  applySavingTransaction: new ApplySavingTransactionUseCase(savingRepository),
  applySpendingIncomeTransaction: new ApplySpendingIncomeTransactionUseCase(
    spendingIncomeRepository,
  ),
  resetSpendingIncomePeriod: new ResetSpendingIncomePeriodUseCase(
    spendingIncomeRepository,
    archiveService,
  ),
};
