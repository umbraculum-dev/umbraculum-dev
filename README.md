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
- The [`Code of Conduct`](CODE_OF_CONDUCT.md) is in force in all
  project spaces.
- For security issues, please follow [`SECURITY.md`](SECURITY.md)
  rather than opening a public issue.

## Status snapshot

| Area                              | Status        |
|-----------------------------------|---------------|
| Brewery vertical — web            | Shipping (WIP)|
| Brewery vertical — native (Expo)  | Shipping (WIP)|
| AI consultant — orchestrator + tools + memory + admin dashboard | Shipping (Sprint #2 complete) |
| Second vertical module (WMS/CRM/MRP/CRP) | Not started — platform shape supports it |
| Brand name                        | **Umbraculum** (resolved 2026-05-18; namespace `umbraculum`, primary domain `umbraculum.dev`, GitHub org `umbraculum-dev`); see [`docs/RENAME-DILIGENCE.md`](docs/RENAME-DILIGENCE.md) |
| Public release                    | Not flipped (working assumption: H1 2027 — see `docs/PLATFORM-ARCHITECTURE.md` §10.1) |
