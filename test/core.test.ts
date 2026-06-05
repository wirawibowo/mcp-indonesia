import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TtlCache, TTL } from "../src/core/cache.js";
import { fetchJson, HttpError } from "../src/core/http.js";
import { jsonResult, textResult, errorResult } from "../src/core/types.js";

describe("TtlCache", () => {
  it("mengembalikan nilai sebelum kedaluwarsa", () => {
    let clock = 1000;
    const cache = new TtlCache(() => clock);
    cache.set("k", 42, TTL.MINUTE);
    expect(cache.get<number>("k")).toBe(42);
  });

  it("menghapus nilai setelah kedaluwarsa", () => {
    let clock = 1000;
    const cache = new TtlCache(() => clock);
    cache.set("k", 42, 500);
    clock = 1600;
    expect(cache.get<number>("k")).toBeUndefined();
  });

  it("getOrLoad memuat sekali lalu memakai cache", async () => {
    let clock = 0;
    const cache = new TtlCache(() => clock);
    const loader = vi.fn(async () => "value");
    const a = await cache.getOrLoad("k", TTL.MINUTE, loader);
    const b = await cache.getOrLoad("k", TTL.MINUTE, loader);
    expect(a).toBe("value");
    expect(b).toBe("value");
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("getOrLoad memuat ulang setelah TTL habis", async () => {
    let clock = 0;
    const cache = new TtlCache(() => clock);
    const loader = vi.fn(async () => clock);
    await cache.getOrLoad("k", 100, loader);
    clock = 200;
    await cache.getOrLoad("k", 100, loader);
    expect(loader).toHaveBeenCalledTimes(2);
  });
});

describe("types helpers", () => {
  it("textResult membungkus teks", () => {
    expect(textResult("hi")).toEqual({ content: [{ type: "text", text: "hi" }] });
  });

  it("jsonResult menyertakan atribusi", () => {
    const r = jsonResult({ a: 1 }, { source: "BMKG", url: "https://bmkg.go.id" });
    const parsed = JSON.parse(r.content[0]!.text);
    expect(parsed.data).toEqual({ a: 1 });
    expect(parsed.attribution.source).toBe("BMKG");
  });

  it("errorResult menandai isError", () => {
    const r = errorResult("gagal");
    expect(r.isError).toBe(true);
    expect(r.content[0]!.text).toContain("gagal");
  });
});

describe("fetchJson", () => {
  const realFetch = globalThis.fetch;
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("mengembalikan JSON pada respons sukses", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ hello: "world" }),
    })) as unknown as typeof fetch;
    const data = await fetchJson<{ hello: string }>("https://example.com");
    expect(data.hello).toBe("world");
  });

  it("melempar HttpError pada status 404 tanpa retry", async () => {
    const spy = vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) }));
    globalThis.fetch = spy as unknown as typeof fetch;
    await expect(fetchJson("https://example.com", { retries: 2 })).rejects.toBeInstanceOf(HttpError);
    expect(spy).toHaveBeenCalledTimes(1); // 4xx tidak di-retry
  });

  it("retry pada status 500 lalu menyerah", async () => {
    const spy = vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }));
    globalThis.fetch = spy as unknown as typeof fetch;
    await expect(fetchJson("https://example.com", { retries: 1 })).rejects.toBeInstanceOf(HttpError);
    expect(spy).toHaveBeenCalledTimes(2); // 1 awal + 1 retry
  });
});
