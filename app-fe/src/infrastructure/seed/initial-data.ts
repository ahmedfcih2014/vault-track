import { nowIso } from "@/domain/date";
import { createEmptySaving } from "@/domain/saving";
import { createFreshSpendingIncome } from "@/domain/spending-income";
import { ACTIVE_DOCUMENT_KEY } from "@/domain/types";
import {
  db,
  metaTable,
  savingTable,
  spendingIncomeTable,
  SCHEMA_VERSION,
} from "@/infrastructure/storage/dexie-db";

function createDeviceId(): string {
  return crypto.randomUUID();
}

export async function seedInitialData(): Promise<void> {
  const now = nowIso();
  const savingId = crypto.randomUUID();
  const spendingIncomeId = crypto.randomUUID();

  await db.transaction("rw", metaTable, savingTable, spendingIncomeTable, async () => {
    await metaTable.put({
      key: "app",
      schemaVersion: SCHEMA_VERSION,
      deviceId: createDeviceId(),
      lastModifiedAt: now,
    });

    await savingTable.put({
      key: ACTIVE_DOCUMENT_KEY,
      ...createEmptySaving(savingId),
    });

    await spendingIncomeTable.put({
      key: ACTIVE_DOCUMENT_KEY,
      ...createFreshSpendingIncome(spendingIncomeId),
    });
  });
}

export async function isDatabaseSeeded(): Promise<boolean> {
  const saving = await savingTable.get(ACTIVE_DOCUMENT_KEY);
  const spendingIncome = await spendingIncomeTable.get(ACTIVE_DOCUMENT_KEY);
  return Boolean(saving && spendingIncome);
}

export async function touchLastModified(): Promise<void> {
  const meta = await metaTable.get("app");
  if (!meta) {
    return;
  }

  await metaTable.put({
    ...meta,
    lastModifiedAt: nowIso(),
  });
}
