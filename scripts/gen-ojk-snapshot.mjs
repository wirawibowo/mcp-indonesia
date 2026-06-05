/**
 * Unduh snapshot daftar entitas terdaftar OJK + daftar ilegal Satgas PASTI dari
 * Namchee/ojk-invest-api (unofficial mirror dari portal OJK), lalu bundle ke
 * raw.ts.
 *
 * Sumber upstream (official): https://reksadana.ojk.go.id dan portal Satgas PASTI.
 * Snapshot ini perlu di-regen berkala. Disclaimer tanggal snapshot disertakan di
 * tiap response tool — pengguna wajib verifikasi langsung ke ojk.go.id untuk
 * keputusan finansial.
 *
 * Jalankan: node scripts/gen-ojk-snapshot.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "src", "modules", "ojk", "data");

const BASE = "https://ojk-invest-api.vercel.app/api";

async function fetchJson(path) {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Gagal unduh ${path}: ${res.status}`);
  return res.json();
}

console.log("Mengunduh snapshot OJK...");

const [productsResp, illegalsResp] = await Promise.all([
  fetchJson("products"),
  fetchJson("illegals"),
]);

const products = productsResp.data.products ?? [];
const illegals = illegalsResp.data.illegals ?? [];

console.log(`  Terdaftar OJK: ${products.length}`);
console.log(`  Daftar ilegal: ${illegals.length}`);

// Ringkas: hanya field yang relevan untuk pencarian/identifikasi.
const registered = products.map((p) => ({
  name: String(p.name ?? "").trim(),
  manager: String(p.management ?? "").trim(),
  custodian: String(p.custodian ?? "").trim(),
  type: String(p.type ?? "").trim(),
}));

const illegal = illegals.map((i) => ({
  name: String(i.name ?? "").trim(),
  aliases: Array.isArray(i.alias) ? i.alias.filter(Boolean) : [],
  entityType: String(i.entity_type ?? "").trim(),
  activities: Array.isArray(i.activity_type) ? i.activity_type.filter(Boolean) : [],
  inputDate: String(i.input_date ?? "").trim(),
  reference: String(i.description ?? "").trim(),
}));

const today = new Date();
const snapshotDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

const lines = [
  "// AUTO-GENERATED oleh scripts/gen-ojk-snapshot.mjs — jangan edit manual.",
  "// Sumber: Namchee/ojk-invest-api (unofficial mirror portal OJK & Satgas PASTI).",
  `// Snapshot tanggal: ${snapshotDate}`,
  "//",
  "// PERINGATAN: snapshot tidak real-time. Untuk keputusan finansial, verifikasi",
  "// langsung di https://ojk.go.id/waspada-investasi/.",
  "",
  `export const SNAPSHOT_DATE = "${snapshotDate}";`,
  "",
  "export interface RegisteredEntity {",
  "  name: string;",
  "  manager: string;",
  "  custodian: string;",
  "  type: string;",
  "}",
  "",
  "export interface IllegalEntity {",
  "  name: string;",
  "  aliases: string[];",
  "  entityType: string;",
  "  activities: string[];",
  "  inputDate: string;",
  "  reference: string;",
  "}",
  "",
  "export const REGISTERED: ReadonlyArray<RegisteredEntity> = " + JSON.stringify(registered, null, 2) + ";",
  "",
  "export const ILLEGAL: ReadonlyArray<IllegalEntity> = " + JSON.stringify(illegal, null, 2) + ";",
];

writeFileSync(join(dataDir, "raw.ts"), lines.join("\n") + "\n", "utf8");
console.log(`✓ Snapshot ${snapshotDate} → raw.ts`);
