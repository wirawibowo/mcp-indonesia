/**
 * Modul Wilayah — tools data administratif Indonesia (offline).
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonResult } from "../../core/types.js";
import {
  listProvinces,
  listChildren,
  search,
  detail,
  WILAYAH_ATTRIBUTION,
} from "./repository.js";

export function register(server: McpServer): void {
  server.registerTool(
    "wilayah_list_provinces",
    {
      description: "Daftar seluruh provinsi di Indonesia beserta kodenya.",
    },
    async () => jsonResult(listProvinces(), WILAYAH_ATTRIBUTION),
  );

  server.registerTool(
    "wilayah_list_regencies",
    {
      description: "Daftar kabupaten/kota dalam sebuah provinsi (berdasarkan kode provinsi 2 digit).",
      inputSchema: { provinceCode: z.string().describe("Kode provinsi, mis. '32' (Jawa Barat).") },
    },
    async ({ provinceCode }) => jsonResult(listChildren(provinceCode), WILAYAH_ATTRIBUTION),
  );

  server.registerTool(
    "wilayah_list_districts",
    {
      description: "Daftar kecamatan dalam sebuah kabupaten/kota (berdasarkan kode 4 digit).",
      inputSchema: { regencyCode: z.string().describe("Kode kabupaten/kota, mis. '3273' (Kota Bandung).") },
    },
    async ({ regencyCode }) => jsonResult(listChildren(regencyCode), WILAYAH_ATTRIBUTION),
  );

  server.registerTool(
    "wilayah_list_villages",
    {
      description: "Daftar desa/kelurahan dalam sebuah kecamatan (berdasarkan kode 7 digit).",
      inputSchema: { districtCode: z.string().describe("Kode kecamatan, mis. '3273010'.") },
    },
    async ({ districtCode }) => jsonResult(listChildren(districtCode), WILAYAH_ATTRIBUTION),
  );

  server.registerTool(
    "wilayah_search",
    {
      description:
        "Cari wilayah (provinsi/kabupaten/kota/kecamatan/desa) berdasarkan nama. Mengembalikan kode, nama, dan level.",
      inputSchema: {
        query: z.string().min(2).describe("Kata kunci nama wilayah, mis. 'Cibadak'."),
        limit: z.number().int().min(1).max(100).optional().describe("Maksimum hasil (default 25)."),
      },
    },
    async ({ query, limit }) => jsonResult(search(query, limit ?? 25), WILAYAH_ATTRIBUTION),
  );

  server.registerTool(
    "wilayah_detail",
    {
      description:
        "Resolusi hierarki lengkap (provinsi → kab/kota → kecamatan → desa) dari sebuah kode wilayah apa pun.",
      inputSchema: { code: z.string().describe("Kode wilayah 2/4/7/10 digit.") },
    },
    async ({ code }) => jsonResult(detail(code), WILAYAH_ATTRIBUTION),
  );
}
