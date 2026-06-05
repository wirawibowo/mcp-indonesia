<div align="center">

# 🇮🇩 mcp-indonesia

<img src="https://img.shields.io/badge/MCP-Open%20Standard-6366f1?style=for-the-badge&logo=anthropic&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.6-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Tools-26-22c55e?style=for-the-badge" />
<img src="https://img.shields.io/badge/Tests-139%20passing-22c55e?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge" />

<br/>

**MCP Server untuk data publik Indonesia.**  
Beri AI agent akses langsung ke data wilayah, BMKG, kurs (termasuk JISDOR resmi), validasi NIK/NPWP/HP, kode pos, hari libur, jadwal sholat & arah kiblat, daftar bank, serta cek entitas OJK & Satgas PASTI — semua dari satu server.

<br/>

```
🏙️ Wilayah · 📮 Kodepos · 🌤️ BMKG · 💱 Kurs+JISDOR · 🪪 NIK/NPWP/HP
🏦 Bank · 🕌 Sholat · 📅 Libur · ⚠️ OJK Waspada
```

</div>

---

## 🌐 Kompatibilitas — Semua MCP Client

> **MCP adalah open standard.** `mcp-indonesia` bekerja di semua aplikasi yang support MCP client.

| Client | Platform | Status |
|--------|----------|:------:|
| **Anthropic Desktop** | Desktop app | ✅ |
| **Anthropic Web** | Web | ✅ |
| **Cursor** | IDE | ✅ |
| **VS Code** (GitHub Copilot) | IDE | ✅ |
| **Windsurf** | IDE | ✅ |
| **Zed Editor** | IDE | ✅ |
| **Continue.dev** | VS Code / JetBrains ext | ✅ |
| **Cline** | VS Code ext | ✅ |
| **Goose** (Block) | Desktop app | ✅ |
| **Amazon Q Developer** | IDE / CLI | ✅ |
| **Gemini CLI** | Terminal | ✅ |
| **App custom** | Node / Python / Go / dll | ✅ via SDK |

---

## ✨ Kenapa `mcp-indonesia`?

| | |
|---|---|
| 🔌 **Universal** | Jalan di semua MCP client |
| 📦 **Offline-first** | Data wilayah & validator bekerja tanpa internet |
| ⚡ **TTL Cache** | Hit API publik (BMKG, kurs) seminimal mungkin |
| 🧩 **Modular** | Tambah data source baru = buat 1 modul + 1 baris registrasi |
| 🤝 **Open-source** | Kontribusi sangat diterima! |

---

## 🛠️ Tools (26 tools aktif)

### 🏙️ Wilayah Administratif — *offline, instan*
| Tool | Deskripsi |
|------|-----------|
| `wilayah_list_provinces` | Daftar 38 provinsi Indonesia |
| `wilayah_list_regencies` | Kab/kota dalam provinsi |
| `wilayah_list_districts` | Kecamatan dalam kab/kota |
| `wilayah_list_villages` | Desa/kelurahan dalam kecamatan |
| `wilayah_search` | Cari nama wilayah lintas level |
| `wilayah_detail` | Hierarki lengkap dari sebuah kode wilayah |

### 📮 Kodepos — *offline, 83.762 entries*
| Tool | Deskripsi |
|------|-----------|
| `kodepos_get` | Kode pos dari kode wilayah adm4 (10 digit) |
| `kodepos_search` | Reverse: kode pos → daftar desa/kelurahan |

### 🌤️ BMKG — *online, cache otomatis*
| Tool | Deskripsi |
|------|-----------|
| `bmkg_latest_earthquake` | Info gempa terkini |
| `bmkg_recent_earthquakes` | 15 gempa terakhir (`terkini` / `dirasakan`) |
| `bmkg_weather_forecast` | Prakiraan cuaca 3 harian — masukkan **kode adm4 atau nama desa** |

### 🪪 Validator — *offline, pure logic*
| Tool | Deskripsi |
|------|-----------|
| `validate_nik` | Validasi & dekode NIK 16 digit (provinsi, kab/kota, tgl lahir, gender) |
| `validate_npwp` | Validasi & dekode NPWP 15/16 digit |
| `phone_validate` | Validasi format nomor HP Indonesia (08xx / +628xx) |
| `phone_operator` | Deteksi operator dari prefix (Telkomsel, XL/Axis, Indosat, Tri, Smartfren) |

### 💱 Keuangan — *online, cache*
| Tool | Cache | Deskripsi |
|------|-------|-----------|
| `finance_exchange_rate` | 6 jam | Kurs mata uang termasuk IDR (referensi pasar) |
| `finance_idx_quote` | 1 menit | Harga saham IDX via Yahoo Finance (tidak resmi, delay ~15 mnt) |
| `finance_bi_jisdor` | 6 jam | **JISDOR resmi Bank Indonesia** (USD/IDR + valas lain) |

