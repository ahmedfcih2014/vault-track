import type { IAppBootstrap } from '@vault-track/shared';
import {
  ACTIVE_DOCUMENT_KEY,
  buildArchiveFilename,
  nowIso,
  validatePersistedSnapshot,
  type ArchiveRecord,
} from '@vault-track/shared';

import { shareJsonFile } from '../archive/file-export';
import { isDatabaseSeeded, seedInitialData } from '../seed/initial-data';
import { getDatabase } from '../storage/sqlite-client';
import { parseSaving, parseSpendingIncome, SCHEMA_VERSION, parseArchive } from '../storage/sqlite-db';

export class SqliteAppBootstrap implements IAppBootstrap {
  async ensureSeeded(): Promise<void> {
    const seeded = await isDatabaseSeeded();
    if (!seeded) {
      await seedInitialData();
    }
  }

  async getSnapshot() {
    const db = await getDatabase();
    const [savingRow, spendingRow] = await Promise.all([
      db.getFirstAsync<{ payload: string }>(
        'SELECT payload FROM saving WHERE key = ?',
        ACTIVE_DOCUMENT_KEY,
      ),
      db.getFirstAsync<{ payload: string }>(
        'SELECT payload FROM spending_income WHERE key = ?',
        ACTIVE_DOCUMENT_KEY,
      ),
    ]);

    if (!savingRow || !spendingRow) {
      throw new Error('Database is not seeded');
    }

    const savingRecord = parseSaving(savingRow.payload);
    const spendingIncomeRecord = parseSpendingIncome(spendingRow.payload);

    const snapshot = {
      saving: {
        id: savingRecord.id,
        balance: savingRecord.balance,
        transactions: savingRecord.transactions,
        updatedAt: savingRecord.updatedAt,
        version: savingRecord.version,
      },
      spendingIncome: {
        id: spendingIncomeRecord.id,
        startedAt: spendingIncomeRecord.startedAt,
        resetedAt: spendingIncomeRecord.resetedAt,
        balance: spendingIncomeRecord.balance,
        transactions: spendingIncomeRecord.transactions,
        updatedAt: spendingIncomeRecord.updatedAt,
        version: spendingIncomeRecord.version,
      },
    };

    return validatePersistedSnapshot(snapshot);
  }
}

export async function exportFullBackup(): Promise<void> {
  const db = await getDatabase();
  const [metaRow, savingRow, spendingRow, archiveRows] = await Promise.all([
    db.getFirstAsync<{ payload: string }>('SELECT payload FROM meta WHERE key = ?', 'app'),
    db.getFirstAsync<{ payload: string }>(
      'SELECT payload FROM saving WHERE key = ?',
      ACTIVE_DOCUMENT_KEY,
    ),
    db.getFirstAsync<{ payload: string }>(
      'SELECT payload FROM spending_income WHERE key = ?',
      ACTIVE_DOCUMENT_KEY,
    ),
    db.getAllAsync<{ payload: string }>('SELECT payload FROM archives ORDER BY archived_at DESC'),
  ]);

  const exportedAt = nowIso();
  const filename = `vault-track-backup-${exportedAt.replace(/[:.]/g, '-')}.json`;

  await shareJsonFile(filename, {
    exportedAt,
    schemaVersion: SCHEMA_VERSION,
    meta: metaRow ? JSON.parse(metaRow.payload) : null,
    saving: savingRow ? JSON.parse(savingRow.payload) : null,
    spendingIncome: spendingRow ? JSON.parse(spendingRow.payload) : null,
    archives: archiveRows.map((row) => JSON.parse(row.payload)),
  });
}

export async function exportCorruptDataRecovery(): Promise<void> {
  const db = await getDatabase();
  const exportedAt = nowIso();
  const filename = `vault-track-recovery-${exportedAt.replace(/[:.]/g, '-')}.json`;

  const [savingRow, spendingRow, archiveRows] = await Promise.all([
    db.getFirstAsync<{ payload: string }>(
      'SELECT payload FROM saving WHERE key = ?',
      ACTIVE_DOCUMENT_KEY,
    ),
    db.getFirstAsync<{ payload: string }>(
      'SELECT payload FROM spending_income WHERE key = ?',
      ACTIVE_DOCUMENT_KEY,
    ),
    db.getAllAsync<{ payload: string }>('SELECT payload FROM archives ORDER BY archived_at DESC'),
  ]);

  const archives = archiveRows.map((row) => {
    const archive = parseArchive(row.payload);
    return {
      ...archive,
      filename: archive.filename ?? buildArchiveFilename(archive.snapshot),
    } satisfies ArchiveRecord;
  });

  await shareJsonFile(filename, {
    exportedAt,
    note: 'Raw export from corrupted or invalid state',
    saving: savingRow ? JSON.parse(savingRow.payload) : null,
    spendingIncome: spendingRow ? JSON.parse(spendingRow.payload) : null,
    archives,
  });
}
