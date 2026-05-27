import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(siteRoot, "..");
const src = join(repoRoot, "docs/media/umbi.png");
const destDir = join(siteRoot, "static/img");
const dest = join(destDir, "umbi.png");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`docs-site: copied ${src} -> ${dest}`);
