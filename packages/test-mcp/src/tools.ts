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

export async function smokeStack(args: { baseUrl?: string } = {}): Promise<ToolResult> {
  const baseUrl = args.baseUrl ?? process.env.E2E_BASE_URL ?? "http://localhost:18080";
  return runCommand("smoke", path.join(repoRoot(), "scripts", "smoke.sh"), [baseUrl], { timeoutMs: 120_000 });
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
  const baseUrl = args.baseUrl ?? process.env.E2E_BASE_URL ?? "http://localhost:18080";
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
  const baseUrl = args.baseUrl ?? process.env.E2E_BASE_URL ?? "http://localhost:18080";
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
  const baseUrl = args.baseUrl ?? process.env.E2E_BASE_URL ?? "http://localhost:18080";
  const persona = args.persona ?? "e2e-admin";
  const passwords: Record<string, string> = {
    "e2e-admin": process.env.E2E_ADMIN_PASSWORD ?? "e2e-admin-pw!",
    "e2e-member": process.env.E2E_MEMBER_PASSWORD ?? "e2e-member-pw!",
    "e2e-viewer": process.env.E2E_VIEWER_PASSWORD ?? "e2e-viewer-pw!",
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
    token: body.token,
    cookie: body.token ? `sid=${body.token}` : undefined,
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
