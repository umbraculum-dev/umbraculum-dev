#!/usr/bin/env tsx
/**
 * @brewery/test-mcp - small HTTP server exposing testing tools as JSON endpoints.
 *
 * Each tool is reachable two ways:
 *   1. HTTP POST /<toolName>   (body is JSON args)
 *   2. CLI:  tsx src/server.ts --cli <toolName> --json '{"...":"..."}'
 *
 * Modeled after the agentic MCP server in
 * ~/dkprojects/thesiteup/e2e/e2e-app/playwright-suite/scripts/agentic/mcp-server.ts
 * but scoped to brewery-app concerns.
 *
 * Output contract per .cursor/skills/agentic-browser-web-app.md (upstream skill) and docs/agentic-jobs.md (project-local job catalog):
 *   - tool runs that spawn subprocesses write artifacts under var/test-runs/<ts>-<tool>/
 *   - tool runs that just call the API (loginAs) return JSON directly
 */
import http from "node:http";
import { TOOLS, type ToolName } from "./tools.js";
import { latestRunDirFor, summarizeRunDir } from "./runDir.js";

const PORT = Number(process.env.MCP_PORT ?? process.env.PORT ?? "8932");

interface JsonRequest {
  tool: ToolName;
  args?: Record<string, unknown>;
}

async function dispatch(tool: ToolName, args: Record<string, unknown> = {}): Promise<unknown> {
  switch (tool) {
    case "smokeStack":
      return TOOLS.smokeStack(args as { baseUrl?: string });
    case "seedE2eFixture":
      return TOOLS.seedE2eFixture(args as { clean?: boolean });
    case "runApiTests":
      return TOOLS.runApiTests(args as { filter?: string });
    case "runContractsCheck":
      return TOOLS.runContractsCheck(args as { update?: boolean });
    case "runPlaywrightSmoke":
      return TOOLS.runPlaywrightSmoke(args as { baseUrl?: string });
    case "runPlaywrightSpec":
      return TOOLS.runPlaywrightSpec(args as { spec: string; baseUrl?: string });
    case "loginAs":
      return TOOLS.loginAs(args as { persona?: string; baseUrl?: string });
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

async function startServer() {
  const server = http.createServer(async (req, res) => {
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
      return json(res, 200, result);
    } catch (err) {
      return json(res, 500, { ok: false, error: String((err as Error)?.message ?? err) });
    }
  });

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[@brewery/test-mcp] listening on http://localhost:${PORT}`);
  });
}

async function runCli() {
  const argv = process.argv.slice(2);
  const cliIdx = argv.indexOf("--cli");
  if (cliIdx === -1) return null;
  const tool = argv[cliIdx + 1] as ToolName | undefined;
  if (!tool || !(tool in TOOLS)) {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ ok: false, error: `unknown tool: ${tool}` }, null, 2));
    process.exit(2);
  }
  const jsonIdx = argv.indexOf("--json");
  const args = jsonIdx !== -1 ? (JSON.parse(argv[jsonIdx + 1] ?? "{}") as Record<string, unknown>) : {};
  try {
    const result = await dispatch(tool, args);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
    const ok = (result as { ok?: boolean } | undefined)?.ok !== false;
    process.exit(ok ? 0 : 1);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ ok: false, error: String((err as Error)?.message ?? err) }, null, 2));
    process.exit(1);
  }
}

void (async () => {
  const cliRan = await runCli();
  if (cliRan === null) await startServer();
})();
