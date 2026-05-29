# @umbraculum/module-sdk

Module registration contract for the Umbraculum platform (`registerModule`, `registerAiTools`, reserved canonical codes, web registry, rendering template slot).

> [!NOTE]
> Part of [Umbraculum](../../README.md) — an open-source toolset for building workspace-shaped operational applications.

## What this is

MIT-licensed SDK surface (per [`docs/LICENSING.md`](../../docs/LICENSING.md) §6.2) for third-party and first-party modules. Exposes `registerModule()` for Fastify route registration, module-owned AI-tool registration, and document-template registration, canonical-code validation aligned with [RFC-0001](../../docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md) Decision B, and a parallel `registerWebModule()` (with URL-segment registration + nav-entry contributions) for the App Router route-group convention committed in [RFC-0002](../../docs/rfcs/0002-canonical-module-physical-layout.md) Decision B and refined by [`docs/design/web-route-group-audit.md`](../../docs/design/web-route-group-audit.md).

## Scope

- **Contains**: registration types, in-memory module registry (boot-time collision detection), `RESERVED_CANONICAL_MODULE_CODES`, `registerModule`, `registerRegisteredModuleAiTools`, `registerWebModule` (with `ownedUrlSegments` + `navEntry` whose `labelKey` is typed as `ModuleNavLabelKey` from [`@umbraculum/i18n-keys`](../i18n-keys/)), `registerNativeModule` (with optional `tabEntry.labelKey` of the same type), `DocumentTemplate<TData>` / `RenderJob<TData>` / `RenderResult` rendering types, and the **library-agnostic `ValidatedSchema<T>` interface** + `fromParser` adapter (per [RFC-0003](../../docs/rfcs/0003-validation-library-adoption.md) Decision C — third-party modules may use Zod, Valibot, TypeBox, or hand-rolled validators that satisfy the interface).
- **Does not contain**: Prisma models, Fastify plugins for auth/billing, AI orchestrator implementation, document-rendering engines, BullMQ workers, or `@umbraculum/rendering` runtime adapters. Every shipped canonical module — and the brewery vertical — registers via `registerModule()` + `registerWebModule()`.

## What this SDK is *not* (where module code actually lives)

This package is **contract-only plus registration helpers**. The actual per-module code lives in the module's four β slices ([RFC-0002 §3](../../docs/rfcs/0002-canonical-module-physical-layout.md)):

| What | Where |
|---|---|
| Module's Fastify routes, services, AI tools, Prisma slice | `services/api/src/modules/<code>/` |
| Module's web pages (Next.js App Router) | `apps/web/app/[locale]/(<code>)/` |
| Module's **native** screens, navigation entries, native-only components | `apps/native/src/modules/<code>/` |
| Module's DTO types, route ID constants, third-party-pinnable types | `packages/<code>-contracts/` → `@umbraculum/<code>-contracts` |

The SDK is *only* the registration shape — `registerModule`, `registerWebModule`, and `registerNativeModule` (native route availability per module) exported from this same package per [RFC-0002 §5](../../docs/rfcs/0002-canonical-module-physical-layout.md). Native shell code lives in `apps/native/`; the brewery vertical calls `registerNativeModule({ code: "brewery", availableRouteIds: [...] })` at bootstrap. Cross-platform UI primitives live in `@umbraculum/ui` (industry-agnostic) and `@umbraculum/brewery-recipes-ui` (brewery-vertical); Prisma schemas live in `services/api/prisma/`. See [`docs/design/canonical-native-platform-surface.md`](../../docs/design/canonical-native-platform-surface.md) for the native operational SoT.

## Validated-schema contract

```typescript
export interface ValidatedSchema<T> {
  parse(input: unknown): T;
}
```

The Umbraculum codebase internally commits to **Zod v4** (RFC-0003 Decision B). Zod schemas satisfy this interface by construction — pass a Zod schema directly anywhere `ValidatedSchema<T>` is expected. For non-Zod libraries (Valibot, TypeBox, hand-rolled), wrap via `fromParser`:

```typescript
import * as v from "valibot";
import { fromParser, registerModule } from "@umbraculum/module-sdk";

const MyToolInput = v.object({ id: v.string() });
registerModule({
  code: "my-module",
  // ... wrap a Valibot schema for the SDK boundary:
  // (real registration shape grows alongside the canonical-module rollout — see RFC-0002)
});
```

See `src/validatedSchema.ts` for the full interface + adapter + library-specific usage examples.

