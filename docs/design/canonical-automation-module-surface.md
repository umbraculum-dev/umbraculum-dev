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
| 4 | Sister-repo PR — emit `PI_*` mailbox artifact (`mailbox.json` and/or `.ts`); align `contract_version` slot for adapter consumers; add `PI_FIRMWARE_VERSION` register if missing | OpenPLC sister repo | Pending |
| 5 | Sync first emitted mailbox artifact into `packages/automation-contracts/` (M2 mirror); bump `CONTRACT_VERSION` to first non-`-dev` value agreed with sister-repo maintainer | `umbraculum-dev` | Pending (depends on #4) |
| 6 | Phase B unblock signal — when #5 merges, Phase B (read path: Prisma `automation` schema, `vesselState`, `listVessels`, read-only `(automation)/`) becomes the active focus per §9 | both | Pending |

**Hold rule.** Steps 1–3 land independently in `umbraculum-dev` (types and shape only — no consumer). Step 4 is the first sister-repo touch and needs the maintainer's review window. Step 5 is the first time the platform mirror carries real `PI_*` names, so it should land in a single dedicated PR for clean diff review.

**No-customer pilot context (per §12.1).** Steps 4 + 5 may iterate freely on names and addresses without external compatibility concern; the version handshake (steps 1 + 5) is the discipline that catches accidental skew on our own bench during Phase B/C.

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
