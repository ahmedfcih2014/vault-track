import type {
  ArchiveMeta,
  ISpendingIncomeRepository,
  SpendingIncomeTransactionPersistenceInput,
} from '@vault-track/shared';
import {
  ACTIVE_DOCUMENT_KEY,
  applySpendingIncomeTransaction,
  type SpendingIncome,
} from '@vault-track/shared';

import { toArchiveRecord } from '../archive/sqlite-archive-service';
import { touchLastModified } from '../seed/initial-data';
import { getDatabase } from '../storage/sqlite-client';
import { parseSpendingIncome } from '../storage/sqlite-db';

export class SqliteSpendingIncomeRepository implements ISpendingIncomeRepository {
  async getCurrent() {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ payload: string }>(
      'SELECT payload FROM spending_income WHERE key = ?',
      ACTIVE_DOCUMENT_KEY,
    );

    if (!row) {
      throw new Error('SpendingIncome document not found');
    }

    return toSpendingIncome(parseSpendingIncome(row.payload));
  }

  async applyTransaction(input: SpendingIncomeTransactionPersistenceInput) {
    const db = await getDatabase();
    let updated = await this.getCurrent();

    await db.withTransactionAsync(async () => {
      const row = await db.getFirstAsync<{ payload: string }>(
        'SELECT payload FROM spending_income WHERE key = ?',
        ACTIVE_DOCUMENT_KEY,
      );

      if (!row) {
        throw new Error('SpendingIncome document not found');
      }

      updated = applySpendingIncomeTransaction(toSpendingIncome(parseSpendingIncome(row.payload)), {
        id: input.clientTransactionId,
        amount: input.amount,
        note: input.note ?? '',
        operationType: input.operationType,
        createdAt: input.createdAt,
      });

      await db.runAsync(
        'UPDATE spending_income SET payload = ? WHERE key = ?',
        JSON.stringify({ key: ACTIVE_DOCUMENT_KEY, ...updated }),
        ACTIVE_DOCUMENT_KEY,
      );
      await touchLastModified();
    });

    return updated;
  }

  async replaceWithFresh(period: SpendingIncome) {
    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        'UPDATE spending_income SET payload = ? WHERE key = ?',
        JSON.stringify({ key: ACTIVE_DOCUMENT_KEY, ...period }),
        ACTIVE_DOCUMENT_KEY,
      );
      await touchLastModified();
    });

    return period;
  }

  async resetPeriodWithArchive(snapshot: SpendingIncome, fresh: SpendingIncome) {
    const archiveRecord = toArchiveRecord(snapshot);
    const db = await getDatabase();
    let archiveMeta!: ArchiveMeta;

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        'INSERT INTO archives (id, archived_at, payload) VALUES (?, ?, ?)',
        archiveRecord.id,
        archiveRecord.archivedAt,
        JSON.stringify(archiveRecord),
      );

      await db.runAsync(
        'UPDATE spending_income SET payload = ? WHERE key = ?',
        JSON.stringify({ key: ACTIVE_DOCUMENT_KEY, ...fresh }),
        ACTIVE_DOCUMENT_KEY,
      );
      await touchLastModified();

      archiveMeta = {
        id: archiveRecord.id,
        filename: archiveRecord.filename,
        archivedAt: archiveRecord.archivedAt,
      };
    });

    return archiveMeta;
  }
}

function toSpendingIncome(record: SpendingIncome): SpendingIncome {
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
