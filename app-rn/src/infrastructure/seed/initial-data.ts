import {
  ACTIVE_DOCUMENT_KEY,
  createEmptySaving,
  createFreshSpendingIncome,
  nowIso,
} from '@vault-track/shared';

import { getDatabase } from '../storage/sqlite-client';
import { SCHEMA_VERSION } from '../storage/sqlite-db';

function createDeviceId(): string {
  return crypto.randomUUID();
}

export async function seedInitialData(): Promise<void> {
  const db = await getDatabase();
  const now = nowIso();
  const savingId = crypto.randomUUID();
  const spendingIncomeId = crypto.randomUUID();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT OR REPLACE INTO meta (key, payload) VALUES (?, ?)',
      'app',
      JSON.stringify({
        key: 'app',
        schemaVersion: SCHEMA_VERSION,
        deviceId: createDeviceId(),
        lastModifiedAt: now,
      }),
    );

    await db.runAsync(
      'INSERT OR REPLACE INTO saving (key, payload) VALUES (?, ?)',
      ACTIVE_DOCUMENT_KEY,
      JSON.stringify({
        key: ACTIVE_DOCUMENT_KEY,
        ...createEmptySaving(savingId),
      }),
    );

    await db.runAsync(
      'INSERT OR REPLACE INTO spending_income (key, payload) VALUES (?, ?)',
      ACTIVE_DOCUMENT_KEY,
      JSON.stringify({
        key: ACTIVE_DOCUMENT_KEY,
        ...createFreshSpendingIncome(spendingIncomeId),
      }),
    );
  });
}

export async function isDatabaseSeeded(): Promise<boolean> {
  const db = await getDatabase();
  const saving = await db.getFirstAsync<{ key: string }>(
    'SELECT key FROM saving WHERE key = ?',
    ACTIVE_DOCUMENT_KEY,
  );
  const spendingIncome = await db.getFirstAsync<{ key: string }>(
    'SELECT key FROM spending_income WHERE key = ?',
    ACTIVE_DOCUMENT_KEY,
  );
  return Boolean(saving && spendingIncome);
}

export async function touchLastModified(): Promise<void> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ payload: string }>(
    'SELECT payload FROM meta WHERE key = ?',
    'app',
  );

  if (!row) {
    return;
  }

  const meta = JSON.parse(row.payload) as Record<string, unknown>;
  await db.runAsync(
    'UPDATE meta SET payload = ? WHERE key = ?',
    JSON.stringify({ ...meta, lastModifiedAt: nowIso() }),
    'app',
  );
}
