import type {
  SavingTransactionPersistenceInput,
  SpendingIncomeTransactionPersistenceInput,
} from "../contracts/dtos";
import type { ArchiveRecord, Saving, SpendingIncome } from "../../domain/types";

export interface ISavingRepository {
  get(): Promise<Saving>;
  applyTransaction(input: SavingTransactionPersistenceInput): Promise<Saving>;
}

export interface ISpendingIncomeRepository {
  getCurrent(): Promise<SpendingIncome>;
  applyTransaction(input: SpendingIncomeTransactionPersistenceInput): Promise<SpendingIncome>;
  replaceWithFresh(period: SpendingIncome): Promise<SpendingIncome>;
  resetPeriodWithArchive(
    snapshot: SpendingIncome,
    fresh: SpendingIncome,
  ): Promise<ArchiveMeta>;
}

export interface ArchiveMeta {
  id: string;
  filename: string;
  archivedAt: string;
}

export interface IArchiveService {
  save(snapshot: SpendingIncome): Promise<ArchiveMeta>;
  list(): Promise<ArchiveMeta[]>;
  get(id: string): Promise<SpendingIncome>;
  exportToFile(id: string): Promise<void>;
}

export interface IAppBootstrap {
  ensureSeeded(): Promise<void>;
  getSnapshot(): Promise<{ saving: Saving; spendingIncome: SpendingIncome }>;
}

export type { ArchiveRecord };