## AI-tool registration — `registerModule({ registerAiTools })`

Modules contribute callable tools to the platform's single AI registry through the `registerAiTools` hook. The platform still owns the orchestrator, provider access, prompt composition, usage ledger, memory, and safety gates.

```typescript
import { registerModule } from "@umbraculum/module-sdk";
import { registerPimTools } from "./ai-tools";

declare const app: { prisma: unknown };

registerModule(app, {
  code: "pim",
  prismaSchema: "pim",
  registerAiTools(registry, hostApp) {
    registerPimTools(registry, hostApp.prisma);
  },
});
```

The API boot path creates an `AiToolRegistry` and calls `registerRegisteredModuleAiTools(registry, app)`. The host app is passed at invocation time so repeated `buildApp()` calls in tests do not reuse the first app instance captured by module metadata.

## AI prompt registration — `registerModule({ aiPrompts })`

Modules contribute system-prompt overlays for the platform orchestrator. See [`docs/design/canonical-ai-prompt-composition-surface.md`](../../docs/design/canonical-ai-prompt-composition-surface.md).

```typescript
registerModule(app, {
  code: "mrp",
  aiPrompts: {
    module: "MRP read-only planning context…",
    routes: { productionOrders: "Prefer mrp.* tools on this screen." },
    knowledge: "Optional static reference notes (max 2048 chars).",
  },
});
```

Registry helpers: `collectModulePromptOverlayTexts()`, `collectModuleKnowledgeSnippets()`, `resolveRoutePromptOverlay(routeId)`.

## Tier-limit registration — `registerModule({ tierLimits })`

Modules contribute per-tier limit slices; the platform merges them at runtime via `composeModuleTierLimitSlices(tier)` (alphabetical module-code order). Platform-owned keys (`aiEnabled` today) are reserved — modules must not claim them (`ReservedTierLimitKeyError`). Duplicate keys across modules fail at boot (`TierLimitKeyCollisionError`).

```typescript
registerModule(app, {
  code: "brewery",
  prismaSchema: "brewery",
  tierLimits: (tier) => ({
    maxRecipesPerWorkspace: tier === "free" ? 5 : 25,
    maxVersionsPerRecipe: tier === "free" ? 2 : 3,
  }),
});
```

The API's `getTierLimits(tier)` in `services/api/src/services/tierLimitsService.ts` returns `{ ...platformSlice, ...composeModuleTierLimitSlices(tier) }` after module boot.

## Add-on code registration — `registerModule({ addonCodes })`

[RFC-0009](../../docs/rfcs/0009-workspace-billing-addons-and-entitlements.md) commits the entitlement contract; **purchase enforcement** is deferred H1 2027. Modules declare Stripe/RevenueCat SKU vocabulary (convention: `<code>_module`). Duplicate codes across modules fail at boot (`AddonCodeAlreadyRegisteredError`). The `managed_ai_credits_*` prefix is platform-reserved for future managed-AI packs.

```typescript
registerModule(app, {
  code: "automation",
  addonCodes: ["automation_module"],
});
```

Hosted public α runs `EntitlementsService` in `tier_only` mode — tier limits remain the enforcement surface until `WorkspaceBillingAddon` lands. See [`canonical-workspace-billing-addons-surface.md`](../../docs/design/canonical-workspace-billing-addons-surface.md).

## Document-template registration — `registerModule({ documentTemplates })`

[RFC-0007](../../docs/rfcs/0007-canonical-document-rendering.md) adds document / file rendering to the platform consumption contract. Modules contribute typed templates through the SDK; the platform-owned `@umbraculum/rendering` package owns the engines and job runner.

```typescript
import { registerModule, type DocumentTemplate } from "@umbraculum/module-sdk";

declare const app: unknown;

interface ProductFeedInput {
  readonly productId: string;
}

const googleShoppingFeedTemplate: DocumentTemplate<ProductFeedInput> = {
  kind: "xml",
  ref: "pim:google-shopping-feed@v1",
  schema: {
    parse(input: unknown): ProductFeedInput {
      if (input === null || typeof input !== "object") throw new Error("expected object");
      const r = input as Record<string, unknown>;
      if (typeof r["productId"] !== "string") throw new Error("productId must be string");
      return { productId: r["productId"] };
    },
  },
  async render(data) {
    return new TextEncoder().encode(data.productId);
  },
};

registerModule(app, {
  code: "pim",
  prismaSchema: "pim",
  documentTemplates: [googleShoppingFeedTemplate],
});
```

