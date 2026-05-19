#!/usr/bin/env tsx
/**
 * @umbraculum/test-mcp - small HTTP server exposing testing tools as JSON endpoints.
 *
 * Each tool is reachable two ways:
 *   1. HTTP POST /<toolName>   (body is JSON args)
 *   2. CLI:  tsx src/server.ts --cli <toolName> --json '{"...":"..."}'
 *
 * Modeled after the agentic MCP server in
 * ~/dkprojects/thesiteup/e2e/e2e-app/playwright-suite/scripts/agentic/mcp-server.ts
 * but scoped to umbraculum-dev concerns.
 *
 * Output contract per .cursor/skills/agentic-browser-web-app.md (upstream skill) and docs/agentic-jobs.md (project-local job catalog):
 *   - tool runs that spawn subprocesses write artifacts under var/test-runs/<ts>-<tool>/
 *   - tool runs that just call the API (loginAs) return JSON directly
 */
import http from "node:http";
import { TOOLS, type ToolName } from "./tools.js";
import { latestRunDirFor, summarizeRunDir } from "./runDir.js";

/**
 * Tool results have one of two shapes:
 *  - Subprocess/fetch tools (smokeStack, runApiTests, ...) -> ToolResult,
 *    which carries `runDir` and per-stream tails. The HTTP/CLI response
 *    is enriched from that run-dir so a caller gets verdict/logLines/files
 *    without an extra round trip (mirrors what GET /lastRunArtifacts
 *    returns).
 *  - Lightweight tools (loginAs) -> their own JSON object with no
 *    `runDir`. These pass through unchanged.
 *
 * Without this enrichment a caller would see `{ ok, runDir, exitCode,
 * stdoutTail, stderrTail }` and still have to `cat <runDir>/verdict.txt`
 * to know whether the run passed semantically.
 */
function enrichResultWithRunDir(result: unknown): unknown {
  if (result === null || typeof result !== "object") return result;
  const obj = result as Record<string, unknown>;
  const runDir = obj['runDir'];
  if (typeof runDir !== "string" || runDir.length === 0) return result;
  try {
    const summary = summarizeRunDir(runDir);
    // Server-side summary fields go LAST so a tool can never accidentally
    // shadow them (e.g. a tool result already containing a stringly-
    // shaped "files" field would otherwise be confusing). The tool's own
    // fields stay authoritative for anything they explicitly set.
    return { ...obj, verdict: summary.verdict, logLines: summary.logLines, files: summary.files };
  } catch {
    // Summarization is best-effort; never break the response over a
    // missing/unreadable artifact (e.g. run-dir got rm-rf'd between
    // tool return and HTTP response).
    return result;
  }
}

const PORT = Number(process.env['MCP_PORT'] ?? process.env['PORT'] ?? "8932");

async function dispatch(tool: ToolName, args: Record<string, unknown> = {}): Promise<unknown> {
  switch (tool) {
    case "smokeStack":
      return TOOLS.smokeStack(args);
    case "seedE2eFixture":
      return TOOLS.seedE2eFixture(args);
    case "runApiTests":
      return TOOLS.runApiTests(args);
    case "runContractsCheck":
      return TOOLS.runContractsCheck(args);
    case "runPlaywrightSmoke":
      return TOOLS.runPlaywrightSmoke(args);
    case "runPlaywrightSpec":
      return TOOLS.runPlaywrightSpec(args as { spec: string; baseUrl?: string });
    case "loginAs":
      return TOOLS.loginAs(args);
    default:
      throw new Error(`unknown tool: ${tool}`);
  }
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function json(res: http.ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload, null, 2));
}

function listTools() {
  return {
    ok: true,
    tools: Object.keys(TOOLS),
    docs: {
      smokeStack: { args: { baseUrl: "string (default http://localhost:18080)" } },
      seedE2eFixture: { args: { clean: "boolean (default false)" } },
      runApiTests: { args: { filter: "string (vitest -t filter, optional)" } },
      runContractsCheck: { args: { update: "boolean (default false; UPDATE_CONTRACTS=1)" } },
      runPlaywrightSmoke: { args: { baseUrl: "string" } },
      runPlaywrightSpec: { args: { spec: "string (required, e.g. 'smoke/auth.spec.ts')", baseUrl: "string" } },
      loginAs: { args: { persona: "string (e2e-admin|e2e-member|e2e-viewer)", baseUrl: "string" } },
    },
  };
}

function startServer() {
  const server = http.createServer((req, res) => {
    void handleRequest(req, res);
  });

  server.listen(PORT, () => {
    console.log(`[@umbraculum/test-mcp] listening on http://localhost:${PORT}`);
  });
}

async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (req.method === "GET" && url.pathname === "/") {
    return json(res, 200, listTools());
  }

  if (req.method === "GET" && url.pathname === "/lastRunArtifacts") {
    const tool = url.searchParams.get("tool") ?? undefined;
    const dir = latestRunDirFor(tool);
    if (!dir) return json(res, 404, { ok: false, error: "no runs found" });
    return json(res, 200, { ok: true, ...summarizeRunDir(dir) });
  }

  if (req.method !== "POST") return json(res, 405, { ok: false, error: "method not allowed" });

  // path-based dispatch: POST /<tool>
  const tool = url.pathname.replace(/^\//, "") as ToolName;
  if (!(tool in TOOLS)) return json(res, 404, { ok: false, error: `unknown tool: ${tool}` });

  let body: Record<string, unknown> = {};
  try {
    const text = await readBody(req);
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch (err) {
    return json(res, 400, { ok: false, error: "invalid JSON body", detail: String(err) });
  }

  try {
    const result = await dispatch(tool, body);
    return json(res, 200, enrichResultWithRunDir(result));
  } catch (err) {
    return json(res, 500, { ok: false, error: String((err as Error)?.message ?? err) });
  }
}

async function runCli() {
  const argv = process.argv.slice(2);
  const cliIdx = argv.indexOf("--cli");
  if (cliIdx === -1) return null;
  const tool = argv[cliIdx + 1] as ToolName | undefined;
  if (!tool || !(tool in TOOLS)) {
    console.error(JSON.stringify({ ok: false, error: `unknown tool: ${tool}` }, null, 2));
    process.exit(2);
  }
  const jsonIdx = argv.indexOf("--json");
  const args = jsonIdx !== -1 ? (JSON.parse(argv[jsonIdx + 1] ?? "{}") as Record<string, unknown>) : {};
  try {
    const result = await dispatch(tool, args);
    const enriched = enrichResultWithRunDir(result);
    console.log(JSON.stringify(enriched, null, 2));
    const ok = (enriched as { ok?: boolean } | undefined)?.ok !== false;
    process.exit(ok ? 0 : 1);
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: String((err as Error)?.message ?? err) }, null, 2));
    process.exit(1);
  }
}

void (async () => {
  const cliRan = await runCli();
  if (cliRan === null) startServer();
})();
