import { describe, expect, it } from "vitest";
import { validatePersistedSnapshot } from "./validate-persisted-snapshot";
import { DOMAIN_ERROR_CODES } from "../../domain/errors";
import { createEmptySaving } from "../../domain/saving";
import { createFreshSpendingIncome } from "../../domain/spending-income";

describe("validatePersistedSnapshot", () => {
  it("accepts valid seeded data", () => {
    const snapshot = {
      saving: createEmptySaving("00000000-0000-4000-8000-000000000001"),
      spendingIncome: createFreshSpendingIncome("00000000-0000-4000-8000-000000000002"),
    };

    const result = validatePersistedSnapshot(snapshot);
    expect(result.saving.balance.usd).toBe("0");
    expect(result.spendingIncome.balance).toBe("0");
  });

  it("rejects corrupted saving data", () => {
    const snapshot = {
      saving: {
        id: "not-a-uuid",
        balance: { usd: "0", sar: "0", gold_21: "0" },
        transactions: [],
        updatedAt: "invalid",
      },
      spendingIncome: createFreshSpendingIncome("00000000-0000-4000-8000-000000000002"),
    };

    expect(() => validatePersistedSnapshot(snapshot as never)).toThrowError(
      expect.objectContaining({ code: DOMAIN_ERROR_CODES.CORRUPT_DATA }),
    );
  });
});
