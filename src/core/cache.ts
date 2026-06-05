/**
 * Cache TTL in-memory sederhana untuk mengurangi hit ke API publik.
 *
 * Tidak ada eviksi berbasis ukuran — entri kedaluwarsa dihapus saat diakses.
 * Cocok untuk jumlah key kecil (per endpoint), bukan cache umum berskala besar.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class TtlCache {
  private store = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly now: () => number = Date.now) {}

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (this.now() >= entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: this.now() + ttlMs });
  }

  /**
   * Ambil dari cache; jika tidak ada/kedaluwarsa, jalankan `loader`,
   * simpan hasilnya dengan TTL, lalu kembalikan.
   */
  async getOrLoad<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await loader();
    this.set(key, value, ttlMs);
    return value;
  }

  clear(): void {
    this.store.clear();
  }
}

/** TTL umum (ms) untuk dipakai modul. */
export const TTL = {
  MINUTE: 60_000,
  TEN_MINUTES: 10 * 60_000,
  HOUR: 60 * 60_000,
  SIX_HOURS: 6 * 60 * 60_000,
} as const;
