/**
 * Validasi & dekode NIK (Nomor Induk Kependudukan) — 16 digit.
 *
 * Struktur: PP RR SS DDMMYY NNNN
 *  - PP (2): kode provinsi      → diselaraskan dengan dataset wilayah
 *  - RR (2): kode kab/kota      → 4 digit pertama selaras dengan dataset wilayah
 *  - SS (2): kode kecamatan     → TIDAK 1:1 dengan kode kecamatan emsifa (3 digit),
 *                                 jadi hanya dikembalikan sebagai kode mentah.
 *  - DDMMYY (6): tanggal lahir; DD+40 menandai perempuan.
 *  - NNNN (4): nomor urut.
 */
import { getByCode, type Region } from "../wilayah/repository.js";

export interface NikResult {
  valid: boolean;
  reasons: string[];
  normalized: string;
  province?: Pick<Region, "code" | "name">;
  regency?: Pick<Region, "code" | "name">;
  kecamatanCode?: string;
  birthDate: { day: number; month: number; year: number } | null;
  gender: "L" | "P" | null;
  serial?: string;
}

export interface NikOptions {
  /** Tahun acuan untuk resolusi abad (default: tahun berjalan). */
  referenceYear?: number;
}

const FEMALE_DAY_OFFSET = 40;

export function validateNik(input: string, opts: NikOptions = {}): NikResult {
  const reasons: string[] = [];
  const normalized = input.replace(/\s/g, "");

  if (!/^\d{16}$/.test(normalized)) {
    return {
      valid: false,
      reasons: ["NIK harus terdiri dari 16 digit angka."],
      normalized,
      birthDate: null,
      gender: null,
    };
  }

  const provinceCode = normalized.slice(0, 2);
  const regencyCode = normalized.slice(0, 4);
  const kecamatanCode = normalized.slice(4, 6);
  const dd = Number(normalized.slice(6, 8));
  const mm = Number(normalized.slice(8, 10));
  const yy = Number(normalized.slice(10, 12));
  const serial = normalized.slice(12, 16);

  const province = getByCode(provinceCode);
  if (!province) reasons.push(`Kode provinsi '${provinceCode}' tidak dikenal.`);
  const regency = getByCode(regencyCode);
  if (!regency) reasons.push(`Kode kabupaten/kota '${regencyCode}' tidak dikenal.`);

  const gender: "L" | "P" = dd > FEMALE_DAY_OFFSET ? "P" : "L";
  const actualDay = dd > FEMALE_DAY_OFFSET ? dd - FEMALE_DAY_OFFSET : dd;

  const referenceYear = opts.referenceYear ?? new Date().getFullYear();
  const pivot = referenceYear % 100;
  const year = yy <= pivot ? 2000 + yy : 1900 + yy;

  let birthDate: NikResult["birthDate"] = null;
  if (mm < 1 || mm > 12 || actualDay < 1 || actualDay > 31) {
    reasons.push("Tanggal lahir pada NIK tidak valid.");
  } else {
    birthDate = { day: actualDay, month: mm, year };
  }

  return {
    valid: reasons.length === 0,
    reasons,
    normalized,
    province: province ? { code: province.code, name: province.name } : undefined,
    regency: regency ? { code: regency.code, name: regency.name } : undefined,
    kecamatanCode,
    birthDate,
    gender,
    serial,
  };
}
