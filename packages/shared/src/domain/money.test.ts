import { describe, expect, it } from "vitest";
import {
  addMoney,
  compareMoney,
  formatCurrency,
  formatSignedEgp,
  isPositive,
  subtractMoney,
} from "./money";

describe("money helpers", () => {
  it("adds decimal strings without float drift", () => {
    expect(addMoney("0.1", "0.2")).toBe("0.3");
  });

  it("subtracts decimal strings", () => {
    expect(subtractMoney("10", "3.5")).toBe("6.5");
  });

  it("detects positive amounts", () => {
    expect(isPositive("1")).toBe(true);
    expect(isPositive("0")).toBe(false);
  });

  it("compares amounts", () => {
    expect(compareMoney("10", "5")).toBe(1);
    expect(compareMoney("5", "10")).toBe(-1);
  });

  it("formats currency values", () => {
    expect(formatCurrency("1234.5", "usd")).toBe("$1,234.50");
    expect(formatCurrency("99.5", "sar")).toBe("99.50 SAR");
    expect(formatCurrency("5.125", "gold_21")).toBe("5.125 g");
  });

  it("formats signed EGP for spending income", () => {
    expect(formatSignedEgp("100")).toBe("100.00 EGP");
    expect(formatSignedEgp("-50.5")).toBe("-50.50 EGP");
    expect(formatSignedEgp("1234.5")).toBe("1,234.50 EGP");
  });
});
