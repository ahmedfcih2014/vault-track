import Dexie from "dexie";
import type {
  ACTIVE_DOCUMENT_KEY,
  AppMeta,
  ArchiveRecord,
  Saving,
  SpendingIncome,
} from "@/domain/types";

export const SCHEMA_VERSION = 1;

export interface SavingRecord extends Saving {
  key: typeof ACTIVE_DOCUMENT_KEY;
}

export interface SpendingIncomeRecord extends SpendingIncome {
  key: typeof ACTIVE_DOCUMENT_KEY;
}

const dexie = new Dexie("vault-track");

dexie.version(SCHEMA_VERSION).stores({
  meta: "key",
  saving: "key",
  spendingIncome: "key",
  archives: "id, archivedAt",
});

export const db = dexie;

export const metaTable = dexie.table<AppMeta, "app">("meta");
export const savingTable = dexie.table<SavingRecord, typeof ACTIVE_DOCUMENT_KEY>("saving");
export const spendingIncomeTable = dexie.table<
  SpendingIncomeRecord,
  typeof ACTIVE_DOCUMENT_KEY
>("spendingIncome");
export const archivesTable = dexie.table<ArchiveRecord, string>("archives");
