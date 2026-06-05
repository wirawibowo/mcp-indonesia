import { describe, it, expect } from "vitest";
import { checkEntity, SNAPSHOT_DATE } from "../src/modules/ojk/repository.js";

describe("checkEntity", () => {
  it("menyertakan disclaimer dan snapshot date", () => {
    const r = checkEntity("Ciptadana");
    expect(r.snapshotDate).toBe(SNAPSHOT_DATE);
    expect(r.disclaimer).toContain("ojk.go.id");
  });

  it("menemukan entitas terdaftar (manajer investasi)", () => {
    // Ciptadana adalah salah satu manajer investasi yang ada di snapshot.
    const r = checkEntity("Ciptadana");
    expect(r.matches.registered.length).toBeGreaterThan(0);
    expect(r.status).toBe("terdaftar");
  });

  it("menemukan entitas dari daftar ilegal", () => {
    // "Alipinjaman" adalah salah satu fintech ilegal di Satgas PASTI.
    const r = checkEntity("Alipinjaman");
    expect(r.matches.illegal.length).toBeGreaterThan(0);
    expect(r.status).toBe("ilegal");
  });

  it("case-insensitive dan tahan terhadap karakter khusus", () => {
    const r = checkEntity("CIPTADANA, PT");
    expect(r.matches.registered.length).toBeGreaterThan(0);
  });

  it("mengembalikan status unknown untuk nama yang tidak ada", () => {
    const r = checkEntity("Entitas Fiksi 12345 Tidak Ada");
    expect(r.status).toBe("unknown");
    expect(r.matches.registered).toEqual([]);
    expect(r.matches.illegal).toEqual([]);
  });

  it("membatasi hasil maksimal 10 per kategori", () => {
    // Query umum yang likely cocok banyak entitas.
    const r = checkEntity("PT");
    expect(r.matches.registered.length).toBeLessThanOrEqual(10);
    expect(r.matches.illegal.length).toBeLessThanOrEqual(10);
  });

  it("trim whitespace query", () => {
    const r = checkEntity("   Ciptadana   ");
    expect(r.query).toBe("Ciptadana");
  });

  it("snapshotDate berformat YYYY-MM-DD", () => {
    expect(SNAPSHOT_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
