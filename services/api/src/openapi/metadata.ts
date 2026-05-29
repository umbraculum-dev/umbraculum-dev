/** Shared OpenAPI document metadata for @fastify/swagger and committed artifact. */
export const OPENAPI_INFO = {
  title: "Umbraculum API",
  version: "0.0.1",
  description: [
    "Alpha partial OpenAPI spec for the Umbraculum API.",
    "",
    "Coverage at public alpha: canonical modules (automation, pim, mrp, crp) and horizontal rendering (RFC-0007).",
    "Platform routes (auth, workspaces, billing), brewery vertical routes, webhooks, and AI orchestrator paths",
    "are not yet schema-backed — see human route tables in docs/modules/ until PR3 completes.",
    "",
    "Authoritative contracts: @umbraculum/<code>-contracts packages in git.",
    "Automation adapters: CONTRACT_VERSION handshake remains authoritative over this spec.",
    "",
    "Canonical doc index: docs/API-OPENAPI.md",
  ].join("\n"),
} as const;

export const OPENAPI_TAGS = [
  { name: "automation", description: "Canonical automation module (vessels, adapters)" },
  { name: "pim", description: "Canonical PIM module" },
  { name: "mrp", description: "Canonical MRP module" },
  { name: "crp", description: "Canonical CRP module" },
  { name: "rendering", description: "Horizontal document rendering (RFC-0007)" },
  { name: "platform", description: "Platform health and future platform routes" },
] as const;

export const OPENAPI_SECURITY_SCHEMES = {
  sessionCookie: {
    type: "apiKey" as const,
    in: "cookie" as const,
    name: "sid",
    description: "Web session cookie (httpOnly). See docs/AUTH-STRATEGY.md.",
  },
  bearerAuth: {
    type: "http" as const,
    scheme: "bearer",
    bearerFormat: "session token",
    description: "Native / SDK bearer token. See docs/AUTH-STRATEGY.md.",
  },
};
