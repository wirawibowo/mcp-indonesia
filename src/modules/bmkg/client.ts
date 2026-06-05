/**
 * Client data terbuka BMKG (cuaca & gempa) dengan cache.
 * Sumber: BMKG — wajib dicantumkan sebagai atribusi pada hasil.
 */
import { fetchJson } from "../../core/http.js";
import { TtlCache, TTL } from "../../core/cache.js";

export const BMKG_ATTRIBUTION = {
  source: "Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)",
  url: "https://www.bmkg.go.id",
} as const;

const TEWS_BASE = "https://data.bmkg.go.id/DataMKG/TEWS";
const WEATHER_BASE = "https://api.bmkg.go.id/publik/prakiraan-cuaca";

const cache = new TtlCache();

export interface Earthquake {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi: string;
  Dirasakan?: string;
  Shakemap?: string;
}

interface InfogempaSingle {
  Infogempa: { gempa: Earthquake };
}
interface InfogempaList {
  Infogempa: { gempa: Earthquake[] };
}

/** Tambahkan URL shakemap absolut jika ada. */
function withShakemapUrl(eq: Earthquake): Earthquake & { ShakemapUrl?: string } {
  return eq.Shakemap ? { ...eq, ShakemapUrl: `${TEWS_BASE}/${eq.Shakemap}` } : eq;
}

export async function getLatestEarthquake(): Promise<Earthquake & { ShakemapUrl?: string }> {
  const data = await cache.getOrLoad("autogempa", TTL.MINUTE, () =>
    fetchJson<InfogempaSingle>(`${TEWS_BASE}/autogempa.json`),
  );
  return withShakemapUrl(data.Infogempa.gempa);
}

export type RecentKind = "terkini" | "dirasakan";

export async function getRecentEarthquakes(kind: RecentKind): Promise<Earthquake[]> {
  const file = kind === "dirasakan" ? "gempadirasakan.json" : "gempaterkini.json";
  const data = await cache.getOrLoad(file, TTL.MINUTE, () =>
    fetchJson<InfogempaList>(`${TEWS_BASE}/${file}`),
  );
  return data.Infogempa.gempa;
}

/** Normalisasi kode adm4 ke format bertitik BMKG (PP.RR.SS.VVVV). */
export function normalizeAdm4(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 10)}`;
  }
  return input.trim();
}

export interface WeatherForecast {
  lokasi: Record<string, unknown>;
  data: Array<{ cuaca: unknown[][] }>;
}

export interface WeatherForecastResult {
  adm4: string;
  resolvedFrom?: { code: string; name: string; level: string };
  forecast: WeatherForecast;
}

/**
 * Ambil prakiraan cuaca untuk kode adm4 atau nama desa/kelurahan.
 * Jika `input` berupa nama (bukan digit), cari desa via wilayah repository,
 * ambil yang pertama cocok. Kode 10-digit (mis. "3174041003") juga diterima.
 */
export async function getWeatherForecast(input: string): Promise<WeatherForecastResult> {
  // Cek apakah input berupa kode (digit/titik) atau nama
  const looksLikeCode = /^[\d.]+$/.test(input.trim());

  if (looksLikeCode) {
    const adm4 = normalizeAdm4(input);
    const forecast = await cache.getOrLoad(`weather:${adm4}`, TTL.TEN_MINUTES, () =>
      fetchJson<WeatherForecast>(`${WEATHER_BASE}?adm4=${encodeURIComponent(adm4)}`),
    );
    return { adm4, forecast };
  }

  // Resolve nama → kode wilayah → adm4
  const { search } = await import("../wilayah/repository.js");
  const results = search(input, 10);
  const village = results.find((r) => r.level === "village") ?? results[0];
  if (!village) {
    throw new Error(`Desa/kelurahan '${input}' tidak ditemukan dalam dataset wilayah.`);
  }
  const adm4 = normalizeAdm4(village.code);
  const forecast = await cache.getOrLoad(`weather:${adm4}`, TTL.TEN_MINUTES, () =>
    fetchJson<WeatherForecast>(`${WEATHER_BASE}?adm4=${encodeURIComponent(adm4)}`),
  );
  return {
    adm4,
    resolvedFrom: { code: village.code, name: village.name, level: village.level },
    forecast,
  };
}

/** Reset cache — hanya untuk testing. */
export function _resetCache(): void {
  cache.clear();
}
