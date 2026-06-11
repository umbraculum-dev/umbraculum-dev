#!/usr/bin/env node
/**
 * Node resolver for installation profile (ci-parity / node:20-slim — no python3).
 * Keep in sync with scripts/lib/resolve-install-manifest.py
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function repoRoot(start = process.cwd()) {
  let cur = resolve(start);
  for (;;) {
    if (existsSync(resolve(cur, ".umbraculum/install.core.json"))) return cur;
    const parent = resolve(cur, "..");
    if (parent === cur) return start;
    cur = parent;
  }
}

function manifestPath(root, env) {
  const override = env.UMBRACULUM_INSTALL_MANIFEST?.trim();
  if (override) return resolve(override);

  const active = resolve(root, ".umbraculum/install.json");
  if (existsSync(active)) return active;

  const profile = env.UMBRACULUM_MODULE_PROFILE?.trim() || "platform";
  const name = profile === "reference" ? "install.reference.json" : "install.core.json";
  return resolve(root, ".umbraculum", name);
}

function loadManifest(root, env) {
  const path = manifestPath(root, env);
  if (!existsSync(path)) {
    const profile = env.UMBRACULUM_MODULE_PROFILE?.trim() || "platform";
    if (profile === "reference") {
      return { id: "reference", verticals: ["brewery"], nativeApps: ["brewery"] };
    }
    return { id: "core", verticals: [], nativeApps: ["blank"] };
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

const args = process.argv.slice(2);
const fieldIdx = args.indexOf("--field");
const field = fieldIdx >= 0 ? args[fieldIdx + 1] : null;
const rootArgIdx = args.indexOf("--repo-root");
const root = rootArgIdx >= 0 ? resolve(args[rootArgIdx + 1]) : repoRoot();

const manifest = loadManifest(root, process.env);

if (args.includes("--json")) {
  console.log(JSON.stringify(manifest, null, 2));
  process.exit(0);
}

switch (field) {
  case "id":
    console.log(manifest.id ?? "core");
    break;
  case "verticals":
    console.log((manifest.verticals ?? []).join(","));
    break;
  case "nativeApps":
    console.log((manifest.nativeApps ?? []).join(","));
    break;
  case "primaryNativeApp":
    console.log((manifest.nativeApps ?? ["blank"])[0] ?? "blank");
    break;
  case "hasBrewery":
    console.log((manifest.verticals ?? []).includes("brewery") ? "true" : "false");
    break;
  default:
    console.log(JSON.stringify(manifest));
}
