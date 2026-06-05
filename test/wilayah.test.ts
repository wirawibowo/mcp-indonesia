import { describe, it, expect, beforeEach } from "vitest";
import {
  listProvinces,
  listChildren,
  search,
  detail,
  getByCode,
  _resetCache,
} from "../src/modules/wilayah/repository.js";

describe("wilayah repository", () => {
  beforeEach(() => _resetCache());

  it("memuat daftar provinsi (>= 34)", () => {
    const provinces = listProvinces();
    expect(provinces.length).toBeGreaterThanOrEqual(34);
    // Jawa Barat berkode 32.
    const jabar = provinces.find((p) => p.code === "32");
    expect(jabar?.name).toContain("JAWA BARAT");
  });

  it("listChildren mengembalikan kab/kota dari kode provinsi", () => {
    const regencies = listChildren("32");
    expect(regencies.length).toBeGreaterThan(0);
    expect(regencies.every((r) => r.parentCode === "32")).toBe(true);
  });

  it("hierarki provinsi → desa konsisten", () => {
    const regencies = listChildren("32");
    const firstRegency = regencies[0]!;
    const districts = listChildren(firstRegency.code);
    expect(districts.length).toBeGreaterThan(0);
    const villages = listChildren(districts[0]!.code);
    expect(villages.length).toBeGreaterThan(0);
  });

  it("search menemukan wilayah berdasarkan nama", () => {
    const results = search("bandung", 50);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name.toLowerCase().includes("bandung"))).toBe(true);
    expect(results.every((r) => typeof r.level === "string")).toBe(true);
  });

  it("search menghormati limit", () => {
    const results = search("a", 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("search query kosong mengembalikan array kosong", () => {
    expect(search("  ")).toEqual([]);
  });

  it("detail meresolusi hierarki lengkap dari kode desa", () => {
    // Ambil sebuah kode desa nyata dari dataset.
    const regency = listChildren("32")[0]!;
    const district = listChildren(regency.code)[0]!;
    const village = listChildren(district.code)[0]!;

    const d = detail(village.code);
    expect(d.province?.code).toBe("32");
    expect(d.regency?.code).toBe(regency.code);
    expect(d.district?.code).toBe(district.code);
    expect(d.village?.code).toBe(village.code);
  });

  it("detail kode tidak dikenal mengembalikan objek kosong", () => {
    expect(detail("9999999999")).toEqual({});
  });

  it("getByCode mengembalikan region atau undefined", () => {
    expect(getByCode("32")?.name).toContain("JAWA BARAT");
    expect(getByCode("00")).toBeUndefined();
  });
});
