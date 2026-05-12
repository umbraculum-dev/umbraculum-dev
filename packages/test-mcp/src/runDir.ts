import {
  mkdirSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
  appendFileSync,
  readFileSync,
} from "node:fs";
import path from "node:path";

/**
 * Run-dir layout (mirrors .cursor/skills/agentic-browser-web-app.md upstream skill):
 *
 *   var/test-runs/<UTC-timestamp>-<tool>/
 *     verdict.txt
 *     log.jsonl
 *     screenshots/   (browser-MCP only)
 *     trace.zip      (Playwright only)
 *     stdout.log
 *     stderr.log
 */
export function repoRoot(): string {
  let cur = process.cwd();
  for (let i = 0; i < 12; i++) {
    if (existsSync(path.join(cur, "docker-compose.yml")) && existsSync(path.join(cur, "package.json"))) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return process.cwd();
}

export function createRunDir(tool: string): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(repoRoot(), "var", "test-runs", `${ts}-${tool}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeVerdict(dir: string, verdict: string): void {
  writeFileSync(path.join(dir, "verdict.txt"), verdict.trim() + "\n");
}

export function appendLog(dir: string, entry: Record<string, unknown>): void {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n";
  appendFileSync(path.join(dir, "log.jsonl"), line);
}

export function latestRunDirFor(tool?: string): string | null {
  const base = path.join(repoRoot(), "var", "test-runs");
  if (!existsSync(base)) return null;
  const entries = readdirSync(base);
  const filtered = tool ? entries.filter((e) => e.endsWith("-" + tool)) : entries;
  if (filtered.length === 0) return null;
  filtered.sort();
  return path.join(base, filtered[filtered.length - 1]);
}

export function summarizeRunDir(dir: string): {
  runDir: string;
  verdict: string | null;
  logLines: number;
  files: string[];
} {
  const stat = (p: string) => (existsSync(p) ? statSync(p) : null);
  const verdictPath = path.join(dir, "verdict.txt");
  const verdict = stat(verdictPath) ? readFileSync(verdictPath, "utf8").trim() : null;
  const logPath = path.join(dir, "log.jsonl");
  const logLines = stat(logPath)
    ? readFileSync(logPath, "utf8").split("\n").filter(Boolean).length
    : 0;
  const files: string[] = [];
  if (existsSync(dir)) {
    for (const f of readdirSync(dir)) files.push(f);
  }
  return { runDir: dir, verdict, logLines, files };
}
