import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getExchangeRate, _resetCache } from "../src/modules/finance/client.js";

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
