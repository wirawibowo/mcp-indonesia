/**
 * Unduh data kodepos dari cahyadsn/wilayah_kodepos (SQL dump), parse, dan
 * konversi ke modul TS (raw.ts) yang di-bundle bersama source.
 *
 * Sumber: Kepmendagri No 300.2.2-2138 Tahun 2025 (kodepos vs kode wilayah).
 * Format input: INSERT VALUES ('PP.RR.SS.DDDD', 'NNNNN').
 * Format output: 10-digit code (titik dihilangkan) → kodepos 5-digit.
 *
 * Jalankan: node scripts/gen-kodepos.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "src", "modules", "kodepos", "data");

const URL =
  "https://raw.githubusercontent.com/cahyadsn/wilayah_kodepos/master/db/wilayah_kodepos.sql";

console.log("Mengunduh SQL kodepos...");
const res = await fetch(URL);
if (!res.ok) throw new Error(`Gagal unduh: ${res.status}`);
const sql = await res.text();

const rowRe = /\('([\d.]+)',\s*'(\d{4,5})'\)/g;
const entries = [];
let m;
while ((m = rowRe.exec(sql)) !== null) {
  const code = m[1].replace(/\./g, ""); // 11.01.01.2001 -> 1101012001
  const kodepos = m[2].padStart(5, "0");
  if (code.length === 10) entries.push([code, kodepos]);
}
console.log(`Parsed ${entries.length} entries`);

// Bentuk: array tuples kompak [code, kodepos][].
const lines = [
  "// AUTO-GENERATED oleh scripts/gen-kodepos.mjs — jangan edit manual.",
  "// Sumber: cahyadsn/wilayah_kodepos (Kepmendagri No 300.2.2-2138 Tahun 2025).",
  "//",
  "// Format: [adm4Code (10 digit), kodepos (5 digit)]",
  "",
  "export const KODEPOS_DATA: ReadonlyArray<readonly [string, string]> = [",
  ...entries.map(([k, p]) => `  ["${k}","${p}"],`),
  "];",
];

writeFileSync(join(dataDir, "raw.ts"), lines.join("\n") + "\n", "utf8");
console.log("✓ raw.ts berhasil di-generate");
