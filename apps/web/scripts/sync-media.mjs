/**
 * Sync shared media assets from @umbraculum/media into apps/web/public/media.
 * Source of truth: packages/media/assets/**
 * Destination: apps/web/public/media/**
 *
 * Only copies/overwrites files; never deletes. Safe to run on every dev/build.
 */
import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve(import.meta.dirname, "..");
// Docker: packages/media is mounted at /packages/media. Host: resolve via repo root.
const mediaPkg = fs.existsSync("/packages/media")
  ? "/packages/media"
  : path.join(path.resolve(webRoot, "..", ".."), "packages", "media");
const assetsDir = path.join(mediaPkg, "assets");
const publicMediaDir = path.join(webRoot, "public", "media");

if (!fs.existsSync(assetsDir)) {
  console.warn("sync-media: source not found:", assetsDir);
  process.exit(0);
}

fs.mkdirSync(publicMediaDir, { recursive: true });

const manifestPath = path.join(mediaPkg, "src", "manifest.generated.json");
if (!fs.existsSync(manifestPath)) {
  console.warn("sync-media: manifest not found (run @umbraculum/media build first):", manifestPath);
  process.exit(0);
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
}

console.log("sync-media: synced", entries.length, "assets ->", publicMediaDir);
