import { DateTime } from "luxon";

export function nowIso(): string {
  const iso = DateTime.now().toISO();
  if (!iso) {
    throw new Error("Failed to produce ISO timestamp");
  }
  return iso;
}

export function formatDisplayDate(iso: string): string {
  return DateTime.fromISO(iso).toLocaleString(DateTime.DATETIME_MED);
}
