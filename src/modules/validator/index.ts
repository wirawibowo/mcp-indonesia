/**
 * Modul Validator — tools validasi & dekode NIK dan NPWP (offline).
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonResult } from "../../core/types.js";
import { validateNik } from "./nik.js";
import { validateNpwp } from "./npwp.js";

export function register(server: McpServer): void {
  server.registerTool(
    "validate_nik",
    {
      description:
        "Validasi & dekode NIK (16 digit): provinsi, kabupaten/kota, tanggal lahir, dan jenis kelamin.",
      inputSchema: {
        nik: z.string().describe("NIK 16 digit."),
        referenceYear: z
          .number()
          .int()
          .optional()
          .describe("Tahun acuan resolusi abad tanggal lahir (default: tahun berjalan)."),
      },
    },
    async ({ nik, referenceYear }) =>
      jsonResult(validateNik(nik, referenceYear ? { referenceYear } : {})),
  );

  server.registerTool(
    "validate_npwp",
    {
      description:
        "Validasi & dekode NPWP (15 digit lama atau 16 digit baru): jenis WP, kode KPP, dan status pusat/cabang.",
      inputSchema: { npwp: z.string().describe("NPWP, boleh berformat (titik/strip) atau angka saja.") },
    },
    async ({ npwp }) => jsonResult(validateNpwp(npwp)),
  );
}
