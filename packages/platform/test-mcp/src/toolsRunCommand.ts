import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

import { appendLog, createRunDir, repoRoot, writeVerdict } from "./runDir.js";

export interface ToolResult {
  ok: boolean;
  runDir: string;
  exitCode: number;
  stdoutTail: string;
  stderrTail: string;
}

export function tail(text: string, lines = 30): string {
  const arr = text.split("\n");
  if (arr.length <= lines) return text;
  return arr.slice(-lines).join("\n");
}

export async function runCommand(
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
