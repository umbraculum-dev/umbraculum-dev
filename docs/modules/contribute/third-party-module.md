# Contribute — a third-party / community module

**Tier:** Public
**Ceremony level:** **None — Tier 3 / Tier 4 are permissionless** ([RFC-0001 §5–§6](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md)).
**Audience:** anyone building a connector, integration, or extension *against* an existing canonical module — typically from your own repo, distributed via npm.

> [!NOTE]
> This is the most common contribution path once the canonical-module set matures. Examples: a Modbus-RTU adapter for `automation` from a hardware vendor; a Salesforce connector for the future `crm`; an open-source warehouse-scanner pack for the future `wms`. You ship from your own repo; consumers install your package alongside the platform.

---

## 1. Tier 3 vs Tier 4

| Tier | Author | License | Example |
|---|---|---|---|
| **Tier 3 — Community** | Open-source contributor / consultancy | Author's choice (MIT-compatible recommended) | Open-source hardware adapter, community-built integration |
| **Tier 4 — Third-party vendor** | Commercial vendor | Commercial / proprietary OK (you build on the MIT SDK) | Vendor's pre-built BI dashboards, commercial vertical add-on |

The only practical difference is licensing posture — Tier 4 may ship proprietary code because the SDK you depend on is MIT ([LICENSING.md §6.2](../../LICENSING.md)). Tier 3 is the natural home for open-source community work. Both are permissionless; both follow the same technical contribution path.

---

## 2. When this path applies

You're building something that:

- Implements an SDK contract (e.g. `AutomationAdapterDefinition`) or registers tools through one of the SDK's slots (`registerAiTools`, `tierLimits`, `addonCodes`).
- Is consumed by users who *already* have a canonical module installed — your module extends, it does not replace.
- Lives in your own repo and ships as an npm package (typically; for very small community contributions a PR into this monorepo is also acceptable, but the canonical model is "your repo, your release cadence, your license").

If you want to ship the *one* canonical implementation of a new domain, you want [`canonical-module.md`](canonical-module.md) (high ceremony). If you want to ship a vertical-flavored bundle of features for an industry, you want [`vertical-configuration.md`](vertical-configuration.md).

---

## 3. The stable surfaces you pin

The MIT-licensed SDK contract is the **only** Umbraculum surface a third-party module depends on. Core packages: three unconditional plus one per canonical you target. Optional HTTP client packages when your module calls the platform API from Node or a custom client:

