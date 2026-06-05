import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  // Pastikan dataset JSON ikut tersedia relatif terhadap dist.
  // Dataset di-import sebagai module JSON sehingga ter-bundle otomatis.
  banner: {
    js: "#!/usr/bin/env node",
  },
});
