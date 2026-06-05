/**
 * Repository hari libur nasional & cuti bersama Indonesia (offline).
 *
 * Dataset di-bundle (raw.ts), mencakup tahun-tahun yang di-fetch oleh
 * scripts/gen-holiday.mjs.
 */
import { HOLIDAYS, type HolidayEntry } from "./data/raw.js";

export type { HolidayEntry };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDate(input: string): string | null {
  const trimmed = input.trim();
  if (ISO_DATE.test(trimmed)) return trimmed;
  // Coba parsing dengan Date — fallback longgar untuk format tanpa nol di depan.
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type HolidayType = HolidayEntry["type"];

export interface HolidayCheckResult {
  date: string;
  isHoliday: boolean;
  matches: HolidayEntry[];
}

export function checkHoliday(input: string): HolidayCheckResult | null {
  const date = normalizeDate(input);
  if (!date) return null;
  const matches = HOLIDAYS.filter((h) => h.date === date);
  return { date, isHoliday: matches.length > 0, matches };
}

export function listHolidays(year: number, type?: HolidayType): HolidayEntry[] {
  const prefix = `${year}-`;
  return HOLIDAYS.filter((h) => {
    if (!h.date.startsWith(prefix)) return false;
    if (type && h.type !== type) return false;
    return true;
  });
}

export function nextHoliday(fromDate?: string, type?: HolidayType): HolidayEntry | null {
  const from = fromDate ? normalizeDate(fromDate) : todayIso();
  if (!from) return null;
  for (const h of HOLIDAYS) {
    if (h.date < from) continue;
    if (type && h.type !== type) continue;
    return h;
  }
  return null;
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Cakupan tahun di dataset (untuk error message). */
export function dataYearRange(): { min: number; max: number } {
  const years = HOLIDAYS.map((h) => Number(h.date.slice(0, 4)));
  return { min: Math.min(...years), max: Math.max(...years) };
}
