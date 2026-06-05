import { describe, it, expect } from "vitest";
import { listBanks, getBank, searchBank } from "../src/modules/bank/repository.js";

describe("listBanks", () => {
  it("mengembalikan semua bank ketika tanpa filter", () => {
    const all = listBanks();
    expect(all.length).toBeGreaterThan(20);
    expect(all.find((b) => b.alias === "BCA")).toBeDefined();
  });

  it("memfilter berdasarkan jenis syariah", () => {
    const syariah = listBanks("syariah");
    expect(syariah.length).toBeGreaterThan(0);
    syariah.forEach((b) => expect(b.type).toBe("syariah"));
    expect(syariah.find((b) => b.alias === "BSI")).toBeDefined();
  });

  it("memfilter berdasarkan jenis asing", () => {
    const asing = listBanks("asing");
    asing.forEach((b) => expect(b.type).toBe("asing"));
    expect(asing.find((b) => b.alias === "HSBC")).toBeDefined();
  });

  it("memfilter berdasarkan jenis pembangunan (BPD)", () => {
    const bpd = listBanks("pembangunan");
    expect(bpd.length).toBeGreaterThan(0);
    bpd.forEach((b) => expect(b.type).toBe("pembangunan"));
  });
});

describe("getBank", () => {
  it("mengambil bank berdasarkan kode kliring 3 digit", () => {
    const bca = getBank("014");
    expect(bca?.alias).toBe("BCA");
    expect(bca?.swift).toBe("CENAIDJA");
  });

  it("mengambil bank berdasarkan SWIFT code", () => {
    const bri = getBank("BRINIDJA");
    expect(bri?.alias).toBe("BRI");
    expect(bri?.code).toBe("002");
  });

  it("case-insensitive untuk SWIFT", () => {
    const bri = getBank("brinidja");
    expect(bri?.alias).toBe("BRI");
  });

  it("trim whitespace", () => {
    const bca = getBank("  014  ");
    expect(bca?.alias).toBe("BCA");
  });

  it("mengembalikan null untuk kode yang tidak ada", () => {
    expect(getBank("999")).toBeNull();
    expect(getBank("ABCDEFGH")).toBeNull();
  });

  it("mengembalikan null untuk input kosong", () => {
    expect(getBank("")).toBeNull();
    expect(getBank("   ")).toBeNull();
  });
});

describe("searchBank", () => {
  it("mencari berdasarkan nama lengkap", () => {
    const r = searchBank("Mandiri");
    expect(r.length).toBeGreaterThan(0);
    expect(r.find((b) => b.alias === "Mandiri")).toBeDefined();
  });

  it("mencari berdasarkan alias", () => {
    const r = searchBank("bca");
    expect(r.find((b) => b.alias === "BCA")).toBeDefined();
  });

  it("case-insensitive", () => {
    expect(searchBank("BNI").length).toBe(searchBank("bni").length);
  });

  it("mengembalikan array kosong untuk query kosong", () => {
    expect(searchBank("")).toEqual([]);
    expect(searchBank("   ")).toEqual([]);
  });

  it("mengembalikan array kosong untuk query yang tidak match", () => {
    expect(searchBank("XYZNOTFOUND123")).toEqual([]);
  });
});
