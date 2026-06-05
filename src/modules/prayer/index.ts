/**
 * Modul Prayer — jadwal sholat & arah kiblat (offline, kalkulasi astronomi).
 *
 * Tidak ada panggilan jaringan — semua perhitungan via adhan-js.
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonResult, errorResult } from "../../core/types.js";
import {
  computePrayerTimes,
  computeQibla,
  CALCULATION_METHODS,
} from "./calculator.js";
import { CITIES } from "./data/cities.js";

const ATTRIBUTION = {
  source: "adhan-js (Astronomical Algorithms — Jean Meeus)",
  url: "https://github.com/batoulapps/adhan-js",
};

const METHOD_ENUM = z.enum(CALCULATION_METHODS);

const LOCATION_SCHEMA = {
  city: z.string().optional().describe(`Nama kota (cth. 'Jakarta'). Tersedia: ${CITIES.map((c) => c.name).join(", ")}.`),
  lat: z.number().min(-90).max(90).optional().describe("Lintang (latitude)."),
  lon: z.number().min(-180).max(180).optional().describe("Bujur (longitude)."),
  utcOffset: z.number().int().min(-12).max(14).optional().describe("UTC offset (jam). Otomatis untuk kota built-in."),
};

export function register(server: McpServer): void {
  server.registerTool(
    "prayer_times",
    {
      description:
        "Jadwal sholat (Subuh, Dhuhr, Ashar, Maghrib, Isya) + matahari terbit. Lokasi via nama kota Indonesia atau lat/lon. Default method: Singapore (Kemenag-style untuk Indonesia).",
      inputSchema: {
        ...LOCATION_SCHEMA,
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Tanggal YYYY-MM-DD (default: hari ini)."),
        method: METHOD_ENUM.optional().describe("Metode kalkulasi. Default: Singapore."),
      },
    },
    async (args) => {
      try {
        const result = computePrayerTimes(
          { city: args.city, lat: args.lat, lon: args.lon, utcOffset: args.utcOffset },
          args.date,
          args.method,
        );
        return jsonResult(result, ATTRIBUTION);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    "prayer_qibla",
    {
      description:
        "Hitung arah kiblat dalam derajat dari Utara (searah jarum jam). 0° = Utara, 90° = Timur, dst.",
      inputSchema: LOCATION_SCHEMA,
    },
    async (args) => {
      try {
        const result = computeQibla({
          city: args.city,
          lat: args.lat,
          lon: args.lon,
          utcOffset: args.utcOffset,
        });
        return jsonResult(result, ATTRIBUTION);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