- **`@umbraculum/module-sdk`** ([`packages/module-sdk/README.md`](../../../packages/module-sdk/README.md)) — `registerModule()`, `RESERVED_CANONICAL_MODULE_CODES`, `ValidatedSchema<T>`, `RegisterModuleOptions`, `registerWebModule()`, `registerNativeModule()`. The module SDK proper.
- **`@umbraculum/ai-tool-sdk`** ([`packages/ai-tool-sdk/README.md`](../../../packages/ai-tool-sdk/README.md)) — `AiTool<I, O>`, `AiToolContext`, `AiToolScope`, `AiToolRegistry`, `AiToolDefinition`. The AI-tool contract every module's tool implementations satisfy. Library-agnostic — third-party authors pick their own validation library for `inputSchema`. Pin if your module contributes AI tools (which most modules do via `registerAiTools` on `RegisterModuleOptions`).
- **`@umbraculum/i18n-keys`** ([`packages/i18n-keys/README.md`](../../../packages/i18n-keys/README.md)) — `ModuleNavLabelKey`, `moduleMessageRoot`, `defaultModuleNavLabelKey`, `RESERVED_PLATFORM_MESSAGE_ROOTS`. Namespace conventions for module-owned message keys in locale bundles. Pin for any module that ships UI copy or registers `navEntry` / `tabEntry` label keys (typical for all modules with a web or native surface).
- **`@umbraculum/<code>-contracts`** — the specific canonical's contracts package (e.g. `@umbraculum/automation-contracts` exports `AutomationAdapterDefinition`, `MAILBOX_SPEC`, `CONTRACT_VERSION`). One per canonical module you target.
- **`@umbraculum/contracts`** ([`packages/contracts/README.md`](../../../packages/contracts/README.md)) — platform wire parsers (auth, workspaces, rendering jobs, ads, AI settings/usage). Pin when validating platform HTTP payloads outside `@umbraculum/api-client`.
- **`@umbraculum/api-client`** ([`packages/api-client/README.md`](../../../packages/api-client/README.md)) — optional typed HTTP facades (`listWorkspaces`, canonical subpaths `/automation`, `/pim`, …). Prefer over raw `fetch` when calling Umbraculum APIs from Node scripts or external apps. Browse paths on [docs.umbraculum.dev/openapi-platform](https://docs.umbraculum.dev/openapi-platform).

You do **not** import from `services/api/src/modules/<code>/` directly. That tree is platform internals and not version-stable. If something you need is not exported from a contracts package, that's a feature request against the contracts package, not a license to reach inside.

**npm registry (primary).** Core SDK packages on the public npm registry as of **2026-05-29**; `@umbraculum/contracts` and `@umbraculum/api-client` at **`0.0.1`** (2026-06):

```bash
npm install \
  @umbraculum/module-sdk@0.0.2 \
  @umbraculum/ai-tool-sdk@0.1.1 \
  @umbraculum/i18n-keys@0.1.1
# plus @umbraculum/<code>-contracts@0.0.2 for each canonical you target
# optional HTTP client stack:
npm install @umbraculum/contracts@0.0.1 @umbraculum/api-client@0.0.1
```

Pin `peerDependencies` to `^` those versions (or newer patch/minor within range). See [`LICENSING.md`](../../LICENSING.md) §6.2.1 for the full version table.

**HTTP integrator walkthrough (no module registration):** [`INTEGRATOR-QUICKSTART.md`](../../INTEGRATOR-QUICKSTART.md) — install from npm, bearer login, platform API reads. **Sample repo:** [`umbraculum-integrator-sample`](https://github.com/umbraculum-dev/umbraculum-integrator-sample) (public, no monorepo clone).

**Monorepo hybrid (contributors).** Umbraculum contributors use npm workspaces: **consumer** manifests pin the same registry semver as third-party repos (`^0.0.2` module-sdk batch, `^0.0.1` contracts/api-client); workspaces still symlink in-tree `packages/*` for active co-dev. Unpublished monorepo packages (`ui`, `i18n`, brewery vertical, …) remain `file:` links. See [`npm-sdk-monorepo-dogfood.md`](../../design/npm-sdk-monorepo-dogfood.md). Git dependencies on the monorepo checkout remain valid when you need unreleased pins.

---

## 4. Procedure

### Step 1 — Pick the canonical(s) you're extending

Identify which canonical module's SDK slot you implement. For an OpenPLC adapter: `automation`'s `AutomationAdapterDefinition`. For a Salesforce CRM connector (when `crm` ships): `crm`'s extension points. For a vertical-specific AI tool pack: any canonical's `registerAiTools` slot.

### Step 2 — Scaffold your repo

Outside this monorepo. Use the β shape for your package layout:

```
my-adapter-repo/
├── packages/<your-pkg>/
│   ├── src/
│   ├── package.json
│   └── README.md
└── ...
```

`package.json` declares its dependencies:

```json
{
  "name": "@your-org/<your-pkg>",
  "version": "0.1.0",
  "license": "MIT",
  "peerDependencies": {
    "@umbraculum/module-sdk": "^X.Y.Z",
    "@umbraculum/ai-tool-sdk": "^X.Y.Z",
    "@umbraculum/i18n-keys": "^X.Y.Z",
    "@umbraculum/automation-contracts": "^X.Y.Z"
  }
}
```

Use `peerDependencies` (not `dependencies`) for the SDK and contracts packages — your consumers must have one platform version pinned, not multiple copies.

### Step 3 — Implement the contract

Example: implementing `AutomationAdapterDefinition` for a custom Modbus device. (Illustrative — the real adapter contract is exported from `@umbraculum/automation-contracts`; consult [`packages/automation-contracts/README.md`](../../../packages/automation-contracts/README.md) for the current surface.)

```typescript
import type { AutomationAdapterDefinition } from "@umbraculum/automation-contracts";

export const myDeviceAdapter: AutomationAdapterDefinition = {
  kind: "my-org.my-device.v1",
  protocol: "modbus-tcp",
  capabilities: { read: true, write: false },
  contractVersion: "2.0.1-dev",
  async connect(config) { /* ... */ },
  async disconnect() { /* ... */ },
  async readSnapshot() { /* return VesselSnapshot[] */ },
};
```

### Step 4 — Version the handshake

If you're targeting a canonical that uses a version handshake (`automation` does, via `CONTRACT_VERSION` + `classifyContractVersionSkew`), pin the version your adapter is built against. The canonical's adapter supervisor rejects connections with a major-version mismatch and warns on minor mismatch ([canonical-automation-module-surface.md §12.2](../../design/canonical-automation-module-surface.md)).

### Step 5 — Ship via npm

Publish under your own scope (`@your-org/...`). Your consumers add your module to their workspace's installation list (mechanism TBD — packaging for installable third-party modules is one of the H1 2027 follow-ons per [RFC-0002 §11.4](../../rfcs/0002-canonical-module-physical-layout.md)).

### Step 6 — Document and version

Your module's README should state:

- Which canonical(s) it extends.
- Which `CONTRACT_VERSION` of the target contracts package it's built against.
- Which versions of `@umbraculum/module-sdk` it's compatible with.
- Your license (any MIT-compatible license).

---

## 5. The consumption contract still applies

Tier 3 and Tier 4 modules are bound by the same [RFC-0001 §8 (Decision F)](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) consumption contract that core canonicals are:

- No parallel auth / session model.
- No direct Stripe / RevenueCat integration (declare addon codes; the platform owns billing).
- No parallel AI orchestrator (register AI tools via the SDK).
- No parallel i18n stack.
- No parallel device-ingestion path (use the integrations framework for read-mostly devices).

The SDK shape *enforces* this — there is no `auth` slot in `RegisterModuleOptions`, so you cannot register a parallel auth implementation even if you wanted to.

---

## 6. Promotion path (Tier 3 → Tier 1, if your module becomes the canonical)

A Tier 3 module that matures into the *de facto* implementation of a new canonical domain can be promoted to canonical via the mini-RFC procedure in [`canonical-module.md`](canonical-module.md). The trajectory:

1. Ship at Tier 3 or Tier 4.
2. Demonstrate cross-vertical adoption (multiple verticals depend on you; not just one customer).
3. Mature the surface — stable contracts, documented extension points.
4. Propose canonical allocation via mini-RFC.
5. If approved, the canonical code is reserved and the platform may ship its own implementation OR adopt yours via license relicensing. The promotion is structural (the *code* becomes canonical); the *implementation* relationship is negotiated.

This is the same trajectory the Drupal ecosystem's most successful contributed modules have followed for two decades.

---

## 7. Common pitfalls

- **Reaching into platform internals.** `import from "services/api/src/modules/automation/services/vesselsService"` is not a stable surface — that's our platform internals. Pin `@umbraculum/automation-contracts` instead.
- **Using `dependencies` for the SDK instead of `peerDependencies`.** Causes duplicate SDK instances in the consumer's `node_modules`, which breaks the registry singleton ([module-sdk's `registerModule` uses a process-wide singleton](../../../packages/module-sdk/src/moduleRegistry.ts)).
- **Pinning a major contract version too narrowly.** Use caret-range `^X.Y.Z` for the contracts package so minor and patch updates flow without your consumers having to update your module in lockstep.
- **Hard-coding addon prices.** Billing is the platform's; your module declares `addonCodes`, and Stripe/RevenueCat configuration of the price lives outside your module ([RFC-0001 §8.2](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) billing row).
- **Shipping AGPLv3 SDK code as proprietary.** The SDK is MIT, so you can ship proprietary against it. Some *examples* in this repo are AGPLv3 — re-implement, don't copy, if you need proprietary code.

