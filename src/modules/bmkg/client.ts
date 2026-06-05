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

export async function getWeatherForecast(adm4: string): Promise<WeatherForecast> {
  const code = normalizeAdm4(adm4);
  return cache.getOrLoad(`weather:${code}`, TTL.TEN_MINUTES, () =>
    fetchJson<WeatherForecast>(`${WEATHER_BASE}?adm4=${encodeURIComponent(code)}`),
  );
}

/** Reset cache — hanya untuk testing. */
export function _resetCache(): void {
  cache.clear();
}
