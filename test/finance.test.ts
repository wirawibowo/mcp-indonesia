import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getExchangeRate, getIdxQuote, getJisdor, _resetCache } from "../src/modules/finance/client.js";

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

describe("finance JISDOR (BI)", () => {
  beforeEach(() => _resetCache());
  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  function mockJisdorXml(xml: string) {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => xml,
    })) as unknown as typeof fetch;
  }

  const SAMPLE_XML = `<?xml version="1.0" encoding="utf-8"?>
<DataSet xmlns="http://schemas.datacontract.org/2004/07/">
  <diffgr:diffgram>
    <NewDataSet>
      <mt_kurs_lokal_subkursLokal3>
        <mts_kd>USD</mts_kd>
        <kurs_jual>16450.50</kurs_jual>
        <kurs_beli>16285.75</kurs_beli>
        <tgl_subkurslokal>2026-06-05T00:00:00</tgl_subkurslokal>
      </mt_kurs_lokal_subkursLokal3>
      <mt_kurs_lokal_subkursLokal3>
        <mts_kd>USD</mts_kd>
        <kurs_jual>16470.00</kurs_jual>
        <kurs_beli>16300.00</kurs_beli>
        <tgl_subkurslokal>2026-06-04T00:00:00</tgl_subkurslokal>
      </mt_kurs_lokal_subkursLokal3>
    </NewDataSet>
  </diffgr:diffgram>
</DataSet>`;

  it("mengembalikan kurs JISDOR terbaru dari XML BI", async () => {
    mockJisdorXml(SAMPLE_XML);
    const r = await getJisdor("USD", "2026-06-05");
    expect(r.currency).toBe("USD");
    expect(r.date).toBe("2026-06-05");
    expect(r.sellRate).toBe(16450.5);
    expect(r.buyRate).toBe(16285.75);
    expect(r.midRate).toBeCloseTo((16450.5 + 16285.75) / 2);
  });

  it("memilih tanggal paling baru bila ada beberapa rekord", async () => {
    mockJisdorXml(SAMPLE_XML);
    const r = await getJisdor("USD", "2026-06-05");
    expect(r.date).toBe("2026-06-05");
  });

  it("melempar error ketika XML tidak mengandung data", async () => {
    mockJisdorXml('<?xml version="1.0"?><DataSet></DataSet>');
    await expect(getJisdor("XXX", "2026-06-05")).rejects.toThrow(/Tidak ada data/);
  });

  it("melempar error informatif saat endpoint tidak responsif", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("Connection reset");
    }) as unknown as typeof fetch;
    await expect(getJisdor("USD", "2026-06-05")).rejects.toThrow(/BI JISDOR.*bi\.go\.id/);
  });

  it("memakai cache untuk basis & tanggal yang sama", async () => {
    mockJisdorXml(SAMPLE_XML);
    await getJisdor("USD", "2026-06-05");
    await getJisdor("USD", "2026-06-05");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
