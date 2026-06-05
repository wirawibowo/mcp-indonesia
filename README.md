<div align="center">

# 🇮🇩 mcp-indonesia

<img src="https://img.shields.io/badge/MCP-Open%20Standard-6366f1?style=for-the-badge&logo=anthropic&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.6-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Tools-13-22c55e?style=for-the-badge" />
<img src="https://img.shields.io/badge/Coverage-96%25-22c55e?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge" />

<br/>

**MCP Server untuk data publik Indonesia.**  
Beri AI agent kemampuan langsung untuk query data wilayah administratif, info cuaca & gempa BMKG, kurs mata uang, serta validasi & dekode NIK/NPWP — semua dari satu server.

<br/>

```
🏙️ Wilayah   ·   🌤️ BMKG   ·   💱 Kurs   ·   🪪 NIK/NPWP
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

## 🛠️ Tools (12 tools aktif)

### 🏙️ Wilayah Administratif — *offline, instan*
| Tool | Deskripsi |
|------|-----------|
| `wilayah_list_provinces` | Daftar 38 provinsi Indonesia |
| `wilayah_list_regencies` | Kab/kota dalam provinsi |
| `wilayah_list_districts` | Kecamatan dalam kab/kota |
| `wilayah_list_villages` | Desa/kelurahan dalam kecamatan |
| `wilayah_search` | Cari nama wilayah lintas level |
| `wilayah_detail` | Hierarki lengkap dari sebuah kode wilayah |

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

### 💱 Keuangan — *online, cache*
| Tool | Cache | Deskripsi |
|------|-------|-----------|
| `finance_exchange_rate` | 6 jam | Kurs mata uang termasuk IDR (referensi pasar) |
| `finance_idx_quote` | 1 menit | Harga saham IDX via Yahoo Finance (tidak resmi, delay ~15 mnt) |

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
npm test               # Unit + integration test (49 test)
npm run test:coverage  # Laporan coverage (96%, target ≥80%)
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
| [ExchangeRate-API](https://www.exchangerate-api.com) | Data kurs mata uang |

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
    ├── wilayah/          ← Offline, dataset di-bundle (CSV → TypeScript)
    ├── validator/        ← Offline, pure logic
    ├── bmkg/             ← Online + cache + atribusi BMKG wajib
    └── finance/          ← Online + cache 6 jam
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

- [ ] `ojk_check_investment` — cek entitas investasi ilegal OJK (bundled snapshot Satgas PASTI)
- [ ] `finance_bi_jisdor` — kurs JISDOR Bank Indonesia (menunggu endpoint resmi stabil)
- [ ] Data kecamatan & desa untuk provinsi Papua DOB 2022 (92/95/96/97)

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