---

## 8. Worked example — minimal external adapter repo

The steps in §4 describe the contract; this section shows the **shape of a standalone repo** a hardware vendor or community contributor would maintain outside `umbraculum-dev`. The in-monorepo analog for development and tests is [`services/api/src/modules/automation/adapters/mockAdapter.ts`](../../../services/api/src/modules/automation/adapters/mockAdapter.ts) (`automation.mock.v0`); your external package follows the same `AutomationAdapterDefinition` surface.

### 8.1 Repository layout

```
acme-modbus-adapter/                 # your GitHub org's repo
├── package.json
├── README.md
├── LICENSE                          # MIT recommended for Tier 3
└── src/
    ├── index.ts                     # re-exports the adapter
    └── acmeFermenterAdapter.ts      # implements AutomationAdapterDefinition
```

### 8.2 `package.json` (peer-deps only for platform packages)

```json
{
  "name": "@acme/automation-modbus-adapter",
  "version": "0.1.0",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "peerDependencies": {
    "@umbraculum/module-sdk": "^0.0.2",
    "@umbraculum/automation-contracts": "^2.0.0"
  }
}
```

Install SDK + contracts from npm (see §3). The **peer dependency names and semver ranges** below match the published registry versions.

### 8.3 Adapter implementation (illustrative)

