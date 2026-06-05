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

// ── BI JISDOR (Kurs Resmi Bank Indonesia) ───────────────────────────────────

export const JISDOR_ATTRIBUTION = {
  source: "Bank Indonesia — JISDOR (Jakarta Interbank Spot Dollar Rate)",
  url: "https://www.bi.go.id/id/statistik/informasi-kurs/jisdor/default.aspx",
} as const;

const JISDOR_ENDPOINT = "https://www.bi.go.id/biwebservice/wskursbi.asmx/getSubKursLokal3";

export interface JisdorResult {
  currency: string;
  date: string;
  /** Kurs Beli BI. */
  buyRate: number;
  /** Kurs Jual BI. */
  sellRate: number;
  /** Midpoint (rerata buy+sell). */
  midRate: number;
}

interface SubKursItem {
  mts_kd?: string | string[];
  kurs_jual?: string | string[];
  kurs_beli?: string | string[];
  tgl_subkurslokal?: string | string[];
}

function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Ambil kurs JISDOR resmi BI untuk `currency` (default USD).
 * Endpoint BI cukup sering tidak responsif — error message mengarahkan ke laman BI.
 * Cache 6 jam (JISDOR dipublish pukul 15:15 WIB tiap hari kerja).
 */
export async function getJisdor(currency = "USD", date?: string): Promise<JisdorResult> {
  const code = currency.toUpperCase();
  const end = date ? new Date(`${date}T00:00:00Z`) : new Date();
  const start = new Date(end.getTime() - 6 * 24 * 3600 * 1000);
  const startStr = toIsoDate(start);
  const endStr = toIsoDate(end);
  const cacheKey = `jisdor:${code}:${startStr}:${endStr}`;

  return cache.getOrLoad(cacheKey, TTL.SIX_HOURS, async () => {
    const url = `${JISDOR_ENDPOINT}?mts=${encodeURIComponent(code)}&startdate=${startStr}&enddate=${endStr}`;
    const { XMLParser } = await import("fast-xml-parser");
    let xml: string;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(10_000),
        headers: { Accept: "application/xml,text/xml,*/*" },
      });
      if (!res.ok) {
        throw new Error(`BI endpoint mengembalikan HTTP ${res.status}.`);
      }
      xml = await res.text();
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Endpoint BI JISDOR tidak dapat diakses (${reason}). Cek manual: https://www.bi.go.id/id/statistik/informasi-kurs/jisdor/default.aspx`,
      );
    }

    const parser = new XMLParser({ ignoreAttributes: true });
    const parsed = parser.parse(xml) as Record<string, unknown>;
    const records = extractRecords(parsed);
    if (records.length === 0) {
      throw new Error(
        `Tidak ada data JISDOR untuk '${code}' pada rentang ${startStr}..${endStr}. Coba tanggal hari kerja sebelumnya.`,
      );
    }
    records.sort((a, b) => b.date.localeCompare(a.date));
    return records[0]!;
  });
}

function extractRecords(parsed: Record<string, unknown>): JisdorResult[] {
  const result: JisdorResult[] = [];
  const stack: unknown[] = [parsed];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    const rec = node as Record<string, unknown>;
    const subkurs = rec.mt_kurs_lokal_subkursLokal3;
    if (subkurs) {
      const items = Array.isArray(subkurs) ? subkurs : [subkurs];
      for (const raw of items) {
        const it = raw as SubKursItem;
        const date = String(getFirst(it.tgl_subkurslokal) ?? "").slice(0, 10);
        const sell = Number(getFirst(it.kurs_jual) ?? NaN);
        const buy = Number(getFirst(it.kurs_beli) ?? NaN);
        const code = String(getFirst(it.mts_kd) ?? "").trim();
        if (!date || Number.isNaN(sell) || Number.isNaN(buy)) continue;
        result.push({
          currency: code,
          date,
          buyRate: buy,
          sellRate: sell,
          midRate: (buy + sell) / 2,
        });
      }
    }
    for (const v of Object.values(node)) {
      if (v && typeof v === "object") stack.push(v);
    }
  }
  return result;
}

function getFirst<T>(v: T | T[] | undefined): T | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

/** Reset cache — hanya untuk testing. */
export function _resetCache(): void {
  cache.clear();
}
