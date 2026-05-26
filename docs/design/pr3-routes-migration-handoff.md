# PR 3 (services/api/routes → Zod + fastify-type-provider-zod) — migration handoff

**Tier:** Internal
**Status:** In progress — handoff doc landed; route migration scheduled for next session under container access.
**Owners:** project lead
**Related:** [RFC-0003](../rfcs/0003-validation-library-adoption.md) Decisions D + F, PR 1 worked example at [`packages/contracts/src/auth/meResponse.ts`](../../packages/contracts/src/auth/meResponse.ts), PR 2 at [`packages/automation-contracts/src/mailbox.ts`](../../packages/automation-contracts/src/mailbox.ts).

---

## Why a handoff doc (PR 3 specifically)

PR 3 is the biggest PR in the migration plan:

- **28 route files** under `services/api/src/routes/` (most with multiple routes each — auth.ts alone has 9 routes; the total endpoint count is closer to 80–100).
- **~30 `assert*` helpers** to retire (`assertSafeNextPath`, `assertLocale`, `assertUiTheme`, `assertUiFontScale`, `assertUiDensity`, `assertWorkspaceId`, etc. — defined inline per route file).
- **~80–100 integration tests** under `services/api/src/tests/` that assert on `BadRequestError("code", "message")` shapes; all need rewriting to assert on the new error envelope.
- **`apps/web` + `apps/native` client updates** that catch and inspect `BadRequestError` codes — must land in the same PR per RFC-0003 Decision F (no bridge layer).
- **Per-route latent-bug audit** — every route is likely to surface a latent input-validation gap when the schema-based engine takes over from hand-rolled.

Doing all of this as a single agent-session bulk edit is unsafe without per-route test verification. This handoff splits PR 3 into one prep landing + 28 per-route migrations that can be batched (e.g. 4–6 routes per sub-PR if the lead wants smaller landing units).

## What's pending for the next session (container required)

### Prep (one-time, before any route migration)

> [!IMPORTANT]
> **The "added zod to a workspace, container can't find it" gotcha.** Caught during the 2026-05-19 Phase B-2 boot-fail. After step 1 below (and *every* time you add a runtime dep to `services/api/package.json`), you must reinstall inside the api container so the bind-mounted `services/api/node_modules` picks up the new dep — the host edit alone does NOT propagate. Run these two commands after the package.json edit:
> ```bash
> docker compose exec -T api sh -c "cd /app && npm install --no-audit --no-fund"
> docker compose restart api
> ```
> Failure mode if skipped: `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'zod' imported from /app/src/...` on api boot, with the api process exiting and nginx returning 502 on every request that proxies to it.
>
> **Pair with the package-dist rebuild gotcha** (also documented in [`pr1-contracts-migration-handoff.md`](pr1-contracts-migration-handoff.md) §"Mandatory prep before any consumer-side verification"): if PR 3 starts importing new Zod schemas from `packages/contracts` or `packages/automation-contracts` (which it will — route bodies reference contracts schemas), the consumer-visible `dist/` MUST be regenerated via `bash scripts/build-packages-in-docker.sh` BEFORE the api container is restarted. Otherwise api boots with `SyntaxError: The requested module '@umbraculum/contracts' does not provide an export named 'XSchema'`.

1. Add deps to [`services/api/package.json`](../../services/api/package.json):
   ```json
   "zod": "^4.3.6",
   "fastify-type-provider-zod": "^4.0.0"
   ```
   Then run the install + restart pair from the callout above.
2. Wire the Fastify type provider in [`services/api/src/app.ts`](../../services/api/src/app.ts) immediately after `const app = Fastify(...)`:
   ```typescript
   import {
     serializerCompiler,
     validatorCompiler,
   } from "fastify-type-provider-zod";

   app.setValidatorCompiler(validatorCompiler);
   app.setSerializerCompiler(serializerCompiler);
   ```
   This is backward-compatible: routes without `schema: { body: ZodSchema }` are unaffected (Fastify falls through to its default no-validation path). Routes that opt in via `app.withTypeProvider<ZodTypeProvider>().post(...)` use the new compiler.
3. Update `errorHandlerPlugin` in [`services/api/src/plugins/errorHandler.ts`](../../services/api/src/plugins/errorHandler.ts) to recognize `ZodError`:
   - On `ZodError`, return HTTP 400 with body `{ ok: false, code: "validation_error", issues: error.issues.map(...) }`.
   - Per RFC-0003 Decision F: this is the new wire format. Pre-release state confirmed by lead 2026-05-19 — no external clients depend on the old `BadRequestError(code, message)` shape.
   - Tests that previously asserted `BadRequestError("invalid_email", ...)` now assert `code: "validation_error"` + `issues[].path === ["email"]`.

