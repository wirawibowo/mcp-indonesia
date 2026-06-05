/**
 * Registry modul aktif. Menambah data source baru cukup tambahkan satu entri
 * di sini — itulah satu-satunya titik perakitan modul.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { register as registerWilayah } from "./wilayah/index.js";
import { register as registerValidator } from "./validator/index.js";
import { register as registerBmkg } from "./bmkg/index.js";
import { register as registerFinance } from "./finance/index.js";
import { register as registerPhone } from "./phone/index.js";
import { register as registerBank } from "./bank/index.js";
import { register as registerKodepos } from "./kodepos/index.js";
import { register as registerHoliday } from "./holiday/index.js";
import { register as registerPrayer } from "./prayer/index.js";
import { register as registerOjk } from "./ojk/index.js";

export interface ModuleEntry {
  name: string;
  register: (server: McpServer) => void;
}

export const MODULES: ModuleEntry[] = [
  { name: "wilayah", register: registerWilayah },
  { name: "validator", register: registerValidator },
  { name: "bmkg", register: registerBmkg },
  { name: "finance", register: registerFinance },
  { name: "phone", register: registerPhone },
  { name: "bank", register: registerBank },
  { name: "kodepos", register: registerKodepos },
  { name: "holiday", register: registerHoliday },
  { name: "prayer", register: registerPrayer },
  { name: "ojk", register: registerOjk },
];

export function registerAll(server: McpServer): void {
  for (const mod of MODULES) mod.register(server);
}
