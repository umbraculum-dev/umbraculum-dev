# @brewery/automation-contracts

Phase A surface of the canonical `automation` module: typed Modbus mailbox spec, adapter SDK contract, and contract-version handshake.

> [!NOTE]
> Part of [Umbraculum](../../README.md). End-state npm name: `@umbraculum/automation-contracts` per [RFC-0002](../../docs/rfcs/0002-canonical-module-physical-layout.md); monorepo scope remains `@brewery/*` until sub-plan #9 ([`docs/RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md) §10).

## What this is

MIT-licensed contract types for the canonical `automation` module ([`docs/design/canonical-automation-module-surface.md`](../../docs/design/canonical-automation-module-surface.md), Accepted 2026-05-19).

Three exported surfaces:

- **`CONTRACT_VERSION` + `classifyContractVersionSkew`** — version-handshake primitives. Mismatch policy per design §12.2: `major` → adapter refuses, `minor` → warn on `adapterHealth`, `patch` → silent.
- **`MailboxSpec` / `MailboxEntry` types** — type-only mirror of the OpenPLC sister-repo `PI_*` mailbox. The actual `PI_*` address map is owned by the sister repo and emitted as a checked-in artifact (M2 mechanism, design §12.2). This package does **not** ship the literal address map yet — Phase A is types only.
- **`AutomationAdapterDefinition`** — the adapter SDK contract that `brewery.openplc.v1` (and future adapters) implements. Phase A declares the type; Phase C lands the first reference adapter.

## Scope

- **Contains**: TypeScript types, the `CONTRACT_VERSION` constant, helper functions for version classification and mailbox lookup.
- **Does not contain**: any runtime Modbus client, any literal `PI_*` address map, Prisma models, route handlers, or AI tool implementations.

## Phase coupling

| Phase | What lives here |
|---|---|
| **A — Contracts (Q3 2026)** | Types + `CONTRACT_VERSION` constant. **This package, today.** |
| B — Read path (Q3–Q4 2026) | Consumed by `services/api/src/modules/automation/` (Prisma schema, `vesselState`, `listVessels`). |
| C — Brewery adapter (Q4 2026) | Concrete `AutomationAdapterDefinition` implementation in a brewery package; imports the mailbox artifact emitted by the sister repo. |
| D — Alarms (Q4 2026) | `AutomationAlarmEvent` types added here when alarm capability is enabled. |
| E — Write proposals (H1 2027+) | `applyCommand` capability and proposal types. |

## Build / test / typecheck (local)

From repo root (see [`DEVELOPMENT.md`](../../DEVELOPMENT.md) — run Node/npm inside the project container, not on the host):

- **Build**: `npm run build -w @brewery/automation-contracts`
- **Test**: `npm run test -w @brewery/automation-contracts`
- **Typecheck**: `npm run typecheck -w @brewery/automation-contracts`

## Cross-references

- [`docs/design/canonical-automation-module-surface.md`](../../docs/design/canonical-automation-module-surface.md) — Phase A entry checklist, B1/B2/B3 resolutions
- [`docs/design/openplc-mailbox-emitter-pr-shape.md`](../../docs/design/openplc-mailbox-emitter-pr-shape.md) — sister-repo PR shape for the M2 emitter
- [`docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md`](../../docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md) §7.2 — automation module surface origin
- [`docs/rfcs/0002-canonical-module-physical-layout.md`](../../docs/rfcs/0002-canonical-module-physical-layout.md) — `packages/<code>-contracts/` placement rule
- [`packages/module-sdk/`](../module-sdk/) — peer SDK package; this package will be referenced from `registerModule({ code: "automation", ... })` when Phase B lands
