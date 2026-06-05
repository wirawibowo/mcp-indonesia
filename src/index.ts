/**
 * mcp-indonesia — entrypoint MCP server (transport stdio).
 *
 * Merakit McpServer, mendaftarkan seluruh modul data Indonesia, lalu terhubung
 * ke stdio. Jangan menulis ke stdout selain protokol MCP (gunakan stderr untuk log).
 */
import { pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAll, MODULES } from "./modules/registry.js";

export function createServer(): McpServer {
  const server = new McpServer({ name: "mcp-indonesia", version: "0.1.0" });
  registerAll(server);
  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log ke stderr agar tidak mengganggu protokol di stdout.
  console.error(
    `[mcp-indonesia] siap. Modul aktif: ${MODULES.map((m) => m.name).join(", ")}`,
  );
}

// Hanya jalankan saat dieksekusi langsung (bukan saat di-import, mis. oleh test).
const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((err) => {
    console.error("[mcp-indonesia] gagal start:", err);
    process.exit(1);
  });
}
