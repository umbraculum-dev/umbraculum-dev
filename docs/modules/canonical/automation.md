# `automation` — canonical module

**Tier:** Public
**Status:** Phase B-3 shipped 2026-05-19 (read path + L2 cross-workspace isolation tests); Phase C (real OpenPLC adapter) pending.
**Code:** `automation`
**Module tier:** 1 (core canonical, reserved code).
**License:** AGPLv3 (per [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5).
**Audience:** anyone consuming, contributing to, or integrating against the `automation` canonical module.

> [!NOTE]
> Per-module page for `automation`. Indexed from [`docs/MODULES.md`](../../MODULES.md). For the substantive surface design, see [`docs/design/canonical-automation-module-surface.md`](../../design/canonical-automation-module-surface.md) (Accepted 2026-05-19); this page is the navigational view of what already exists in the codebase.

---

## 1. What it does

`automation` is the workspace-scoped runtime control surface for physical equipment. The first reference adapter (`brewery.openplc.v1`) bridges an OpenPLC supervisor running brewery fermenter / kettle / pump logic into the platform. The module owns:

- a typed inventory of **vessels** (fermenters, kettles, HLT, etc.) keyed by workspace-unique `code`,
- the **adapter SDK contract** every connector implements,
- the **Modbus mailbox mirror** that the brewery adapter aligns to,
- the **AI tools** that let the workspace AI consultant read vessel state, and
- the **tier-limit slice** that gates how many vessels and connected adapters a workspace can carry.

It does **not** own scheduling, capacity planning, or "next planned use" views — those belong to the future `crp` canonical module ([surface boundary guardrail](../../../services/api/src/modules/automation/README.md#surface-boundary--automation-vs-crp-forward-looking-guardrail)).

---

## 2. The four slices (β layout per [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md))

| Slice | Path | Status |
|---|---|---|
| **API** | [`services/api/src/modules/automation/`](../../../services/api/src/modules/automation/) | **Shipped (B-3)** — `index.ts` with `registerAutomationModule`, `routes/automationVesselsRoutes.ts`, `services/vesselsService.ts`, `adapters/mockAdapter.ts`. |
| **Web** | [`apps/web/app/[locale]/(automation)/`](../../../apps/web/app/[locale]/(automation)/) | **Shipped (B-3); aligned per Week-1 audit ([RFC-0006](../../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) + [`web-route-group-audit.md`](../../design/web-route-group-audit.md))** — `vessels/page.tsx` (vessel list at `/en/vessels`), `vessels/[vesselCode]/page.tsx` (vessel detail at `/en/vessels/<code>`). Next.js route group `(automation)/` does not contribute a URL segment per RFC-0002 §3; the canonical static sub-segment is `vessels` and the module declares `ownedUrlSegments: ["vessels"]` via `registerWebModule()`. The pre-audit layout had `(automation)/page.tsx` + `(automation)/[vesselCode]/page.tsx` at the group root — both violated the two β disciplines and produced a routing collision that left `/en/automation` unreachable. |
| **Native** | _(`apps/native/src/modules/automation/` per [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §3)_ | **Not yet wired.** Native surface for automation is pending; mock adapter + web read path are sufficient for Phase B. |
| **Contracts** | [`packages/automation-contracts/`](../../../packages/automation-contracts/) → [`@umbraculum/automation-contracts`](../../../packages/automation-contracts/README.md) | **Shipped.** Adapter SDK types, `CONTRACT_VERSION`, `MAILBOX_SPEC` (356 entries mirrored from the OpenPLC sister repo). |

Postgres schema name is `automation` ([`services/api/prisma/schema.prisma`](../../../services/api/prisma/schema.prisma) — see the `automation.vessels`, `automation.adapter_connections`, `automation.alarm_events` tables).

---

## 3. Registration

The module is wired into the Fastify app via `@umbraculum/module-sdk`'s `registerModule()`. From [`services/api/src/modules/automation/index.ts`](../../../services/api/src/modules/automation/index.ts):

```44:66:services/api/src/modules/automation/index.ts
export function registerAutomationModule(app: FastifyInstance): void {
  const alreadyRecorded = listRegisteredModules().some(
    (m) => m.code === MODULE_CODE,
  );

  if (!alreadyRecorded) {
    registerModule(app, {
      code: MODULE_CODE,
      prismaSchema: "automation",
      addonCodes: ["automation_module"],
      // Routes registered via per-app `app.register(...)` below so they
      // attach on every `buildApp()` call. `registerModule` records the
      // metadata once per process; if `routes:` were passed here, the
      // guarded first-call path would register routes too, but
      // second-and-later `buildApp()` calls (test workers) would skip
      // both metadata AND routes — leaving the second app without the
      // module's routes wired.
      routes: [],
    });
  }

  app.register(automationVesselsRoutes);
}
```

`tierLimits` is not yet contributed — it lands with the first vessel-create route in Phase C, contributing `maxVessels` and `maxAdaptersConnected` per [canonical-automation-module-surface.md §8.2](../../design/canonical-automation-module-surface.md). AI tools are registered separately at app boot — see §5 below.

---

## 4. HTTP routes (Phase B-3, read-only)

| Method | Path | Auth | Response shape | Status |
|---|---|---|---|---|
| `GET` | `/automation/vessels` | session + active workspace | `VesselListResponseSchema` (from `@umbraculum/automation-contracts`) | **Shipped** — deterministic `code asc` ordering. **NB:** API route path is `/automation/vessels` (unchanged); the user-facing web URL is `/en/vessels` (no `/automation` prefix). |
| `GET` | `/automation/vessels/:code` | session + active workspace | `VesselStateResponseSchema` | **Shipped** — 404 on workspace-mismatch (no cross-workspace leakage). Web URL: `/en/vessels/<code>`. |
| `POST` | `/automation/vessels` | _Phase C_ | _TBD_ | Pending |
| `PATCH` | `/automation/vessels/:code` | _Phase C_ | _TBD_ — mode/target-temp setpoint | Pending |

The route source: [`automationVesselsRoutes.ts`](../../../services/api/src/modules/automation/routes/automationVesselsRoutes.ts). Both shipped routes follow the canonical L2 cross-workspace isolation pattern from the PR3 handoff — service-layer `assertMembership` plus response parsing through Zod schemas at the boundary ([RFC-0003](../../rfcs/0003-validation-library-adoption.md)).

---

## 5. AI tools

Two read-scope tools register into the platform's AI orchestrator at app boot ([`services/api/src/services/ai/tools/automation/index.ts`](../../../services/api/src/services/ai/tools/automation/index.ts)):

| Tool name | Purpose | Scopes |
|---|---|---|
| `automation.listVessels` | Paginated fleet snapshot with filters | `read` |
| `automation.vesselState` | One vessel or fleet snapshot | `read` |

Phase D adds `automation.activeAlarms`, `automation.adapterHealth`, `automation.setpointHistory` (per [canonical-automation-module-surface.md §8.1](../../design/canonical-automation-module-surface.md)). Write-scope tools (mode change, target-temp setpoint) wait for Phase E (H1 2027+) and human-in-the-loop approvals.

---

## 6. Adapter SDK contract — what third parties implement

Third-party adapter authors pin **only** [`@umbraculum/automation-contracts`](../../../packages/automation-contracts/README.md) and [`@umbraculum/module-sdk`](../../../packages/module-sdk/README.md). Four surfaces are exported from the contracts package:

| Export | What it pins |
|---|---|
| `CONTRACT_VERSION` + `classifyContractVersionSkew` | Version-handshake primitives. Major mismatch → adapter refuses to connect. Minor mismatch → warn on `adapterHealth`. Patch differences silent. ([surface design §12.2](../../design/canonical-automation-module-surface.md)) |
| `MailboxSpec` / `MailboxEntry` types | Typed view of the OpenPLC sister-repo `PI_*` Modbus registers. The sister repo is the source of truth; this package mirrors. |
| `MAILBOX_SPEC` frozen constant | Validated runtime mirror — 356 entries as of `2.0.1-dev`. Loaded from `data/mailbox.json` and asserted at module-load (loud failure on drift). |
| `AutomationAdapterDefinition` | The adapter contract itself — `kind`, `protocol`, `capabilities`, `connect` / `disconnect` / `readSnapshot` / optional `applyCommand`. |

A built-in reference adapter for development and testing lives in [`services/api/src/modules/automation/adapters/mockAdapter.ts`](../../../services/api/src/modules/automation/adapters/mockAdapter.ts) (`automation.mock.v0`). It's deterministic, has no real Modbus dependency, and is what every test uses. The real `brewery.openplc.v1` lands in Phase C.

---

## 7. Data model (Prisma `automation` schema)

Three tables ([`services/api/prisma/schema.prisma`](../../../services/api/prisma/schema.prisma), surface sketch in [canonical-automation-module-surface.md §7](../../design/canonical-automation-module-surface.md)):

- `Vessel` — runtime instance: workspace-scoped `code`, kind, mode, current/target temps, alarm state, last-seen-at. Optional FK to `brewery.EquipmentProfile` (Prisma cross-schema `@relation` per [RFC-0010](../../rfcs/0010-platform-brewery-postgres-schema-split.md) and [surface design §12.3](../../design/canonical-automation-module-surface.md)).
- `AdapterConnection` — one per installed PLC connection: `adapterKind`, `contractVersion`, `runtimeVersion`, `status`. Carries the version handshake.
- `AutomationAlarmEvent` — open/cleared alarm records with code / severity / message / `raisedAt` / `clearedAt`. Phase D enables raise-and-clear flow.

The cross-schema FK to `brewery.equipment_profiles` uses a formal Prisma `@relation` ([RFC-0010](../../rfcs/0010-platform-brewery-postgres-schema-split.md); [surface design §12.3](../../design/canonical-automation-module-surface.md)).

---

## 8. Tier limits (planned)

Per [canonical-automation-module-surface.md §8.2](../../design/canonical-automation-module-surface.md). Lands with Phase C vessel-create route:

| Field | Meaning | Illustrative numbers |
|---|---|---|
| `maxVessels` | Vessels per workspace | free 2 / premium 8 / pro 24 / pro_plus 100 |
| `maxAdaptersConnected` | Adapters in `connected` state | free 0 / premium 1 / pro 2 / pro_plus 10 |
| `automationAiToolsEnabled` | Gate for the `automation.*` AI tool family | free false / paid true |

Stripe / RevenueCat addon code: `automation_module`.

---

## 9. Phase plan and timeline

From [canonical-automation-module-surface.md §9](../../design/canonical-automation-module-surface.md) (working assumption — H2 2026 / H1 2027+):

| Phase | Window | Deliverable | Status |
|---|---|---|---|
| A — Contracts | Q3 2026 | `@umbraculum/automation-contracts`, adapter SDK types, mailbox mirror, `CONTRACT_VERSION` | **Done 2026-05-19** |
| B — Read path | Q3–Q4 2026 | Prisma schema, mock adapter, vesselState/listVessels routes + AI tools, read-only `(automation)/` web | **Done 2026-05-19** (B-1 / B-2 / B-3) |
| C — Brewery adapter | Q4 2026 | `brewery.openplc.v1` bench Modbus; `adapterHealth`; version handshake enforcement | **Pending** — unblocked |
| D — Alarms | Q4 2026 | `AutomationAlarmEvent` raise/clear, `activeAlarms` tool, integration-metadata bridge | Pending |
| E — Write proposals | H1 2027+ | Human-in-the-loop setpoints | Deferred |

---

## 10. How to consume `automation` from another module or vertical

If you are building a Tier 6 vertical configuration (e.g. a distillery or kombucha vertical) that wants automation:

1. Add `@umbraculum/automation-contracts` to your vertical's dependencies.
2. If you ship a vertical-specific adapter (`distillery.somecontroller.v1`), implement `AutomationAdapterDefinition`. Use the existing brewery-side approach as a model.
3. Register your adapter through the connection-config UI surfaced by the `(automation)/` shell — your vertical does **not** ship a parallel automation web page. The platform's `(automation)/` shell is the canonical UX; your vertical contributes adapter packs.
4. Respect the [surface boundary](../../../services/api/src/modules/automation/README.md#surface-boundary--automation-vs-crp-forward-looking-guardrail) — no scheduling or planning data on the automation surface; that's `crp`'s job.

---

## 11. Cross-references

- **Surface design (the substantive doc):** [`docs/design/canonical-automation-module-surface.md`](../../design/canonical-automation-module-surface.md)
- **Governance:** [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §7 (Decision E — automation canonical placement)
- **Layout:** [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §3 (β three-tree)
- **Validation:** [RFC-0003](../../rfcs/0003-validation-library-adoption.md) (Zod v4 schemas at the boundary)
- **OpenPLC sister-repo handoff:** [`docs/design/openplc-mailbox-emitter-pr-shape.md`](../../design/openplc-mailbox-emitter-pr-shape.md)
- **Module README in code:** [`services/api/src/modules/automation/README.md`](../../../services/api/src/modules/automation/README.md) — the in-code companion (phase scope, surface boundary, demo SQL).
- **Contracts package README:** [`packages/automation-contracts/README.md`](../../../packages/automation-contracts/README.md)
- **Entry page:** [`docs/MODULES.md`](../../MODULES.md)
