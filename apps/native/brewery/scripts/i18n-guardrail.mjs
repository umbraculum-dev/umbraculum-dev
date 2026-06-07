import fs from "node:fs";
import path from "node:path";

/**
 * Lightweight i18n guardrail (native):
 * - Scans `apps/native/src/**` TS/TSX files.
 * - Flags obvious hard-coded user-facing strings in:
 *   - <Text>TEXT</Text>
 *   - <Heading>TEXT</Heading>
 *   - accessibilityLabel / accessibilityHint / placeholder attributes with letters
 *
 * This is intentionally heuristic (fast + low-maintenance).
 */

const nativeRoot = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(nativeRoot, "src");

/** @param {string} dir */
function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

/** @param {string} s */
function hasLetters(s) {
  return /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(s);
}

/** @param {string} file */
function checkFile(file) {
  const rel = path.relative(nativeRoot, file);
  const src = fs.readFileSync(file, "utf8");

  /** @type {Array<{line:number, kind:string, text:string}>} */
  const problems = [];

  const tagRules = [
    { kind: "Text", re: /<Text[\s\S]*?>\s*([^<{][\s\S]*?)\s*<\/Text>/g },
    { kind: "Heading", re: /<Heading[\s\S]*?>\s*([^<{][\s\S]*?)\s*<\/Heading>/g },
  ];

  for (const { kind, re } of tagRules) {
    for (const m of src.matchAll(re)) {
      const text = String(m[1] ?? "").trim().replace(/\s+/g, " ");
      if (!text) continue;
      if (!hasLetters(text)) continue;
      if (text.includes("{") || text.includes("t(") || text.includes("t.")) continue;

      const idx = m.index ?? 0;
      const line = src.slice(0, idx).split("\n").length;
      problems.push({ line, kind, text });
    }
  }

  const attrRe = /\b(accessibilityLabel|accessibilityHint|placeholder)=["']([^"']+)["']/g;
  for (const m of src.matchAll(attrRe)) {
    const text = String(m[2] ?? "").trim();
    if (!text) continue;
    if (!hasLetters(text)) continue;
    const idx = m.index ?? 0;
    const line = src.slice(0, idx).split("\n").length;
    problems.push({ line, kind: m[1] ?? "attr", text });
  }

  return { rel, problems };
}

function main() {
  if (!fs.existsSync(srcDir)) {
    console.error(`Missing src dir: ${srcDir}`);
    process.exit(2);
  }

  const files = walk(srcDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
  /** @type {Array<{rel:string, problems:Array<{line:number, kind:string, text:string}>}>} */
  const results = [];

  for (const f of files) {
    const res = checkFile(f);
    if (res.problems.length) results.push(res);
  }

  if (!results.length) {
    console.log("i18n-guardrail (native): OK (no obvious hard-coded strings found)");
    return;
  }

  console.error("i18n-guardrail (native): Found hard-coded user-facing strings:");
  for (const r of results) {
    for (const p of r.problems) {
      console.error(`- ${r.rel}:${p.line} [${p.kind}] ${JSON.stringify(p.text)}`);
    }
  }
  process.exit(1);
}

main();

