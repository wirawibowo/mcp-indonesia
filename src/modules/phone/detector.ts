/**
 * Validasi & deteksi operator nomor HP Indonesia (offline).
 *
 * Format yang diterima:
 *   - 08xxxxxxxxxx    (lokal, dimulai dengan 0)
 *   - +628xxxxxxxxxx  (internasional)
 *   - 628xxxxxxxxxx   (tanpa plus)
 *   - Boleh berisi spasi, strip, atau titik — dinormalkan terlebih dahulu.
 *
 * Panjang nomor HP Indonesia: 9-13 digit setelah angka 8 (total 10-14 digit
 * mulai dari 0/62). Standar BRTI: 10-13 digit total dengan prefix 0.
 */
import { PREFIX_MAP, type OperatorPrefix } from "./data/prefixes.js";

export interface PhoneValidateResult {
  valid: boolean;
  reasons: string[];
  /** Nomor dinormalkan dalam format 08xxxxxxxxxx (jika valid). */
  normalized: string;
  /** Nomor dalam format internasional +628xxxxxxxxxx (jika valid). */
  e164?: string;
}

export interface PhoneOperatorResult extends PhoneValidateResult {
  prefix?: string;
  operator?: string;
  brand?: string;
}

const MIN_LENGTH = 10; // 08 + 8 digit
const MAX_LENGTH = 14; // 08 + 12 digit (untuk fleksibilitas Telkomsel)

/** Hilangkan karakter non-digit kecuali leading `+`. */
function stripFormatting(input: string): string {
  return input.replace(/[\s\-.()]/g, "");
}

/**
 * Normalkan input menjadi bentuk lokal `0xxxxxxxxxx`.
 * Mengembalikan `null` jika format tidak dapat dikenali sebagai nomor Indonesia.
 */
export function normalize(input: string): string | null {
  const trimmed = stripFormatting(input).trim();
  if (trimmed.length === 0) return null;

  let local: string;
  if (trimmed.startsWith("+62")) {
    local = "0" + trimmed.slice(3);
  } else if (trimmed.startsWith("62") && !trimmed.startsWith("620")) {
    local = "0" + trimmed.slice(2);
  } else if (trimmed.startsWith("0")) {
    local = trimmed;
  } else {
    return null;
  }

  if (!/^\d+$/.test(local)) return null;
  return local;
}

export function validatePhone(input: string): PhoneValidateResult {
  const reasons: string[] = [];
  const normalized = normalize(input) ?? "";

  if (!normalized) {
    return {
      valid: false,
      reasons: ["Format nomor tidak dikenal. Gunakan 08xx, +628xx, atau 628xx."],
      normalized: stripFormatting(input),
    };
  }

  if (!normalized.startsWith("08")) {
    reasons.push("Nomor HP Indonesia harus diawali dengan 08 (atau +628).");
  }

  if (normalized.length < MIN_LENGTH) {
    reasons.push(`Nomor terlalu pendek (minimal ${MIN_LENGTH} digit).`);
  }

  if (normalized.length > MAX_LENGTH) {
    reasons.push(`Nomor terlalu panjang (maksimal ${MAX_LENGTH} digit).`);
  }

  const valid = reasons.length === 0;
  const result: PhoneValidateResult = {
    valid,
    reasons,
    normalized,
  };
  if (valid) {
    result.e164 = "+62" + normalized.slice(1);
  }
  return result;
}

export function detectOperator(input: string): PhoneOperatorResult {
  const base = validatePhone(input);
  if (!base.valid) return base;

  const prefix = base.normalized.slice(0, 4);
  const match: OperatorPrefix | undefined = PREFIX_MAP.get(prefix);
  if (!match) {
    return {
      ...base,
      prefix,
      // Tidak menggagalkan validasi; struktur boleh valid tetapi operator unknown.
    };
  }

  const result: PhoneOperatorResult = {
    ...base,
    prefix: match.prefix,
    operator: match.operator,
  };
  if (match.brand) result.brand = match.brand;
  return result;
}
