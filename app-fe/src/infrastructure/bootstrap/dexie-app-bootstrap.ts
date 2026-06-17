import type { IAppBootstrap, ArchiveRecord } from "@vault-track/shared";
import {
  ACTIVE_DOCUMENT_KEY,
  buildArchiveFilename,
  nowIso,
  validatePersistedSnapshot,
} from "@vault-track/shared";
import { downloadJsonFile } from "@/infrastructure/archive/browser-file-export";
import {
  isDatabaseSeeded,
  seedInitialData,
} from "@/infrastructure/seed/initial-data";
import {
  archivesTable,
  metaTable,
  savingTable,
  spendingIncomeTable,
} from "@/infrastructure/storage/dexie-db";

export class DexieAppBootstrap implements IAppBootstrap {
  async ensureSeeded(): Promise<void> {
    const seeded = await isDatabaseSeeded();
    if (!seeded) {
      await seedInitialData();
    }
  }

  async getSnapshot() {
    const [savingRecord, spendingIncomeRecord] = await Promise.all([
      savingTable.get(ACTIVE_DOCUMENT_KEY),
      spendingIncomeTable.get(ACTIVE_DOCUMENT_KEY),
    ]);

    if (!savingRecord || !spendingIncomeRecord) {
      throw new Error("Database is not seeded");
    }

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
  const [meta, savingRecord, spendingIncomeRecord, archives] = await Promise.all([
    metaTable.get("app"),
    savingTable.get(ACTIVE_DOCUMENT_KEY),
    spendingIncomeTable.get(ACTIVE_DOCUMENT_KEY),
    archivesTable.toArray(),
  ]);

  const exportedAt = nowIso();
  const filename = `vault-track-backup-${exportedAt.replace(/[:.]/g, "-")}.json`;

  await downloadJsonFile(filename, {
    exportedAt,
    schemaVersion: 1,
    meta,
    saving: savingRecord,
    spendingIncome: spendingIncomeRecord,
    archives,
  });
}

export async function exportCorruptDataRecovery(): Promise<void> {
  const exportedAt = nowIso();
  const filename = `vault-track-recovery-${exportedAt.replace(/[:.]/g, "-")}.json`;

  const [savingRecord, spendingIncomeRecord, archives] = await Promise.all([
    savingTable.get(ACTIVE_DOCUMENT_KEY),
    spendingIncomeTable.get(ACTIVE_DOCUMENT_KEY),
    archivesTable.toArray(),
  ]);

  await downloadJsonFile(filename, {
    exportedAt,
    note: "Raw export from corrupted or invalid state",
    saving: savingRecord ?? null,
    spendingIncome: spendingIncomeRecord ?? null,
    archives: archives.map((archive: ArchiveRecord) => ({
      ...archive,
      filename: archive.filename ?? buildArchiveFilename(archive.snapshot),
    })),
  });
}