### 🏦 Bank — *offline, 40+ bank*
| Tool | Deskripsi |
|------|-----------|
| `bank_list` | Daftar bank Indonesia (filter: umum/syariah/asing/pembangunan) |
| `bank_get` | Detail bank by kode kliring (3 digit) atau SWIFT/BIC |
| `bank_search` | Cari bank by nama/alias |

### 🕌 Prayer — *offline, pure astronomical calc*
| Tool | Deskripsi |
|------|-----------|
| `prayer_times` | Jadwal sholat (Subuh, Dhuhr, Ashar, Maghrib, Isya) — kota Indonesia atau lat/lon |
| `prayer_qibla` | Arah kiblat dalam derajat (+ cardinal direction) |

### 📅 Holiday — *offline, multi-tahun*
| Tool | Deskripsi |
|------|-----------|
| `holiday_check` | Cek apakah tanggal tertentu libur nasional / cuti bersama |
| `holiday_list` | Daftar libur dalam setahun (filter tipe) |
| `holiday_next` | Hari libur berikutnya dari tanggal tertentu |

### ⚠️ OJK Waspada Investasi — *offline snapshot*
| Tool | Deskripsi |
|------|-----------|
| `ojk_check_entity` | Cek entitas: terdaftar OJK / masuk daftar ilegal Satgas PASTI |

---

## 🚀 Instalasi

```bash
git clone https://github.com/wirawibowo/mcp-indonesia.git
cd mcp-indonesia
npm install
npm run build
```

---

## ⚙️ Konfigurasi per Client

### Anthropic Desktop App

Edit file config MCP (`mcp_config.json` atau sesuai nama di app yang kamu pakai):

```json
{
  "mcpServers": {
    "indonesia": {
      "command": "node",
      "args": ["/path/ke/mcp-indonesia/dist/index.js"]
    }
  }
}
```

Restart app, lalu coba:
> 💬 _"Cari kode wilayah Cibadak"_ · _"Validasi NIK 3273011708950001"_ · _"Gempa terkini di Indonesia"_

---

### Cursor IDE

Edit `~/.cursor/mcp.json` (global) atau `.cursor/mcp.json` (per project):

```json
{
  "mcpServers": {
    "indonesia": {
      "command": "node",
      "args": ["/path/ke/mcp-indonesia/dist/index.js"]
    }
  }
}
```

---

### VS Code (GitHub Copilot)

Edit `.vscode/mcp.json` di root project:

```json
{
  "servers": {
    "indonesia": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/ke/mcp-indonesia/dist/index.js"]
    }
  }
}
```

---

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "indonesia": {
      "command": "node",
      "args": ["/path/ke/mcp-indonesia/dist/index.js"]
    }
  }
}
```

---

### Cline (VS Code Extension)

Buka **Cline Settings → MCP Servers → Edit Config**, tambahkan:

```json
{
  "mcpServers": {
    "indonesia": {
      "command": "node",
      "args": ["/path/ke/mcp-indonesia/dist/index.js"]
    }
  }
}
```

---

## 🖥️ Penggunaan Mandiri (Tanpa AI Client)

Tidak punya AI client dengan MCP? Bisa dipakai langsung dengan 3 cara:

### 1. 🔍 MCP Inspector (GUI interaktif — paling mudah)

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Buka browser → `http://localhost:5173`. Kamu bisa browse semua tools dan memanggil langsung lewat UI.

---

### 2. 📡 Raw JSON-RPC via stdin (scripting / debugging)

Server berkomunikasi lewat stdin/stdout pakai protokol JSON-RPC 2.0.

```bash
# Jalankan server
node dist/index.js
```

Kirim request ke stdin (satu baris per pesan):

```jsonc
// List semua tools
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}

// Panggil tool wilayah_search
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"wilayah_search","arguments":{"query":"bandung","limit":3}}}

// Validasi NIK
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"validate_nik","arguments":{"nik":"3273011708950001","referenceYear":2024}}}

// Gempa terkini
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"bmkg_latest_earthquake","arguments":{}}}
```

---

### 3. 💻 Integrasi Programatik (Node.js / TypeScript)

Pakai `createServer()` langsung sebagai library di aplikasimu:

```typescript
import { createServer } from "./src/index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

// Buat server dan client dalam satu proses
const server = createServer();
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
const client = new Client({ name: "my-app", version: "1.0.0" });

await Promise.all([
  client.connect(clientTransport),
  server.connect(serverTransport),
]);

// List semua tools
const { tools } = await client.listTools();
console.log(tools.map(t => t.name));

// Panggil tool
const result = await client.callTool({
  name: "wilayah_search",
  arguments: { query: "surabaya", limit: 5 },
});
console.log(result.content[0].text);

await client.close();
```

---

## 🧑‍💻 Pengembangan

```bash
npm run dev            # Jalankan via tsx (tanpa build)
npm test               # Unit + integration test (139 test)
npm run test:coverage  # Laporan coverage (91%+, target ≥80%)
npm run typecheck      # Cek tipe TypeScript
node scripts/smoke.mjs # Smoke test stdio end-to-end (perlu build dulu)
```

---

