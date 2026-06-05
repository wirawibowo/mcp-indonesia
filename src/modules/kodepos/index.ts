/**
 * Modul Kodepos — lookup kode pos Indonesia ↔ kode wilayah administratif.
 *
 * Sumber: cahyadsn/wilayah_kodepos berdasarkan Kepmendagri No 300.2.2-2138/2025.
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonResult, errorResult } from "../../core/types.js";
import { getKodepos, searchByKodepos } from "./repository.js";

const ATTRIBUTION = {
  source: "cahyadsn/wilayah_kodepos (Kepmendagri No 300.2.2-2138 Tahun 2025)",
  url: "https://github.com/cahyadsn/wilayah_kodepos",
};

export function register(server: McpServer): void {
  server.registerTool(
    "kodepos_get",
    {
      description:
        "Lookup kode pos berdasarkan kode wilayah adm4 (10 digit, level desa/kelurahan). Cth: 3174041003 → 12950.",
      inputSchema: {
        adm4: z.string().describe("Kode wilayah 10 digit (kelurahan/desa), boleh dengan/atau tanpa titik."),
      },
    },
    async ({ adm4 }) => {
      const kp = getKodepos(adm4);
      if (!kp) return errorResult(`Kodepos untuk kode wilayah '${adm4}' tidak ditemukan.`);
      return jsonResult({ adm4: adm4.replace(/\./g, ""), kodepos: kp }, ATTRIBUTION);
    },
  );

  server.registerTool(
    "kodepos_search",
    {
      description:
        "Reverse lookup: cari semua desa/kelurahan yang memiliki kode pos tertentu. Cth: 12950 → daftar desa di Mampang Prapatan, dll.",
      inputSchema: {
        kodepos: z.string().regex(/^\d{4,5}$/).describe("Kode pos 5 digit."),
      },
    },
    async ({ kodepos }) => {
      const results = searchByKodepos(kodepos);
      if (results.length === 0) {
        return errorResult(`Kode pos '${kodepos}' tidak ditemukan.`);
      }
      return jsonResult({ kodepos, count: results.length, results }, ATTRIBUTION);
    },
  );
}
