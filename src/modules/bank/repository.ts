/**
 * Repository bank Indonesia — lookup by kode/SWIFT, list, dan search nama.
 *
 * Dataset di-bundle (raw.ts) sehingga semua operasi adalah pure & offline.
 */
import { BANKS, type Bank } from "./data/raw.js";

export type { Bank };

const BY_CODE: ReadonlyMap<string, Bank> = new Map(
  BANKS.filter((b) => b.code).map((b) => [b.code, b]),
);
const BY_SWIFT: ReadonlyMap<string, Bank> = new Map(
  BANKS.filter((b) => b.swift).map((b) => [b.swift.toUpperCase(), b]),
);

export function listBanks(type?: Bank["type"]): Bank[] {
  if (!type) return [...BANKS];
  return BANKS.filter((b) => b.type === type);
}

export function getBank(codeOrSwift: string): Bank | null {
  const q = codeOrSwift.trim();
  if (!q) return null;
  // Kode kliring 3 digit murni angka.
  if (/^\d{3}$/.test(q)) return BY_CODE.get(q) ?? null;
  // SWIFT 8 atau 11 karakter alfanumerik.
  const upper = q.toUpperCase();
  return BY_SWIFT.get(upper) ?? null;
}

export function searchBank(query: string): Bank[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return BANKS.filter((b) => {
    if (b.name.toLowerCase().includes(q)) return true;
    if (b.alias && b.alias.toLowerCase().includes(q)) return true;
    return false;
  });
}
