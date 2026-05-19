# @umbraculum/automation-contracts

Phase A surface of the canonical `automation` module: typed Modbus mailbox spec, adapter SDK contract, and contract-version handshake.

> [!NOTE]
> Part of [Umbraculum](../../README.md). This package landed under the new `@umbraculum/*` scope as sub-plan #9 slot 4 (2026-05-19) per [RFC-0002](../../docs/rfcs/0002-canonical-module-physical-layout.md) Decision C; see [`docs/design/brewery-scope-migration-plan.md`](../../docs/design/brewery-scope-migration-plan.md). The sister repo (`brewery-alarms-tanks-supervisor`) emits JSON-only mailbox artifacts and does not import this package, so the rename was doc-only on the sister side.

## What this is

MIT-licensed contract types for the canonical `automation` module ([`docs/design/canonical-automation-module-surface.md`](../../docs/design/canonical-automation-module-surface.md), Accepted 2026-05-19).

Four exported surfaces:

- **`CONTRACT_VERSION` + `classifyContractVersionSkew`** — version-handshake primitives. Mismatch policy per design §12.2: `major` → adapter refuses, `minor` → warn on `adapterHealth`, `patch` → silent. Bumped from `0.0.0-dev` to `2.0.1-dev` in Phase A step 5 (tracks the sister-repo integrated release tag).
- **`MailboxSpec` / `MailboxEntry` types** — typed mirror of the OpenPLC sister-repo `PI_*` mailbox. The actual `PI_*` address map is owned by the sister repo and emitted as a checked-in artifact (M2 mechanism, design §12.2).
- **`MAILBOX_SPEC` constant** — the validated, frozen mirror of the sister-repo artifact. 356 entries as of `2.0.1-dev`. Loaded from `data/mailbox.json` and asserted at module-load time (loud failure on drift). Adapters consume this constant rather than reading the JSON directly.
- **`AutomationAdapterDefinition`** — the adapter SDK contract that `brewery.openplc.v1` (and future adapters) implements. Phase A declares the type; Phase C lands the first reference adapter.

## Scope

- **Contains**: TypeScript types, the `CONTRACT_VERSION` constant, the validated `MAILBOX_SPEC` constant, and helper functions for version classification and mailbox lookup.
- **Does not contain**: any runtime Modbus client, Prisma models, route handlers, or AI tool implementations.

## Mailbox mirror — sync procedure

The address map at `data/mailbox.json` is **byte-for-byte identical** to `out/mailbox.json` emitted by the sister repo `brewery-alarms-tanks-supervisor` (`tools/build_mailbox_artifact.py`). The sister repo is the single source of truth for `PI_*` names, addresses, and semantics; this package **mirrors** that artifact via PR (M2 mechanism, design §12.2).

To refresh the mirror:

```bash
# In the sister repo: regenerate the artifact (after editing LOCATED_VAR_BLOCK)
cd ../arduino-and-plc/openplc/brewery/tanks-pump-priority-and-low-high-levels-sensors-alarms
make mailbox-artifact
make test-tools

# Back in umbraculum-dev: copy the artifact in
bash scripts/sync-automation-mailbox-mirror.sh

# Drift check (CI-friendly)
bash scripts/sync-automation-mailbox-mirror.sh --check

# Override the sister-repo path if it lives elsewhere
SISTER_REPO=/path/to/sister-repo bash scripts/sync-automation-mailbox-mirror.sh
```

Never hand-edit `data/mailbox.json`. Bump `CONTRACT_VERSION` in `src/version.ts` whenever the sister-repo `INTEGRATED_RELEASE_TAG` moves — both move together per the integrated-release-versioning baseline rule.

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

- **Build**: `npm run build -w @umbraculum/automation-contracts`
- **Test**: `npm run test -w @umbraculum/automation-contracts`
- **Typecheck**: `npm run typecheck -w @umbraculum/automation-contracts`

## Cross-references

- [`docs/design/canonical-automation-module-surface.md`](../../docs/design/canonical-automation-module-surface.md) — Phase A entry checklist, B1/B2/B3 resolutions
- [`docs/design/openplc-mailbox-emitter-pr-shape.md`](../../docs/design/openplc-mailbox-emitter-pr-shape.md) — sister-repo PR shape for the M2 emitter
- [`docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md`](../../docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md) §7.2 — automation module surface origin
- [`docs/rfcs/0002-canonical-module-physical-layout.md`](../../docs/rfcs/0002-canonical-module-physical-layout.md) — `packages/<code>-contracts/` placement rule
- [`packages/module-sdk/`](../module-sdk/) — peer SDK package; this package will be referenced from `registerModule({ code: "automation", ... })` when Phase B lands
