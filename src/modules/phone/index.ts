/**
 * Modul Phone — validasi format & deteksi operator nomor HP Indonesia (offline).
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonResult } from "../../core/types.js";
import { validatePhone, detectOperator } from "./detector.js";

const ATTRIBUTION = {
  source: "Kominfo prefix allocation + Wikipedia: Telephone numbers in Indonesia",
  url: "https://en.wikipedia.org/wiki/Telephone_numbers_in_Indonesia",
};

export function register(server: McpServer): void {
  server.registerTool(
    "phone_validate",
    {
      description:
        "Validasi format nomor HP Indonesia. Menerima 08xx, +628xx, atau 628xx, dengan/atau tanpa separator. Mengembalikan bentuk lokal & E.164.",
      inputSchema: {
        number: z.string().describe("Nomor HP, contoh: 081234567890 atau +6281234567890."),
      },
    },
    async ({ number }) => jsonResult(validatePhone(number)),
  );

  server.registerTool(
    "phone_operator",
    {
      description:
        "Deteksi operator seluler dari prefix nomor HP Indonesia (Telkomsel, Indosat, XL Axiata/Axis, Tri, Smartfren).",
      inputSchema: {
        number: z.string().describe("Nomor HP, contoh: 081234567890 atau +6281234567890."),
      },
    },
    async ({ number }) => jsonResult(detectOperator(number), ATTRIBUTION),
  );
}
