import { describe, it, expect } from "vitest";
import { validatePhone, detectOperator, normalize } from "../src/modules/phone/detector.js";

describe("normalize", () => {
  it("menerima format lokal 08xx", () => {
    expect(normalize("081234567890")).toBe("081234567890");
  });

  it("mengonversi +628xx menjadi 08xx", () => {
    expect(normalize("+6281234567890")).toBe("081234567890");
  });

  it("mengonversi 628xx menjadi 08xx", () => {
    expect(normalize("6281234567890")).toBe("081234567890");
  });

  it("mengabaikan spasi, strip, titik, kurung", () => {
    expect(normalize("(0812) 3456-7890")).toBe("081234567890");
    expect(normalize("+62 812.3456.7890")).toBe("081234567890");
  });

  it("menolak input non-Indonesia", () => {
    expect(normalize("+14155552671")).toBeNull();
    expect(normalize("9876543210")).toBeNull();
  });

  it("menolak input kosong", () => {
    expect(normalize("")).toBeNull();
    expect(normalize("   ")).toBeNull();
  });

  it("menolak karakter alfabet", () => {
    expect(normalize("081abc4567890")).toBeNull();
  });
});

describe("validatePhone", () => {
  it("memvalidasi nomor lokal yang benar", () => {
    const r = validatePhone("081234567890");
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe("081234567890");
    expect(r.e164).toBe("+6281234567890");
  });

  it("memvalidasi nomor internasional", () => {
    const r = validatePhone("+6281234567890");
    expect(r.valid).toBe(true);
    expect(r.e164).toBe("+6281234567890");
  });

  it("menolak nomor terlalu pendek", () => {
    const r = validatePhone("0812345");
    expect(r.valid).toBe(false);
    expect(r.reasons.join(" ")).toMatch(/pendek/);
  });

  it("menolak nomor terlalu panjang", () => {
    const r = validatePhone("081234567890123456");
    expect(r.valid).toBe(false);
    expect(r.reasons.join(" ")).toMatch(/panjang/);
  });

  it("menolak nomor non-Indonesia", () => {
    const r = validatePhone("+14155552671");
    expect(r.valid).toBe(false);
  });

  it("menolak input kosong", () => {
    const r = validatePhone("");
    expect(r.valid).toBe(false);
  });
});

describe("detectOperator", () => {
  it("mendeteksi Telkomsel dari prefix 0812", () => {
    const r = detectOperator("081234567890");
    expect(r.valid).toBe(true);
    expect(r.operator).toBe("Telkomsel");
    expect(r.prefix).toBe("0812");
  });

  it("mendeteksi Indosat dari prefix 0856", () => {
    const r = detectOperator("085612345678");
    expect(r.operator).toBe("Indosat");
  });

  it("mendeteksi XL dari prefix 0817", () => {
    const r = detectOperator("081712345678");
    expect(r.operator).toBe("XL Axiata");
    expect(r.brand).toBe("XL");
  });

  it("mendeteksi Axis (anak XL) dari prefix 0838", () => {
    const r = detectOperator("083812345678");
    expect(r.operator).toBe("XL Axiata");
    expect(r.brand).toBe("Axis");
  });

  it("mendeteksi Smartfren dari prefix 0881", () => {
    const r = detectOperator("088112345678");
    expect(r.operator).toBe("Smartfren");
  });

  it("mendeteksi Tri dari prefix 0896", () => {
    const r = detectOperator("089612345678");
    expect(r.operator).toBe("Tri");
  });

  it("mengembalikan prefix tetapi operator undefined untuk prefix tidak dikenal", () => {
    const r = detectOperator("087012345678");
    expect(r.valid).toBe(true);
    expect(r.prefix).toBe("0870");
    expect(r.operator).toBeUndefined();
  });

  it("tidak mengembalikan operator jika nomor tidak valid", () => {
    const r = detectOperator("0812");
    expect(r.valid).toBe(false);
    expect(r.operator).toBeUndefined();
  });

  it("mendeteksi operator dari format internasional", () => {
    const r = detectOperator("+6281234567890");
    expect(r.operator).toBe("Telkomsel");
  });
});
