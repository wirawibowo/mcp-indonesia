/**
 * Modul Bank — daftar bank Indonesia (kode kliring 3-digit & SWIFT/BIC), offline.
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonResult, errorResult } from "../../core/types.js";
import { listBanks, getBank, searchBank } from "./repository.js";

const ATTRIBUTION = {
  source: "Bank Indonesia — Daftar Bank + SWIFT/BIC registry",
  url: "https://www.bi.go.id/id/publikasi/data/Daftar-Bank.aspx",
};

const BANK_TYPE = z.enum(["umum", "syariah", "asing", "pembangunan"]);

export function register(server: McpServer): void {
  server.registerTool(
    "bank_list",
    {
      description:
        "Daftar bank di Indonesia (BUMN, swasta, syariah, BPD, dan bank asing) beserta kode kliring 3-digit dan SWIFT/BIC.",
      inputSchema: {
        type: BANK_TYPE.optional().describe("Filter jenis bank: umum, syariah, asing, atau pembangunan."),
      },
    },
    async ({ type }) => jsonResult(listBanks(type), ATTRIBUTION),
  );

  server.registerTool(
    "bank_get",
    {
      description: "Detail bank berdasarkan kode kliring (3 digit angka) atau kode SWIFT/BIC (8-11 karakter).",
      inputSchema: {
        query: z.string().describe("Kode kliring (cth. '014') atau SWIFT (cth. 'CENAIDJA')."),
      },
    },
    async ({ query }) => {
      const bank = getBank(query);
      if (!bank) return errorResult(`Bank dengan kode/SWIFT '${query}' tidak ditemukan.`);
      return jsonResult(bank, ATTRIBUTION);
    },
  );

  server.registerTool(
    "bank_search",
    {
      description: "Cari bank Indonesia berdasarkan nama lengkap atau alias (substring, case-insensitive).",
      inputSchema: {
        query: z.string().min(2).describe("Nama bank, cth. 'BCA' atau 'Mandiri'. Minimal 2 karakter."),
      },
    },
    async ({ query }) => {
      const results = searchBank(query);
      return jsonResult({ query, count: results.length, results }, ATTRIBUTION);
    },
  );
}
