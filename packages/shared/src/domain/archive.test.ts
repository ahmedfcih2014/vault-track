import { describe, expect, it } from "vitest";
import { closePeriodSnapshot, cloneSpendingIncomePeriod } from "./archive";
import { createFreshSpendingIncome } from "./spending-income";

const PERIOD_ID = "00000000-0000-4000-8000-000000000002";
const RESETED_AT = "2026-06-17T12:00:00+03:00";

describe("archive snapshot", () => {
  it("clones period with all transactions", () => {
    const period = createFreshSpendingIncome(PERIOD_ID);
    period.balance = "100.00";
    period.transactions = [
      {
        id: "00000000-0000-4000-8000-000000000030",
        amount: "100.00",
        note: "salary",
        operationType: "deposit",
        createdAt: "2026-06-17T10:00:00+03:00",
      },
    ];

    const clone = cloneSpendingIncomePeriod(period);

    expect(clone).toEqual(period);
    expect(clone).not.toBe(period);
    expect(clone.transactions).not.toBe(period.transactions);
  });

  it("sets resetedAt on closed snapshot (BR-R01)", () => {
    const period = createFreshSpendingIncome(PERIOD_ID);
    const snapshot = closePeriodSnapshot(period, RESETED_AT);

    expect(snapshot.resetedAt).toBe(RESETED_AT);
    expect(snapshot.updatedAt).toBe(RESETED_AT);
  });
});