```typescript
import type { AutomationAdapterDefinition } from "@umbraculum/automation-contracts";
import { CONTRACT_VERSION } from "@umbraculum/automation-contracts";

export const acmeFermenterAdapter: AutomationAdapterDefinition = {
  kind: "acme.fermenter-modbus.v1",
  protocol: "modbus-tcp",
  capabilities: { read: true, write: false },
  contractVersion: CONTRACT_VERSION,
  async connect(_config) {
    /* open TCP socket to PLC */
  },
  async disconnect() {
    /* close socket */
  },
  async readSnapshot() {
    /* map holding registers → VesselSnapshot[] */
    return [];
  },
};
```

### 8.4 How a workspace operator wires it in

Third-party module **installation UX** is still evolving ([RFC-0002 §11.4](../../rfcs/0002-canonical-module-physical-layout.md)). Today the integration path is:

1. Operator (or self-hoster) adds your npm package to the API service dependency graph.
2. Platform code registers the adapter kind with the `automation` module's adapter supervisor (Phase C — see [`modules/canonical/automation.md`](../canonical/automation.md)).
3. Workspace admin creates an `AdapterConnection` row pointing at your `kind` and supplies connection config (host, port, secrets ref).

Document steps 2–3 in **your** README as "platform version X.Y required" so operators know which Umbraculum release exposes the registration hook you target.

### 8.5 README checklist (your repo)

Your `README.md` should state explicitly:

- Canonical extended: `automation`.
- Adapter kind string: `acme.fermenter-modbus.v1`.
- `@umbraculum/automation-contracts` version built against (including `CONTRACT_VERSION`).
- `@umbraculum/module-sdk` peer range.
- License and support contact.

---

## 9. Cross-references

- [`packages/module-sdk/README.md`](../../../packages/module-sdk/README.md) — the SDK's own README.
- [`packages/ai-tool-sdk/README.md`](../../../packages/ai-tool-sdk/README.md) — the AI-tool SDK contract.
- [`packages/i18n-keys/README.md`](../../../packages/i18n-keys/README.md) — module message-key conventions.
- [`packages/automation-contracts/README.md`](../../../packages/automation-contracts/README.md) — example contracts package.
- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5 (Tier 3 / Tier 4 rows), §8 (consumption contract).
- [LICENSING.md §6.2](../../LICENSING.md) — MIT SDK posture.
- [`docs/MODULES.md`](../../MODULES.md) §4.3 — decision-tree row.
