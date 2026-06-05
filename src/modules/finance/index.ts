/**
 * Modul Finance — tool kurs mata uang (referensi pasar).
 * IDX & OJK belum tersedia (lihat README "Roadmap") karena tidak ada API
 * publik resmi yang andal.
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonResult, errorResult } from "../../core/types.js";
import { getExchangeRate, FX_ATTRIBUTION } from "./client.js";

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
}
