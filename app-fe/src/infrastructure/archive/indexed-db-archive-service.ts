import type { IArchiveService, ArchiveMeta, ArchiveRecord, SpendingIncome } from "@vault-track/shared";
import { buildArchiveFilename } from "@vault-track/shared";
import { downloadJsonFile } from "@/infrastructure/archive/browser-file-export";
import { archivesTable } from "@/infrastructure/storage/dexie-db";

export class IndexedDbArchiveService implements IArchiveService {
  async save(snapshot: SpendingIncome): Promise<ArchiveMeta> {
    const record = toArchiveRecord(snapshot);
    await archivesTable.add(record);
    return toArchiveMeta(record);
  }

  async list(): Promise<ArchiveMeta[]> {
    const records = await archivesTable.orderBy("archivedAt").reverse().toArray();
    return records.map(toArchiveMeta);
  }

  async get(id: string): Promise<SpendingIncome> {
    const record = await archivesTable.get(id);
    if (!record) {
      throw new Error("Archive not found");
    }
    return record.snapshot;
  }

  async exportToFile(id: string): Promise<void> {
    const record = await archivesTable.get(id);
    if (!record) {
      throw new Error("Archive not found");
    }

    await downloadJsonFile(record.filename, record.snapshot);
  }
}

export function toArchiveRecord(snapshot: SpendingIncome): ArchiveRecord {
  const archivedAt = snapshot.resetedAt;
  if (!archivedAt) {
    throw new Error("Archive snapshot must include resetedAt");
  }

  return {
    id: crypto.randomUUID(),
    filename: buildArchiveFilename(snapshot),
    archivedAt,
    snapshot,
  };
}

function toArchiveMeta(record: ArchiveRecord): ArchiveMeta {
  return {
    id: record.id,
    filename: record.filename,
    archivedAt: record.archivedAt,
  };
}
