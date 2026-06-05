/**
 * Modul Finance — kurs mata uang dan harga saham IDX.
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonResult, errorResult } from "../../core/types.js";
import { getExchangeRate, FX_ATTRIBUTION, getIdxQuote, IDX_ATTRIBUTION } from "./client.js";

export function register(server: McpServer): void {
  server.registerTool(
    "finance_exchange_rate",
    {
      description:
        "Kurs mata uang terhadap basis tertentu (default basis USD), termasuk IDR. Kurs referensi pasar, bukan JISDOR Bank Indonesia.",
      inputSchema: {
        base: z.string().length(3).optional().describe("Kode mata uang basis ISO-4217, mis. 'USD' (default)."),
        symbols: z
          .array(z.string().length(3))
          .optional()
          .describe("Daftar mata uang target, mis. ['IDR','SGD']. Default: IDR + mata uang utama."),
      },
    },
    async ({ base, symbols }) => {
      try {
        return jsonResult(await getExchangeRate(base ?? "USD", symbols), FX_ATTRIBUTION);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : "Gagal mengambil kurs.");
      }
    },
  );

  server.registerTool(
    "finance_idx_quote",
    {
      description:
        "Harga saham IDX (Bursa Efek Indonesia) via Yahoo Finance. Data tidak resmi dan mungkin tertunda ~15 menit. Masukkan kode saham 4 huruf, mis. 'BBCA', 'TLKM', 'GOTO'.",
      inputSchema: {
        ticker: z.string().min(1).max(10).describe("Kode saham IDX, mis. 'BBCA' atau 'BBCA.JK'."),
      },
    },
    async ({ ticker }) => {
      try {
        return jsonResult(await getIdxQuote(ticker), IDX_ATTRIBUTION);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : "Gagal mengambil data saham.");
      }
    },
  );
}
