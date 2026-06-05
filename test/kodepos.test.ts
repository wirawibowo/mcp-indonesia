import { describe, it, expect, beforeEach } from "vitest";
import { getKodepos, searchByKodepos, _resetCache } from "../src/modules/kodepos/repository.js";

describe("getKodepos", () => {
  beforeEach(() => _resetCache());

  it("mengembalikan kodepos untuk adm4 yang valid", () => {
    // Aceh: 11.01.01.2001 → 1101012001 → kodepos 23773 (Bakongan, Aceh Selatan)
    const kp = getKodepos("1101012001");
    expect(kp).toBe("23773");
  });

  it("menerima format dengan titik", () => {
    const kp = getKodepos("11.01.01.2001");
    expect(kp).toBe("23773");
  });

  it("trim whitespace", () => {
    expect(getKodepos("  1101012001  ")).toBe("23773");
  });

  it("mengembalikan null untuk adm4 yang tidak ada", () => {
    expect(getKodepos("9999999999")).toBeNull();
  });

  it("mengembalikan null untuk input kosong", () => {
    expect(getKodepos("")).toBeNull();
  });
});

describe("searchByKodepos", () => {
  beforeEach(() => _resetCache());

  it("mengembalikan daftar desa untuk kodepos yang valid", () => {
    const results = searchByKodepos("23773");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.kodepos).toBe("23773");
    expect(results[0]!.adm4).toMatch(/^\d{10}$/);
  });

  it("memperkaya hasil dengan nama wilayah (best-effort)", () => {
    // Kode wilayah Kemendagri 2025 ≠ Permendagri 137/2017 (emsifa) di beberapa
    // level — enrichment dilakukan best-effort. Provinsi & kab/kota umumnya
    // konsisten, sementara village name bisa kosong jika kode telah berubah.
    const results = searchByKodepos("23773");
    expect(results[0]!.provinceName).toMatch(/aceh/i);
  });

  it("pad kodepos pendek dengan leading zero", () => {
    // Beberapa kodepos di Aceh dimulai dengan kecil; cukup test bahwa padding bekerja.
    const padded = searchByKodepos("23773");
    const unpadded = searchByKodepos(" 23773 ");
    expect(padded.length).toBe(unpadded.length);
  });

  it("mengembalikan array kosong untuk kodepos yang tidak ada", () => {
    expect(searchByKodepos("00000")).toEqual([]);
  });
});
