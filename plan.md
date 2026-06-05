# Plan: `mcp-indonesia` — MCP Server untuk Data Publik Indonesia

## Konteks
Tren GitHub 2026: **MCP + AI Agents** meledak, tapi ekosistem MCP untuk **data publik Indonesia masih kosong**. Sementara kebutuhan lokal (data wilayah, BMKG, validator NIK/NPWP) sudah terbukti lewat banyak repo populer. Project ini menjembatani keduanya: satu MCP server yang membungkus sumber data Indonesia jadi *tools* siap pakai untuk AI agent (Claude Desktop/IDE), modular agar mudah dikontribusi bersama.

## Stack
- **TypeScript + Node.js**, SDK `@modelcontextprotocol/sdk`, validasi **Zod**, test **Vitest**.
- **Transport:** stdio lokal.

## Arsitektur — Modular Provider
Core server + modul domain independen. Tiap modul ekspor `register(server)`. Tambah data source = tambah satu folder modul + satu baris di `registry.ts`.

```
src/
├── index.ts              # rakit McpServer + StdioServerTransport
├── core/                 # http.ts, cache.ts, types.ts
└── modules/
    ├── registry.ts       # daftar modul aktif
    ├── wilayah/          # data wilayah administratif (offline, bundled)
    ├── bmkg/             # cuaca & gempa (fetch + cache, atribusi wajib)
    ├── finance/          # kurs BI / IDX / OJK (best-effort)
    └── validator/        # NIK / NPWP (offline, pure logic)
```

## Tools MVP
- **Wilayah:** `wilayah_list_provinces`, `wilayah_list_regencies`, `wilayah_list_districts`, `wilayah_list_villages`, `wilayah_search`, `wilayah_postal_code`
- **BMKG:** `bmkg_latest_earthquake`, `bmkg_recent_earthquakes`, `bmkg_weather_forecast`
- **Finance:** `finance_bi_exchange_rate` (andal), `finance_idx_quote` (eksperimental), `ojk_check_investment`
- **Validator:** `validate_nik`, `validate_npwp`

## Sumber Data
- Wilayah: dataset emsifa/api-wilayah-indonesia (bundled lokal, atribusi).
- BMKG: `api.bmkg.go.id/publik/prakiraan-cuaca`, `data.bmkg.go.id/DataMKG/TEWS/*.json` (atribusi wajib).
- Finance: Bank Indonesia (kurs), IDX, OJK.

## Verifikasi
1. `npm test` lulus, coverage ≥80%.
2. Smoke test stdio `tools/list` (atau MCP Inspector).
3. Uji per tool (wilayah offline, NIK decode, BMKG/kurs online).
4. Integrasi nyata di Claude Desktop.

> Breakdown task lengkap ada di [task.md](task.md).
