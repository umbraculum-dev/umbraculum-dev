import fs from "node:fs";
import path from "node:path";

const pkgRoot = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(pkgRoot, "src");
const distDir = path.join(pkgRoot, "dist");

fs.mkdirSync(distDir, { recursive: true });

for (const locale of ["en", "it"]) {
  const src = path.join(srcDir, `${locale}.json`);
  const dest = path.join(distDir, `${locale}.json`);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing locale file: ${src}`);
  }
  fs.copyFileSync(src, dest);
}

