import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/index.js";
import { _resetCache as resetBmkg } from "../src/modules/bmkg/client.js";
import { _resetCache as resetFx } from "../src/modules/finance/client.js";

async function connectedClient() {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "1.0.0" });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  return client;
}

const realFetch = globalThis.fetch;

describe("MCP server (integration)", () => {
  beforeEach(() => {
    resetBmkg();
    resetFx();
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("mendaftarkan 12 tools dari semua modul", async () => {
    const client = await connectedClient();
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(12);
    const names = tools.map((t) => t.name);
    expect(names).toContain("wilayah_list_provinces");
    expect(names).toContain("validate_nik");
    expect(names).toContain("bmkg_latest_earthquake");
    expect(names).toContain("finance_exchange_rate");
    await client.close();
  });

  it("memanggil tool wilayah offline", async () => {
    const client = await connectedClient();
    const res = await client.callTool({ name: "wilayah_list_regencies", arguments: { provinceCode: "32" } });
    const parsed = JSON.parse((res.content as Array<{ text: string }>)[0]!.text);
    expect(parsed.data.length).toBeGreaterThan(0);
    expect(parsed.attribution.source).toContain("emsifa");
    await client.close();
  });

  it("memanggil validator dan menyertakan dekode", async () => {
    const client = await connectedClient();
    const res = await client.callTool({ name: "validate_nik", arguments: { nik: "327301570895" + "0001", referenceYear: 2024 } });
    const parsed = JSON.parse((res.content as Array<{ text: string }>)[0]!.text);
    expect(parsed.data.gender).toBe("P");
    await client.close();
  });

  it("BMKG mengembalikan data saat fetch sukses, lalu atribusi BMKG", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ Infogempa: { gempa: { Magnitude: "4.8" } } }),
    })) as unknown as typeof fetch;
    const client = await connectedClient();
    const res = await client.callTool({ name: "bmkg_latest_earthquake", arguments: {} });
    const parsed = JSON.parse((res.content as Array<{ text: string }>)[0]!.text);
    expect(parsed.data.Magnitude).toBe("4.8");
    expect(parsed.attribution.source).toMatch(/BMKG/);
    await client.close();
  });

  it("BMKG menandai isError saat fetch gagal", async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })) as unknown as typeof fetch;
    const client = await connectedClient();
    const res = await client.callTool({ name: "bmkg_recent_earthquakes", arguments: { kind: "dirasakan" } });
    expect(res.isError).toBe(true);
    await client.close();
  });

  it("finance mengembalikan kurs saat fetch sukses", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ result: "success", base_code: "USD", rates: { IDR: 18000 } }),
    })) as unknown as typeof fetch;
    const client = await connectedClient();
    const res = await client.callTool({ name: "finance_exchange_rate", arguments: { symbols: ["IDR"] } });
    const parsed = JSON.parse((res.content as Array<{ text: string }>)[0]!.text);
    expect(parsed.data.rates.IDR).toBe(18000);
    await client.close();
  });

  it("finance menandai isError saat fetch gagal", async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })) as unknown as typeof fetch;
    const client = await connectedClient();
    const res = await client.callTool({ name: "finance_exchange_rate", arguments: {} });
    expect(res.isError).toBe(true);
    await client.close();
  });

  it("weather memanggil endpoint dan mengembalikan data", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ lokasi: { desa: "Test" }, data: [] }),
    })) as unknown as typeof fetch;
    const client = await connectedClient();
    const res = await client.callTool({ name: "bmkg_weather_forecast", arguments: { adm4: "3174041003" } });
    const parsed = JSON.parse((res.content as Array<{ text: string }>)[0]!.text);
    expect(parsed.data.lokasi.desa).toBe("Test");
    await client.close();
  });
});
