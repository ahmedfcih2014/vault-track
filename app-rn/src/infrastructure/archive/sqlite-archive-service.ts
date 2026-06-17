import type { ArchiveMeta, IArchiveService } from '@vault-track/shared';
import { buildArchiveFilename, type ArchiveRecord, type SpendingIncome } from '@vault-track/shared';

import { shareJsonFile } from './file-export';
import { getDatabase } from '../storage/sqlite-client';
import { parseArchive } from '../storage/sqlite-db';

export class SqliteArchiveService implements IArchiveService {
  async save(snapshot: SpendingIncome): Promise<ArchiveMeta> {
    const record = toArchiveRecord(snapshot);
    const db = await getDatabase();

    await db.runAsync(
      'INSERT INTO archives (id, archived_at, payload) VALUES (?, ?, ?)',
      record.id,
      record.archivedAt,
      JSON.stringify(record),
    );

    return toArchiveMeta(record);
  }

  async list(): Promise<ArchiveMeta[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ payload: string }>(
      'SELECT payload FROM archives ORDER BY archived_at DESC',
    );

    return rows.map((row) => toArchiveMeta(parseArchive(row.payload)));
  }

  async get(id: string): Promise<SpendingIncome> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ payload: string }>(
      'SELECT payload FROM archives WHERE id = ?',
      id,
    );

    if (!row) {
      throw new Error('Archive not found');
    }

    return parseArchive(row.payload).snapshot;
  }

  async exportToFile(id: string): Promise<void> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ payload: string }>(
      'SELECT payload FROM archives WHERE id = ?',
      id,
    );

    if (!row) {
      throw new Error('Archive not found');
    }

    const record = parseArchive(row.payload);
    await shareJsonFile(record.filename, record.snapshot);
  }
}

export function toArchiveRecord(snapshot: SpendingIncome): ArchiveRecord {
  const archivedAt = snapshot.resetedAt;
  if (!archivedAt) {
    throw new Error('Archive snapshot must include resetedAt');
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
