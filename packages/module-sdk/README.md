# @umbraculum/module-sdk

Module registration contract for the Umbraculum platform (`registerModule`, reserved canonical codes, web registry stub).

> [!NOTE]
> Part of [Umbraculum](../../README.md) — the process-manufacturing platform, brewery-configured by default. Brand resolved 2026-05-18; see [`docs/RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md). Renamed from `@brewery/module-sdk` to `@umbraculum/module-sdk` as sub-plan #9 slot 11; closes the last of the two transient cross-scope states opened by slot 9 (the other — `@brewery/api-client` — closed on slot 10). Placement per [RFC-0002](../../docs/rfcs/0002-canonical-module-physical-layout.md) Decision C.

## What this is

MIT-licensed SDK surface (per [`docs/LICENSING.md`](../../docs/LICENSING.md) §6.2) for third-party and first-party modules. Exposes `registerModule()` for Fastify route registration, canonical-code validation aligned with [RFC-0001](../../docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md) Decision B, and a parallel `registerWebModule()` stub for the App Router migration in [RFC-0002](../../docs/rfcs/0002-canonical-module-physical-layout.md).

## Scope

- **Contains**: registration types, in-memory module registry (boot-time collision detection), `RESERVED_CANONICAL_MODULE_CODES`, `registerModule`, `registerWebModule`, and the **library-agnostic `ValidatedSchema<T>` interface** + `fromParser` adapter (per [RFC-0003](../../docs/rfcs/0003-validation-library-adoption.md) Decision C — third-party modules may use Zod, Valibot, TypeBox, or hand-rolled validators that satisfy the interface).
- **Does not contain**: Prisma models, Fastify plugins for auth/billing, AI orchestrator implementation, or brewery route migration (flat `services/api/src/routes/` until H1 2027 per RFC-0002 Decision D).

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
  // (real registration shape will be richer in the H1 2027 SDK design)
});
```

See `src/validatedSchema.ts` for the full interface + adapter + library-specific usage examples.

## Build / test / lint (local)

From repo root (run Node/npm inside the project container, not on the host — see the root [`README.md`](../../README.md) for service/container setup; the local-only `DEVELOPMENT.md` is per-developer and gitignored):

- **Build**: `npm run build -w @umbraculum/module-sdk`
- **Test**: `npm run test -w @umbraculum/module-sdk`
- **Typecheck**: `npm run typecheck -w @umbraculum/module-sdk`

## Cross-references

- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) §4.4 — registration sketch
- [`docs/rfcs/0002-canonical-module-physical-layout.md`](../../docs/rfcs/0002-canonical-module-physical-layout.md) — `packages/module-sdk/` placement (Decision C)
