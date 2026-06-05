/**
 * Repository kodepos Indonesia — lookup dua arah:
 *  - adm4 (kode wilayah 10 digit) → kodepos
 *  - kodepos (5 digit) → daftar adm4 yang memiliki kode pos tsb
 *
 * Dataset di-bundle (raw.ts) sehingga semua operasi offline.
 */
import { KODEPOS_DATA } from "./data/raw.js";
import { getByCode } from "../wilayah/repository.js";

export interface KodeposEntry {
  adm4: string;
  kodepos: string;
  villageName?: string;
  districtName?: string;
  regencyName?: string;
  provinceName?: string;
}

let byAdm4: Map<string, string> | undefined;
let byKodepos: Map<string, string[]> | undefined;

function load(): void {
  if (byAdm4 && byKodepos) return;
  byAdm4 = new Map();
  byKodepos = new Map();
  for (const [code, kp] of KODEPOS_DATA) {
    byAdm4.set(code, kp);
    const arr = byKodepos.get(kp);
    if (arr) arr.push(code);
    else byKodepos.set(kp, [code]);
  }
}

/** Lookup kodepos berdasarkan adm4 (10 digit, tanpa titik). */
export function getKodepos(adm4: string): string | null {
  load();
  const normalized = adm4.replace(/\./g, "").trim();
  return byAdm4!.get(normalized) ?? null;
}

/** Reverse lookup: kodepos → array adm4 codes. Diperkaya dengan nama wilayah. */
export function searchByKodepos(kodepos: string): KodeposEntry[] {
  load();
  const kp = kodepos.trim().padStart(5, "0");
  const codes = byKodepos!.get(kp);
  if (!codes) return [];

  return codes.map((adm4) => {
    const village = getByCode(adm4);
    const districtCode = adm4.slice(0, 7);
    const regencyCode = adm4.slice(0, 4);
    const provinceCode = adm4.slice(0, 2);
    const entry: KodeposEntry = { adm4, kodepos: kp };
    if (village) entry.villageName = village.name;
    const district = getByCode(districtCode);
    if (district) entry.districtName = district.name;
    const regency = getByCode(regencyCode);
    if (regency) entry.regencyName = regency.name;
    const province = getByCode(provinceCode);
    if (province) entry.provinceName = province.name;
    return entry;
  });
}

/** Reset cache — untuk testing. */
export function _resetCache(): void {
  byAdm4 = undefined;
  byKodepos = undefined;
}
