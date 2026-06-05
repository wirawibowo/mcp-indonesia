# Task List — `mcp-indonesia`

Status: `[ ]` belum · `[~]` proses · `[x]` selesai

## Fase 0 — Setup
- [x] T0.1 Init `package.json` (type module, bin, scripts)
- [x] T0.2 `tsconfig.json` (NodeNext, strict)
- [x] T0.3 Config build (`tsup`) & test (`vitest`)
- [x] T0.4 `.gitignore`
- [x] T0.5 Install deps (`npm install`)
- [x] T0.6 `git init` + commit awal

## Fase 1 — Core
- [x] T1.1 `core/types.ts` — helper respons MCP (`textResult`/`jsonResult`/`errorResult`)
- [x] T1.2 `core/http.ts` — `fetchJson` (timeout 8s, retry 1x, error ramah)
- [x] T1.3 `core/cache.ts` — TTL cache
- [x] T1.4 Test core (http mock + cache expiry) — 10 test

## Fase 2 — Modul Wilayah (offline)
- [x] T2.1 Bundle dataset wilayah (emsifa, CSV→raw.ts) + atribusi
- [x] T2.2 `repository.ts` — load + query (provinces → villages, search, detail)
- [x] T2.3 Register 6 tools `wilayah_*` (Zod)
- [x] T2.4 Test wilayah — 9 test

## Fase 3 — Modul Validator (offline, TDD)
- [x] T3.1 `validate_nik` (decode wilayah/tgl lahir/gender) — test dulu
- [x] T3.2 `validate_npwp` (format + dekode struktur) — test dulu
- [x] T3.3 Register tools `validate_*` — 12 test

## Fase 4 — Modul BMKG (fetch + cache, atribusi wajib)
- [x] T4.1 `bmkg_latest_earthquake` (+ ShakemapUrl)
- [x] T4.2 `bmkg_recent_earthquakes` (terkini/dirasakan)
- [x] T4.3 `bmkg_weather_forecast` (input adm4, normalisasi titik)
- [x] T4.4 Test BMKG (HTTP mock + cek atribusi) — 6 test

## Fase 5 — Modul Finance (best-effort)
- [x] T5.1 `finance_exchange_rate` (open.er-api.com, IDR + utama)
- [~] T5.2 `finance_idx_quote` — DITUNDA (tak ada API resmi andal) → Roadmap
- [~] T5.3 `ojk_check_investment` — DITUNDA → Roadmap
- [x] T5.4 Test finance (HTTP mock) — 4 test

## Fase 6 — Rakit & Rilis
- [x] T6.1 `registry.ts` + `index.ts` (guard run-direct)
- [x] T6.2 Smoke test stdio (`scripts/smoke.mjs`) — 12 tools OK
- [x] T6.3 `README.md` (instalasi, config, atribusi, kontribusi, roadmap)
- [x] T6.4 Integration test in-memory (8 test) + coverage 96% (≥80% ✔)
- [x] T6.5 Commit rilis + push ke github.com/wirawibowo/mcp-indonesia

## Ringkasan
- **12 tools** aktif · **49 test** lulus · coverage **96.47%**.
- IDX & OJK masuk Roadmap (tidak ada sumber resmi andal — tidak di-mock palsu).
