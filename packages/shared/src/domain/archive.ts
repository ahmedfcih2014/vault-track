import type { SpendingIncome } from "./types";

export function buildArchiveFilename(snapshot: SpendingIncome): string {
  const timestamp = (snapshot.resetedAt ?? snapshot.startedAt).replace(/[:.]/g, "-");
  return `spending-income-${timestamp}.json`;
}

export function cloneSpendingIncomePeriod(period: SpendingIncome): SpendingIncome {
  return JSON.parse(JSON.stringify(period)) as SpendingIncome;
}

export function closePeriodSnapshot(
  period: SpendingIncome,
  resetedAt: string,
): SpendingIncome {
  return {
    ...cloneSpendingIncomePeriod(period),
    resetedAt,
    updatedAt: resetedAt,
  };
}
