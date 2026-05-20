# Umbraculum — process-manufacturing platform, brewery-configured by default

> [!IMPORTANT]
> This repository is **work in progress** and **not yet a public-facing
> release**. The path to a public flip (working assumption: H1 2027,
> seeded into a fresh public repo) is documented in
> [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) §10.1.
> The project's brand was resolved on 2026-05-18 to **Umbraculum**
> (primary domain `umbraculum.dev`; GitHub org `umbraculum-dev`;
> mascot **Umbi** — [`docs/media/umbi.png`](docs/media/umbi.png));
> see [`docs/RENAME-DILIGENCE.md`](docs/RENAME-DILIGENCE.md) for the
> diligence record.

## What this is

Umbraculum is a **process-manufacturing platform** built around a
small set of operational primitives — recipes as bills-of-materials,
equipment profiles as constrained resources, production runs as
scheduled batches, and ingredient + utility inputs as process
specifications.

The **brewery vertical** is the first vertical configuration shipping
on this platform. It is a fully working product on its own — brew-day
logging, water chemistry, recipe management, brew sessions — and
simultaneously a reference implementation for how other vertical
configurations (distillery, kombucha, food, cosmetics, fine chemicals,
nutraceuticals, fragrance) plug in via seed data, prompts, and
configuration rather than by re-implementing the core. See
[`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) §1.1 +
§2 for the full reasoning.

This framing matters because **the same primitives that power a
brewery are the primitives any batch process manufacturer needs.** MRP
and CRP are not future "new modules" — they are a generalization of
work the brewery vertical already does.

The platform is also structured around a **workspace-scope AI
consultant** as a first-class operational surface. The architectural
choices that follow — monorepo, one shell, canonical-module discipline,
peer-module decomposition, vertical-configuration tier — are downstream
of one principle: the consultant must see the workspace as one coherent
thing. See [`docs/AI-CONSULTANT.md`](docs/AI-CONSULTANT.md) for the
feature surface and [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md)
§4.0 for the cornerstone reasoning.

### What ships with the brewery vertical today

- Brew-day reliability tooling — mash / sparge / boil step pages, water
  chemistry (mash + sparge + boil), recipe import/export (BeerJSON
  canonical; BeerXML import-compatible), equipment profiles.
- Workspace + membership + tier-based billing (free / premium / pro /
  pro+) wired through Stripe.
- An **AI consultant** integrated as a first-class operational surface
  (chat, settings, usage dashboard, per-workspace operational memory)
  using **BYOK** keys + paid workspace tier unlock — see
  [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) §6–§7.
- Web app + native (React Native + Expo) app sharing core logic via
  cross-platform packages.

### What is intentionally not shipped yet

- A second vertical module (WMS / CRM / MRP / CRP). The platform is
  shaped to host them, but only the brewery vertical is live today.
- Brand resolution complete (2026-05-18: **Umbraculum** — wordmark,
  `umbraculum` namespace, `umbraculum.dev` primary domain,
  `umbraculum-dev` GitHub org). The placeholder substitution is
  applied across the codebase and docs; see
  [`docs/RENAME-DILIGENCE.md`](docs/RENAME-DILIGENCE.md) for the
  diligence record.
- A public release. The repository is currently developed privately;
  the go-public criteria and plan are in
  [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) §10.1.

## Project values

The convictions Umbraculum is built around — Total Quality with capital Q (Galgano / Deming / Toyota / Kaizen lineage), AI-orchestrated code as discipline (rules + skills + agents apparatus, *not* drive-by Copilot paste), sustainability for the *whole ecosystem* (not just maintainers), horizontal accessibility, empathy as a structural commitment, people / family / unionism welcomed, and explicit inclusivity — live in [`MANIFESTO.md`](MANIFESTO.md). It is the public statement of what the project commits to and why; reading it is the fastest way to know whether Umbraculum is the kind of project you want to bet a profession or a business on.

## Who this is for

- **Process manufacturers** — anyone running batch production where the
  primitives above are recognizable. Today the user-facing brewery
  vertical is the entry point; the underlying platform aims to serve a
  much wider audience as additional vertical configurations land.
- **Operators / IT teams** — single-tenant self-host is a first-class
  deployment target. Hosted SaaS will be offered alongside, not instead.
- **Developers and integrators** — every public-facing surface is
  contract-typed (`packages/contracts`), every module is registered
  through the same horizontal platform layer, and the AI consultant
  exposes a stable tool-protocol per
  [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) §6.

## Repository layout

```text
apps/
  web/         Next.js + React + Tamagui — desktop-first web UI
  native/     React Native + Expo + Tamagui — mobile UI
services/
  api/         Fastify + Prisma — primary API service
packages/
  contracts/   Typed shared contracts (DTOs, AI tool types, etc.)
  ui/          Cross-platform Tamagui primitives + shared components
                 (e.g. AiChatPanel — used by both web and native)
  i18n/        en + it translations
  i18n-react/  React bindings for translations
  api-client/  Typed API client (bearer-token aware; used by native)
  navigation/  Cross-platform route IDs
docs/          Public-facing docs (this is what ships to consumers)
internal/      Internal-only strategy + business docs (excluded from
                 the public mirror when the repo flips public)
scripts/       One-shot maintenance + container build scripts
.cursor/       AI agent rules + skills for in-repo coding workflows
```

## Native out of the box (why Tamagui)

Web + native are not coincidence in this stack — they are the platform's
deliberate shape. The reason `apps/native/` ships alongside `apps/web/`,
and the reason Tamagui sits at the bottom of the UI dependency stack, is
that the platform commits to **one source of truth shipping to both
surfaces almost out of the box**:

- **Tamagui** gives us one component tree that resolves to real DOM on
  web and real React Native primitives on device — one design-token
  system, one accessibility surface, one set of primitives — instead of
  two parallel UI libraries kept in sync by hand. The alternatives
  comparison and the accepted-cost discipline live in
  [`docs/TAMAGUI.md`](docs/TAMAGUI.md).
- **React Native + Expo** is the device-side runtime. The cross-platform
  packages (`@umbraculum/ui`, `@umbraculum/brewery-recipes-ui`,
  `@umbraculum/navigation`, `@umbraculum/i18n-react`,
  `@umbraculum/api-client`, `@umbraculum/media`) are the boundary layer
  that abstracts the web-vs-native split so feature code rarely has to
  fork.
- **Module shape mirrors this.** Per
  [`docs/rfcs/0002-canonical-module-physical-layout.md`](docs/rfcs/0002-canonical-module-physical-layout.md),
  every canonical or vertical module materializes as four coordinated
  slices — API, web, **native** (`apps/native/src/modules/<code>/`),
  and a contracts package — and the native slice is one of those four
  by design, not an afterthought.

That is what
[`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) §1.1
means when it says the cross-platform infrastructure "lets one source of
truth ship as both a web app and a native app almost out of the box".
For the native-specific risk posture, CI strategy, and local dev, see
[`docs/NATIVE-STRATEGY-AND-CI.md`](docs/NATIVE-STRATEGY-AND-CI.md) and
[`docs/DEVELOPMENT-NATIVE-LOCAL.md`](docs/DEVELOPMENT-NATIVE-LOCAL.md).

