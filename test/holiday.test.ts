import { describe, it, expect } from "vitest";
import {
  checkHoliday,
  listHolidays,
  nextHoliday,
  dataYearRange,
} from "../src/modules/holiday/repository.js";

describe("checkHoliday", () => {
  it("mengembalikan true untuk Tahun Baru 1 Januari 2026", () => {
    const r = checkHoliday("2026-01-01");
    expect(r?.isHoliday).toBe(true);
    expect(r?.matches[0]?.name).toMatch(/tahun baru/i);
  });

  it("mengembalikan false untuk hari kerja biasa", () => {
    // 2026-01-05 adalah Senin biasa (libur Natal sudah lewat).
    const r = checkHoliday("2026-01-05");
    expect(r?.isHoliday).toBe(false);
    expect(r?.matches).toEqual([]);
  });

  it("mengembalikan null untuk format tanggal tidak valid", () => {
    expect(checkHoliday("bukan-tanggal")).toBeNull();
    expect(checkHoliday("")).toBeNull();
  });
});

describe("listHolidays", () => {
  it("mengembalikan semua libur untuk tahun yang ada di dataset", () => {
    const range = dataYearRange();
    const list = listHolidays(range.max);
    expect(list.length).toBeGreaterThan(0);
    list.forEach((h) => expect(h.date.startsWith(`${range.max}-`)).toBe(true));
  });

  it("memfilter tipe national", () => {
    const range = dataYearRange();
    const list = listHolidays(range.max, "national");
    list.forEach((h) => expect(h.type).toBe("national"));
  });

  it("memfilter tipe cuti_bersama", () => {
    const range = dataYearRange();
    const list = listHolidays(range.max, "cuti_bersama");
    list.forEach((h) => expect(h.type).toBe("cuti_bersama"));
  });

  it("mengembalikan kosong untuk tahun di luar cakupan", () => {
    expect(listHolidays(1900)).toEqual([]);
  });
});

describe("nextHoliday", () => {
  it("menemukan hari libur berikutnya dari tanggal yang diberikan", () => {
    const r = nextHoliday("2026-01-02");
    expect(r).not.toBeNull();
    expect(r!.date.startsWith("2026")).toBe(true);
    expect(r!.date > "2026-01-02").toBe(true);
  });

  it("menemukan hari libur berikutnya yang difilter tipe", () => {
    const r = nextHoliday("2026-01-01", "cuti_bersama");
    expect(r?.type).toBe("cuti_bersama");
  });

  it("mengembalikan tanggal libur itu sendiri jika 'from' tepat di hari libur", () => {
    const r = nextHoliday("2026-01-01");
    expect(r?.date).toBe("2026-01-01");
  });

  it("mengembalikan null bila tidak ada libur lagi", () => {
    const r = nextHoliday("2099-12-31");
    expect(r).toBeNull();
  });
});

describe("dataYearRange", () => {
  it("memberikan min ≤ max", () => {
    const r = dataYearRange();
    expect(r.min).toBeLessThanOrEqual(r.max);
    expect(r.max).toBeGreaterThanOrEqual(2025);
  });
});
