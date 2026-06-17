import { describe, expect, it } from "vitest";
import {
  applySpendingIncomeTransaction,
  createFreshSpendingIncome,
} from "@/domain/spending-income";

const PERIOD_ID = "00000000-0000-4000-8000-000000000002";
const CREATED_AT = "2026-06-17T10:00:00+03:00";
const TX_ID_1 = "00000000-0000-4000-8000-000000000020";
const TX_ID_2 = "00000000-0000-4000-8000-000000000021";

function applyTx(
  period: ReturnType<typeof createFreshSpendingIncome>,
  operationType: "deposit" | "withdraw",
  amount: string,
  createdAt = CREATED_AT,
  id = TX_ID_1,
) {
  return applySpendingIncomeTransaction(period, {
    id,
    amount,
    note: "",
    operationType,
    createdAt,
  });
}

describe("applySpendingIncomeTransaction", () => {
  it("increases signed balance on income (deposit)", () => {
    const period = createFreshSpendingIncome(PERIOD_ID);
    const updated = applyTx(period, "deposit", "100");

    expect(updated.balance).toBe("100.00");
    expect(updated.transactions).toHaveLength(1);
    expect(updated.transactions[0]?.createdAt).toBe(CREATED_AT);
  });

  it("decreases signed balance on spending (withdraw)", () => {
    const period = applyTx(createFreshSpendingIncome(PERIOD_ID), "deposit", "250");
    const updated = applyTx(period, "withdraw", "75", "2026-06-17T11:00:00+03:00", TX_ID_2);

    expect(updated.balance).toBe("175.00");
  });

  it("allows negative balance (BR-SP01)", () => {
    const period = createFreshSpendingIncome(PERIOD_ID);
    const updated = applyTx(period, "withdraw", "50");

    expect(updated.balance).toBe("-50.00");
  });

  it("appends transaction with all required fields (BR-SP04)", () => {
    const period = createFreshSpendingIncome(PERIOD_ID);
    const updated = applySpendingIncomeTransaction(period, {
      id: TX_ID_1,
      amount: "25.5",
      note: "groceries",
      operationType: "withdraw",
      createdAt: CREATED_AT,
    });

    expect(updated.transactions[0]).toEqual({
      id: TX_ID_1,
      amount: "25.50",
      note: "groceries",
      operationType: "withdraw",
      createdAt: CREATED_AT,
      syncStatus: "local",
    });
  });
});
