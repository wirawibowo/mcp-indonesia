import { describe, it, expect } from "vitest";
import { validateNik } from "../src/modules/validator/nik.js";
import { validateNpwp } from "../src/modules/validator/npwp.js";

describe("validateNik", () => {
  it("menolak NIK yang bukan 16 digit", () => {
    const r = validateNik("123");
    expect(r.valid).toBe(false);
    expect(r.reasons.join(" ")).toMatch(/16 digit/i);
  });

  it("menolak NIK dengan karakter non-angka", () => {
    const r = validateNik("32730112abcd3456");
    expect(r.valid).toBe(false);
  });

  it("mendekode laki-laki dengan tanggal lahir benar", () => {
    // 3273 = Kota Bandung. SS=01. Lahir 17-08-1995, laki-laki, serial 0001.
    const r = validateNik("327301" + "170895" + "0001");
    expect(r.province?.code).toBe("32");
    expect(r.regency?.code).toBe("3273");
    expect(r.gender).toBe("L");
    expect(r.birthDate).toEqual({ day: 17, month: 8, year: 1995 });
    expect(r.valid).toBe(true);
  });

  it("mendeteksi perempuan (tanggal + 40)", () => {
    // Tanggal 17 -> 57 untuk perempuan.
    const r = validateNik("327301" + "570895" + "0001");
    expect(r.gender).toBe("P");
    expect(r.birthDate).toEqual({ day: 17, month: 8, year: 1995 });
  });

  it("menolak tanggal/bulan tidak valid", () => {
    const r = validateNik("327301" + "993295" + "0001"); // hari 99->59 invalid, bulan 32 invalid
    expect(r.valid).toBe(false);
  });

  it("menandai provinsi tidak dikenal", () => {
    const r = validateNik("009901170895" + "0001");
    expect(r.valid).toBe(false);
    expect(r.reasons.join(" ")).toMatch(/provinsi/i);
  });

  it("resolusi tahun memakai referenceYear", () => {
    // yy=95 dengan referenceYear 2024 -> 1995; yy=10 -> 2010.
    const a = validateNik("327301170895" + "0001", { referenceYear: 2024 });
    expect(a.birthDate?.year).toBe(1995);
    const b = validateNik("327301170810" + "0001", { referenceYear: 2024 });
    expect(b.birthDate?.year).toBe(2010);
  });
});

describe("validateNpwp", () => {
  it("menerima 15 digit dan mendekode struktur", () => {
    const r = validateNpwp("012345678901000");
    expect(r.valid).toBe(true);
    expect(r.format).toBe("15-digit");
    expect(r.kppCode).toBe("901");
    expect(r.branch).toBe("000");
    expect(r.isHeadOffice).toBe(true);
  });

  it("menerima input terformat dengan titik dan strip", () => {
    const r = validateNpwp("01.234.567.8-901.000");
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe("012345678901000");
  });

  it("menandai cabang ketika status bukan 000", () => {
    const r = validateNpwp("012345678901001");
    expect(r.isHeadOffice).toBe(false);
    expect(r.branch).toBe("001");
  });

  it("menerima 16 digit (format baru berbasis NIK)", () => {
    const r = validateNpwp("3273011708950001");
    expect(r.valid).toBe(true);
    expect(r.format).toBe("16-digit");
  });

  it("menolak panjang yang tidak valid", () => {
    const r = validateNpwp("12345");
    expect(r.valid).toBe(false);
  });
});
