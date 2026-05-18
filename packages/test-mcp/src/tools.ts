import { spawn } from "node:child_process";
import { appendLog, createRunDir, repoRoot, writeVerdict } from "./runDir.js";
import path from "node:path";
import { writeFileSync } from "node:fs";

export interface ToolResult {
  ok: boolean;
  runDir: string;
  exitCode: number;
  stdoutTail: string;
  stderrTail: string;
}

function tail(text: string, lines = 30): string {
  const arr = text.split("\n");
  if (arr.length <= lines) return text;
  return arr.slice(-lines).join("\n");
}

async function runCommand(
  tool: string,
  command: string,
  args: string[],
  options: { cwd?: string; env?: Record<string, string>; timeoutMs?: number } = {},
): Promise<ToolResult> {
  const runDir = createRunDir(tool);
  appendLog(runDir, { event: "start", tool, command, args, cwd: options.cwd ?? repoRoot() });

  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? repoRoot(),
      env: { ...process.env, ...(options.env ?? {}) },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      try { child.kill("SIGKILL"); } catch { /* ignore */ }
    }, options.timeoutMs ?? 15 * 60_000);

    child.stdout.on("data", (d) => (stdout += String(d)));
    child.stderr.on("data", (d) => (stderr += String(d)));
    child.on("close", (code) => {
      clearTimeout(timeout);
      writeFileSync(path.join(runDir, "stdout.log"), stdout);
      writeFileSync(path.join(runDir, "stderr.log"), stderr);
      const ok = code === 0;
      writeVerdict(runDir, ok ? "pass" : `fail: exit ${code}`);
      appendLog(runDir, { event: "end", exitCode: code, ok });
      resolve({ ok, runDir, exitCode: code ?? -1, stdoutTail: tail(stdout), stderrTail: tail(stderr) });
    });
  });
}

/**
 * In-process smoke equivalent of scripts/smoke.sh, implemented with the
 * built-in fetch() so this tool runs inside any Node >=18 container
 * (including node:20-slim and the api container, which do not ship
 * curl/jq). Keeps the same 5 checks, the same exit semantics, and the
 * same run-dir layout (verdict.txt + log.jsonl + stdout.log/stderr.log).
 *
 * The shell scripts/smoke.sh is retained for human/CI use (curl-based,
 * portable, no Node required); both implementations must stay
 * semantically equivalent. If you add/remove a check here, mirror it in
 * scripts/smoke.sh (and vice versa).
 */
