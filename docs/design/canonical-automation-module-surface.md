# Canonical `automation` module surface — design

**Tier:** Public  
**Status:** Accepted design 2026-05-19 (core team approval recorded; B1–B3 pre–Phase A checkpoints resolved 2026-05-19, see §12; NOT a separate Accepted RFC — implementation is phased per §9; amendments per [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md) §12)  
**Audience:** core team, brewery-vertical maintainers, OpenPLC sister-repo maintainers, module SDK authors  
**Resolves:** [RFC-0001](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) Decision E §7.2  
**Builds on:** [RFC-0001](../rfcs/0001-modules-tiers-governance-and-automation-placement.md), [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md), [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.4, §6, [`packages/module-sdk/README.md`](../../packages/module-sdk/README.md)

> **Disclaimer.** Recommends concrete shapes for canonical `automation`. Does not allocate canonical codes, change licenses, or relitigate pi-sidecar runtime (Jinja + FastAPI stays per RFC-0001 §7.3). Safety-validated PLC logic in the OpenPLC sister repo remains authoritative until a formal re-validation program says otherwise.

---

## 1. Summary

[RFC-0001](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) commits `automation` as tier-1 canonical and defers surface design here. Four §7.2 questions — **recommendations, not TBDs:**

| # | Question | Recommendation |
|---|---|---|
| 1 | Adapter contract | Canonical `automation` owns **generic adapter SDK**; brewery (tier 6) ships thin `brewery.openplc.v1` implementation |
| 2 | Equipment vs Vessel | **Two models** + optional FK: `EquipmentProfile` (brewery design-time) ↔ `Vessel` (automation runtime) |
| 3 | OpenPLC translation | **Alarm ladder in sister repo**; **workspace shell, Modbus mailbox contract, Prisma, AI tools, tier limits** in platform |
| 4 | Pi-sidecar vs integrations | **Layered**: integrations = read-mostly devices; automation = supervisory control; pi-sidecar = field UI; shell = system-of-record |

β layout per [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md): `services/api/src/modules/automation/`, `apps/web/app/[locale]/(automation)/`, `apps/native/src/modules/automation/`, `packages/automation-contracts/`. Postgres schema `automation` when tables land (§8).

---

## 2. Problem statement

Three concerns must not collapse (RFC-0001 §7.1):

1. **Design-time brewing math** — `EquipmentProfile` (`schema.prisma`): kettle volume, mash efficiency; recipe/water inputs; no live PLC state.
2. **Read-mostly telemetry** — `Integration` / `IntegrationDevice` / `IntegrationReading` via [`integrationsGeneric.ts`](../../services/api/src/routes/integrationsGeneric.ts) (Tilt, iSpindel, RAPT).
3. **Supervisory PLC** — OpenPLC sister repo (Modbus, pi-sidecar, `PI_*` mailbox, frozen alarm layer `2.0.1-dev`).

(3) is not "another integration" and not brewery-internal-only. This design assigns lifecycles and safety boundaries per concern.

---

## 3. Recommendation 1 — Generic adapter SDK (canonical owns contract)

**Recommendation:** `@umbraculum/automation-adapter-sdk` (MIT, tier 2) defines `AutomationAdapterDefinition` (kind, protocol, capabilities, connect/disconnect/readSnapshot/optional applyCommand). Canonical `automation` owns **AdapterConnection** persistence, secrets refs, connection supervisor, snapshot→`Vessel` mapping, and `maxAdaptersConnected` enforcement. Brewery ships **`brewery.openplc.v1`** — Modbus map aligned to sister-repo `PI_*`; no alarm ladder in TypeScript.

**Rationale:** Same pattern as Decision F (one platform-owned interface, many consumers). Supervisor + tenancy + billing are identical across verticals; only protocol packs differ.

**Rejected:** Per-vertical adapters against undocumented primitives — duplicates supervisor logic and breaks hosted consistency.

---

## 4. Recommendation 2 — EquipmentProfile + Vessel (two models, optional FK)

| Model | Owner | Schema | Purpose |
|---|---|---|---|
| `EquipmentProfile` | Brewery (tier 6) | `public` (until brewery split) | Design-time params for recipes / water |
| `Vessel` | Canonical `automation` | `automation.vessels` | Runtime instance: mode, temps, alarms, adapter link |

**Link:** `Vessel.equipmentProfileId` → `EquipmentProfile.id` (optional). Vessel-only (PLC import) and profile-only (planning) are both valid.

**Rejected:** Single unified model — mixes snapshot-copy semantics with live PLC rows; confuses `maxRecipes` vs `maxVessels`.

**MRP / CRP entry point (deferred).** When `mrp` (and `crp`) ship, they will need read access to `EquipmentProfile` to do capacity planning (profiles × N vessels per profile = total workspace capacity — see §12 cardinality note). That is the second-consumer trigger from [RFC-0002 §7](../rfcs/0002-canonical-module-physical-layout.md#7-what-this-rfc-defers-open-questions-for-sub-plan-9) item 3 ("cross-module shared types") to extract `@umbraculum/equipment-contracts` (or `@brewery/equipment-contracts` if the concept stays brewery-specific). Until then, the field stays brewery-internal; `automation` references `vesselId` via `@umbraculum/automation-contracts`. No `platform-equipment-contracts` until the conflict is concrete — YAGNI.

---

## 5. Recommendation 3 — OpenPLC translation seam

### 5.1 Sister repo (validated runtime — do not duplicate without re-validation)

- Safety alarm ladder / interlocks (`DEVELOPMENT.md` alarm-layer stability).
- OpenPLC Editor artifacts, compile/upload, bench vs field profiles.
- Runtime upload bundle (`prepare_openplc_runtime_upload.py`).

### 5.2 Umbraculum platform

- `Vessel` / `AdapterConnection` / `AutomationAlarmEvent` (Prisma `automation` schema).
- `PI_*` mailbox semantics in `@umbraculum/automation-contracts` (enforced by brewery adapter).
- AI tools, tier limits, workspace shell UI `(automation)/`.
- Pi-sidecar **runtime** stays on Pi (FastAPI + Jinja) — not replaced by Next.js.

### 5.3 Runtime flow (bench)

```
OpenPLC Runtime ◄─Modbus PI_*─► Pi sidecar (field UI)
       ▲                              │
       │ upload bundle                │ HTTPS
       └──────────────────────────────┼──► Umbraculum API
                                      │    automation + brewery.openplc.v1
```

PLC releases follow sister-repo validation; platform ships on normal API/web cadence. Surface `AdapterConnection.runtimeVersion` + `contractVersion` for skew detection.

---

## 6. Recommendation 4 — Layered integrations + UI

### 6.1 Data

| Layer | Use when | Examples |
|---|---|---|
| **Integrations** | Read-mostly, high-volume series, brew-session attach | Tilt, iSpindel, RAPT |
| **Automation** | Multi-vessel state, commands, alarm authority | OpenPLC vessels |

**Bridge:** Optional `vesselId` in integration `metadataJson` for UI correlation only — do not copy `IntegrationReading` rows into `Vessel`. AI joins via tools in one workspace context ([`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.0).

### 6.2 UI

| Surface | Role |
|---|---|
| **Pi-sidecar** | Field operator, local/offline-tolerant control — **keep** |
| **`(automation)/` shell** | Fleet, alarms, AI, billing, audit — **primary** desk UX |
| **`(brewery)/`** | Recipes, equipment **profiles** — deep-link to vessel when linked |

**Rejected:** Web-only replacement of pi-sidecar in H2 2026.

---

## 7. Prisma sketch (`automation` schema)

Illustrative; migrations land with implementation. `equipmentProfileId` may be app-level FK to `public.equipment_profiles` until cross-schema relations are enabled.

```prisma
model Vessel {
  id                  String   @id @default(uuid())
  workspaceId         String   @map("workspace_id")
  code                String
  displayName         String   @map("display_name")
  vesselKind          String   @map("vessel_kind")
  equipmentProfileId  String?  @map("equipment_profile_id")
  adapterConnectionId String?  @map("adapter_connection_id")
  mode                String?
  currentTempC        Float?   @map("current_temp_c")
  targetTempC         Float?   @map("target_temp_c")
  alarmActive         Boolean  @default(false) @map("alarm_active")
  lastSeenAt          DateTime? @map("last_seen_at")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")
  adapterConnection   AdapterConnection? @relation(fields: [adapterConnectionId], references: [id])
  alarmEvents         AutomationAlarmEvent[]
  @@unique([workspaceId, code])
  @@index([workspaceId])
  @@map("vessels")
  @@schema("automation")
}

model AdapterConnection {
  id              String   @id @default(uuid())
  workspaceId     String   @map("workspace_id")
  adapterKind     String   @map("adapter_kind")
  displayName     String   @map("display_name")
  status          String   @default("disconnected")
  configJson      Json     @map("config_json")
  secretRefId     String?  @map("secret_ref_id")
  contractVersion String   @map("contract_version")
  runtimeVersion  String?  @map("runtime_version")
  lastSeenAt      DateTime? @map("last_seen_at")
  vessels         Vessel[]
  @@index([workspaceId])
  @@map("adapter_connections")
  @@schema("automation")
}

model AutomationAlarmEvent {
  id        String   @id @default(uuid())
  vesselId  String   @map("vessel_id")
  code      String
  severity  String
  message   String
  active    Boolean  @default(true)
  raisedAt  DateTime @default(now()) @map("raised_at")
  clearedAt DateTime? @map("cleared_at")
  vessel    Vessel @relation(fields: [vesselId], references: [id], onDelete: Cascade)
  @@index([vesselId, active])
  @@map("alarm_events")
  @@schema("automation")
}
```

---

## 8. AI tools, tier limits, registration

### 8.1 AI tools (H2 2026 — read-only; `ownerModule: "automation"`, `scopes: ["read"]`)

| Tool | Purpose |
|---|---|
| `automation.vesselState` | One vessel or fleet snapshot |
| `automation.listVessels` | Paginated fleet + filters |
| `automation.activeAlarms` | Open alarms |
| `automation.adapterHealth` | Connection status, versions, last-seen |
| `automation.setpointHistory` | Bounded audit of mode/setpoint changes |

Write/propose flows follow human-in-the-loop per [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §6.5 (H1 2027+).

### 8.2 Tier limits (`tierLimits(tier)` slice)

| Field | Meaning | Illustrative |
|---|---|---|
| `maxVessels` | Vessels per workspace | free 2 / premium 8 / pro 24 / pro_plus 100 |
| `maxAdaptersConnected` | Connections in `connected` | free 0 / premium 1 / pro 2 / pro_plus 10 |
| `automationAiToolsEnabled` | Gate tool family | free false / paid true |

`addonCodes: ["automation_module"]`. Enforce on vessel create and adapter connect.

### 8.3 `registerModule()` (shape per §4.4)

```ts
registerModule({
  code: "automation",
  routes: [automationVesselsRoutes, automationAdaptersRoutes, automationAlarmsRoutes],
  prismaSchema: "automation",
  aiTools: [vesselStateTool, listVesselsTool, activeAlarmsTool, adapterHealthTool, setpointHistoryTool],
  tierLimits: (tier) => ({ maxVessels, maxAdaptersConnected, automationAiToolsEnabled }),
  addonCodes: ["automation_module"],
});
```

---

## 9. H2 2026 phasing (RFC-0001 §7.3 working assumption)

Per [`docs/ROADMAP.md`](../ROADMAP.md) H2 2026 AI-first; full MRP ↔ automation co-design waits H1 2027.

| Phase | Window | Deliverable |
|---|---|---|
| A — Contracts | Q3 2026 | `@umbraculum/automation-contracts`, adapter SDK types; `PI_*` doc sync |
| B — Read path | Q3–Q4 2026 | Prisma schema, mock adapter, `vesselState` / `listVessels`, read-only `(automation)/` |
| C — Brewery adapter | Q4 2026 | `brewery.openplc.v1` bench Modbus; `adapterHealth` |
| D — Alarms | Q4 2026 | `AutomationAlarmEvent`, `activeAlarms`, integration metadata bridge |
| E — Write proposals | H1 2027+ | Human-in-the-loop setpoints (not H2 2026) |

**Not H2 2026:** pi-sidecar UI replacement; alarm ladder in TS; autonomous AI PLC writes. `registerModule()` should land with or before Phase B (feature-flag OK).

---

## 10. Brewery tier-6 checklist

- Package implementing `brewery.openplc.v1` (adapter SDK consumer).
- Keep `EquipmentProfile` in brewery module; optional link UX to `Vessel`.
- Sister-repo README cross-link to this doc + RFC-0001.
- Ferm integration screens keep integrations routes; optional vessel link when automation installed.

---

## 11. Non-goals

- `eslint-plugin-boundaries` for `modules/automation/` (RFC-0001 follow-on).
- `brewery` schema split from `public`.
- MRP ↔ vessel scheduling.
- Native automation screens beyond minimal status unless proven.
- Elevating this artifact to a separate Accepted RFC (RFC-0003) unless a future governance change explicitly requires the RFC track; canonical status and layout are already committed in RFC-0001 and RFC-0002.

---

## 12. Pre–Phase A checkpoints — Resolved 2026-05-19

Owner: OpenPLC + API maintainer (project lead). All structural recommendations in §§3–6 are accepted; the items below close the remaining detail before Phase A contract work (`@umbraculum/automation-contracts` + adapter SDK types) starts. Tier-limit numerics (§8.2) and full MRP/CRP cross-references (§4) remain illustrative until their respective phases.

### 12.1 Pilot context (informs the rest of this section)

The OpenPLC sister repo today is a **dev / pilot** — not deployed in any customer's production environment. The brewery vertical is real, but does not currently consume the pilot. Implication for Phase A–C: we have full freedom to evolve `PI_*` names, add registers, restructure the contract, and break compatibility on our own bench without notifying anyone external. Discipline (version handshake, refuse-on-major-mismatch) is wired in **from day one** so that by the time real customers exist, the muscle memory is in place — not because today's churn would harm anyone.

### 12.2 B1 — `PI_*` / Modbus mailbox source of truth

- **SoT.** OpenPLC sister repo is authoritative for `PI_*` names, addresses, and semantics. Safety-validated alarm logic is part of that SoT and is not duplicated in TypeScript.
- **Mirror mechanism (M2).** Sister repo emits a checked-in artifact (script-generated `PI_*.json` and/or `.ts`). Platform `@umbraculum/automation-contracts` imports / mirrors that artifact via PR. Drift becomes visible in PR diffs rather than at runtime. Upgrade to a published `@umbraculum/openplc-mailbox-spec` package (M3) deferred until a second adapter or third-party consumer appears.
- **Platform extensions.** Platform never adds `PI_*` names unilaterally; new mailbox entries require sister-repo PR + revalidation. Non-PLC platform-only data (AI summaries, UI hints, saved presets) lives in Postgres on `Vessel`/sibling tables, not in the mailbox namespace.
- **Version handshake.** Reuse the existing baseline `contract_version` from the integrated release (sister-repo `pyproject.toml` is the canonical sidecar source per the integrated-release-versioning rule). Phase A `automation-contracts` exports a `CONTRACT_VERSION` constant tracking that field. The PLC reports its runtime version via a dedicated `PI_FIRMWARE_VERSION` (or equivalent) register; if one does not yet exist in the sister repo, Phase A includes a sister-repo PR to add it.
- **Mismatch policy.** Major-version mismatch → adapter refuses to connect, raises an `AutomationAlarmEvent`. Minor-version mismatch → connects with a warning surfaced on `automation.adapterHealth`. Patch differences are silent.
- **Phase A scope for write path.** Types and version constants only. No Modbus client in the platform until Phase C (`brewery.openplc.v1`).

### 12.3 B2 — `Vessel.equipmentProfileId` cross-schema link

- **Mechanism (L1).** App-level UUID FK: `equipmentProfileId String?` on `Vessel`, nullable, no Prisma `@relation` across schemas. Application code validates the referenced `public.equipment_profiles.id` exists at write time.
- **Future upgrade path (L2).** Move to a formal Prisma cross-schema relation when brewery migrates to the canonical β layout in the H1 2027 tranche (per RFC-0002 Decision D). Backfill is a one-shot data-integrity check + relation declaration; no data migration required.
- **Cardinality — N:1 (industry-standard).** Multiple `Vessel` rows may reference the same `EquipmentProfile`. Concrete brewery example: one profile `P-FV-15bbl-Std` (15 bbl conical, glycol, 2" arm) referenced by four physical vessels K1, K2, K3, K4. Same physical layout, single design record, single calibration update applies to all four. The 1-of-1 case (mash tun, kettle, HLT — typically unique designs in a brewery) is the trivial sub-case of N:1 and is allowed without special handling.
- **Profile delete semantics.** Default is **block** when any vessel references the profile; the API returns a clear error naming the referencing vessel codes. Explicit detach is supported via an opt-in flag (e.g. `?cascade=detach`) — never silent. Avoids surprise data loss while keeping the operator override path explicit.
- **Tier interactions.** Automation not installed → brewery never reads or writes the field. Brewery not installed (post-canonical hypothetical) → the field stays nullable; vessels without profiles are allowed.
- **MRP/CRP forward note.** When `mrp`/`crp` ships, capacity planning aggregates `count(vessels) × profile.capacity` per workspace. The N:1 cardinality is what makes that aggregation meaningful. Trigger for extracting `@umbraculum/equipment-contracts` is documented in §4 above.

### 12.4 B3 — Phase A scope confirmation

Phase A is strictly:

- New `packages/automation-contracts/` — mailbox types, adapter SDK types, `CONTRACT_VERSION` constant. No runtime code.
- Sister-repo PR(s) — emit the mailbox artifact; ensure `contract_version` baseline includes a slot for adapter consumers; add `PI_FIRMWARE_VERSION` register if absent.
- This design doc — §12 (this section) records resolutions; §4 records the MRP/CRP entry point.

Phase A explicitly does **not** include:

- Prisma migrations (Phase B).
- `registerModule({ code: "automation" })` registration in `app.ts` (lands with or before Phase B).
- Any Modbus client implementation (Phase C).
- Web `(automation)/` routes (Phase B).

Implementation PRs should link this doc and cite the accepted Phase (§9).

### 12.5 Phase A entry checklist

Concrete steps Phase A includes, in order. Tracked under sub-plan #7 (umbrella plan).

| # | Step | Repo | Status |
|---|---|---|---|
| 1 | Scaffold `packages/automation-contracts/` (types-only, vitest, tsup) | `umbraculum-dev` | **Done** — see commit log |
| 2 | Wire new package into root `build:packages` and `.github/workflows/typecheck.yml` workspaces array | `umbraculum-dev` | **Done** |
| 3 | Mailbox-emitter PR shape draft (handoff to sister-repo maintainer) | `umbraculum-dev` (`docs/design/openplc-mailbox-emitter-pr-shape.md`) | **Done** |
| 4 | Sister-repo PR — emit `PI_*` mailbox artifact (`mailbox.json` and/or `.ts`); align `contract_version` slot for adapter consumers; add `PI_FIRMWARE_VERSION` register if missing | OpenPLC sister repo | **Done** — sister-repo `upgrade/v2` commit `114502d` (`tools/build_mailbox_artifact.py`, `tools/test_build_mailbox_artifact.py`, `out/mailbox.json` 356 entries, `PI_FIRMWARE_VERSION AT %QW222`, `make mailbox-artifact` / `make test-tools` 17/17 passing) |
| 5 | Sync first emitted mailbox artifact into `packages/automation-contracts/` (M2 mirror); bump `CONTRACT_VERSION` to first non-`-dev` value agreed with sister-repo maintainer | `umbraculum-dev` | **Done** — `master` commit `9253b1b` (`packages/automation-contracts/data/mailbox.json` byte-for-byte mirror, `src/mailbox-data.ts` validator + frozen `MAILBOX_SPEC`, `CONTRACT_VERSION = "2.0.1-dev"` tracking sister-repo `INTEGRATED_RELEASE_TAG`, `scripts/sync-automation-mailbox-mirror.sh` with `--check` drift mode, vitest 28/28 passing in container, `dist/*` regenerated). Phase A 5/5 done. Note: `2.0.1-dev` retains the `-dev` suffix because the sister-repo integrated release itself is still pre-release; the first non-`-dev` bump is gated by sister-repo cutting `2.0.1` (or later) on its bench-acceptance milestone, then both repos move together. |
| 6 | Phase B unblock signal — Phase B (read path: Prisma `automation` schema, `vesselState`, `listVessels`, read-only `(automation)/`) is now the active focus per §9 | both | **Done** — Phase B-1 landed (see §12.6) |

**Hold rule.** Steps 1–3 land independently in `umbraculum-dev` (types and shape only — no consumer). Step 4 is the first sister-repo touch and needs the maintainer's review window. Step 5 is the first time the platform mirror carries real `PI_*` names, so it should land in a single dedicated PR for clean diff review.

**No-customer pilot context (per §12.1).** Steps 4 + 5 may iterate freely on names and addresses without external compatibility concern; the version handshake (steps 1 + 5) is the discipline that catches accidental skew on our own bench during Phase B/C.

### 12.6 Phase B execution checklist

Phase B is split into three reviewable commits, B-1 → B-3, all landing in `umbraculum-dev`. Each is independently typechecked and tested in container; the sister repo is not touched in Phase B.

| # | Step | Status |
|---|---|---|
| B-1 | Prisma `multiSchema` enabled + `@@schema("public")` on all 58 existing models/enums + `Vessel` / `AdapterConnection` / `AutomationAlarmEvent` under `@@schema("automation")` (migration `add_automation_schema`); `services/api/src/modules/automation/` skeleton (`registerAutomationModule(app)` via `@brewery/module-sdk`, no routes); `app.ts` wire-up; docker-compose api+web service mounts for `module-sdk` + `automation-contracts`; vitest setup + idempotent guard for repeat `buildApp()` calls; api test suite green (49 files / 400 tests) | **Done** |
| B-2 | `services/api/src/modules/automation/adapters/mockAdapter.ts` (deterministic `AutomationAdapterDefinition` impl, no real Modbus, `automation.mock.v0` kind); `services/vesselsService.ts` (DB read with `assertMembership` + `VesselStateSchema.parse(...)` translation); `routes/automationVesselsRoutes.ts` (`GET /automation/vessels`, `GET /automation/vessels/:code`, workspace-scoped, response shapes pinned via `VesselListResponseSchema` / `VesselStateResponseSchema`); AI tools `automation.listVessels` + `automation.vesselState` registered alongside brewery tools in `app.ts`; `packages/automation-contracts/src/adapter.ts` migrated to Zod schemas (`VesselSnapshotSchema`, `VesselStateSchema`, `VesselListResponseSchema`, `VesselStateResponseSchema`, `AdapterCapabilitiesSchema`) per RFC-0003; vitest unit tests for the mock adapter + the new schemas | **Done — 2026-05-19** |
| B-3 | `apps/web/app/[locale]/(automation)/page.tsx` (vessel list); `apps/web/app/[locale]/(automation)/[vesselCode]/page.tsx` (vessel detail); top-nav entry in `PrimaryNav.tsx` + `automation` i18n namespace (English + Italian placeholder); api integration tests in `services/api/src/tests/automationVessels.test.ts` covering 401 unauth, list happy path with deterministic `code asc` ordering, get-by-code happy path + 404, **L2 cross-workspace isolation pins** (shared-code collision + B-only code 404 from A); api typecheck clean; full api vitest suite green (51 files / 413 tests); web typecheck has no new errors beyond the pre-existing project-wide Tamagui shorthand-prop type-resolution issue; `services/api/src/modules/automation/README.md` now carries an **automation-vs-crp surface-boundary guardrail** + "how to insert demo vessels locally" note (no seed extension per design) | **Done — 2026-05-19** |

**B-1 invariants captured.** The migration is forward-only: existing tables stay in `public` (no rename, no data migration); the only structural change is the new `automation` schema. The cross-schema `equipmentProfileId` is the L1 app-level FK from §12.3 (no Prisma `@relation` across schemas yet). The adapter contract version handshake (`AdapterConnection.contractVersion` ↔ `MAILBOX_SPEC.contractVersion` from `@brewery/automation-contracts`) is wired into the table shape but not yet enforced — enforcement lands with the real `brewery.openplc.v1` adapter in Phase C.

**B-1 follow-on captured for module-sdk.** `@brewery/module-sdk`'s `registerModule()` uses a process-wide singleton registry that throws on duplicate registration. The api `vitest.setup.ts` clears it between test files and `services/api/src/modules/automation/index.ts` carries an idempotent guard for intra-file repeats. The cleaner long-term fix is to split metadata-recording (process-wide, idempotent) from per-app route registration in module-sdk itself; tracked as a sub-plan #9 follow-on (sub-plan #9 scoping pass done 2026-05-19 — see [`brewery-scope-migration-plan.md`](./brewery-scope-migration-plan.md); the metadata/registration split is a *post-rename* refactor expected to land after slot 11 closes the `@brewery/module-sdk` rename).

**B-2 closure note (2026-05-19, on the post-RFC-0003 Zod v4 pattern).** The B-2 commit lands the read path entirely on the new validation-slice pattern: `adapter.ts` rewrites the interface-based contracts as Zod schemas with `z.infer` types (`VesselSnapshotSchema`, `VesselStateSchema`, `VesselListResponseSchema`, `VesselStateResponseSchema`); the service layer parses Prisma rows through `VesselStateSchema.parse(...)` at the wire-shape boundary so a future Prisma migration that adds a column without updating the wire shape surfaces the drift at the service boundary, not at the client; the route layer parses route params (`/automation/vessels/:code`) via an inline `z.object({ code })` schema; the AI tool layer parses the model-provided input via Zod `.parse()` in the handler (the JSON Schema literal stays on the `inputSchema` property because the Anthropic SDK consumes JSON Schema, not Zod schemas — until the AI-tool registry grows a Zod-aware adapter in Phase C). All four boundary types (request body / route params / Prisma row → wire / model input) get a Zod validation pass, matching the "validate at the boundary, once" discipline from the rewritten `22-typescript-contracts-runtime-validation.mdc` plugin-pack rule. Integration tests (the canonical 6-axis L2 pattern from `services/api/src/tests/` for the new `/automation/vessels` routes + an L2 cross-workspace isolation pin) are tracked under B-3's testing scope so they land in the same commit as the web UI that exercises them.

**B-3 closure note (2026-05-19).** Web read path landed: `apps/web/app/[locale]/(automation)/page.tsx` (vessel list) + `(automation)/[vesselCode]/page.tsx` (vessel detail) consume `GET /api/automation/vessels`(+`:code`) via `apiFetch`, re-validate the response through `VesselListResponseSchema` / `VesselStateResponseSchema` on the client (boundary validation per the Zod v4 standard — server's `VesselStateSchema.parse(...)` is the canonical pin, the client re-parse catches HTTP-layer drift), and render only the live-controller-state fields explicitly enumerated in §11 (mode, currentTempC, targetTempC, alarmActive, lastSeenAt). **Automation-vs-crp surface guardrail** is now first-class: the `services/api/src/modules/automation/README.md` carries a "Surface boundary — automation vs. crp" section that contributors must respect (no scheduling / utilization / booking / capacity views on the automation surface; those belong to the future `crp` module). The top nav (`PrimaryNav.tsx`) exposes the surface with the `automation` i18n label; English + Italian placeholder copy land in `packages/i18n/src/{en,it}.json`. Tests: 8 new tests in `services/api/src/tests/automationVessels.test.ts` covering 401 unauth, list happy path with deterministic ordering, get-by-code + 404, and **two L2 cross-workspace isolation pins** (the shared-code collision case and the B-only-code 404 case); full api suite (51 files / 413 tests) green. The `apps/web` typecheck has no NEW errors beyond the pre-existing project-wide Tamagui shorthand-prop type-resolution issue (same pattern as `app/[locale]/recipes/page.tsx` and others); fixing that is orthogonal Tamagui type-debt and tracked separately. Phase C (real `brewery.openplc.v1` adapter + version handshake enforcement) is unblocked.

---

## 13. References

- [RFC-0001](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) — Decision E §7.2, Decision F
- [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md) — β layout, `automation` schema name
- [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) — §4.4, §4.5, §6
- [`docs/ROADMAP.md`](../ROADMAP.md) — H2 2026 / H1 2027
- [`integrationsGeneric.ts`](../../services/api/src/routes/integrationsGeneric.ts), `schema.prisma` (`EquipmentProfile`, `Integration*`)
- OpenPLC sister repo — `PI_*`, alarm-layer stability, `DEVELOPMENT.md`

---

*Accepted design 2026-05-19. Implementation PRs should link this doc, RFC-0001 §7.2, and RFC-0002 (β layout). Amendments follow the same lightweight design-review procedure as RFC-0002 §12 unless a formal RFC-0003 is opened for governance reasons.*
