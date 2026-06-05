import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getLatestEarthquake,
  getRecentEarthquakes,
  getWeatherForecast,
  normalizeAdm4,
  BMKG_ATTRIBUTION,
  _resetCache,
} from "../src/modules/bmkg/client.js";
import { _resetCache as resetWilayah } from "../src/modules/wilayah/repository.js";

const realFetch = globalThis.fetch;

function mockFetchOnce(body: unknown) {
  globalThis.fetch = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => body,
  })) as unknown as typeof fetch;
}

describe("bmkg client", () => {
  beforeEach(() => { _resetCache(); resetWilayah(); });
  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("normalizeAdm4 menyisipkan titik pada kode 10 digit", () => {
    expect(normalizeAdm4("3174041003")).toBe("31.74.04.1003");
    expect(normalizeAdm4("31.74.04.1003")).toBe("31.74.04.1003");
  });

  it("getLatestEarthquake menambahkan ShakemapUrl absolut", async () => {
    mockFetchOnce({
      Infogempa: { gempa: { Magnitude: "5.2", Shakemap: "x.jpg", Wilayah: "Test" } },
    });
    const eq = await getLatestEarthquake();
    expect(eq.Magnitude).toBe("5.2");
    expect(eq.ShakemapUrl).toContain("https://data.bmkg.go.id/DataMKG/TEWS/x.jpg");
  });

  it("getLatestEarthquake memakai cache (fetch sekali)", async () => {
    mockFetchOnce({ Infogempa: { gempa: { Magnitude: "5.2" } } });
    await getLatestEarthquake();
    await getLatestEarthquake();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("getRecentEarthquakes mengembalikan array", async () => {
    mockFetchOnce({ Infogempa: { gempa: [{ Magnitude: "5.6" }, { Magnitude: "5.0" }] } });
    const list = await getRecentEarthquakes("terkini");
    expect(list).toHaveLength(2);
  });

  it("getWeatherForecast (kode) meminta endpoint dengan adm4 ternormalisasi", async () => {
    const spy = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ lokasi: {}, data: [] }) }));
    globalThis.fetch = spy as unknown as typeof fetch;
    const result = await getWeatherForecast("3174041003");
    const calledUrl = (spy.mock.calls[0]![0] as string);
    expect(calledUrl).toContain("adm4=31.74.04.1003");
    expect(result.adm4).toBe("31.74.04.1003");
    expect(result.resolvedFrom).toBeUndefined();
  });

  it("getWeatherForecast (nama desa) resolve otomatis ke adm4", async () => {
    const spy = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ lokasi: { desa: "Menteng" }, data: [] }) }));
    globalThis.fetch = spy as unknown as typeof fetch;
    const result = await getWeatherForecast("menteng");
    expect(result.adm4).toMatch(/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/);
    expect(result.resolvedFrom?.name).toMatch(/MENTENG/i);
    expect(result.resolvedFrom?.level).toBe("village");
  });

  it("getWeatherForecast melempar error jika nama tidak ditemukan", async () => {
    await expect(getWeatherForecast("xyznamayangpastisalah123")).rejects.toThrow();
  });

  it("atribusi BMKG terdefinisi", () => {
    expect(BMKG_ATTRIBUTION.source).toMatch(/BMKG/);
  });
});
