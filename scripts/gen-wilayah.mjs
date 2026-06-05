/**
 * Unduh CSV wilayah dari emsifa, patch provinsi Papua DOB 2022,
 * lalu konversi ke modul TS (raw.ts) yang di-bundle bersama source.
 *
 * Jalankan: node scripts/gen-wilayah.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "src", "modules", "wilayah", "data");

const BASE = "https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/master/data";

async function download(name) {
  const res = await fetch(`${BASE}/${name}.csv`);
  if (!res.ok) throw new Error(`Gagal unduh ${name}.csv: ${res.status}`);
  return (await res.text()).trimEnd();
}

// ── Papua DOB 2022 ──────────────────────────────────────────────────────────
// 4 provinsi baru hasil pemekaran Papua (PP Nomor 106-109 Tahun 2022).
// Emsifa belum update; data di-patch manual berdasarkan Permendagri.

const NEW_PROVINCES = [
  "92,PAPUA BARAT DAYA",
  "95,PAPUA SELATAN",
  "96,PAPUA TENGAH",
  "97,PAPUA PEGUNUNGAN",
];

// Kabupaten/kota untuk provinsi baru (kode resmi Kemendagri 2022).
// Parent adalah kode 2-digit provinsi baru.
const NEW_REGENCIES = [
  // Papua Barat Daya (92) – dari Papua Barat (91)
  "9201,92,KABUPATEN SORONG",
  "9202,92,KABUPATEN SORONG SELATAN",
  "9203,92,KABUPATEN RAJA AMPAT",
  "9204,92,KABUPATEN TAMBRAUW",
  "9205,92,KABUPATEN MAYBRAT",
  "9271,92,KOTA SORONG",
  // Papua Selatan (95) – dari Papua (94)
  "9501,95,KABUPATEN MERAUKE",
  "9502,95,KABUPATEN BOVEN DIGOEL",
  "9503,95,KABUPATEN MAPPI",
  "9504,95,KABUPATEN ASMAT",
  // Papua Tengah (96) – dari Papua (94)
  "9601,96,KABUPATEN NABIRE",
  "9602,96,KABUPATEN INTAN JAYA",
  "9603,96,KABUPATEN DOGIYAI",
  "9604,96,KABUPATEN DEIYAI",
  "9605,96,KABUPATEN PANIAI",
  "9606,96,KABUPATEN PUNCAK JAYA",
  "9607,96,KABUPATEN PUNCAK",
  "9608,96,KABUPATEN MIMIKA",
  // Papua Pegunungan (97) – dari Papua (94)
  "9701,97,KABUPATEN JAYAWIJAYA",
  "9702,97,KABUPATEN PEGUNUNGAN BINTANG",
  "9703,97,KABUPATEN YAHUKIMO",
  "9704,97,KABUPATEN TOLIKARA",
  "9705,97,KABUPATEN MAMBERAMO TENGAH",
  "9706,97,KABUPATEN YALIMO",
  "9707,97,KABUPATEN LANNY JAYA",
  "9708,97,KABUPATEN NDUGA",
];

// ────────────────────────────────────────────────────────────────────────────

console.log("Mengunduh CSV dari emsifa...");
const [provincesCsv, regenciesCsv, districtsCsv, villagesCsv] = await Promise.all([
  download("provinces"),
  download("regencies"),
  download("districts"),
  download("villages"),
]);

// Patch provinsi
const patchedProvinces = provincesCsv + "\n" + NEW_PROVINCES.join("\n");
// Patch kabupaten/kota
const patchedRegencies = regenciesCsv + "\n" + NEW_REGENCIES.join("\n");

const provinceCount = patchedProvinces.split("\n").filter(Boolean).length;
const regencyCount = patchedRegencies.split("\n").filter(Boolean).length;
console.log(`Provinsi: ${provinceCount} (termasuk 4 Papua DOB 2022)`);
console.log(`Kab/kota: ${regencyCount}`);

const csvMap = {
  provinces: patchedProvinces,
  regencies: patchedRegencies,
  districts: districtsCsv,
  villages: villagesCsv,
};

const parts = [
  "// AUTO-GENERATED oleh scripts/gen-wilayah.mjs — jangan edit manual.",
  "// Sumber: emsifa/api-wilayah-indonesia + patch Provinsi Papua DOB 2022.",
  "// Catatan: distrik & desa untuk provinsi Papua DOB (92/95/96/97) belum tersedia",
  "//          di emsifa; hanya level provinsi & kab/kota yang ditambahkan.",
];

for (const [name, csv] of Object.entries(csvMap)) {
  const escaped = csv.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  parts.push(`export const ${name}Csv = \`${escaped}\`;`);
}

writeFileSync(join(dataDir, "raw.ts"), parts.join("\n") + "\n", "utf8");
console.log("✓ raw.ts berhasil di-generate");
