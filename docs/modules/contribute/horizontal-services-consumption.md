# Horizontal services consumption — quick reference

**Tier:** Public  
**Status:** v1.0 (contributor cheat sheet)  
**Audience:** module authors, vertical builders, third-party integrators.

One-page summary of [RFC-0001 §8 (Decision F)](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md). **Consume platform services; never reimplement them.**

Full RFC table and enforcement layers: [RFC-0001 §8.2](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md). Deep dives:

- Tenancy + ACL → [`TENANCY-AND-ACL.md`](../../TENANCY-AND-ACL.md)
- Prisma vs API → [`DATA-ACCESS-BOUNDARIES.md`](../../DATA-ACCESS-BOUNDARIES.md)
- Auth (login/sessions) → [`AUTH-STRATEGY.md`](../../AUTH-STRATEGY.md)

---

## Obligation table (abbreviated)

| Concern | Platform owns | You must | You must not |
|---|---|---|---|
| **Identity / sessions** | `User`, `Session`, `/auth/*` | Use session/bearer auth via platform routes | Parallel session model |
| **Tenancy** | `Workspace`, `WorkspaceMember`, `requireActiveWorkspace` | Scope all ops to session `activeWorkspaceId` | Parallel tenancy concept |
| **ACL / roles** | `AclService`, `WorkspaceRole` | Call platform ACL in services; declare roles via SDK conventions | Custom permission tables |
| **Billing** | `WorkspaceBilling`, Stripe/RevenueCat integration | Declare `addonCodes` / `tierLimits` via SDK | Import Stripe/RevenueCat in module code |
| **AI** | Orchestrator, tool registry, BYOK vault | `registerAiTools`, register prompts/knowledge via SDK | Call LLM providers directly from module code |
| **Observability** | Pino logger, error handler, audit conventions | Use platform logger and event shapes | Ad-hoc logging stacks |
| **i18n** | `@umbraculum/i18n`, `@umbraculum/i18n-react` | Module-prefixed message namespaces | Forked translation system |
| **UI** | `@umbraculum/ui`, `@umbraculum/navigation` | Build on design tokens + route IDs | Parallel component library |
| **Secrets** | Platform key vault (AI BYOK today) | Register secret kinds via SDK | Secrets in module env/files |
| **Integrations** | Devices, attachments, readings framework | Register device kinds via integrations SDK | Parallel device-ingestion path |
| **HTTP** | Fastify plugins, `registerModule()` | Register routes through module registration | Custom CORS/auth around platform |
| **Database** | Prisma + Postgres schemas | Use platform client; module models in module schema | Parallel ORM; client-side Postgres |
| **Rendering** | `@umbraculum/rendering`, BullMQ jobs | `registerDocumentTemplate`, submit render jobs | Bundle PDF/XLSX engines in module |
| **Notifications** | Outbound-delivery service (RFC-0008) | Register intents/templates via SDK | SMTP/provider SDK in module |

---

## Pre-flight (60 seconds)

Before writing code, answer **no** to every question below. If any answer is **yes**, stop — you are proposing a platform change or misclassifying the work.

1. Does my module define its own login or session store?
2. Does my module use a workspace id from the request body without session membership checks?
3. Does my module ship its own role/permission tables?
4. Does my module call Stripe, Anthropic, or SMTP directly?
5. Does `apps/web` or `apps/native` import Prisma or `DATABASE_URL`?
6. Does my published npm package expose Prisma types?

---

## In-repo module slice checklist

For code under `services/api/src/modules/<code>/`:

1. Routes registered via `registerModule()` — not a standalone Fastify app.
2. `requireActiveWorkspace()` at the route boundary.
3. `assertMembership` (today) / `AclService.requireRole` (target) in services.
4. Prisma queries include `workspaceId`.
5. DTOs in `packages/<code>-contracts/` with Zod parsers ([RFC-0003](../../rfcs/0003-validation-library-adoption.md)).
6. L2 cross-workspace isolation test for new routes ([`TESTING.md`](../../TESTING.md)).

---

## Third-party module checklist

For packages outside this monorepo:

1. Pin `@umbraculum/module-sdk` and `@umbraculum/<code>-contracts` from npm (when published).
2. Integrate via HTTP + documented routes ([`API-OPENAPI.md`](../../API-OPENAPI.md)).
3. No database credentials in the integrator deployment for Umbraculum data.
4. Respect the same tenancy/ACL semantics the API enforces (you inherit them by calling the API).

---

## Cross-references

- [`README.md`](README.md) — four contributor paths
- [`canonical-module.md`](canonical-module.md) — mini-RFC + consumption checklist (Tier 1)
- [`third-party-module.md`](third-party-module.md) — external repo path
- [`horizontal-package.md`](horizontal-package.md) — when you are adding cross-cutting infrastructure
