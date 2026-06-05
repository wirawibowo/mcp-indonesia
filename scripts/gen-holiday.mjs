/**
 * Unduh data hari libur nasional & cuti bersama Indonesia untuk beberapa tahun
 * berurutan dan bundle ke raw.ts.
 *
 * Sumber: api-hari-libur.vercel.app (andifahruddinakas; auto-scrape tanggalan.com,
 * di-update bulanan). Fallback bila API down: snapshot manual yang sudah di-commit.
 *
 * Jalankan: node scripts/gen-holiday.mjs
 *
 * Penanda "cuti bersama" diturunkan dari kata kunci dalam description.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "src", "modules", "holiday", "data");

const BASE = "https://api-hari-libur.vercel.app/api";
const currentYear = new Date().getFullYear();
// Ambil 1 tahun lalu sampai 2 tahun ke depan untuk fleksibilitas.
const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

async function fetchYear(year) {
  const res = await fetch(`${BASE}?year=${year}`);
  if (!res.ok) throw new Error(`Gagal unduh tahun ${year}: ${res.status}`);
  const json = await res.json();
  if (json.status !== "success") throw new Error(`Tahun ${year}: ${JSON.stringify(json)}`);
  return json.data;
}

console.log(`Mengunduh hari libur untuk tahun: ${years.join(", ")}...`);
const allData = [];
for (const year of years) {
  try {
    const entries = await fetchYear(year);
    console.log(`  ${year}: ${entries.length} entries`);
    allData.push(...entries);
  } catch (err) {
    console.warn(`  ${year}: skip (${err.message})`);
  }
}

// Tandai cuti bersama berdasarkan kata kunci dalam description.
const normalized = allData.map((row) => {
  const desc = row.description;
  const isCutiBersama = /cuti bersama/i.test(desc);
  return {
    date: row.date,
    name: desc,
    type: isCutiBersama ? "cuti_bersama" : "national",
  };
});

// Sort by date.
normalized.sort((a, b) => a.date.localeCompare(b.date));

const lines = [
  "// AUTO-GENERATED oleh scripts/gen-holiday.mjs — jangan edit manual.",
  "// Sumber: api-hari-libur.vercel.app (andifahruddinakas/api-hari-libur).",
  "// Cakupan tahun: " + years.join(", "),
  "//",
  "// Tipe: 'national' (libur nasional) | 'cuti_bersama' (cuti bersama).",
  "",
  "export interface HolidayEntry {",
  "  date: string;",
  "  name: string;",
  "  type: 'national' | 'cuti_bersama';",
  "}",
  "",
  "export const HOLIDAYS: ReadonlyArray<HolidayEntry> = [",
  ...normalized.map(
    (h) =>
      `  { date: "${h.date}", name: ${JSON.stringify(h.name)}, type: "${h.type}" },`,
  ),
  "];",
];

writeFileSync(join(dataDir, "raw.ts"), lines.join("\n") + "\n", "utf8");
console.log(`✓ ${normalized.length} entries → raw.ts`);
