/** Shared OpenAPI document metadata for @fastify/swagger and committed artifacts. */
export const OPENAPI_INFO = {
  title: "Umbraculum API",
  version: "0.0.1",
  description: [
    "Platform catalog — machine-readable OpenAPI spec for the Umbraculum API.",
    "",
    "Coverage (Phase D, 2026-06): 81 paths / 105 operations — canonical modules, rendering (RFC-0007),",
    "platform routes (health, auth, workspaces), billing, ads, AI (proposals/settings/usage), integrations,",
    "webhooks, and platform-admin. Generated with UMBRACULUM_MODULE_PROFILE=platform.",
    "",
    "Brewery vertical routes are in the separate openapi/brewery.json add-on (reference profile).",
    "ISVs without the brewery vertical should use this catalog only.",
    "See docs/API-OPENAPI.md and docs/BUILDING-YOUR-VERTICAL.md.",
    "",
    "Streaming: POST /ai/chat (SSE) is documented in docs/API-OPENAPI.md §Streaming endpoints, not in this spec.",
    "",
    "Authoritative contracts: @umbraculum/<code>-contracts packages in git.",
    "Automation adapters: CONTRACT_VERSION handshake remains authoritative over this spec.",
    "BeerJSON and other complex JSON bodies may use loose OpenAPI schema shapes — contracts win on edge validation.",
  ].join("\n"),
} as const;

export const OPENAPI_BREWERY_INFO = {
  title: "Umbraculum Brewery API (reference vertical add-on)",
  version: "0.0.1",
  description: [
    "Brewery reference vertical add-on — 55 paths / 70 operations (Phase D, 2026-06).",
    "",
    "Generated with UMBRACULUM_MODULE_PROFILE=reference and filtered to brewery-tagged routes only.",
    "Not present when UMBRACULUM_MODULE_PROFILE=platform at runtime.",
    "",
    "Canonical platform catalog: services/api/openapi/openapi.json",
    "Integrator index: docs/API-OPENAPI.md",
    "Browsable copy on docs site: /openapi/brewery (Redoc embed, Phase D).",
  ].join("\n"),
} as const;

export const OPENAPI_TAGS = [
  { name: "automation", description: "Canonical automation module (vessels, adapters)" },
  { name: "pim", description: "Canonical PIM module" },
  { name: "mrp", description: "Canonical MRP module" },
  { name: "crp", description: "Canonical CRP module" },
  { name: "rendering", description: "Horizontal document rendering (RFC-0007)" },
  { name: "platform", description: "Platform health, auth, and workspaces" },
  { name: "billing", description: "Workspace billing intents, tier, and usage" },
  { name: "ads", description: "Public ad slot resolution" },
  { name: "ai", description: "AI orchestrator — proposals, settings, usage" },
  { name: "platform-admin", description: "Platform administrator routes (ads, recipes)" },
  { name: "integrations", description: "Fermentation monitor integrations (Tilt, iSpindel, RAPT)" },
  { name: "webhooks", description: "Billing provider webhooks (Stripe, RevenueCat)" },
  { name: "brewery", description: "Brewery reference vertical (optional add-on spec)" },
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
