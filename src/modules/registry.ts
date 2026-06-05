/**
 * Registry modul aktif. Menambah data source baru cukup tambahkan satu entri
 * di sini — itulah satu-satunya titik perakitan modul.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { register as registerWilayah } from "./wilayah/index.js";
import { register as registerValidator } from "./validator/index.js";
import { register as registerBmkg } from "./bmkg/index.js";
import { register as registerFinance } from "./finance/index.js";

export interface ModuleEntry {
  name: string;
  register: (server: McpServer) => void;
}

export const MODULES: ModuleEntry[] = [
  { name: "wilayah", register: registerWilayah },
  { name: "validator", register: registerValidator },
  { name: "bmkg", register: registerBmkg },
  { name: "finance", register: registerFinance },
];

export function registerAll(server: McpServer): void {
  for (const mod of MODULES) mod.register(server);
}
