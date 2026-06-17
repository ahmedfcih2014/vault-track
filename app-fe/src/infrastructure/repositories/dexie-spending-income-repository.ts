import type { SpendingIncomeTransactionPersistenceInput } from "@/application/contracts/dtos";
import type { ArchiveMeta, ISpendingIncomeRepository } from "@/application/ports/repositories";
import { toArchiveRecord } from "@/infrastructure/archive/indexed-db-archive-service";
import { applySpendingIncomeTransaction } from "@/domain/spending-income";
import { ACTIVE_DOCUMENT_KEY, type SpendingIncome } from "@/domain/types";
import { touchLastModified } from "@/infrastructure/seed/initial-data";
import { notifyDataChanged } from "@/infrastructure/sync/broadcast-sync";
import {
  archivesTable,
  db,
  metaTable,
  spendingIncomeTable,
} from "@/infrastructure/storage/dexie-db";

export class DexieSpendingIncomeRepository implements ISpendingIncomeRepository {
  async getCurrent() {
    const record = await spendingIncomeTable.get(ACTIVE_DOCUMENT_KEY);
    if (!record) {
      throw new Error("SpendingIncome document not found");
    }

    return toSpendingIncome(record);
  }

  async applyTransaction(input: SpendingIncomeTransactionPersistenceInput) {
    return db.transaction("rw", spendingIncomeTable, metaTable, async () => {
      const record = await spendingIncomeTable.get(ACTIVE_DOCUMENT_KEY);
      if (!record) {
        throw new Error("SpendingIncome document not found");
      }

      const updated = applySpendingIncomeTransaction(toSpendingIncome(record), {
        id: input.clientTransactionId,
        amount: input.amount,
        note: input.note ?? "",
        operationType: input.operationType,
        createdAt: input.createdAt,
      });

      await spendingIncomeTable.put({
        key: ACTIVE_DOCUMENT_KEY,
        ...updated,
      });
      await touchLastModified();

      notifyDataChanged();
      return updated;
    });
  }

  async replaceWithFresh(period: SpendingIncome) {
    return db.transaction("rw", spendingIncomeTable, metaTable, async () => {
      await spendingIncomeTable.put({
        key: ACTIVE_DOCUMENT_KEY,
        ...period,
      });
      await touchLastModified();
      notifyDataChanged();
      return period;
    });
  }

  async resetPeriodWithArchive(snapshot: SpendingIncome, fresh: SpendingIncome) {
    const archiveRecord = toArchiveRecord(snapshot);

    return db.transaction("rw", archivesTable, spendingIncomeTable, metaTable, async () => {
      await archivesTable.add(archiveRecord);
      await spendingIncomeTable.put({
        key: ACTIVE_DOCUMENT_KEY,
        ...fresh,
      });
      await touchLastModified();

      notifyDataChanged();
      return {
        id: archiveRecord.id,
        filename: archiveRecord.filename,
        archivedAt: archiveRecord.archivedAt,
      } satisfies ArchiveMeta;
    });
  }
}

function toSpendingIncome(
  record: SpendingIncome & { key?: typeof ACTIVE_DOCUMENT_KEY },
): SpendingIncome {
  return {
    id: record.id,
    startedAt: record.startedAt,
    resetedAt: record.resetedAt,
    balance: record.balance,
    transactions: record.transactions,
    updatedAt: record.updatedAt,
    version: record.version,
  };
}
