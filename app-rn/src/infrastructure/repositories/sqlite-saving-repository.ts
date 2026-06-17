import type { SavingTransactionPersistenceInput } from '@vault-track/shared';
import type { ISavingRepository } from '@vault-track/shared';
import { applySavingTransaction, ACTIVE_DOCUMENT_KEY } from '@vault-track/shared';

import { touchLastModified } from '../seed/initial-data';
import { getDatabase } from '../storage/sqlite-client';
import { parseSaving } from '../storage/sqlite-db';

export class SqliteSavingRepository implements ISavingRepository {
  async get() {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ payload: string }>(
      'SELECT payload FROM saving WHERE key = ?',
      ACTIVE_DOCUMENT_KEY,
    );

    if (!row) {
      throw new Error('Saving document not found');
    }

    const record = parseSaving(row.payload);
    return {
      id: record.id,
      balance: record.balance,
      transactions: record.transactions,
      updatedAt: record.updatedAt,
      version: record.version,
    };
  }

  async applyTransaction(input: SavingTransactionPersistenceInput) {
    const db = await getDatabase();
    let updated = await this.get();

    await db.withTransactionAsync(async () => {
      const row = await db.getFirstAsync<{ payload: string }>(
        'SELECT payload FROM saving WHERE key = ?',
        ACTIVE_DOCUMENT_KEY,
      );

      if (!row) {
        throw new Error('Saving document not found');
      }

      const record = parseSaving(row.payload);
      const saving = {
        id: record.id,
        balance: record.balance,
        transactions: record.transactions,
        updatedAt: record.updatedAt,
        version: record.version,
      };

      updated = applySavingTransaction(saving, {
        id: input.clientTransactionId,
        accountType: input.accountType,
        amount: input.amount,
        note: input.note ?? '',
        operationType: input.operationType,
        createdAt: input.createdAt,
      });

      await db.runAsync(
        'UPDATE saving SET payload = ? WHERE key = ?',
        JSON.stringify({ key: ACTIVE_DOCUMENT_KEY, ...updated }),
        ACTIVE_DOCUMENT_KEY,
      );
      await touchLastModified();
    });

    return updated;
  }
}
