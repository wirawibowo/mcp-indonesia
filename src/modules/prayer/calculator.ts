/**
 * Kalkulasi jadwal sholat & arah kiblat menggunakan adhan-js.
 *
 * adhan-js: high-precision astronomical calculations dari "Astronomical
 * Algorithms" (Jean Meeus). Default method: Singapore (digunakan resmi di
 * Indonesia/Malaysia/Singapura — fajr 20°, isha 18°).
 *
 * Input lokasi:
 *   - "Jakarta" / nama kota dari daftar built-in
 *   - "-6.2088,106.8456" / "lat,lon" eksplisit
 *
 * Format waktu output: HH:mm (24-jam) di zona waktu lokal.
 */
import adhan from "adhan";
import { findCity, type City } from "./data/cities.js";

const { CalculationMethod, Coordinates, PrayerTimes, Qibla } = adhan;

export const CALCULATION_METHODS = [
  "Singapore",
  "MuslimWorldLeague",
  "Egyptian",
  "Karachi",
  "UmmAlQura",
  "Dubai",
  "Kuwait",
  "Qatar",
  "Turkey",
] as const;

export type CalculationMethodName = (typeof CALCULATION_METHODS)[number];

export interface LocationInput {
  city?: string;
  lat?: number;
  lon?: number;
  /** UTC offset jam (default: dideteksi dari kota; jika koordinat manual, default 7 WIB). */
  utcOffset?: number;
}

export interface PrayerTimesResult {
  location: { name: string; lat: number; lon: number; utcOffset: number };
  date: string;
  method: CalculationMethodName;
  times: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
}

export interface QiblaResult {
  location: { name: string; lat: number; lon: number };
  qiblaDegrees: number;
  /** Cardinal direction (cth. "Barat-Laut"). */
  cardinal: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseLocation(input: LocationInput): {
  name: string;
  lat: number;
  lon: number;
  utcOffset: number;
} {
  if (input.city) {
    const city = findCity(input.city);
    if (!city) {
      throw new Error(
        `Kota '${input.city}' tidak ada di daftar built-in. Gunakan koordinat eksplisit (lat, lon).`,
      );
    }
    return { name: city.name, lat: city.lat, lon: city.lon, utcOffset: city.utcOffset };
  }
  if (typeof input.lat === "number" && typeof input.lon === "number") {
    const utcOffset = input.utcOffset ?? inferOffset(input.lon);
    return { name: `${input.lat},${input.lon}`, lat: input.lat, lon: input.lon, utcOffset };
  }
  throw new Error("Berikan `city` (cth. 'Jakarta') atau `lat`+`lon`.");
}

/** Tebak zona waktu Indonesia dari bujur: <115=WIB, 115-127=WITA, >127=WIT. */
function inferOffset(lon: number): number {
  if (lon < 115) return 7;
  if (lon < 127) return 8;
  return 9;
}

function getMethodParams(method: CalculationMethodName): adhan.CalculationParameters {
  const factory = CalculationMethod[method] as () => adhan.CalculationParameters;
  if (typeof factory !== "function") {
    throw new Error(`Method tidak dikenal: ${method}`);
  }
  return factory.call(CalculationMethod);
}

function formatTimeAtOffset(date: Date, utcOffset: number): string {
  // Convert UTC-stamped Date ke HH:mm di zona target.
  const ms = date.getTime() + utcOffset * 3600 * 1000;
  const local = new Date(ms);
  const h = String(local.getUTCHours()).padStart(2, "0");
  const m = String(local.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function parseDate(input?: string): Date {
  if (!input) return new Date();
  if (!ISO_DATE.test(input)) {
    throw new Error(`Format tanggal harus YYYY-MM-DD, dapat '${input}'.`);
  }
  // Parse sebagai midday lokal supaya tidak ada drift cross-day.
  return new Date(`${input}T12:00:00Z`);
}

export function computePrayerTimes(
  location: LocationInput,
  date?: string,
  method: CalculationMethodName = "Singapore",
): PrayerTimesResult {
  const loc = parseLocation(location);
  const d = parseDate(date);
  const coords = new Coordinates(loc.lat, loc.lon);
  const params = getMethodParams(method);
  // PrayerTimes expects a Date object — adhan internally treats it as local
  // calendar date for the given coordinates.
  const pt = new PrayerTimes(coords, d, params);

  const isoDate = d.toISOString().slice(0, 10);

  return {
    location: loc,
    date: isoDate,
    method,
    times: {
      fajr: formatTimeAtOffset(pt.fajr, loc.utcOffset),
      sunrise: formatTimeAtOffset(pt.sunrise, loc.utcOffset),
      dhuhr: formatTimeAtOffset(pt.dhuhr, loc.utcOffset),
      asr: formatTimeAtOffset(pt.asr, loc.utcOffset),
      maghrib: formatTimeAtOffset(pt.maghrib, loc.utcOffset),
      isha: formatTimeAtOffset(pt.isha, loc.utcOffset),
    },
  };
}

const CARDINAL_NAMES = [
  "Utara",
  "Timur-Laut",
  "Timur",
  "Tenggara",
  "Selatan",
  "Barat-Daya",
  "Barat",
  "Barat-Laut",
];

function toCardinal(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const idx = Math.round(normalized / 45) % 8;
  return CARDINAL_NAMES[idx]!;
}

export function computeQibla(location: LocationInput): QiblaResult {
  const loc = parseLocation(location);
  const coords = new Coordinates(loc.lat, loc.lon);
  const qiblaDegrees = Qibla(coords);
  return {
    location: { name: loc.name, lat: loc.lat, lon: loc.lon },
    qiblaDegrees: Math.round(qiblaDegrees * 100) / 100,
    cardinal: toCardinal(qiblaDegrees),
  };
}

export type { City };
