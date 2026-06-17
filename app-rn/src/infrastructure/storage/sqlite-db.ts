import type { AppMeta, ArchiveRecord, Saving, SpendingIncome } from '@vault-track/shared';

export const SCHEMA_VERSION = 1;
export const DB_NAME = 'vault-track.db';

export interface SavingRecord extends Saving {
  key: 'active';
}

export interface SpendingIncomeRecord extends SpendingIncome {
  key: 'active';
}

export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY NOT NULL,
    payload TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS saving (
    key TEXT PRIMARY KEY NOT NULL,
    payload TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS spending_income (
    key TEXT PRIMARY KEY NOT NULL,
    payload TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS archives (
    id TEXT PRIMARY KEY NOT NULL,
    archived_at TEXT NOT NULL,
    payload TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_archives_archived_at ON archives (archived_at);
`;

export type MetaRow = { key: string; payload: string };
export type DocumentRow = { key: string; payload: string };
export type ArchiveRow = { id: string; archived_at: string; payload: string };

export function parseMeta(payload: string): AppMeta {
  return JSON.parse(payload) as AppMeta;
}

export function parseSaving(payload: string): SavingRecord {
  return JSON.parse(payload) as SavingRecord;
}

export function parseSpendingIncome(payload: string): SpendingIncomeRecord {
  return JSON.parse(payload) as SpendingIncomeRecord;
}

export function parseArchive(payload: string): ArchiveRecord {
  return JSON.parse(payload) as ArchiveRecord;
}
