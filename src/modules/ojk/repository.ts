/**
 * Repository OJK — cek apakah entitas terdaftar di OJK atau masuk daftar ilegal
 * Satgas PASTI. Pure & offline (bundled snapshot).
 */
import {
  REGISTERED,
  ILLEGAL,
  SNAPSHOT_DATE,
  type RegisteredEntity,
  type IllegalEntity,
} from "./data/raw.js";

export { SNAPSHOT_DATE };
export type { RegisteredEntity, IllegalEntity };

export type OjkStatus = "terdaftar" | "ilegal" | "unknown";

export interface OjkCheckResult {
  query: string;
  status: OjkStatus;
  snapshotDate: string;
  disclaimer: string;
  matches: {
    registered: RegisteredEntity[];
    illegal: IllegalEntity[];
  };
}

const DISCLAIMER =
  `Data snapshot per ${SNAPSHOT_DATE}. Untuk keputusan finansial, ` +
  `selalu verifikasi langsung di https://ojk.go.id/waspada-investasi/.`;

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(s: string): string[] {
  return normalize(s).split(" ").filter((t) => t.length >= 2);
}

/** Match jika SEMUA token query ada di target (sebagai substring kata). */
function matches(target: string, queryTokens: string[]): boolean {
  if (queryTokens.length === 0) return false;
  const t = normalize(target);
  return queryTokens.every((q) => t.includes(q));
}

export function checkEntity(name: string): OjkCheckResult {
  const query = name.trim();
  const qTokens = tokens(query);
  if (qTokens.length === 0) {
    return {
      query,
      status: "unknown",
      snapshotDate: SNAPSHOT_DATE,
      disclaimer: DISCLAIMER,
      matches: { registered: [], illegal: [] },
    };
  }

  const registered: RegisteredEntity[] = [];
  for (const r of REGISTERED) {
    if (matches(r.name, qTokens)) {
      registered.push(r);
      if (registered.length >= 10) break;
    }
  }

  const illegal: IllegalEntity[] = [];
  for (const i of ILLEGAL) {
    if (
      matches(i.name, qTokens) ||
      i.aliases.some((a) => matches(a, qTokens))
    ) {
      illegal.push(i);
      if (illegal.length >= 10) break;
    }
  }

  let status: OjkStatus = "unknown";
  if (illegal.length > 0 && registered.length === 0) status = "ilegal";
  else if (registered.length > 0 && illegal.length === 0) status = "terdaftar";
  else if (registered.length > 0 && illegal.length > 0) {
    // Ada nama bertabrakan — kembalikan ilegal sebagai status hati-hati,
    // tetapi sertakan kedua hasil supaya user bisa verifikasi.
    status = "ilegal";
  }

  return {
    query,
    status,
    snapshotDate: SNAPSHOT_DATE,
    disclaimer: DISCLAIMER,
    matches: { registered, illegal },
  };
}
