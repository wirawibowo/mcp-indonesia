import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getExchangeRate, getIdxQuote, _resetCache } from "../src/modules/finance/client.js";

const realFetch = globalThis.fetch;

function mockFx(rates: Record<string, number>, result = "success") {
  globalThis.fetch = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      result,
      base_code: "USD",
      time_last_update_utc: "Fri, 05 Jun 2026 00:02:31 +0000",
      rates,
    }),
  })) as unknown as typeof fetch;
}

describe("finance client", () => {
  beforeEach(() => _resetCache());
  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("mengembalikan kurs default termasuk IDR", async () => {
    mockFx({ IDR: 18000, EUR: 0.92, USD: 1 });
    const r = await getExchangeRate();
    expect(r.base).toBe("USD");
    expect(r.rates.IDR).toBe(18000);
    expect(r.lastUpdate).toContain("2026");
  });

  it("memfilter sesuai symbols yang diminta", async () => {
    mockFx({ IDR: 18000, EUR: 0.92, SGD: 1.35, JPY: 150 });
    const r = await getExchangeRate("USD", ["IDR", "SGD"]);
    expect(Object.keys(r.rates).sort()).toEqual(["IDR", "SGD"]);
  });

  it("melempar error ketika result bukan success", async () => {
    mockFx({}, "error");
    await expect(getExchangeRate("XXX")).rejects.toThrow();
  });

  it("memakai cache (fetch sekali untuk basis sama)", async () => {
    mockFx({ IDR: 18000 });
    await getExchangeRate("USD");
    await getExchangeRate("USD");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});

describe("finance IDX quote", () => {
  beforeEach(() => _resetCache());
  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  function mockYahoo(meta: Record<string, unknown>) {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ chart: { result: [{ meta }] } }),
    })) as unknown as typeof fetch;
  }

  it("mengembalikan data harga saham BBCA", async () => {
    mockYahoo({
      symbol: "BBCA.JK",
      regularMarketPrice: 9750,
      currency: "IDR",
      regularMarketChangePercent: 0.52,
      regularMarketVolume: 12000000,
      regularMarketTime: 1717500000,
      marketState: "REGULAR",
      exchangeName: "JKT",
      longName: "PT Bank Central Asia Tbk",
    });
    const r = await getIdxQuote("BBCA");
    expect(r.ticker).toBe("BBCA");
    expect(r.price).toBe(9750);
    expect(r.name).toContain("Bank Central Asia");
  });

  it("menambahkan suffix .JK otomatis", async () => {
    mockYahoo({ symbol: "TLKM.JK", regularMarketPrice: 3200, currency: "IDR",
      regularMarketChangePercent: -0.3, regularMarketVolume: 5000000,
      regularMarketTime: 1717500000, marketState: "CLOSED", exchangeName: "JKT" });
    const spy = globalThis.fetch as ReturnType<typeof vi.fn>;
    await getIdxQuote("TLKM");
    expect((spy.mock.calls[0]![0] as string)).toContain("TLKM.JK");
  });

  it("melempar error jika ticker tidak valid", async () => {
    await expect(getIdxQuote("!!!")).rejects.toThrow();
  });

  it("melempar error jika Yahoo kembalikan error", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true, status: 200,
      json: async () => ({ chart: { error: { code: "Not Found", description: "No data" } } }),
    })) as unknown as typeof fetch;
    await expect(getIdxQuote("XXXX")).rejects.toThrow();
  });
});
