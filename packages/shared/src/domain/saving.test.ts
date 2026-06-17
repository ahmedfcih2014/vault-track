import { describe, expect, it } from "vitest";
import { DOMAIN_ERROR_CODES, DomainError } from "./errors";
import {
  applyDeposit,
  applySavingTransaction,
  applyWithdraw,
  createEmptySaving,
} from "./saving";

const SAVING_ID = "00000000-0000-4000-8000-000000000001";
const TX_ID = "00000000-0000-4000-8000-000000000010";
const CREATED_AT = "2026-06-17T10:00:00+03:00";

describe("createEmptySaving", () => {
  it("creates zero balances for all account types", () => {
    const saving = createEmptySaving(SAVING_ID);

    expect(saving.balance).toEqual({
      usd: "0",
      sar: "0",
      gold_21: "0",
    });
    expect(saving.transactions).toEqual([]);
  });
});

describe("applySavingTransaction", () => {
  it("increases only the selected account balance on deposit", () => {
    const saving = createEmptySaving(SAVING_ID);
    const updated = applySavingTransaction(saving, {
      id: TX_ID,
      accountType: "usd",
      amount: "10",
      note: "paycheck",
      operationType: "deposit",
      createdAt: CREATED_AT,
    });

    expect(updated.balance.usd).toBe("10.00");
    expect(updated.balance.sar).toBe("0");
    expect(updated.balance.gold_21).toBe("0");
    expect(updated.transactions).toHaveLength(1);
  });

  it("decreases balance on withdraw", () => {
    const saving = applyDeposit(createEmptySaving(SAVING_ID), "usd", "50");
    const updated = applySavingTransaction(saving, {
      id: TX_ID,
      accountType: "usd",
      amount: "20",
      note: "",
      operationType: "withdraw",
      createdAt: CREATED_AT,
    });

    expect(updated.balance.usd).toBe("30.00");
  });

  it("blocks withdraw when balance is insufficient (BR-S03)", () => {
    const saving = applyDeposit(createEmptySaving(SAVING_ID), "usd", "50");

    expect(() =>
      applyWithdraw(saving, "usd", "100"),
    ).toThrowError(expect.objectContaining({ code: DOMAIN_ERROR_CODES.INSUFFICIENT_BALANCE }));
  });

  it("throws DomainError for over-withdraw", () => {
    const saving = applyDeposit(createEmptySaving(SAVING_ID), "sar", "10");

    try {
      applySavingTransaction(saving, {
        id: TX_ID,
        accountType: "sar",
        amount: "15",
        note: "",
        operationType: "withdraw",
        createdAt: CREATED_AT,
      });
      expect.fail("Expected DomainError");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe(DOMAIN_ERROR_CODES.INSUFFICIENT_BALANCE);
    }
  });
});