export async function smokeStack(args: { baseUrl?: string } = {}): Promise<ToolResult> {
  const baseUrl = (args.baseUrl ?? process.env['E2E_BASE_URL'] ?? "http://localhost:18080").replace(
    /\/+$/,
    "",
  );
  const persona = process.env['E2E_ADMIN_EMAIL'] ?? "e2e-admin@brewery.local";
  const password = process.env['E2E_ADMIN_PASSWORD'] ?? "e2e-admin-pw!";

  const runDir = createRunDir("smoke");
  appendLog(runDir, { event: "start", tool: "smoke", baseUrl, persona });

  const stdoutLines: string[] = [];
  const stderrLines: string[] = [];
  const checks: Array<{ name: string; ok: boolean; detail?: string }> = [];

  const log = (line: string, ok: boolean) => {
    stdoutLines.push(line);
    if (!ok) stderrLines.push(line);
  };

  // Cold-start wait for /api/health, same budget as smoke.sh (15 * 2s).
  let reachable = false;
  for (let i = 0; i < 15; i++) {
    try {
      const r = await fetch(`${baseUrl}/api/health`, { redirect: "follow" });
      if (r.ok) {
        reachable = true;
        break;
      }
    } catch {
      // not yet
    }
    await new Promise((r) => setTimeout(r, 2_000));
  }
  if (!reachable) {
    const msg = `[smoke] stack not reachable at ${baseUrl} after ~30s`;
    log(msg, false);
    writeFileSync(path.join(runDir, "stdout.log"), stdoutLines.join("\n") + "\n");
    writeFileSync(path.join(runDir, "stderr.log"), stderrLines.join("\n") + "\n");
    writeVerdict(runDir, "fail: stack unreachable");
    appendLog(runDir, { event: "end", exitCode: 2, ok: false, reason: "unreachable" });
    return {
      ok: false,
      runDir,
      exitCode: 2,
      stdoutTail: tail(stdoutLines.join("\n")),
      stderrTail: tail(stderrLines.join("\n")),
    };
  }

  // Check 1: /api/health body has ok=true.
  try {
    const r = await fetch(`${baseUrl}/api/health`);
    const body = (await r.json().catch(() => ({}))) as { ok?: boolean };
    const ok = body.ok === true;
    checks.push({ name: "/api/health", ok, detail: ok ? "ok=true" : `body=${JSON.stringify(body)}` });
    log(`[smoke] /api/health ${ok ? "ok=true OK" : "ok!=true FAIL"}`, ok);
  } catch (e) {
    checks.push({ name: "/api/health", ok: false, detail: String(e) });
    log(`[smoke] /api/health threw: ${String(e)}`, false);
  }

  // Check 2: /en/ should render (Next.js normalizes /en/ -> /en, so follow).
  try {
    const r = await fetch(`${baseUrl}/en/`, { redirect: "follow" });
    const ok = r.status === 200;
    checks.push({ name: "/en/", ok, detail: `status=${r.status}` });
    log(`[smoke] /en/ -> ${r.status} ${ok ? "OK" : "FAIL"}`, ok);
  } catch (e) {
    checks.push({ name: "/en/", ok: false, detail: String(e) });
    log(`[smoke] /en/ threw: ${String(e)}`, false);
  }

  // Check 3: POST /api/auth/login/native with the e2e admin persona.
  let token: string | undefined;
  try {
    const r = await fetch(`${baseUrl}/api/auth/login/native`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: persona, password, preferredLocale: "en" }),
    });
    const body = (await r.json().catch(() => ({}))) as { token?: string };
    token = body.token;
    const ok = !!token;
    checks.push({ name: "/api/auth/login/native", ok, detail: ok ? "token issued" : "no token" });
    log(`[smoke] /api/auth/login/native ${ok ? "-> token issued OK" : "-> no token FAIL (seed:e2e?)"}`, ok);
  } catch (e) {
    checks.push({ name: "/api/auth/login/native", ok: false, detail: String(e) });
    log(`[smoke] /api/auth/login/native threw: ${String(e)}`, false);
  }

  // Checks 4 + 5 require the token from Check 3.
  if (token) {
    try {
      const r = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const body = (await r.json().catch(() => ({}))) as { ok?: boolean; activeWorkspaceId?: string };
      const ok = body.ok === true && !!body.activeWorkspaceId;
      checks.push({ name: "/api/auth/me", ok, detail: `activeWorkspaceId=${body.activeWorkspaceId ?? ""}` });
      log(
        `[smoke] /api/auth/me ${ok ? `ok=true activeWorkspaceId=${body.activeWorkspaceId} OK` : `FAIL body=${JSON.stringify(body)}`}`,
        ok,
      );
    } catch (e) {
      checks.push({ name: "/api/auth/me", ok: false, detail: String(e) });
      log(`[smoke] /api/auth/me threw: ${String(e)}`, false);
    }

    try {
      const r = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      const ok = r.status === 200;
      checks.push({ name: "/api/auth/logout", ok, detail: `status=${r.status}` });
      log(`[smoke] /api/auth/logout -> ${r.status} ${ok ? "OK" : "FAIL"}`, ok);
    } catch (e) {
      checks.push({ name: "/api/auth/logout", ok: false, detail: String(e) });
      log(`[smoke] /api/auth/logout threw: ${String(e)}`, false);
    }
  }

  const allOk = checks.length > 0 && checks.every((c) => c.ok);
  writeFileSync(path.join(runDir, "stdout.log"), stdoutLines.join("\n") + "\n");
  writeFileSync(path.join(runDir, "stderr.log"), stderrLines.join("\n") + "\n");
  writeFileSync(path.join(runDir, "summary.json"), JSON.stringify({ baseUrl, persona, checks }, null, 2));
  writeVerdict(runDir, allOk ? "pass" : "fail: one or more checks failed");
  appendLog(runDir, { event: "end", exitCode: allOk ? 0 : 1, ok: allOk, checkCount: checks.length });

  return {
    ok: allOk,
    runDir,
    exitCode: allOk ? 0 : 1,
    stdoutTail: tail(stdoutLines.join("\n")),
    stderrTail: tail(stderrLines.join("\n")),
  };
}

