import fs from "node:fs";
import path from "node:path";

/**
 * Lightweight i18n guardrail:
 * - Scans `apps/web/app/**` TSX files.
 * - Flags obvious hard-coded user-facing strings in:
 *   - headings: <h1..h6>TEXT</h1..h6>
 *   - paragraphs: <p>TEXT</p>
 *   - buttons: <button>TEXT</button>
 *   - aria-label / placeholder attributes with letters
 *
 * This is intentionally heuristic (fast + low-maintenance).
 */

const repoRoot = path.resolve(import.meta.dirname, "..");
const appDir = path.join(repoRoot, "app");

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
  const rel = path.relative(repoRoot, file);
  const src = fs.readFileSync(file, "utf8");

  /** @type {Array<{line:number, kind:string, text:string}>} */
  const problems = [];

  // Simple tag-text-tag patterns (single-line and multi-line safe enough with [\s\S]*?)
  const tagRules = [
    // Use [\s\S]*? for attributes to avoid being confused by `=>` inside JSX props.
    { kind: "heading", re: /<h[1-6][\s\S]*?>\s*([^<{][\s\S]*?)\s*<\/h[1-6]>/g },
    { kind: "paragraph", re: /<p[\s\S]*?>\s*([^<{][\s\S]*?)\s*<\/p>/g },
    { kind: "button", re: /<button[\s\S]*?>\s*([^<{][\s\S]*?)\s*<\/button>/g },
  ];

  for (const { kind, re } of tagRules) {
    for (const m of src.matchAll(re)) {
      const text = String(m[1] ?? "").trim().replace(/\s+/g, " ");
      if (!text) continue;
      if (!hasLetters(text)) continue;
      // If it looks like it’s already translated / dynamic, skip.
      if (text.includes("{") || text.includes("t(") || text.includes("t.")) continue;

      const idx = m.index ?? 0;
      const line = src.slice(0, idx).split("\n").length;
      problems.push({ line, kind, text });
    }
  }

  // Attribute checks
  const attrRe = /\b(aria-label|placeholder)=["']([^"']+)["']/g;
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
  if (!fs.existsSync(appDir)) {
    console.error(`Missing app dir: ${appDir}`);
    process.exit(2);
  }

  const files = walk(appDir).filter((f) => f.endsWith(".tsx"));
  /** @type {Array<{rel:string, problems:Array<{line:number, kind:string, text:string}>}>} */
  const results = [];

  for (const f of files) {
    const res = checkFile(f);
    if (res.problems.length) results.push(res);
  }

  if (!results.length) {
    console.log("i18n-guardrail: OK (no obvious hard-coded strings found)");
    return;
  }

  console.error("i18n-guardrail: Found hard-coded user-facing strings:");
  for (const r of results) {
    for (const p of r.problems) {
      console.error(`- ${r.rel}:${p.line} [${p.kind}] ${JSON.stringify(p.text)}`);
    }
  }
  process.exit(1);
}

main();

