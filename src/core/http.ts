/**
 * Pembungkus `fetch` dengan timeout, retry sekali, dan pemetaan error ramah.
 * Dipakai semua modul yang mengambil data dari API publik.
 */

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly url?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export interface FetchOptions {
  /** Timeout per percobaan (ms). Default 8000. */
  timeoutMs?: number;
  /** Jumlah retry tambahan setelah percobaan pertama. Default 1. */
  retries?: number;
  /** Header tambahan. */
  headers?: Record<string, string>;
}

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_RETRIES = 1;

/**
 * Ambil JSON dari `url`. Melempar `HttpError` dengan pesan ramah pada kegagalan
 * (timeout, status non-2xx, atau body bukan JSON valid).
 */
export async function fetchJson<T = unknown>(url: string, opts: FetchOptions = {}): Promise<T> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = opts.retries ?? DEFAULT_RETRIES;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json", ...opts.headers },
      });
      if (!res.ok) {
        throw new HttpError(
          `Permintaan ke layanan gagal (HTTP ${res.status}).`,
          res.status,
          url,
        );
      }
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      // Status 4xx tidak akan membaik dengan retry — hentikan lebih awal.
      if (err instanceof HttpError && err.status && err.status >= 400 && err.status < 500) {
        break;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  if (lastError instanceof HttpError) throw lastError;
  if (lastError instanceof Error && lastError.name === "AbortError") {
    throw new HttpError(`Permintaan melebihi batas waktu (${timeoutMs} ms).`, undefined, url);
  }
  throw new HttpError(
    `Tidak dapat menghubungi layanan. Periksa koneksi internet.`,
    undefined,
    url,
  );
}
