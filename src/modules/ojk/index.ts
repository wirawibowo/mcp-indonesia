/**
 * Modul OJK — cek apakah entitas keuangan terdaftar di OJK atau masuk daftar
 * ilegal Satgas PASTI (Waspada Investasi). Bundled snapshot.
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonResult } from "../../core/types.js";
import { checkEntity } from "./repository.js";

const ATTRIBUTION = {
  source: "Namchee/ojk-invest-api (unofficial mirror dari OJK & Satgas PASTI)",
  url: "https://github.com/Namchee/ojk-invest-api",
};

export function register(server: McpServer): void {
  server.registerTool(
    "ojk_check_entity",
    {
      description:
        "Cek status entitas keuangan: terdaftar di OJK atau masuk daftar ilegal Satgas PASTI. Berguna untuk verifikasi fintech, manajer investasi, dan reksadana sebelum bertransaksi. Data dari snapshot — verifikasi final tetap di ojk.go.id.",
      inputSchema: {
        name: z.string().min(2).describe("Nama entitas/perusahaan yang dicek (minimal 2 karakter)."),
      },
    },
    async ({ name }) => jsonResult(checkEntity(name), ATTRIBUTION),
  );
}