### Per-route migration (28 files; estimate ~1.5 hr/file = ~5 days)

The per-route pattern, using `/auth/signup` as the canonical example:

#### Before (hand-rolled, current code in `auth.ts:82-159`)

```typescript
app.post(
  "/auth/signup",
  { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
  async (req, reply) => {
    const body = (req.body ?? {}) as { email?: unknown; password?: unknown; /* ... */ };
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body.password === "string" ? body.password : "";
    // ...
    if (!email || !email.includes("@")) throw new BadRequestError("invalid_email", "Email is required");
    if (password.length < 8) throw new BadRequestError("weak_password", "Password must be at least 8 characters");
    // ...
  },
);
```

#### After (Zod schema + fastify-type-provider-zod)

```typescript
import { z } from "zod";
import { type ZodTypeProvider } from "fastify-type-provider-zod";

const SignupBodySchema = z.object({
  email: z.string().trim().toLowerCase().email("invalid_email"),
  password: z.string().min(8, "weak_password"),
  preferredLocale: z.enum(["en", "it"]).default("en"),
  workspaceName: z.string().trim().min(1).optional(),
  accountName: z.string().trim().min(1).optional(),  // backward-compat — preprocess into workspaceName
});

app.withTypeProvider<ZodTypeProvider>().post(
  "/auth/signup",
  {
    config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    schema: { body: SignupBodySchema },
  },
  async (req, reply) => {
    const { email, password, preferredLocale } = req.body;
    const workspaceName = (req.body.workspaceName ?? req.body.accountName ?? "").trim();
    // Business-rule validation (email_in_use) stays as BadRequestError —
    // it's a runtime business outcome, not a structural validation
    // failure. Structural validation = ZodError; business rules =
    // BadRequestError or DomainError. This boundary is the per-route
    // latent-bug audit checkpoint.
    // ...
  },
);
```

### Per-file route inventory + estimated effort

| File | Routes | Hand-rolled helpers to retire | Notes |
|---|---|---|---|
| `auth.ts` | 9 | `assertSafeNextPath`, `assertLocale`, `assertUiTheme`, `assertUiFontScale`, `assertUiDensity` | Highest-traffic file. Dual-key tunnel (`workspaceName`/`accountName`, `workspaceId`/`accountId`). Several business-rule errors (`invalid_email` shape vs `email_in_use` runtime) — verify the structural/business split. |
| `workspaces.ts` | ~6 | TBD per inspection | |
| `recipes.ts` | ~10 | TBD | Likely largest by route count. |
| `recipesImport.ts` / `recipesExport.ts` | TBD | TBD | Multipart upload validation — check Fastify multipart + Zod schema interop. |
| `styles.ts` | TBD | TBD | |
| `waterProfiles.ts` | TBD | TBD | Consumes `parseWaterProfileItem` from PR 1 — verify the cross-package contract is intact. |
| `equipmentProfiles.ts` | TBD | TBD | |
| `waterCalc.ts` | TBD | TBD | Likely uses derivation contracts from PR 1 — verify cross-package contract. |
| `recipeWaterSettings.ts` / `recipeWaterHubSummary.ts` / `recipeWaterComputeAndSave.ts` | ~6 total | TBD | Consume gravity-analysis + water-compute contracts from PR 1. |
| `ingredients.ts` | ~3 | TBD | Has the Phase 6f cross-workspace data-leak fix — verify the `AND: WhereInput[]` pattern is preserved. |
| `ads.ts` / `platformAds.ts` / `platformRecipes.ts` | TBD | TBD | |
| `brewdaySettings.ts` / `brewSessions.ts` / `inventory.ts` / `billing.ts` | TBD | TBD | |
| `integrationsTiltIngest.ts` / `integrationsTilt.ts` / `integrationsGeneric.ts` / `integrationsReveal.ts` | TBD | TBD | Several have webhook signature verification — keep that as pre-validation HOC, don't fold into the Zod schema. |
| `webhooksStripe.ts` / `webhooksRevenuecat.ts` | TBD | TBD | Webhook payloads with provider-specific signature verification. |
| `ai.ts` | TBD | TBD | AI tool routes — verify input/output schemas use the same Zod schemas as the AI tool registry. |
| `health.ts` | 1 | 0 | Likely no migration needed (no body validation). |

### apps/web + apps/native client coordination

After each route migration, search for consumers in `apps/web` and `apps/native`:

```bash
rg 'BadRequestError|invalid_email|weak_password|email_in_use|invalid_workspace_id|invalid_next|invalid_code|invalid_credentials|invalid_session|invalid_webview_exchange_code|missing_bearer' apps/
```

For each match, update the error-catching logic to recognize the new envelope:

