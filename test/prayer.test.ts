import { describe, it, expect } from "vitest";
import { computePrayerTimes, computeQibla } from "../src/modules/prayer/calculator.js";

describe("computePrayerTimes", () => {
  it("menghitung jadwal sholat untuk Jakarta (default Singapore method)", () => {
    const r = computePrayerTimes({ city: "Jakarta" }, "2026-06-15");
    expect(r.location.name).toBe("Jakarta");
    expect(r.location.utcOffset).toBe(7);
    expect(r.method).toBe("Singapore");
    expect(r.date).toBe("2026-06-15");
    expect(r.times.fajr).toMatch(/^\d{2}:\d{2}$/);
    expect(r.times.dhuhr).toMatch(/^\d{2}:\d{2}$/);
    expect(r.times.isha).toMatch(/^\d{2}:\d{2}$/);
  });

  it("menghasilkan urutan waktu sholat yang benar (fajr < sunrise < dhuhr < asr < maghrib < isha)", () => {
    const r = computePrayerTimes({ city: "Jakarta" }, "2026-06-15");
    const t = r.times;
    expect(t.fajr < t.sunrise).toBe(true);
    expect(t.sunrise < t.dhuhr).toBe(true);
    expect(t.dhuhr < t.asr).toBe(true);
    expect(t.asr < t.maghrib).toBe(true);
    expect(t.maghrib < t.isha).toBe(true);
  });

  it("menerima koordinat eksplisit", () => {
    const r = computePrayerTimes({ lat: -6.2, lon: 106.8 }, "2026-06-15");
    expect(r.location.lat).toBe(-6.2);
    expect(r.location.utcOffset).toBe(7); // <115 BT -> WIB
  });

  it("infer UTC offset WITA untuk bujur 115-127", () => {
    const r = computePrayerTimes({ lat: -8.65, lon: 115.22 }, "2026-06-15");
    expect(r.location.utcOffset).toBe(8);
  });

  it("infer UTC offset WIT untuk bujur >127", () => {
    const r = computePrayerTimes({ lat: -2.5, lon: 140.7 }, "2026-06-15");
    expect(r.location.utcOffset).toBe(9);
  });

  it("menerima method alternative (Egyptian)", () => {
    const r1 = computePrayerTimes({ city: "Jakarta" }, "2026-06-15", "Singapore");
    const r2 = computePrayerTimes({ city: "Jakarta" }, "2026-06-15", "Egyptian");
    // Fajr angle berbeda -> waktu fajr akan berbeda.
    expect(r1.times.fajr).not.toBe(r2.times.fajr);
  });

  it("menolak nama kota yang tidak ada", () => {
    expect(() => computePrayerTimes({ city: "Atlantis" })).toThrow(/built-in/);
  });

  it("menolak input tanpa lokasi", () => {
    expect(() => computePrayerTimes({})).toThrow(/city.*lat/);
  });

  it("menolak format tanggal yang salah", () => {
    expect(() => computePrayerTimes({ city: "Jakarta" }, "15-06-2026")).toThrow(/YYYY-MM-DD/);
  });

  it("default ke hari ini jika tanggal tidak diberikan", () => {
    const r = computePrayerTimes({ city: "Jakarta" });
    expect(r.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("computeQibla", () => {
  it("menghitung arah kiblat dari Jakarta (~Barat-Laut, ~295°)", () => {
    const r = computeQibla({ city: "Jakarta" });
    // Jakarta ke Mekkah ≈ 295° (Barat-Laut).
    expect(r.qiblaDegrees).toBeGreaterThan(280);
    expect(r.qiblaDegrees).toBeLessThan(310);
    expect(r.cardinal).toBe("Barat-Laut");
  });

  it("menghitung arah kiblat dari Jayapura", () => {
    const r = computeQibla({ city: "Jayapura" });
    // Jayapura ke Mekkah dari sisi timur Indonesia ≈ 280-290°.
    expect(r.qiblaDegrees).toBeGreaterThan(270);
    expect(r.qiblaDegrees).toBeLessThan(310);
  });

  it("menerima koordinat eksplisit", () => {
    const r = computeQibla({ lat: -6.2, lon: 106.8 });
    expect(r.qiblaDegrees).toBeGreaterThan(0);
    expect(r.qiblaDegrees).toBeLessThan(360);
  });
});
