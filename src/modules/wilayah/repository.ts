/**
 * Repository data wilayah administratif Indonesia.
 *
 * Memuat dataset dari CSV mentah (di-bundle via raw.ts) sekali saat pertama
 * diakses (lazy), lalu menyediakan query hierarki & pencarian. Murni offline.
 *
 * Sumber data: emsifa/api-wilayah-indonesia.
 */
import { provincesCsv, regenciesCsv, districtsCsv, villagesCsv } from "./data/raw.js";

export interface Region {
  code: string;
  name: string;
  /** Kode induk (kosong untuk provinsi). */
  parentCode?: string;
}

export interface RegionDetail {
  village?: Region;
  district?: Region;
  regency?: Region;
  province?: Region;
}

export const WILAYAH_ATTRIBUTION = {
  source: "emsifa/api-wilayah-indonesia",
  url: "https://github.com/emsifa/api-wilayah-indonesia",
} as const;

/** Parse baris CSV "kode,(induk,)nama" menjadi Region. */
function parseCsv(csv: string, hasParent: boolean): Region[] {
  const out: Region[] = [];
  for (const line of csv.split("\n")) {
    if (!line) continue;
    if (hasParent) {
      const i1 = line.indexOf(",");
      const i2 = line.indexOf(",", i1 + 1);
      out.push({
        code: line.slice(0, i1),
        parentCode: line.slice(i1 + 1, i2),
        name: line.slice(i2 + 1),
      });
    } else {
      const i1 = line.indexOf(",");
      out.push({ code: line.slice(0, i1), name: line.slice(i1 + 1) });
    }
  }
  return out;
}

interface Dataset {
  provinces: Region[];
  regencies: Region[];
  districts: Region[];
  villages: Region[];
  byCode: Map<string, Region>;
}

let cached: Dataset | undefined;

function load(): Dataset {
  if (cached) return cached;
  const provinces = parseCsv(provincesCsv, false);
  const regencies = parseCsv(regenciesCsv, true);
  const districts = parseCsv(districtsCsv, true);
  const villages = parseCsv(villagesCsv, true);
  const byCode = new Map<string, Region>();
  for (const list of [provinces, regencies, districts, villages]) {
    for (const r of list) byCode.set(r.code, r);
  }
  cached = { provinces, regencies, districts, villages, byCode };
  return cached;
}

export function listProvinces(): Region[] {
  return load().provinces;
}

export function listChildren(parentCode: string): Region[] {
  const ds = load();
  // Tentukan level anak berdasarkan panjang kode induk.
  const len = parentCode.length;
  const source =
    len === 2 ? ds.regencies : len === 4 ? ds.districts : len === 7 ? ds.villages : [];
  return source.filter((r) => r.parentCode === parentCode);
}

/** Pencarian nama lintas level (case-insensitive substring). */
export function search(query: string, limit = 25): Array<Region & { level: string }> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const ds = load();
  const levels: Array<[string, Region[]]> = [
    ["province", ds.provinces],
    ["regency", ds.regencies],
    ["district", ds.districts],
    ["village", ds.villages],
  ];
  const results: Array<Region & { level: string }> = [];
  for (const [level, list] of levels) {
    for (const r of list) {
      if (r.name.toLowerCase().includes(q)) {
        results.push({ ...r, level });
        if (results.length >= limit) return results;
      }
    }
  }
  return results;
}

/** Resolusi hierarki lengkap dari kode apa pun (provinsi..desa). */
export function detail(code: string): RegionDetail {
  const ds = load();
  const result: RegionDetail = {};
  const region = ds.byCode.get(code);
  if (!region) return result;

  // Kode desa 10 digit; kecamatan 7; kab/kota 4; provinsi 2.
  const provinceCode = code.slice(0, 2);
  const regencyCode = code.length >= 4 ? code.slice(0, 4) : undefined;
  const districtCode = code.length >= 7 ? code.slice(0, 7) : undefined;
  const villageCode = code.length >= 10 ? code.slice(0, 10) : undefined;

  result.province = ds.byCode.get(provinceCode);
  if (regencyCode) result.regency = ds.byCode.get(regencyCode);
  if (districtCode) result.district = ds.byCode.get(districtCode);
  if (villageCode) result.village = ds.byCode.get(villageCode);
  return result;
}

/** Lookup satu region dari kode (atau undefined). */
export function getByCode(code: string): Region | undefined {
  return load().byCode.get(code);
}

/** Reset cache — hanya untuk testing. */
export function _resetCache(): void {
  cached = undefined;
}