## ⚠️ Catatan Akurasi

> **NIK** — kode provinsi & kab/kota diselaraskan dengan dataset wilayah. Kode **kecamatan** (2 digit skema Dukcapil) **tidak** dipetakan ke nama karena berbeda dengan kode emsifa (3 digit) — dikembalikan sebagai kode mentah.

> **NPWP** — DJP **tidak mempublikasikan algoritma check-digit resmi**, sehingga validasi bersifat **struktural** (format + dekode bagian), bukan kriptografis.

> **Kurs** — bersumber dari ExchangeRate-API (referensi pasar), **bukan** kurs resmi JISDOR Bank Indonesia.

> **`bmkg_weather_forecast`** — bisa diisi kode adm4 (mis. `3174041003`) **atau nama desa/kelurahan** (mis. `"Menteng"`). Jika nama tidak unik, hasil pertama yang cocok digunakan — sertakan nama kecamatan/kota untuk hasil lebih spesifik.

---

## 📚 Atribusi Sumber Data

| Sumber | Keterangan |
|--------|------------|
| [emsifa/api-wilayah-indonesia](https://github.com/emsifa/api-wilayah-indonesia) | Dataset wilayah administratif |
| [BMKG](https://www.bmkg.go.id) | Data cuaca & gempa — **pencantuman sumber wajib** sesuai ketentuan BMKG |
| [ExchangeRate-API](https://www.exchangerate-api.com) | Data kurs mata uang (referensi pasar) |
| [Bank Indonesia JISDOR](https://www.bi.go.id) | Kurs JISDOR resmi BI |
| [cahyadsn/wilayah_kodepos](https://github.com/cahyadsn/wilayah_kodepos) | Kode pos per desa/kelurahan (Kepmendagri 2025) |
| [guangrei/APIHariLibur_V2](https://github.com/guangrei/APIHariLibur_V2) | Hari libur nasional & cuti bersama (SKB 3 Menteri) |
| [adhan-js](https://github.com/batoulapps/adhan-js) | Kalkulasi jadwal sholat & arah kiblat |
| [Namchee/ojk-invest-api](https://github.com/Namchee/ojk-invest-api) | Mirror data OJK Waspada Investasi (Satgas PASTI) |

---

## 🏗️ Arsitektur

```
src/
├── index.ts              ← Entrypoint: McpServer + StdioServerTransport
├── core/
│   ├── types.ts          ← Helper respons MCP (textResult / jsonResult / errorResult)
│   ├── http.ts           ← fetchJson: timeout 8s, retry 1x, error ramah
│   └── cache.ts          ← TTL Cache in-memory
└── modules/
    ├── registry.ts       ← Daftar modul aktif (satu-satunya titik perakitan)
    ├── wilayah/          ← Offline, dataset di-bundle
    ├── validator/        ← Offline, pure logic (NIK/NPWP)
    ├── phone/            ← Offline, deteksi operator dari prefix
    ├── bank/             ← Offline, 40+ bank (kliring + SWIFT)
    ├── kodepos/          ← Offline, 83.762 kode pos (Kepmendagri 2025)
    ├── holiday/          ← Offline, hari libur 2025-2027 (SKB 3 Menteri)
    ├── prayer/           ← Offline, pure astronomical calc (adhan-js)
    ├── ojk/              ← Offline snapshot, Satgas PASTI 2.189+11.278 entitas
    ├── bmkg/             ← Online + cache + atribusi BMKG wajib
    └── finance/          ← Online + cache 6 jam (kurs pasar + JISDOR resmi BI)
```

**Menambah modul baru:**
1. Buat `src/modules/<nama>/index.ts` → ekspor `register(server: McpServer)`
2. Daftarkan tool via `server.registerTool(name, { description, inputSchema }, handler)`
3. Bungkus hasil dengan `jsonResult(data, attribution)` dari `core/types.ts`
4. Untuk data online: pakai `fetchJson` + `TtlCache`
5. Tambah satu entri di `src/modules/registry.ts`
6. Tulis test di `test/<nama>.test.ts`

---

## 🗺️ Roadmap

- [ ] Data kecamatan & desa untuk provinsi Papua DOB 2022 (92/95/96/97)
- [ ] `holiday_refresh` — script auto-update holiday data untuk tahun mendatang
- [ ] `bank_refresh` — script periodic untuk sinkronisasi daftar bank dari BI

---

## 🤝 Kontribusi

Pull request sangat diterima! Lihat panduan di bagian **Arsitektur** di atas.  
Untuk fitur besar, silakan buka issue dulu agar bisa didiskusikan bersama.

---

<div align="center">

**Dibuat dengan ❤️ untuk ekosistem AI Indonesia**

[![GitHub](https://img.shields.io/badge/GitHub-wirawibowo%2Fmcp--indonesia-181717?style=flat-square&logo=github)](https://github.com/wirawibowo/mcp-indonesia)
&nbsp;
<img src="https://img.shields.io/badge/MIT-License-f59e0b?style=flat-square" />

</div>
