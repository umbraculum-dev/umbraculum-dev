import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(root, "../..");
const dist = join(root, "dist");
const pub = join(root, "public");
const umbiSrc = join(repoRoot, "docs/media/umbi.png");
const announcementSrc = join(root, "announcement.config.json");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(pub, dist, { recursive: true });

const umbiDestDir = join(dist, "img");
mkdirSync(umbiDestDir, { recursive: true });
cpSync(umbiSrc, join(umbiDestDir, "umbi.png"));

writeFileSync(
  join(dist, "announcement.config.json"),
  readFileSync(announcementSrc, "utf8"),
  "utf8",
);

console.log(`@umbraculum/website: copied ${pub} + umbi.png + announcement.config.json -> ${dist}`);
