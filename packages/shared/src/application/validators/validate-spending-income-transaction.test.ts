import { describe, expect, it } from "vitest";
import { validateSpendingIncomeTransactionInput } from "./validate-spending-income-transaction";
import { DOMAIN_ERROR_CODES } from "../../domain/errors";

describe("validateSpendingIncomeTransactionInput", () => {
  it("rejects non-positive amounts", () => {
    expect(() =>
      validateSpendingIncomeTransactionInput({
        amount: "-5",
        note: "",
        operationType: "deposit",
      }),
    ).toThrowError(expect.objectContaining({ code: DOMAIN_ERROR_CODES.VALIDATION_ERROR }));
  });

  it("accepts valid income input", () => {
    const result = validateSpendingIncomeTransactionInput({
      amount: "100",
      note: "salary",
      operationType: "deposit",
    });

    expect(result.amount).toBe("100");
    expect(result.operationType).toBe("deposit");
  });

  it("accepts valid spending input", () => {
    const result = validateSpendingIncomeTransactionInput({
      amount: "42.5",
      note: "",
      operationType: "withdraw",
    });

    expect(result.operationType).toBe("withdraw");
  });
});