## Stack

- **Web:** Next.js + React + TypeScript + Tamagui.
- **Native:** React Native + Expo + TypeScript + Tamagui.
- **API:** Node.js + Fastify + TypeScript + Prisma.
- **Database:** PostgreSQL (primary + replica) fronted by pgpool.
- **Reverse proxy:** nginx.
- **Local dev:** Docker Compose (one stack for everything, including
  the read replica).
- **Testing:** Vitest (unit / integration / contract) + Playwright
  (web e2e, separate suite stack).
- **AI:** Anthropic Claude via the official SDK, BYOK keys stored
  AES-256-GCM-encrypted per workspace, orchestrator + tool registry +
  per-workspace operational memory.

## Docs

The single source of truth lives under [`docs/`](docs/). High-signal
entry points:

- [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) —
  vision, audit, target architecture, AI consultant blueprint,
  trajectory.
- [`docs/LICENSING.md`](docs/LICENSING.md) — licensing rationale (why
  AGPLv3 for the core, why MIT for SDKs).
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — 12–30 month trajectory.
- [`docs/TESTING.md`](docs/TESTING.md) — test layer map (unit /
  integration / contract / E2E) and per-language conventions.
- [`docs/NATIVE-STRATEGY-AND-CI.md`](docs/NATIVE-STRATEGY-AND-CI.md) —
  native app build + CI strategy.

## License

This project is licensed under the **GNU Affero General Public License
v3.0 or later** (AGPLv3), with selected SDK / client packages released
separately under the **MIT License** (look for `"license": "MIT"` in
the relevant package's `package.json`). See [`LICENSE`](LICENSE) for
the full AGPLv3 text and [`docs/LICENSING.md`](docs/LICENSING.md) for
the rationale.

Copyright (C) 2026 Umbraculum contributors.

## Contributing

We welcome contributions — bug fixes, features, documentation,
translations, and security reports.

- Start with [`CONTRIBUTING.md`](CONTRIBUTING.md) — DCO sign-off is
  required on every commit.
- AI assistants and contributors using Cursor: install the
  *umbraculum-toolset Cursor plugin pack* — see
  [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md). The plugin pack is
  the apparatus referenced in [`MANIFESTO.md`](MANIFESTO.md) §1.2 and is
  what keeps the contribution bar low ([`MANIFESTO.md`](MANIFESTO.md) §1.3,
  §2.2). The repo-root [`AGENTS.md`](AGENTS.md) is the agent self-check
  that runs first in any Cursor session.
- The [`Code of Conduct`](CODE_OF_CONDUCT.md) is in force in all
  project spaces.
- For security issues, please follow [`SECURITY.md`](SECURITY.md)
  rather than opening a public issue.

## Status snapshot

| Area                              | Status        |
|-----------------------------------|---------------|
| Brewery vertical — web            | Shipping (WIP)|
| Brewery vertical — native (Expo)  | Shipping (WIP)|
| AI consultant — ask Umbraculum about recipes, brew sessions, equipment, inventory, and tank state; answers grounded in your workspace data; BYOK + paid-tier unlock (see [`docs/AI-CONSULTANT.md`](docs/AI-CONSULTANT.md)) | Shipping (Sprint #2 complete) |
| Second vertical module (WMS/CRM/MRP/CRP) | Not started — platform shape supports it |
| Brand name                        | **Umbraculum** (resolved 2026-05-18; namespace `umbraculum`, primary domain `umbraculum.dev`, GitHub org `umbraculum-dev`); see [`docs/RENAME-DILIGENCE.md`](docs/RENAME-DILIGENCE.md) |
| Public release                    | Not flipped (working assumption: H1 2027 — see `docs/PLATFORM-ARCHITECTURE.md` §10.1) |
