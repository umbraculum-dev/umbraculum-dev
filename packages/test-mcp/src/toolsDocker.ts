import path from "node:path";

import { repoRoot } from "./runDir.js";
import { runCommand, type ToolResult } from "./toolsRunCommand.js";

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
