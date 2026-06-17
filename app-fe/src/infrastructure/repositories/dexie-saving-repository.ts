import type { SavingTransactionPersistenceInput } from "@/application/contracts/dtos";
import type { ISavingRepository } from "@/application/ports/repositories";
import { applySavingTransaction } from "@/domain/saving";
import { ACTIVE_DOCUMENT_KEY } from "@/domain/types";
import { touchLastModified } from "@/infrastructure/seed/initial-data";
import { notifyDataChanged } from "@/infrastructure/sync/broadcast-sync";
import { db, metaTable, savingTable } from "@/infrastructure/storage/dexie-db";

export class DexieSavingRepository implements ISavingRepository {
  async get() {
    const record = await savingTable.get(ACTIVE_DOCUMENT_KEY);
    if (!record) {
      throw new Error("Saving document not found");
    }

    return {
      id: record.id,
      balance: record.balance,
      transactions: record.transactions,
      updatedAt: record.updatedAt,
      version: record.version,
    };
  }

  async applyTransaction(input: SavingTransactionPersistenceInput) {
    return db.transaction("rw", savingTable, metaTable, async () => {
      const record = await savingTable.get(ACTIVE_DOCUMENT_KEY);
      if (!record) {
        throw new Error("Saving document not found");
      }

      const saving = {
        id: record.id,
        balance: record.balance,
        transactions: record.transactions,
        updatedAt: record.updatedAt,
        version: record.version,
      };

      const updated = applySavingTransaction(saving, {
        id: input.clientTransactionId,
        accountType: input.accountType,
        amount: input.amount,
        note: input.note ?? "",
        operationType: input.operationType,
        createdAt: input.createdAt,
      });

      await savingTable.put({
        key: ACTIVE_DOCUMENT_KEY,
        ...updated,
      });
      await touchLastModified();

      notifyDataChanged();
      return updated;
    });
  }
}
