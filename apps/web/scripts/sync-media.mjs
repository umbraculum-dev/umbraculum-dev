/**
 * Sync shared media assets from @brewery/media into apps/web/public/media.
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

/** @param {string} srcDir */
/** @param {string} destDir */
function syncDir(srcDir, destDir) {
  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, ent.name);
    const destPath = path.join(destDir, ent.name);
    if (ent.isDirectory()) {
      if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
      syncDir(srcPath, destPath);
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

fs.mkdirSync(publicMediaDir, { recursive: true });
syncDir(assetsDir, publicMediaDir);
console.log("sync-media: synced", assetsDir, "->", publicMediaDir);
