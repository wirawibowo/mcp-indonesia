// Konversi CSV wilayah (emsifa) menjadi satu modul TS berisi string mentah.
// Pendekatan ini menjamin data ter-bundle identik di dev (tsx) maupun build (tsup),
// tanpa perlu menyalin aset atau resolusi path runtime.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "src", "modules", "wilayah", "data");

const files = ["provinces", "regencies", "districts", "villages"];
const parts = [
  "// AUTO-GENERATED oleh scripts/gen-wilayah.mjs — jangan edit manual.",
  "// Sumber: emsifa/api-wilayah-indonesia (CSV).",
];

for (const f of files) {
  const csv = readFileSync(join(dataDir, `${f}.csv`), "utf8").trimEnd();
  const escaped = csv.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  parts.push(`export const ${f}Csv = \`${escaped}\`;`);
}

writeFileSync(join(dataDir, "raw.ts"), parts.join("\n") + "\n", "utf8");
console.log("raw.ts generated");
