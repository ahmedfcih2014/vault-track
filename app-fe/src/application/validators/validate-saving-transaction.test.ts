import { describe, expect, it } from "vitest";
import { validateSavingTransactionInput } from "@/application/validators/validate-saving-transaction";
import { DOMAIN_ERROR_CODES } from "@/domain/errors";
import { createEmptySaving } from "@/domain/saving";

const SAVING_ID = "00000000-0000-4000-8000-000000000001";

describe("validateSavingTransactionInput", () => {
  it("rejects non-positive amounts", () => {
    const saving = createEmptySaving(SAVING_ID);

    expect(() =>
      validateSavingTransactionInput(
        {
          accountType: "usd",
          amount: "0",
          note: "",
          operationType: "deposit",
        },
        saving,
      ),
    ).toThrowError(expect.objectContaining({ code: DOMAIN_ERROR_CODES.VALIDATION_ERROR }));
  });

  it("rejects withdraw above available balance", () => {
    const saving = createEmptySaving(SAVING_ID);

    expect(() =>
      validateSavingTransactionInput(
        {
          accountType: "usd",
          amount: "100",
          note: "",
          operationType: "withdraw",
        },
        saving,
      ),
    ).toThrowError(expect.objectContaining({ code: DOMAIN_ERROR_CODES.INSUFFICIENT_BALANCE }));
  });

  it("accepts valid deposit input", () => {
    const saving = createEmptySaving(SAVING_ID);
    const result = validateSavingTransactionInput(
      {
        accountType: "gold_21",
        amount: "1.5",
        note: "gift",
        operationType: "deposit",
      },
      saving,
    );

    expect(result.accountType).toBe("gold_21");
    expect(result.amount).toBe("1.5");
  });
});
