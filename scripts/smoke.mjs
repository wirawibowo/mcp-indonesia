// Smoke test: jalankan server via stdio, list tools, panggil beberapa tool.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["dist/index.js"],
});
const client = new Client({ name: "smoke", version: "1.0.0" });
await client.connect(transport);

const { tools } = await client.listTools();
console.log(`Tools terdaftar (${tools.length}):`);
for (const t of tools) console.log(`  - ${t.name}`);

async function call(name, args) {
  const res = await client.callTool({ name, arguments: args });
  const text = res.content?.[0]?.text ?? "";
  console.log(`\n[${name}] ${res.isError ? "ERROR" : "OK"} ->`, text.slice(0, 160).replace(/\n/g, " "));
}

await call("wilayah_list_provinces", {});
await call("wilayah_search", { query: "bandung", limit: 3 });
await call("validate_nik", { nik: "3273011708950001", referenceYear: 2024 });
await call("validate_npwp", { npwp: "01.234.567.8-901.000" });
await call("phone_operator", { number: "081234567890" });
await call("bank_get", { query: "014" });
await call("kodepos_get", { adm4: "1101012001" });
await call("holiday_check", { date: "2026-08-17" });
await call("prayer_times", { city: "Jakarta", date: "2026-06-15" });
await call("prayer_qibla", { city: "Jakarta" });
await call("ojk_check_entity", { name: "Ciptadana" });
// JISDOR: live network call — best-effort, error gracefully kalau endpoint BI down
await call("finance_bi_jisdor", { currency: "USD" });

await client.close();
console.log("\nSmoke test selesai.");
