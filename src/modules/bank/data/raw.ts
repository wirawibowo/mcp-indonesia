/**
 * Daftar bank Indonesia (bank umum + syariah utama) beserta kode kliring 3-digit
 * dan kode SWIFT/BIC.
 *
 * Sumber:
 *  - Daftar bank umum terdaftar di Bank Indonesia (bi.go.id/id/publikasi/data/Daftar-Bank.aspx).
 *  - Kode SWIFT/BIC: theswiftcodes.com, wise.com SWIFT codes Indonesia, dan
 *    laman resmi masing-masing bank.
 *
 * Perubahan: bank dapat merger (cth. BSI 2021 = BRI Syariah + Mandiri Syariah +
 * BNI Syariah) atau cabut izin. Regenerasi tahunan disarankan.
 *
 * Catatan: kode kliring 3-digit (RTGS) adalah standar nasional; SWIFT/BIC adalah
 * standar internasional 8/11 karakter (XXXXIDJA atau XXXXIDJAXXX).
 */

export interface Bank {
  /** Kode kliring/RTGS Bank Indonesia (3 digit). Diisi "" jika tidak ada. */
  code: string;
  /** Kode SWIFT/BIC. Diisi "" jika bank tidak terdaftar SWIFT. */
  swift: string;
  /** Nama lengkap bank. */
  name: string;
  /** Singkatan umum (untuk pencarian). */
  alias?: string;
  /** "umum" | "syariah" | "asing" | "pembangunan" (BPD). */
  type: "umum" | "syariah" | "asing" | "pembangunan";
}

export const BANKS: Bank[] = [
  // Himbara (BUMN)
  { code: "002", swift: "BRINIDJA", name: "Bank Rakyat Indonesia", alias: "BRI", type: "umum" },
  { code: "008", swift: "BMRIIDJA", name: "Bank Mandiri", alias: "Mandiri", type: "umum" },
  { code: "009", swift: "BNINIDJA", name: "Bank Negara Indonesia", alias: "BNI", type: "umum" },
  { code: "200", swift: "BTANIDJA", name: "Bank Tabungan Negara", alias: "BTN", type: "umum" },
  { code: "451", swift: "BSMDIDJA", name: "Bank Syariah Indonesia", alias: "BSI", type: "syariah" },
  // Bank Swasta Besar
  { code: "014", swift: "CENAIDJA", name: "Bank Central Asia", alias: "BCA", type: "umum" },
  { code: "011", swift: "BDINIDJA", name: "Bank Danamon Indonesia", alias: "Danamon", type: "umum" },
  { code: "022", swift: "BNIAIDJA", name: "Bank CIMB Niaga", alias: "CIMB Niaga", type: "umum" },
  { code: "013", swift: "PDBKIDJA", name: "Permata Bank", alias: "Permata", type: "umum" },
  { code: "016", swift: "MBBEIDJA", name: "Maybank Indonesia", alias: "Maybank", type: "umum" },
  { code: "019", swift: "PANIIDJA", name: "Bank Pan Indonesia", alias: "Panin", type: "umum" },
  { code: "028", swift: "AGOBIDJA", name: "Bank OCBC NISP", alias: "OCBC NISP", type: "umum" },
  { code: "023", swift: "UOBBIDJA", name: "Bank UOB Indonesia", alias: "UOB", type: "umum" },
  { code: "153", swift: "SDOAIDJA", name: "Bank Sinarmas", alias: "Sinarmas", type: "umum" },
  { code: "036", swift: "MCORIDJA", name: "Bank Multi Arta Sentosa", alias: "MNC Bank", type: "umum" },
  { code: "213", swift: "BBBBIDJA", name: "Bank BTPN", alias: "BTPN", type: "umum" },
  { code: "147", swift: "BAEKIDJA", name: "Bank Muamalat Indonesia", alias: "Muamalat", type: "syariah" },
  { code: "422", swift: "ARTGIDJA", name: "Bank BCA Syariah", alias: "BCA Syariah", type: "syariah" },
  { code: "506", swift: "MEGAIDJA", name: "Bank Mega", alias: "Mega", type: "umum" },
  // Bank Digital
  { code: "490", swift: "", name: "Bank Neo Commerce", alias: "Neo", type: "umum" },
  { code: "542", swift: "", name: "Bank Jago", alias: "Jago", type: "umum" },
  { code: "501", swift: "", name: "Bank Digital BCA (Blu)", alias: "Blu", type: "umum" },
  { code: "523", swift: "", name: "Bank Aladin Syariah", alias: "Aladin", type: "syariah" },
  { code: "503", swift: "", name: "SeaBank Indonesia", alias: "SeaBank", type: "umum" },
  { code: "517", swift: "PANIIDJA", name: "Bank Panin Dubai Syariah", alias: "Panin Syariah", type: "syariah" },
  // Bank Pembangunan Daerah (BPD) utama
  { code: "110", swift: "PDJBIDJA", name: "Bank Pembangunan Daerah Jawa Barat dan Banten", alias: "Bank BJB", type: "pembangunan" },
  { code: "111", swift: "BJTGIDJA", name: "Bank Pembangunan Daerah Jawa Tengah", alias: "Bank Jateng", type: "pembangunan" },
  { code: "114", swift: "PDJTIDJA", name: "Bank Pembangunan Daerah Jawa Timur", alias: "Bank Jatim", type: "pembangunan" },
  { code: "113", swift: "PDKJIDJA", name: "Bank DKI", alias: "Bank DKI", type: "pembangunan" },
  { code: "129", swift: "PDIJIDJA", name: "Bank Pembangunan Daerah Bali", alias: "Bank BPD Bali", type: "pembangunan" },
  // Bank Asing
  { code: "031", swift: "CITIIDJX", name: "Citibank Indonesia", alias: "Citibank", type: "asing" },
  { code: "032", swift: "BOFAUS3N", name: "Bank of America Indonesia", alias: "BoA", type: "asing" },
  { code: "041", swift: "HSBCIDJA", name: "HSBC Indonesia", alias: "HSBC", type: "asing" },
  { code: "042", swift: "TOBKIDJX", name: "Bank of Tokyo-Mitsubishi UFJ", alias: "MUFG", type: "asing" },
  { code: "046", swift: "DEUTIDJA", name: "Deutsche Bank Indonesia", alias: "Deutsche", type: "asing" },
  { code: "050", swift: "SCBLIDJX", name: "Standard Chartered Bank Indonesia", alias: "StanChart", type: "asing" },
  { code: "087", swift: "DBSBIDJA", name: "Bank DBS Indonesia", alias: "DBS", type: "asing" },
  { code: "061", swift: "ANZBIDJX", name: "ANZ Indonesia", alias: "ANZ", type: "asing" },
  { code: "069", swift: "BKKBIDJA", name: "Bangkok Bank", alias: "Bangkok Bank", type: "asing" },
  { code: "067", swift: "DEUTIDJA", name: "Bank ICBC Indonesia", alias: "ICBC", type: "asing" },
];
