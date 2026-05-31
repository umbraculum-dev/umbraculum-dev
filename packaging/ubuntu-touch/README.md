# Ubuntu Touch packaging

**Tier:** Public  
**Audience:** maintainers, self-hosters, tier-3 integrators shipping Umbraculum on Lomiri

Distribution adapters for [Ubuntu Touch](https://ubuntu-touch.io/) — **not** application source code. Operator UI remains [`apps/web`](../../apps/web/) + Tamagui; these folders only produce **Click webapp packages** (`webapp-container` + Morph).

**Strategy (decision-of-record):** [`docs/design/ubuntu-touch-shell-strategy.md`](../../docs/design/ubuntu-touch-shell-strategy.md)

## Contents

| Path | Purpose |
|---|---|
| [`umbraculum-reference/`](umbraculum-reference/README.md) | Reference Click package — copy and change `UMBRACULUM_WEB_ORIGIN` for your deployment |

No changes to `@umbraculum/*-contracts`, `@umbraculum/module-sdk`, or `services/api` are required for v1 UT delivery.
