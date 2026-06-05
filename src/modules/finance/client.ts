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

// ── IDX Stock Quote (Yahoo Finance) ─────────────────────────────────────────

export const IDX_ATTRIBUTION = {
  source: "Yahoo Finance — data pasar tidak resmi, mungkin tertunda 15 menit",
  url: "https://finance.yahoo.com",
} as const;

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

interface YahooMeta {
  currency: string;
  symbol: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketTime: number;
  marketState: string;
  exchangeName: string;
  shortName?: string;
  longName?: string;
}

interface YahooChartResponse {
  chart: {
    result?: Array<{ meta: YahooMeta }>;
    error?: { code: string; description: string };
  };
}

export interface IdxQuoteResult {
  ticker: string;
  name?: string;
  price: number;
  currency: string;
  changePercent: number;
  volume: number;
  marketState: string;
  exchange: string;
  timestamp: number;
}

/**
 * Ambil harga saham IDX lewat Yahoo Finance (tidak resmi, bisa delay ~15 menit).
 * Ticker cukup 4 huruf (mis. "BBCA") — suffix ".JK" ditambahkan otomatis.
 */
export async function getIdxQuote(ticker: string): Promise<IdxQuoteResult> {
  const normalized = ticker.trim().toUpperCase().replace(/\.JK$/i, "");
  if (!/^[A-Z0-9]{1,10}$/.test(normalized)) {
    throw new Error(`Kode saham tidak valid: '${ticker}'. Gunakan kode IDX, mis. 'BBCA'.`);
  }
  const symbol = `${normalized}.JK`;
  return cache.getOrLoad(`idx:${symbol}`, TTL.MINUTE, async () => {
    const data = await fetchJson<YahooChartResponse>(`${YAHOO_BASE}/${encodeURIComponent(symbol)}`, {
      headers: { "User-Agent": "mcp-indonesia/0.1 (+https://github.com/wirawibowo/mcp-indonesia)" },
    });
    if (data.chart.error) {
      throw new Error(`Saham '${normalized}' tidak ditemukan di IDX / Yahoo Finance.`);
    }
    const meta = data.chart.result?.[0]?.meta;
    if (!meta) throw new Error(`Data untuk '${normalized}' tidak tersedia.`);
    return {
      ticker: normalized,
      name: meta.longName ?? meta.shortName,
      price: meta.regularMarketPrice,
      currency: meta.currency,
      changePercent: meta.regularMarketChangePercent,
      volume: meta.regularMarketVolume,
      marketState: meta.marketState,
      exchange: meta.exchangeName,
      timestamp: meta.regularMarketTime,
    };
  });
}

/** Reset cache — hanya untuk testing. */
export function _resetCache(): void {
  cache.clear();
}
