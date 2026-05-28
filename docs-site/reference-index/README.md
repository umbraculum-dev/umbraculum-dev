---
slug: /
title: Module reference
---

# Module reference

These pages are the **module READMEs** from the monorepo — one per workspace under `apps/`, `services/`, and `packages/`. They are the runnable entry point for each slice: scope, quick start, build/test commands, dependencies, and status.

This is **not** the narrative documentation in [Documentation home](/). Use that tree for architecture, RFCs, roadmaps, and design notes. Use **Reference** when you need to know what a specific workspace contains and how to run it.

Quality bar and audit checklist: [`DOCS-README-STANDARDS`](/DOCS-README-STANDARDS).

---

## Apps

Operational shells — the surfaces end users interact with.

| Workspace | Role |
|-----------|------|
| [`apps/web`](/reference/apps/web/) | Next.js + Tamagui **web app** — desktop-first brewery vertical UI |
| [`apps/native`](/reference/apps/native/) | React Native + Expo **native app** — brew-day surface on iOS/Android |
| [`apps/web/e2e`](/reference/apps/web/e2e/) | Playwright E2E sub-suite for the web app |

Web and native share UI through `@umbraculum/ui` and domain packages; see [Cross-platform boundaries](/CROSS-PLATFORM-BOUNDARIES) for auth, navigation, and what ships where.

---

## Services

Backend processes and HTTP APIs.

| Workspace | Role |
|-----------|------|
| [`services/api`](/reference/services/api/) | Fastify API — auth, modules, AI consultant backend |
| [`services/api/src/seed`](/reference/services/api/src/seed/) | Seed data helpers bundled with the API |

---

## Packages

Shared libraries consumed by apps and services. Package index with tier notes: [`modules/packages/README`](/modules/packages/).

Browse the **Packages** category in the sidebar for the full list (`@umbraculum/ui`, `@umbraculum/contracts`, `@umbraculum/i18n`, canonical module contract packages, and others).

---

## Edit on GitHub

Each reference page links to its source `README.md` in the [umbraculum-dev](https://github.com/umbraculum-dev/umbraculum-dev) repository. Changes land in the workspace README first; this site re-renders them on the next docs build.
