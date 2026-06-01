/** Shared OpenAPI document metadata for @fastify/swagger and committed artifacts. */
export const OPENAPI_INFO = {
  title: "Umbraculum API",
  version: "0.0.1",
  description: [
    "Platform catalog — partial OpenAPI spec for the Umbraculum API.",
    "",
    "Coverage: canonical modules (automation, pim, mrp, crp), horizontal rendering (RFC-0007),",
    "and platform routes (health, auth, workspaces). Generated with UMBRACULUM_MODULE_PROFILE=platform.",
    "",
    "Brewery vertical routes are documented in the separate openapi/brewery.json add-on spec",
    "(reference profile only). ISVs building without the brewery vertical should use this catalog only.",
    "See docs/API-OPENAPI.md and docs/BUILDING-YOUR-VERTICAL.md.",
    "",
    "Billing, ads, integrations, webhooks, AI, and platform-admin routes are documented in Phase C.",
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
    "Optional add-on OpenAPI spec for the brewery reference vertical.",
    "",
    "Generated with UMBRACULUM_MODULE_PROFILE=reference and filtered to brewery-tagged routes only.",
    "Not present when UMBRACULUM_MODULE_PROFILE=platform at runtime.",
    "",
    "Canonical platform catalog: services/api/openapi/openapi.json",
    "Integrator index: docs/API-OPENAPI.md",
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
