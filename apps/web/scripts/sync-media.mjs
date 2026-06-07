/**
 * Sync shared media assets from platform + vertical media packages into apps/web/public/media.
 * Source of truth:
 *   - packages/platform/media/assets/** (platform; usually empty)
 *   - packages/verticals/brewery/media-assets/assets/** (brewery reference vertical)
 * Destination: apps/web/public/media/**
 *
 * Only copies/overwrites files; never deletes. Safe to run on every dev/build.
 */
import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve(import.meta.dirname, "..");
const monorepoRoot = path.resolve(webRoot, "..", "..");

/** @param {string} relPkg */
function resolveMediaPkg(relPkg) {
  const containerPath = `/packages/${relPkg}`;
  if (fs.existsSync(containerPath)) return containerPath;
  return path.join(monorepoRoot, "packages", ...relPkg.split("/"));
}

const mediaPackages = [
  "platform/media",
  "verticals/brewery/media-assets",
];

const publicMediaDir = path.join(webRoot, "public", "media");
fs.mkdirSync(publicMediaDir, { recursive: true });

let synced = 0;

for (const relPkg of mediaPackages) {
  const mediaPkg = resolveMediaPkg(relPkg);
  const assetsDir = path.join(mediaPkg, "assets");
  const manifestPath = path.join(mediaPkg, "src", "manifest.generated.json");

  if (!fs.existsSync(manifestPath)) {
    console.warn("sync-media: manifest not found (run package build first):", manifestPath);
    continue;
  }
  if (!fs.existsSync(assetsDir)) {
    continue;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const entries = Object.entries(manifest);

  for (const [key, value] of entries) {
    const srcPath = path.join(assetsDir, key);
    const publicPath = String(value.publicPath ?? "");
    if (!publicPath.startsWith("/media/")) continue;
    const relOut = publicPath.replace(/^\/media\//, "");
    const destPath = path.join(publicMediaDir, relOut);

    if (!fs.existsSync(srcPath)) {
      console.warn("sync-media: missing source file:", srcPath);
      continue;
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    synced += 1;
  }
}

console.log("sync-media: synced", synced, "assets ->", publicMediaDir);
