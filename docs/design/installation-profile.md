# Installation profile

**Tier:** Public  
**Status:** Shipped 2026-06 (Waves A–F)  
**Audience:** integrators, maintainers, demo-host operators  
**Related:** [`platform-module-profile.md`](platform-module-profile.md) (legacy alias), [`brewery-vertical-lifecycle.md`](brewery-vertical-lifecycle.md), [`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md), [RFC-0009](../rfcs/0009-workspace-billing-addons-and-entitlements.md)

---

## Summary

An **installation profile** selects which modules and native apps are enabled for a deployment at install/boot time — analogous to Magento's enabled-module list, not a product variant code.

| Term | Meaning |
|------|---------|
| **Installation profile** | Platform + canonical modules + optional verticals installed on this stack |
| **`UMBRACULUM_MODULE_PROFILE`** | Env selector (`platform` \| `reference`) — a view over the manifest |
| **Core profile** | No verticals; native app = `blank` |
| **Reference profile** | Brewery reference vertical + native `brewery` app |

---

## Web vs native — asymmetric surfaces

Installation profile controls **which modules boot on the API** and **which native store binaries** are in scope for a deployment. It does **not** imply the same federation shape on web and native.

| Surface | Federation model | Grows with ecosystem by… |
|---------|------------------|---------------------------|
| **Web** (`apps/web`) | **One** federated workspace-member shell | Adding route groups `(pim)/`, `(mrp)/`, … inside the same deployable |
| **Native** (`apps/native/<app-code>/`) | **Many** purpose-built binaries | Adding new Expo workspaces; each binary **composes** a subset of module native slices |

**Why native does not mirror web.** Web-first for heavy desktop workflows; native only where mobile form factor is intrinsic ([`ROADMAP.md`](../ROADMAP.md) standing principles). A single native binary that registered every enabled module would be the wrong default: app-store size and permissions, role/device mismatch (scanner vs office), integrator choice, and release coupling. Bundling **related** floor apps (for example PIM + quality in one binary) is intentional **composition** at app definition time — not one runtime shell for the whole installation profile.

**`nativeApps` in the manifest** lists **deployable native binaries** for this stack (today `blank` or `brewery`; future examples `pim-floor`, `wms-scanner`). It is not a one-to-one map of every canonical module on the server. Canonical modules can be live on API + web while native UIs for them are absent, web-fallback only, or shipped as separate apps when product need justifies a store binary.

**`blank` (core profile):** the blank native app — interim CI/monorepo target for Expo (`expo-doctor`, typecheck) until the first canonical native product app ships. Not sample data (brewery reference vertical), not `apps/web`'s native twin. See [`apps/native/README.md`](../../apps/native/README.md) § Web vs native.

**AI consultant:** workspace context is carried on **web + API**; mobile apps are task-bound surfaces. Multiple native binaries do not split AI workspace scope.

RFC: [RFC-0011](../rfcs/0011-application-surface-shell-layering.md) Decision C (native multi-app). Backbone: [`pre-flip-application-surface-backbone.md`](pre-flip-application-surface-backbone.md) §4.

---

## Manifest files

| File | Purpose |
|------|---------|
| [`.umbraculum/install.json`](../../.umbraculum/install.json) | Active default pointer (core) |
| [`.umbraculum/install.core.json`](../../.umbraculum/install.core.json) | Core — no verticals |
| [`.umbraculum/install.reference.json`](../../.umbraculum/install.reference.json) | Reference — brewery opt-in |

Example core manifest:

```json
{
  "id": "core",
  "verticals": [],
  "canonical": ["automation", "pim", "mrp", "crp"],
  "nativeApps": ["blank"]
}
```

**Resolver chain** ([`installProfile.ts`](../../packages/sdk/module-sdk/src/installProfile.ts)):

1. `UMBRACULUM_INSTALL_MANIFEST` — path override (optional)
2. `UMBRACULUM_MODULE_PROFILE` — `platform` → core, `reference` → reference manifest
3. `.umbraculum/install.json` when present
4. Fallback: `install.core.json`

Shell helper: `python3 scripts/lib/resolve-install-manifest.py --json`

---

## Compose wiring

**Default (fresh clone):** [`docker-compose.yml`](../../docker-compose.yml) sets `UMBRACULUM_MODULE_PROFILE=platform`.

**Reference demo / E2E:**

```bash
docker compose -f docker-compose.yml -f docker-compose.reference.yml up -d
# or UMBRACULUM_MODULE_PROFILE=reference in .env
```

---

## Two-level entitlements model

| Level | Question | Scope |
|-------|----------|-------|
| **Installation profile** (server-wide) | Is brewery installed on this stack? | Entire deployment |
| **Workspace add-on** (per customer) | Does this workspace have `brewery_module`? | Each workspace (RFC-0009, H1 2027) |

`EntitlementsService.hasActiveAddon("brewery_module")` returns **false** when brewery is not in the installation profile — regardless of workspace billing rows. Full Stripe / purchase UI enforcement is deferred to H1 2027.

---

## Build / CI / native

- **`npm run build:packages`** — builds core packages always; vertical packages only when manifest includes brewery ([`build-packages-install-profile.sh`](../../scripts/build-packages-install-profile.sh)).
- **`native-deps` / expo-doctor** — runs against manifest `nativeApps[0]` (`blank` or `brewery`) via [`check-native-expo-doctor.sh`](../../scripts/check-native-expo-doctor.sh).
- **Smoke** — [`integrator-api-smoke.sh`](../../scripts/integrator-api-smoke.sh) skips brewery catalog checks on core profile.

---

## Prisma

Core profile: [`prisma-migrate-install-profile.sh`](../../scripts/prisma-migrate-install-profile.sh) runs `migrate deploy` then strips `brewery` schema. Reference profile: full deploy. See [`brewery-vertical-lifecycle.md`](brewery-vertical-lifecycle.md).

---

## Magento parallel (pedagogical)

| Magento 2 | Umbraculum |
|-----------|------------|
| Core + framework | Horizontal platform + canonical modules |
| `Magento_SampleData*` (opt-in) | Brewery reference vertical |
| `app/etc/config.php` module list | Installation profile manifest |
| `module:enable` / `module:disable` | Opt-in / disable-only in manifest |

---

## Verification

```bash
# Core — brewery route absent (404)
UMBRACULUM_MODULE_PROFILE=platform curl -s -o /dev/null -w "%{http_code}\n" http://localhost:18080/api/styles

# Reference — route registered (401 without session OK)
UMBRACULUM_MODULE_PROFILE=reference curl -s -o /dev/null -w "%{http_code}\n" http://localhost:18080/api/styles
```

Module-sdk tests: `npm test -w @umbraculum/module-sdk`
