/**
 * Prefix nomor HP Indonesia per operator.
 *
 * Sumber: data publik Kominfo + Wikipedia (Telephone numbers in Indonesia),
 * diverifikasi dengan zororaka00/id-mobile-detector dan situs operator.
 * Perubahan kepemilikan prefix jarang terjadi; regenerasi manual saat dibutuhkan.
 *
 * Catatan Indosat-Tri merger 2022: nomor 089x masih dikenali sebagai Tri
 * (brand tetap dipertahankan di bawah grup Indosat Ooredoo Hutchison).
 */

export interface OperatorPrefix {
  prefix: string;
  operator: string;
  brand?: string;
}

export const OPERATOR_PREFIXES: OperatorPrefix[] = [
  // Telkomsel
  { prefix: "0811", operator: "Telkomsel", brand: "Halo/Kartu Halo" },
  { prefix: "0812", operator: "Telkomsel", brand: "simPATI" },
  { prefix: "0813", operator: "Telkomsel", brand: "simPATI" },
  { prefix: "0821", operator: "Telkomsel", brand: "simPATI/As" },
  { prefix: "0822", operator: "Telkomsel", brand: "simPATI/As" },
  { prefix: "0823", operator: "Telkomsel", brand: "Kartu As" },
  { prefix: "0851", operator: "Telkomsel", brand: "Kartu As" },
  { prefix: "0852", operator: "Telkomsel", brand: "Kartu As" },
  { prefix: "0853", operator: "Telkomsel", brand: "Kartu As" },
  // Indosat Ooredoo (IM3)
  { prefix: "0814", operator: "Indosat", brand: "IM3" },
  { prefix: "0815", operator: "Indosat", brand: "IM3/Mentari" },
  { prefix: "0816", operator: "Indosat", brand: "IM3/Mentari" },
  { prefix: "0855", operator: "Indosat", brand: "IM3 Matrix" },
  { prefix: "0856", operator: "Indosat", brand: "IM3" },
  { prefix: "0857", operator: "Indosat", brand: "IM3" },
  { prefix: "0858", operator: "Indosat", brand: "IM3 Mentari" },
  // XL
  { prefix: "0817", operator: "XL Axiata", brand: "XL" },
  { prefix: "0818", operator: "XL Axiata", brand: "XL" },
  { prefix: "0819", operator: "XL Axiata", brand: "XL" },
  { prefix: "0859", operator: "XL Axiata", brand: "XL" },
  { prefix: "0877", operator: "XL Axiata", brand: "XL" },
  { prefix: "0878", operator: "XL Axiata", brand: "XL" },
  // Axis (anak XL)
  { prefix: "0831", operator: "XL Axiata", brand: "Axis" },
  { prefix: "0832", operator: "XL Axiata", brand: "Axis" },
  { prefix: "0833", operator: "XL Axiata", brand: "Axis" },
  { prefix: "0838", operator: "XL Axiata", brand: "Axis" },
  // Tri (sekarang dalam grup IOH)
  { prefix: "0895", operator: "Tri", brand: "Tri" },
  { prefix: "0896", operator: "Tri", brand: "Tri" },
  { prefix: "0897", operator: "Tri", brand: "Tri" },
  { prefix: "0898", operator: "Tri", brand: "Tri" },
  { prefix: "0899", operator: "Tri", brand: "Tri" },
  // Smartfren
  { prefix: "0881", operator: "Smartfren" },
  { prefix: "0882", operator: "Smartfren" },
  { prefix: "0883", operator: "Smartfren" },
  { prefix: "0884", operator: "Smartfren" },
  { prefix: "0885", operator: "Smartfren" },
  { prefix: "0886", operator: "Smartfren" },
  { prefix: "0887", operator: "Smartfren" },
  { prefix: "0888", operator: "Smartfren" },
  { prefix: "0889", operator: "Smartfren" },
  // by.U (sub-brand Telkomsel, prefix tetap milik Telkomsel)
];

export const PREFIX_MAP: ReadonlyMap<string, OperatorPrefix> = new Map(
  OPERATOR_PREFIXES.map((p) => [p.prefix, p]),
);
