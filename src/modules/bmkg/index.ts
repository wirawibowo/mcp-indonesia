/**
 * Modul BMKG — tools cuaca & gempa. Atribusi BMKG wajib pada setiap hasil.
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonResult, errorResult } from "../../core/types.js";
import { HttpError } from "../../core/http.js";
import {
  getLatestEarthquake,
  getRecentEarthquakes,
  getWeatherForecast,
  BMKG_ATTRIBUTION,
} from "./client.js";

function toError(err: unknown): ReturnType<typeof errorResult> {
  if (err instanceof HttpError) return errorResult(err.message);
  return errorResult("Gagal mengambil data BMKG.");
}

export function register(server: McpServer): void {
  server.registerTool(
    "bmkg_latest_earthquake",
    { description: "Informasi gempa bumi terkini (terakhir) di Indonesia dari BMKG." },
    async () => {
      try {
        return jsonResult(await getLatestEarthquake(), BMKG_ATTRIBUTION);
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.registerTool(
    "bmkg_recent_earthquakes",
    {
      description:
        "Daftar 15 gempa terakhir. 'terkini' = magnitudo M≥5.0; 'dirasakan' = gempa yang dirasakan warga.",
      inputSchema: {
        kind: z
          .enum(["terkini", "dirasakan"])
          .optional()
          .describe("Jenis daftar (default 'terkini')."),
      },
    },
    async ({ kind }) => {
      try {
        return jsonResult(await getRecentEarthquakes(kind ?? "terkini"), BMKG_ATTRIBUTION);
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.registerTool(
    "bmkg_weather_forecast",
    {
      description:
        "Prakiraan cuaca 3 harian per desa/kelurahan dari BMKG. Bisa diisi kode adm4 (mis. '3174041003' atau '31.74.04.1003') ATAU nama desa/kelurahan (mis. 'Menteng', 'Cibadak'). Jika nama desa tidak unik, hasil pertama yang cocok digunakan.",
      inputSchema: {
        query: z
          .string()
          .describe("Kode adm4 (10 digit / format PP.RR.SS.VVVV) atau nama desa/kelurahan."),
      },
    },
    async ({ query }) => {
      try {
        return jsonResult(await getWeatherForecast(query), BMKG_ATTRIBUTION);
      } catch (err) {
        return toError(err);
      }
    },
  );
}
