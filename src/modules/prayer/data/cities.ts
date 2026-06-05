/**
 * Koordinat kota-kota utama Indonesia untuk shortcut input prayer_times.
 *
 * Sumber: koordinat referensi ibukota provinsi & kota besar (BMKG, OpenStreetMap).
 * Untuk kota di luar daftar ini, user wajib memberikan koordinat eksplisit.
 */

export interface City {
  name: string;
  /** Lintang (latitude), positif untuk utara, negatif untuk selatan. */
  lat: number;
  /** Bujur (longitude). Indonesia: ~95–141 BT. */
  lon: number;
  /** Offset zona waktu dari UTC dalam jam (7=WIB, 8=WITA, 9=WIT). */
  utcOffset: number;
}

export const CITIES: ReadonlyArray<City> = [
  // WIB (UTC+7)
  { name: "Jakarta", lat: -6.2088, lon: 106.8456, utcOffset: 7 },
  { name: "Bandung", lat: -6.9175, lon: 107.6191, utcOffset: 7 },
  { name: "Surabaya", lat: -7.2575, lon: 112.7521, utcOffset: 7 },
  { name: "Semarang", lat: -6.9667, lon: 110.4167, utcOffset: 7 },
  { name: "Yogyakarta", lat: -7.7956, lon: 110.3695, utcOffset: 7 },
  { name: "Medan", lat: 3.5952, lon: 98.6722, utcOffset: 7 },
  { name: "Palembang", lat: -2.9909, lon: 104.7566, utcOffset: 7 },
  { name: "Padang", lat: -0.9492, lon: 100.3543, utcOffset: 7 },
  { name: "Pekanbaru", lat: 0.5333, lon: 101.45, utcOffset: 7 },
  { name: "Tangerang", lat: -6.1783, lon: 106.63, utcOffset: 7 },
  { name: "Bekasi", lat: -6.2349, lon: 106.9896, utcOffset: 7 },
  { name: "Bogor", lat: -6.595, lon: 106.8167, utcOffset: 7 },
  { name: "Depok", lat: -6.4025, lon: 106.7942, utcOffset: 7 },
  { name: "Banda Aceh", lat: 5.5483, lon: 95.3238, utcOffset: 7 },
  { name: "Pontianak", lat: -0.0263, lon: 109.3425, utcOffset: 7 },
  { name: "Banjarmasin", lat: -3.3194, lon: 114.5908, utcOffset: 7 },
  { name: "Solo", lat: -7.5667, lon: 110.8167, utcOffset: 7 },
  { name: "Malang", lat: -7.9839, lon: 112.6214, utcOffset: 7 },
  // WITA (UTC+8)
  { name: "Denpasar", lat: -8.65, lon: 115.2167, utcOffset: 8 },
  { name: "Makassar", lat: -5.1477, lon: 119.4327, utcOffset: 8 },
  { name: "Manado", lat: 1.4748, lon: 124.8421, utcOffset: 8 },
  { name: "Balikpapan", lat: -1.2654, lon: 116.8312, utcOffset: 8 },
  { name: "Samarinda", lat: -0.5022, lon: 117.1536, utcOffset: 8 },
  { name: "Palu", lat: -0.8917, lon: 119.8707, utcOffset: 8 },
  { name: "Mataram", lat: -8.5833, lon: 116.1167, utcOffset: 8 },
  { name: "Kupang", lat: -10.1772, lon: 123.607, utcOffset: 8 },
  // WIT (UTC+9)
  { name: "Jayapura", lat: -2.5337, lon: 140.7181, utcOffset: 9 },
  { name: "Ambon", lat: -3.6954, lon: 128.1814, utcOffset: 9 },
  { name: "Manokwari", lat: -0.8615, lon: 134.0625, utcOffset: 9 },
  { name: "Sorong", lat: -0.8762, lon: 131.2558, utcOffset: 9 },
  { name: "Ternate", lat: 0.7833, lon: 127.3667, utcOffset: 9 },
];

export const CITY_INDEX: ReadonlyMap<string, City> = new Map(
  CITIES.map((c) => [c.name.toLowerCase(), c]),
);

export function findCity(name: string): City | null {
  return CITY_INDEX.get(name.trim().toLowerCase()) ?? null;
}