**Validation behavior:**

- Template refs must use `<module>:<template-name>@v<integer>` (for example, `pim:google-shopping-feed@v1`).
- The ref prefix must match the registering module's `code`.
- Template refs are globally unique at boot.
- Registration is atomic: if any template claim fails, no template from the failing registration is persisted.

The rendering type source of truth lives here in `@umbraculum/module-sdk` so third-party modules can import the SDK surface under the MIT scope. [`@umbraculum/rendering`](../rendering/) re-exports these types for discoverability beside the future AGPLv3 implementation package.

## Web-side registration — `registerWebModule()`

Each module's web slice declares the top-level URL segments it owns. The registry detects collisions at registration time AND is the source-of-truth for the build-time CI check `scripts/check-web-url-segments.ts` (per [`docs/design/web-route-group-audit.md`](../../docs/design/web-route-group-audit.md) §3.2).

```typescript
import { registerWebModule } from "@umbraculum/module-sdk";

registerWebModule({
  code: "pim",
  ownedUrlSegments: ["products", "categories", "attribute-sets"],
  navEntry: { primarySegment: "products", labelKey: "nav.pim", order: 5 },
});
```

**The two β disciplines** (codified in plugin rule `46-web-route-shape.mdc`; see [`docs/design/web-route-group-audit.md`](../../docs/design/web-route-group-audit.md) §3):

- **No `apps/web/app/[locale]/(<code>)/page.tsx`** — collides with `[locale]/page.tsx`; one or the other becomes silently unreachable.
- **No `apps/web/app/[locale]/(<code>)/[<dynamicSegment>]/page.tsx`** at the route-group root — shadows every non-static URL under `/en/*`.

All module pages live under static sub-segments registered in `ownedUrlSegments` (e.g. `(pim)/products/page.tsx`, `(pim)/products/[productId]/page.tsx`). `(auth)/` is the canonical good example; the pre-Week-1 `(automation)/` was the canonical bad example.

**Validation behavior:**

- `code` must match `/^[a-z][a-z0-9_]*$/` (`InvalidModuleCodeError`).
- Each `ownedUrlSegments` entry must match `/^[a-z][a-z0-9-]*$/` (kebab-case; `InvalidUrlSegmentError`).
- Two modules cannot register the same URL segment (`UrlSegmentAlreadyOwnedError`).
- `navEntry.primarySegment` MUST appear in `ownedUrlSegments` (`NavEntryPrimarySegmentNotOwnedError`).
- Registration is atomic: if any segment claim fails, no segment from the failing registration is persisted.

**Introspection helpers** (used by `scripts/check-web-url-segments.ts` and by the web shell's `PrimaryNav`):

- `listRegisteredWebModules(): RegisteredWebModuleSnapshot[]`
- `listOwnedUrlSegments(code: string): readonly string[]`
- `getSegmentOwner(segment: string): string | undefined`
- `snapshotSegmentOwnership(): ReadonlyArray<readonly [segment, ownerCode]>`

## Build / test / lint (local)

From repo root (run Node/npm inside the project container, not on the host — see the root [`README.md`](../../README.md) for service/container setup; the local-only `DEVELOPMENT.md` is per-developer and gitignored):

- **Build**: `npm run build -w @umbraculum/module-sdk`
- **Test**: `npm run test -w @umbraculum/module-sdk`
- **Typecheck**: `npm run typecheck -w @umbraculum/module-sdk`

## Cross-references

- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) §4.4 — registration sketch
- [`docs/rfcs/0002-canonical-module-physical-layout.md`](../../docs/rfcs/0002-canonical-module-physical-layout.md) — `packages/module-sdk/` placement (Decision C), web route-group convention (Decision B)
- [`docs/rfcs/0007-canonical-document-rendering.md`](../../docs/rfcs/0007-canonical-document-rendering.md) — document-template registration + canonical rendering pipeline
- [`docs/rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md`](../../docs/rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) — calendar amendment to RFC-0002 D (brewery file-move pulled into Week 1 of late-H1-2026)
- [`docs/design/web-route-group-audit.md`](../../docs/design/web-route-group-audit.md) — the two β disciplines (no group-root `page.tsx`, no group-root dynamic segment), the URL-segment registry surface, canonical good/bad examples
- [`packages/rendering/README.md`](../rendering/README.md) — scaffold package that re-exports the rendering SDK types
