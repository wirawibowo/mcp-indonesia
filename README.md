<div align="center">

# 🇮🇩 mcp-indonesia

<img src="https://img.shields.io/badge/MCP-Model%20Context%20Protocol-6366f1?style=for-the-badge&logo=anthropic&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.6-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Coverage-96%25-22c55e?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge" />

<br/>

**MCP Server untuk data publik Indonesia.**  
Beri AI agent (Claude Desktop, IDE, dll) kemampuan langsung untuk query data wilayah administratif, info cuaca & gempa BMKG, kurs mata uang, serta validasi & dekode NIK/NPWP — semua dari satu server.

<br/>

```
🏙️ Wilayah   ·   🌤️ BMKG   ·   💱 Kurs   ·   🪪 NIK/NPWP
```

</div>

---

## ✨ Kenapa `mcp-indonesia`?

| | |
|---|---|
| 🔌 **Plug & play** | Satu baris config di Claude Desktop, langsung jalan |
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
| `bmkg_weather_forecast` | Prakiraan cuaca 3 harian per desa (kode adm4) |

### 🪪 Validator — *offline, pure logic*
| Tool | Deskripsi |
|------|-----------|
| `validate_nik` | Validasi & dekode NIK 16 digit (provinsi, kab/kota, tgl lahir, gender) |
| `validate_npwp` | Validasi & dekode NPWP 15/16 digit |

### 💱 Keuangan — *online, cache 6 jam*
| Tool | Deskripsi |
|------|-----------|
| `finance_exchange_rate` | Kurs mata uang termasuk IDR (referensi pasar) |

---

## 🚀 Instalasi

```bash
git clone https://github.com/wirawibowo/mcp-indonesia.git
cd mcp-indonesia
npm install
npm run build
```

### ⚙️ Konfigurasi Claude Desktop

Tambahkan ke `claude_desktop_config.json`:

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

Restart Claude Desktop, lalu coba:

> 💬 _"Cari kode wilayah Cibadak"_  
> 💬 _"Validasi NIK 3273011708950001"_  
> 💬 _"Gempa terkini di Indonesia"_  
> 💬 _"Kurs USD ke IDR sekarang?"_

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

> **`bmkg_weather_forecast`** — memerlukan kode **adm4** format Kemendagri (mis. `31.74.04.1003`). Skema ini berbeda dari dataset wilayah emsifa. Cari adm4 di [data.bmkg.go.id](https://data.bmkg.go.id).

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

- [ ] `finance_idx_quote` — harga saham IDX (menunggu sumber API andal)
- [ ] `ojk_check_investment` — cek entitas investasi ilegal OJK
- [ ] Pemetaan kode adm4 BMKG ↔ dataset wilayah (resolusi cuaca by nama desa)
- [ ] Data wilayah 38 provinsi pasca-pemekaran Papua

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
