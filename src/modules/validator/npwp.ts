/**
 * Validasi & dekode NPWP (Nomor Pokok Wajib Pajak).
 *
 * Mendukung dua format:
 *  - 15 digit (lama): 99.999.999.9-999.999
 *      digit 1-2   : kode jenis wajib pajak
 *      digit 3-8   : nomor registrasi
 *      digit 9     : digit pengecekan (DJP tidak mempublikasikan algoritmanya,
 *                    sehingga TIDAK divalidasi — hanya diekspos sebagai nilai)
 *      digit 10-12 : kode KPP
 *      digit 13-15 : kode status (000 = pusat, selain itu = cabang)
 *  - 16 digit (baru, berlaku penuh sejak 2024): selaras dengan NIK untuk WP
 *      orang pribadi. Hanya divalidasi panjang & format.
 *
 * Karena tidak ada checksum resmi yang dipublikasikan, validasi bersifat
 * struktural (format), bukan kriptografis.
 */

export interface NpwpResult {
  valid: boolean;
  reasons: string[];
  normalized: string;
  format: "15-digit" | "16-digit" | "unknown";
  taxpayerTypeCode?: string;
  registrationNumber?: string;
  checkDigit?: string;
  kppCode?: string;
  branch?: string;
  isHeadOffice?: boolean;
}

export function validateNpwp(input: string): NpwpResult {
  const normalized = input.replace(/\D/g, "");

  if (normalized.length === 15) {
    const branch = normalized.slice(12, 15);
    return {
      valid: true,
      reasons: [],
      normalized,
      format: "15-digit",
      taxpayerTypeCode: normalized.slice(0, 2),
      registrationNumber: normalized.slice(2, 8),
      checkDigit: normalized.slice(8, 9),
      kppCode: normalized.slice(9, 12),
      branch,
      isHeadOffice: branch === "000",
    };
  }

  if (normalized.length === 16) {
    return {
      valid: true,
      reasons: [],
      normalized,
      format: "16-digit",
    };
  }

  return {
    valid: false,
    reasons: [
      `Panjang NPWP tidak valid (${normalized.length} digit). Harus 15 (format lama) atau 16 (format baru).`,
    ],
    normalized,
    format: "unknown",
  };
}
