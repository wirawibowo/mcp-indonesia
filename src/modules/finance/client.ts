/**
 * Client kurs mata uang (referensi pasar) dengan cache.
 *
 * Sumber: open.er-api.com (ExchangeRate-API, tier gratis tanpa API key).
 * Catatan: ini kurs referensi pasar, BUKAN kurs resmi JISDOR Bank Indonesia
 * (BI tidak menyediakan JSON API publik). Disebutkan jelas pada atribusi.
 */
import { fetchJson } from "../../core/http.js";
import { TtlCache, TTL } from "../../core/cache.js";

export const FX_ATTRIBUTION = {
  source: "ExchangeRate-API (open.er-api.com) — kurs referensi pasar, bukan JISDOR BI",
  url: "https://www.exchangerate-api.com",
} as const;

const BASE = "https://open.er-api.com/v6/latest";
const cache = new TtlCache();

interface ErApiResponse {
  result: string;
  provider?: string;
  time_last_update_utc?: string;
  base_code: string;
  rates: Record<string, number>;
}

export interface ExchangeRateResult {
  base: string;
  lastUpdate?: string;
  rates: Record<string, number>;
}

/**
 * Ambil kurs `base` terhadap daftar `symbols` (default: IDR + mata uang utama).
 * `base` default USD.
 */
export async function getExchangeRate(
  base = "USD",
  symbols?: string[],
): Promise<ExchangeRateResult> {
  const baseCode = base.toUpperCase();
  const data = await cache.getOrLoad(`fx:${baseCode}`, TTL.SIX_HOURS, () =>
    fetchJson<ErApiResponse>(`${BASE}/${encodeURIComponent(baseCode)}`),
  );

  if (data.result !== "success") {
    throw new Error(`Kurs untuk basis '${baseCode}' tidak tersedia.`);
  }

  const wanted =
    symbols && symbols.length > 0
      ? symbols.map((s) => s.toUpperCase())
      : ["IDR", "USD", "EUR", "SGD", "JPY", "CNY", "MYR", "AUD"];

  const rates: Record<string, number> = {};
  for (const sym of wanted) {
    const value = data.rates[sym];
    if (typeof value === "number") rates[sym] = value;
  }

  return { base: baseCode, lastUpdate: data.time_last_update_utc, rates };
}

/** Reset cache — hanya untuk testing. */
export function _resetCache(): void {
  cache.clear();
}
