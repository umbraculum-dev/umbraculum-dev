import { writeFileSync } from "node:fs";
import path from "node:path";

import { appendLog, createRunDir, writeVerdict } from "./runDir.js";
import { tail, type ToolResult } from "./toolsRunCommand.js";

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
