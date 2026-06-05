/**
 * Modul Holiday — hari libur nasional & cuti bersama Indonesia (bundled).
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonResult, errorResult } from "../../core/types.js";
import {
  checkHoliday,
  listHolidays,
  nextHoliday,
  dataYearRange,
} from "./repository.js";

const ATTRIBUTION = {
  source: "api-hari-libur (andifahruddinakas) — SKB 3 Menteri",
  url: "https://github.com/andifahruddinakas/api-hari-libur",
};

const HOLIDAY_TYPE = z.enum(["national", "cuti_bersama"]);

export function register(server: McpServer): void {
  server.registerTool(
    "holiday_check",
    {
      description:
        "Cek apakah tanggal tertentu adalah hari libur nasional atau cuti bersama di Indonesia.",
      inputSchema: {
        date: z.string().describe("Tanggal format YYYY-MM-DD (cth. 2026-08-17)."),
      },
    },
    async ({ date }) => {
      const result = checkHoliday(date);
      if (!result) return errorResult(`Format tanggal tidak valid: '${date}'. Gunakan YYYY-MM-DD.`);
      return jsonResult(result, ATTRIBUTION);
    },
  );

  server.registerTool(
    "holiday_list",
    {
      description:
        "Daftar hari libur nasional & cuti bersama untuk tahun tertentu. Bisa difilter tipe.",
      inputSchema: {
        year: z.number().int().min(2000).max(2100).describe("Tahun, cth. 2026."),
        type: HOLIDAY_TYPE.optional().describe("Filter: 'national' atau 'cuti_bersama'."),
      },
    },
    async ({ year, type }) => {
      const range = dataYearRange();
      if (year < range.min || year > range.max) {
        return errorResult(
          `Tahun ${year} di luar cakupan dataset (${range.min}-${range.max}). Jalankan scripts/gen-holiday.mjs untuk refresh.`,
        );
      }
      const results = listHolidays(year, type);
      return jsonResult({ year, type: type ?? "all", count: results.length, results }, ATTRIBUTION);
    },
  );

  server.registerTool(
    "holiday_next",
    {
      description:
        "Hari libur berikutnya dari tanggal tertentu (default: hari ini). Berguna untuk perencanaan jadwal.",
      inputSchema: {
        from: z
          .string()
          .optional()
          .describe("Tanggal awal YYYY-MM-DD (default: hari ini)."),
        type: HOLIDAY_TYPE.optional().describe("Filter: 'national' atau 'cuti_bersama'."),
      },
    },
    async ({ from, type }) => {
      const next = nextHoliday(from, type);
      if (!next) return errorResult("Tidak ada hari libur berikutnya dalam cakupan dataset.");
      return jsonResult(next, ATTRIBUTION);
    },
  );
}
