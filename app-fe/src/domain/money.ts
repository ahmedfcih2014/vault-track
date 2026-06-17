import Decimal from "decimal.js";
import type { AccountType } from "@/domain/types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

const ZERO_DECIMALS = 0;

export function addMoney(a: string, b: string): string {
  return new Decimal(a).plus(b).toFixed();
}

export function subtractMoney(a: string, b: string): string {
  return new Decimal(a).minus(b).toFixed();
}

export function isPositive(amount: string): boolean {
  return new Decimal(amount).greaterThan(ZERO_DECIMALS);
}

export function compareMoney(a: string, b: string): number {
  return new Decimal(a).comparedTo(b);
}

export function formatMoney(amount: string, decimals: number): string {
  return new Decimal(amount).toFixed(decimals);
}

export function normalizeAmountForAccount(amount: string, accountType: AccountType): string {
  const decimals = accountType === "gold_21" ? 3 : 2;
  return formatMoney(amount, decimals);
}

export function formatCurrency(amount: string, currency: AccountType): string {
  const decimals = currency === "gold_21" ? 3 : 2;
  const formatted = new Decimal(amount).toFixed(decimals);
  const [whole, fraction = ""] = formatted.split(".");
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  switch (currency) {
    case "usd":
      return `$${fraction ? `${groupedWhole}.${fraction}` : groupedWhole}`;
    case "sar":
      return `${fraction ? `${groupedWhole}.${fraction}` : groupedWhole} SAR`;
    case "gold_21":
      return `${fraction ? `${groupedWhole}.${fraction}` : groupedWhole} g`;
  }
}

export function formatSignedEgp(amount: string): string {
  const decimals = 2;
  const value = new Decimal(amount);
  const formatted = value.abs().toFixed(decimals);
  const [whole, fraction = ""] = formatted.split(".");
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const display = fraction ? `${groupedWhole}.${fraction}` : groupedWhole;
  const signed = value.isNegative() ? `-${display}` : display;
  return `${signed} EGP`;
}
