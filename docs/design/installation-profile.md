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
| **Core profile** | No verticals; native app = `starter` |
| **Reference profile** | Brewery reference vertical + native `brewery` app |

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
  "nativeApps": ["starter"]
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
- **`native-deps` / expo-doctor** — runs against manifest `nativeApps[0]` (`starter` or `brewery`) via [`check-native-expo-doctor.sh`](../../scripts/check-native-expo-doctor.sh).
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