export async function seedE2eFixture(args: { clean?: boolean } = {}): Promise<ToolResult> {
  const flags = args.clean ? ["--", "--clean"] : [];
  return runCommand(
    "seed-e2e",
    "docker",
    ["compose", "exec", "-T", "api", "npm", "run", "seed:e2e", ...flags],
    { timeoutMs: 120_000 },
  );
}

export async function runApiTests(args: { filter?: string } = {}): Promise<ToolResult> {
  const extra = args.filter ? ["--", "-t", args.filter] : [];
  return runCommand(
    "api-tests",
    "docker",
    ["compose", "exec", "-T", "api", "npm", "test", ...extra],
    { timeoutMs: 25 * 60_000 },
  );
}

export async function runContractsCheck(args: { update?: boolean } = {}): Promise<ToolResult> {
  const script = args.update ? "contracts:update" : "contracts:check";
  return runCommand(
    "contracts",
    "docker",
    ["compose", "exec", "-T", "api", "npm", "run", script],
    { timeoutMs: 5 * 60_000 },
  );
}

export async function runPlaywrightSmoke(args: { baseUrl?: string } = {}): Promise<ToolResult> {
  const baseUrl = args.baseUrl ?? process.env['E2E_BASE_URL'] ?? "http://localhost:18080";
  return runCommand(
    "playwright-smoke",
    "docker",
    [
      "run", "--rm", "--network", "host",
      "-e", `E2E_BASE_URL=${baseUrl}`,
      "-v", `${path.join(repoRoot(), "apps", "web", "e2e")}:/e2e`,
      "-w", "/e2e",
      "mcr.microsoft.com/playwright:v1.60.0-noble",
      "bash", "-lc",
      "npm install --no-audit --no-fund && npx playwright test --project=smoke",
    ],
    { timeoutMs: 20 * 60_000 },
  );
}

export async function runPlaywrightSpec(args: { spec: string; baseUrl?: string }): Promise<ToolResult> {
  if (!args.spec || typeof args.spec !== "string") {
    throw new Error("runPlaywrightSpec: 'spec' is required (e.g. 'smoke/auth.spec.ts')");
  }
  const baseUrl = args.baseUrl ?? process.env['E2E_BASE_URL'] ?? "http://localhost:18080";
  return runCommand(
    "playwright-spec",
    "docker",
    [
      "run", "--rm", "--network", "host",
      "-e", `E2E_BASE_URL=${baseUrl}`,
      "-v", `${path.join(repoRoot(), "apps", "web", "e2e")}:/e2e`,
      "-w", "/e2e",
      "mcr.microsoft.com/playwright:v1.60.0-noble",
      "bash", "-lc",
      `npm install --no-audit --no-fund && npx playwright test ${args.spec}`,
    ],
    { timeoutMs: 20 * 60_000 },
  );
}

export interface LoginAsResult {
  ok: boolean;
  cookie?: string;
  token?: string;
  activeWorkspaceId?: string | null;
  error?: string;
}

export async function loginAs(args: { persona?: string; baseUrl?: string } = {}): Promise<LoginAsResult> {
  const baseUrl = args.baseUrl ?? process.env['E2E_BASE_URL'] ?? "http://localhost:18080";
  const persona = args.persona ?? "e2e-admin";
  const passwords: Record<string, string> = {
    "e2e-admin": process.env['E2E_ADMIN_PASSWORD'] ?? "e2e-admin-pw!",
    "e2e-member": process.env['E2E_MEMBER_PASSWORD'] ?? "e2e-member-pw!",
    "e2e-viewer": process.env['E2E_VIEWER_PASSWORD'] ?? "e2e-viewer-pw!",
  };
  const password = passwords[persona];
  if (!password) return { ok: false, error: `unknown persona: ${persona}` };

  const url = `${baseUrl}/api/auth/login/native`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: `${persona}@brewery.local`, password, preferredLocale: "en" }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: `login failed (${res.status}): ${text.slice(0, 200)}` };
  }
  const body = (await res.json()) as { ok: boolean; token?: string; activeWorkspaceId?: string | null };
  return {
    ok: body.ok === true,
    ...(body.token !== undefined ? { token: body.token, cookie: `sid=${body.token}` } : {}),
    activeWorkspaceId: body.activeWorkspaceId ?? null,
  };
}

export const TOOLS = {
  smokeStack,
  seedE2eFixture,
  runApiTests,
  runContractsCheck,
  runPlaywrightSmoke,
  runPlaywrightSpec,
  loginAs,
} as const;

export type ToolName = keyof typeof TOOLS;
