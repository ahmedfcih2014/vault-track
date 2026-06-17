import {
  ApplySavingTransactionUseCase,
  ApplySpendingIncomeTransactionUseCase,
  ResetSpendingIncomePeriodUseCase,
} from '@vault-track/shared';

import { SqliteArchiveService } from '@/infrastructure/archive/sqlite-archive-service';
import { SqliteSavingRepository } from '@/infrastructure/repositories/sqlite-saving-repository';
import { SqliteSpendingIncomeRepository } from '@/infrastructure/repositories/sqlite-spending-income-repository';

const savingRepository = new SqliteSavingRepository();
const spendingIncomeRepository = new SqliteSpendingIncomeRepository();
const archiveService = new SqliteArchiveService();

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