```typescript
// Before:
catch (e) {
  if (e instanceof Error && e.message.includes("invalid_email")) { /* show error */ }
}

// After:
catch (e) {
  if (e instanceof Response && e.status === 400) {
    const body = await e.json();
    if (body.code === "validation_error" && body.issues?.some((i: { path: unknown[] }) => i.path?.includes("email"))) {
      /* show error */
    }
    // OR for business-rule errors that stay as BadRequestError:
    if (body.code === "email_in_use") { /* show error */ }
  }
}
```

### Integration test rewrites

Tests under `services/api/src/tests/**/*.test.ts` that assert on `BadRequestError("code", "message")` shapes need updating:

```typescript
// Before:
expect(response.statusCode).toBe(400);
expect(JSON.parse(response.body)).toMatchObject({
  ok: false,
  code: "invalid_email",
  message: expect.stringContaining("Email"),
});

// After:
expect(response.statusCode).toBe(400);
const body = JSON.parse(response.body);
expect(body.ok).toBe(false);
expect(body.code).toBe("validation_error");
expect(body.issues[0].path).toContain("email");
// OR for business-rule errors:
expect(body.code).toBe("email_in_use");
```

Add a shared test helper in `services/api/src/tests/_shared/zodAssertions.ts` (created in PR 1 of the migration's F9 follow-up):

```typescript
import type { z } from "zod";
export function expectStructuralError(response: { statusCode: number; body: string }, pathPrefix: ReadonlyArray<string | number>): void {
  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body) as { ok: boolean; code: string; issues: Array<z.core.$ZodIssue> };
  expect(body.ok).toBe(false);
  expect(body.code).toBe("validation_error");
  expect(body.issues[0]?.path?.slice(0, pathPrefix.length)).toEqual(pathPrefix);
}
```

### Per-route latent-bug audit checkpoint

For every route migrated, before merging:

1. Run the route's integration tests; observe any new failures.
2. Inspect each failure:
   - **Test asserts old error shape** → update assertion per the helper above.
   - **Test was passing on garbage input that the new schema rejects** → this is a latent bug. Decide:
     - (a) The test was wrong — input was actually invalid and should fail → update test to expect the new failure.
     - (b) The validation is too tight — some real client sends this shape → relax the schema (add `.optional()`, `.nullable()`, or a `preprocess` transform) and add a test pinning the relaxed behavior.
3. Record the decision in the PR description per-route. After the migration completes, the cumulative latent-bug-fix list is published as a CHANGELOG note for self-hosted upgraders.

## Container session command sequence

```bash
# In api container (per DEVELOPMENT.md):
cd /workspace
npm install  # installs zod + fastify-type-provider-zod
cd services/api

# Prep:
# (apply app.ts + errorHandler.ts changes per "Prep" section above)
npm run typecheck
# (verify clean — should be, prep doesn't change any route)

# Per route:
# (apply the route-file migration per "Per-route migration" template)
# (update the matching tests)
npm run test -- src/tests/<area>  # scope to the area you migrated
# (fix any new failures per "Per-route latent-bug audit checkpoint")
# (find + update apps/web + apps/native consumers via rg)

# Before opening the PR:
npm run typecheck
npm run lint -- --max-warnings 0
npm run test  # full integration suite
```

## What lands in this session (no code changes for PR 3)

This handoff doc itself is the artifact landed in this session. No services/api source files are touched. No dependency changes are applied (deferred to container session where `npm install` will pick them up). No tests are modified.

This matches the safest path: PR 3 is too large + too test-coupled for an agent-session bulk edit without per-route container test verification. The handoff doc encodes the full migration plan so the next session is mechanical.

## Sub-PR partition recommendation

The lead may choose to split PR 3 into smaller sub-PRs by route family for reviewability:

- **PR 3a**: Prep (app.ts + errorHandler.ts + package.json + shared test helper). No route changes. ~1 day.
- **PR 3b**: Auth routes (`auth.ts` + tests + apps/web auth-error catches). ~1 day.
- **PR 3c**: Workspaces + recipes routes (likely the largest single route migration). ~1.5 days.
- **PR 3d**: Water-calc routes (consume contracts from PR 1; cross-package contract verification). ~1 day.
- **PR 3e**: Ingredients + ads + brewday + sessions + inventory + billing routes. ~1 day.
- **PR 3f**: Integrations + webhooks routes (signature-verification interaction). ~1 day.
- **PR 3g**: AI routes (cross-feature interaction with AI tool registry). ~0.5 day.

Total: ~7 days at this granularity vs the 5-day estimate at "single PR 3" granularity. The extra 2 days buys 7× smaller review units, which is worth it for the highest-risk PR of the migration.
