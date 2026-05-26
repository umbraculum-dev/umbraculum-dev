# Open-source stack — technology recap and per-dependency rationale

**Tier:** Public
**Status:** living document
**Audience:** evaluators, future maintainers, partners, contributors who want
to know **why** each open-source choice was made (not how to install or use
them).

This document is the project's **technology recap** and the
**per-dependency analytical companion** to
[`MANIFESTO.md`](../MANIFESTO.md) §1.4 ("Open source as
discipline-enabler"). §1.4 names the mechanism — *when the source is
readable, the discipline-apparatus extends to the dependency; when the
source is closed, the apparatus halts at the boundary* — and lists
representative dependencies. This page is the exhaustive instantiation:
for **every load-bearing dependency** we depend on, it states the same
three things.

> [!NOTE]
> This page is **not**:
>
> - the install procedure ([`GETTING-STARTED.md`](GETTING-STARTED.md) is),
> - the platform shape ([`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) is),
> - the per-domain reference for the libraries listed below
>   ([`CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md),
>   [`POSTGRES-REPLICATION-ARCHITECTURE.md`](POSTGRES-REPLICATION-ARCHITECTURE.md),
>   [`CODING-STANDARDS.md`](CODING-STANDARDS.md),
>   [`TESTING.md`](TESTING.md), [`LINTING.md`](LINTING.md), etc.
>   are — entries below link out, do not restate).
>
> It **is** the place to learn, dependency by dependency, why the choice
> was made and what the cost would be of swapping it for a proprietary
> equivalent.

## How to read each entry

Every entry below answers the same three questions concisely (1–2
sentences each), in the same order:

1. **Role in the apparatus.** What this dependency lets the rules /
   skills / agents stack actually *do*. This is the §1.4 mechanism made
   specific.
2. **Why this and not the proprietary alternative.** The choice
   evaluation, brief. Often there is no real alternative
   (it would be ridiculous to swap Linux for a closed kernel); when
   there is one, it gets named.
3. **Closed-source-swap impact.** What shrinks in the apparatus if this
   dependency is replaced with a closed-source equivalent. This is the
   §1.4 "discipline-apparatus halts at the proprietary boundary" claim
   applied per-dependency.

A handful of entries (Linux, OpenPLC, Cursor) carry extra commentary
because their role spans more than the standard three questions or has
a specific accessibility story. Most entries are short on purpose —
brevity is the gate that keeps the page maintainable.

---

## OS / runtime layer

### Linux (Ubuntu)

- **Role.** The OS layer the apparatus runs on. Every reproducibility
  claim the project makes (CI matches local, container images build
  identically across machines, fresh clones bootstrap deterministically)
  is fully verifiable end-to-end only because the kernel + userland are
  inspectable.
- **Why this and not macOS / Windows.** We are not arguing against
  macOS or Windows as contributor OSes
  ([`MANIFESTO.md`](../MANIFESTO.md) §1.4 neutrality clarification);
  CI and production run on Linux because the reproducibility argument
  requires it, and because the container layer (Docker) is native there.
- **Closed-source-swap impact.** Replacing Linux with a closed kernel
  (Windows Server, proprietary Unix) would mean the agent can no longer
  read or pin behavior at the system-call boundary; reproducibility
  claims would degrade from "verifiable" to "trusted".
- *Specifics:* Ubuntu LTS is the recommended host
  ([`GETTING-STARTED.md`](GETTING-STARTED.md) §1.1). Container base
  images are Debian-derived (Node official images) so behavior under
  the apparatus matches.

### Docker (Engine + Compose v2)

- **Role.** The containerization layer the runtime decisions commit to.
  The `node-npm-container-only` policy ([`DEVELOPMENT.md`](../DEVELOPMENT.md))
  exists *because* Docker behavior is examinable — the apparatus can
  pin compose-file syntax, build-stage semantics, image hashes, and
  network behavior to a definite source.
- **Why this and not a proprietary container runtime.** There is no
  meaningful proprietary alternative for the contributor experience;
  Docker Engine is open source (Apache 2.0) and its CLI compatibility
  surface is what every CI provider implements.
- **Closed-source-swap impact.** Apparatus skills that diagnose compose
  errors ([`umbraculum-node-react-cursor-assistant/skills/docker-compose-debugging`](../README.md))
  exist because the parser's behavior is readable. A closed runtime
  would force the apparatus into trial-and-error.

### Node.js

- **Role.** The platform runtime — Fastify API, Next.js web, build
  tooling, test harness. The package.json `"engines": { "node": ">=20" }`
  pin is enforceable across host and CI because Node releases are
  versioned and signed in the open.
- **Why this and not Deno / Bun / proprietary JS runtimes.** Node is
  the runtime the dependency ecosystem (React, Next.js, Fastify,
  Prisma, Vitest, Playwright, Expo, …) is actually published for;
  switching runtimes would mean reinventing every integration that
  works out of the box on Node.
- **Closed-source-swap impact.** The apparatus could not verify
  behaviors that require reading V8 internals or `node_modules`
  resolution semantics. We do this occasionally (debugging ESM /
  package-exports / workspace hoisting issues), and a closed runtime
  would block it.

### Python

- **Role.** Used in two places: (a) repo tooling (`scripts/**`,
  documentation generation, bulk-edit scripts in `cursor-tmp/`), and
  (b) the OpenPLC sister repo (Pi sidecar, mailbox-emitter Python).
  Not on the production hot path of the platform itself.
- **Why this and not bash / typescript-everywhere.** Bash for the
  size of these scripts becomes unmaintainable; TypeScript would
  require Node + a build step for one-off automation. Python is the
  sweet spot for the kind of one-off file manipulation the project
  actually does in scripts.
- **Closed-source-swap impact.** A closed Python runtime would block
  the apparatus from authoring scripts that exercise CPython-specific
  behavior (e.g., the GIL, asyncio event-loop semantics). The Pi
  sidecar specifically depends on FastAPI's source being readable.

---

## Data layer

### PostgreSQL

- **Role.** The platform's primary database. Schema migrations,
  queries, replication, and row-level discipline are all readable
  through the engine's source plus the `pg_stat_*` views.
- **Why this and not MySQL / MariaDB / a proprietary DB.** Postgres
  is the open-source SQL engine whose feature set (JSONB, generated
  columns, partial indexes, FDW, logical replication) and whose
  community-extension story actually match the platform's needs. The
  proprietary alternatives (Oracle, SQL Server) would force the
  apparatus to operate behind a vendor's documentation, not the
  source.
- **Closed-source-swap impact.** Apparatus rules that constrain query
  shape, that diagnose plan regressions via `EXPLAIN`, or that pin
  migration semantics (`prisma migrate`) would lose their evidence
  base; debugging would degrade to "open a support ticket".
- *Specifics:* primary + read replica fronted by pgpool-II — see
  [`POSTGRES-REPLICATION-ARCHITECTURE.md`](POSTGRES-REPLICATION-ARCHITECTURE.md)
  for topology and [`DB-REPLICATION-AND-ROUTING-VERIFICATION.md`](DB-REPLICATION-AND-ROUTING-VERIFICATION.md)
  for the verification harness.

### pgpool-II

- **Role.** Read/write splitting in front of the Postgres primary +
  replica. The apparatus can reason about which queries get routed
  where because pgpool's routing semantics are readable in its
  source.
- **Why this and not a proprietary load balancer / a managed
  connection pooler.** Managed alternatives (AWS RDS Proxy, Azure DB
  for PostgreSQL replicas) would couple the routing semantics to the
  cloud vendor; pgpool is portable across self-hosted and cloud.
- **Closed-source-swap impact.** [`PGPOOL-VERIFICATION.md`](PGPOOL-VERIFICATION.md)
  exists because pgpool's behavior is verifiable end-to-end; a closed
  router would force "trust the docs" instead of "verify against the
  source".

### Redis

- **Role.** Where used: session caching, rate-limit token buckets,
  AI consultant per-workspace operational memory backing. See
  [`REDIS-ARCHITECTURE.md`](REDIS-ARCHITECTURE.md).
- **Why this and not a proprietary in-memory store.** Redis is the
  open-source baseline every cache-using library on Node expects;
  swapping to Memcached drops features (sorted sets, streams); swapping
  to a proprietary equivalent (ElastiCache, MemoryDB) couples the
  semantics to a vendor's runtime.
- **Closed-source-swap impact.** Apparatus rules around eviction
  policy and persistence-mode tradeoffs would lose the source as
  ground truth.

---

## Backend layer

### Fastify

- **Role.** The HTTP server framework for `services/api/`. Plugins,
  route registration, schema validation, and lifecycle hooks all
  have readable implementations the apparatus can pin behavior to.
- **Why this and not Express / NestJS / a proprietary API gateway.**
  Fastify's plugin architecture and built-in JSON-Schema validation
  are the closest match to the route-registration shape the platform
  uses ([`canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md));
  Express is older and has fewer modern affordances; NestJS pulls in
  more framework than the project needs.
- **Closed-source-swap impact.** L2 cross-workspace isolation tests
  (the `l2-cross-workspace-isolation-test` skill in
  [`umbraculum-platform-tsjs-cursor-assistant`](CURSOR-PLUGINS.md))
  inspect Fastify's request lifecycle to verify scoping invariants —
  a closed gateway would block that.

### Prisma

- **Role.** The ORM / migration tool. Schema definitions
  (`*.prisma`), generated client types, and migration files are all
  inspectable; the apparatus has a Prisma migration-failure subagent
  (`prisma-migration-failure-diagnosis`) precisely because Prisma's
  source resolves any ambiguity its documentation leaves
  ([`MANIFESTO.md`](../MANIFESTO.md) §1.4 mechanism #3).
- **Why this and not TypeORM / Drizzle / a proprietary ORM.** Prisma's
  generated client and migration semantics are the most apparatus-
  friendly choice for our schema scale; Drizzle is an option for a
  future migration but does not currently match Prisma's tooling
  story.
- **Closed-source-swap impact.** Closed migration tooling would
  invalidate the Prisma-specific apparatus skills entirely.

### Pino

- **Role.** Logging library used by Fastify (default) and the
  services. The structured-log format (JSON with pinned schema) is
  what observability rules constrain.
- **Why this and not Winston / a proprietary log shipper.** Pino's
  performance characteristics + JSON-first design match the platform's
  containerized-logging story (stdout JSON → log aggregator).
- **Closed-source-swap impact.** Apparatus rules about log message
  format ([`umbraculum-platform-tsjs-cursor-assistant`](CURSOR-PLUGINS.md)
  10-logging) depend on knowing the formatter's exact behavior.

### tsx (TypeScript executor)

- **Role.** Runs TypeScript source directly in Node for scripts,
  bin entries, and CI helpers without an explicit build step.
- **Why this and not ts-node / esbuild-node / a proprietary
  TS-to-JS tool.** tsx wraps esbuild with the right defaults for
  workspace + ESM-first projects; ts-node has known ESM friction;
  esbuild-node requires more configuration for the same outcome.
- **Closed-source-swap impact.** Mostly cosmetic — the apparatus
  could fall back to a build step. Listed here for completeness.

---

## Frontend layer — web

### Next.js

- **Role.** The web app framework (`apps/web/`). Routing, server
  components, dynamic rendering, image optimization, and the
  middleware pipeline are all surfaces the apparatus constrains.
- **Why this and not Remix / a custom Vite + React stack / a
  proprietary CMS framework.** Next.js's app-router model + Server
  Components match the platform's "module surface under
  `(<code>)/`" pattern ([RFC-0002](rfcs/0002-canonical-module-physical-layout.md));
  switching to Remix would require re-implementing the routing
  conventions.
- **Closed-source-swap impact.** Apparatus rules that pin React
  Server Component semantics, route-group conventions, and the
  middleware-vs-server-action boundary would lose their source
  reference.

### React

- **Role.** UI rendering library — same code base shared across web
  (Next.js) and native (React Native via cross-platform packages).
- **Why this and not Vue / Svelte / Solid.** React is what Tamagui,
  Next.js, and React Native all depend on; this is structural for the
  cross-platform sharing strategy ([`NATIVE-STRATEGY-AND-CI.md`](NATIVE-STRATEGY-AND-CI.md)).
- **Closed-source-swap impact.** Closed-source UI libraries do not
  exist meaningfully at this scale; the question is hypothetical.
  React 19+ concurrency semantics are something the apparatus
  occasionally needs to read source for; that path stays open.

### Tamagui

- **Role.** Cross-platform UI primitives — the `packages/ui/`
  building blocks that work on both web (DOM) and native (React
  Native). See [`TAMAGUI.md`](TAMAGUI.md) for the type-system
  caveats and the platform's adaptation strategy.
- **Why this and not Mantine / Chakra UI / NativeBase / a
  proprietary design-system kit.** Tamagui is one of very few
  libraries with first-class web + native support in a single API.
  The web-only alternatives would force re-implementation in the
  native app; the native-only alternatives would do the inverse.
- **Closed-source-swap impact.** The `apps/web` + `apps/native`
  shared-component story collapses if the UI primitive layer is
  closed; we would be back to two separate component libraries.

### Turbopack

- **Role.** The bundler Next.js uses in development and (eventually)
  production. Behavior in dev affects iteration speed.
- **Why this and not webpack / Rspack.** Turbopack is the bundler
  the Next.js team is moving to; matching the upstream default
  reduces the integration surface we have to maintain.
- **Closed-source-swap impact.** Apparatus rules about HMR behavior
  + module-graph pinning would lose their reference.

---

## Frontend layer — native

### React Native

- **Role.** The native app runtime — same React code, different
  rendering target (Yoga + native views instead of DOM).
- **Why this and not Flutter / Capacitor / SwiftUI+Kotlin-Compose
  separately.** React Native is what makes the apps/web ↔ apps/native
  cross-platform-package strategy feasible without two codebases.
  Flutter would require a Dart rewrite. Native-only would double the
  maintenance surface.
- **Closed-source-swap impact.** Closed cross-platform frameworks
  (effectively none exist at scale) would block the apparatus from
  reasoning about bridge semantics, which is occasionally important
  for debugging.

### Expo

- **Role.** React Native build / OTA-update / dev-client tooling.
  The Expo SDK is what makes `apps/native/` shippable without
  hand-managing Xcode / Android Studio toolchains.
- **Why this and not bare React Native + manual native toolchains.**
  Expo's managed workflow eliminates a class of native-toolchain
  problems that would otherwise burn iteration time. The bare-RN
  alternative is supported but pays the cost in setup ceremony.
- **Closed-source-swap impact.** The OTA / dev-client / EAS-build
  story is hard to replicate without Expo; the apparatus would still
  work but the contributor surface would widen significantly.

---

## Validation + types

### TypeScript

- **Role.** Static typing for every workspace; the `tsc --noEmit`
  gate is one of the four slices of the foundation-hardening
  discipline ([`FOUNDATION-HARDENING.md`](FOUNDATION-HARDENING.md))
  and the `typescript-strict-flag-verification` skill in the
  apparatus depends on it being readable.
- **Why this and not Flow / a proprietary type checker.** Flow is
  effectively unmaintained at this point. TypeScript is the type
  checker the entire ecosystem (Next.js, Fastify, Prisma, Tamagui,
  React, RN, Expo, Zod, Vitest, Playwright, …) is written in.
- **Closed-source-swap impact.** The `types-baseline-verifier`
  subagent ([CURSOR-PLUGINS.md](CURSOR-PLUGINS.md)) literally
  inspects `tsc` output — a closed type checker would block it.
- *Specifics:* see [`TYPING.md`](TYPING.md) for the strict-flag
  rollout and [`CODING-STANDARDS.md`](CODING-STANDARDS.md) for
  conventions.

### Zod

- **Role.** Runtime schema validation at every contract boundary
  (`packages/*-contracts/src/**`, `services/api/src/routes/**`).
  The `contracts-zod-auditor` subagent and the `zod-schema-scaffold`
  skill exist *because* Zod's source is readable
  ([`MANIFESTO.md`](../MANIFESTO.md) §1.4 mechanism #3 — verbatim
  example).
- **Why this and not Yup / Joi / class-validator / Valibot /
  TypeBox.** See [`CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md)
  for the full evaluation — Zod won on TypeScript type-inference
  fidelity + ecosystem reach + maintainability for our shape of use.
- **Closed-source-swap impact.** Both apparatus surfaces named
  above would have to be rewritten against the new library; many
  contracts-strategy rules would also need reauthoring.

---

## Test layer

### Vitest

- **Role.** The unit / integration / contract test runner across
  every workspace.
- **Why this and not Jest / Mocha / a proprietary test runner.**
  Vitest matches Vite's bundling/transform model, has first-class
  TypeScript + ESM support, and shares Jest's API for migration.
- **Closed-source-swap impact.** Apparatus skills that diagnose
  flaky tests would lose the source as ground truth.
- *Specifics:* see [`TESTING.md`](TESTING.md) for the test-layer
  map (unit / integration / contract / E2E).

### Playwright

- **Role.** The web E2E test runner. `e2e/playwright/**` is gated
  by the `playwright-runner-docs-gate` skill and the `e2e-smoke`
  subagent.
- **Why this and not Cypress / Selenium / WebdriverIO / a
  proprietary E2E runner.** Playwright's multi-browser (Chromium /
  Firefox / WebKit) support + auto-waiting + trace-viewer story
  match what the agentic E2E control panel needs.
- **Closed-source-swap impact.** The `agentic-e2e-runbook` skill
  reads Playwright traces; a closed runner would block it.

---

## Lint / format / quality

### ESLint

- **Role.** Static-analysis layer — one of the four slices of
  foundation-hardening. Flat-config (`eslint.config.*`) is the
  surface apparatus rules constrain.
- **Why this and not Biome / a proprietary linter.** ESLint is
  the only linter with the plugin ecosystem we actually consume
  (`eslint-plugin-jsx-a11y`, `eslint-plugin-react-hooks`,
  `typescript-eslint`, `eslint-plugin-boundaries`). Biome is a
  watch item.
- **Closed-source-swap impact.** The `ci-parity-local-reproduction`
  skill is calibrated against ESLint's exact rule-loading semantics;
  a closed linter would break it.
- *Specifics:* see [`LINTING.md`](LINTING.md) for the scope-tier
  model (HIGH-light → HIGH-staged → HIGH-full) and the strict-gate
  extension procedure.

### eslint-plugin-boundaries

- **Role.** Enforces monorepo package-boundary rules
  (`packages/*` may not depend on `apps/*`, etc.).
- **Why this and not custom-built boundary detection.** This
  plugin already encodes the dependency-direction patterns we
  need; writing it from scratch would duplicate solved work.
- **Closed-source-swap impact.** A closed equivalent would block
  apparatus rules that read the boundary rule set as ground
  truth.

### No Prettier (deliberate)

The repo does not use Prettier. Formatting is handled by
ESLint's stylistic rules + editor format-on-save. This is a
deliberate scope choice, not a missing dependency — adding
Prettier would force the apparatus to reason about two
formatters' interactions.

---

## Industrial automation

### OpenPLC (Editor + Runtime)

- **Role.** The PLC IDE + runtime the brewery vertical's
  alarm-ladder code is authored and executed on. The OpenPLC
  sister repo (see [`modules/verticals/brewery/README.md §3.7`](modules/verticals/brewery/README.md))
  is the worked example of the "multi-runtime module with a
  versioned interface contract" pattern.
- **Why this and not Siemens TIA Portal / Allen-Bradley
  Studio 5000 / a proprietary PLC toolchain.** Three reasons
  ([`MANIFESTO.md`](../MANIFESTO.md) §1.4 OpenPLC paragraph):
  (a) the apparatus can read OpenPLC's serialized XML / `.st`
  formats and the editor's source, so an agent armed with the
  right rule set can produce correct ladder + structured-text
  output — no proprietary equivalent allows this; (b) free
  toolchain → accessibility for returners-to-industry and
  students who would otherwise pay $1,500/seat; (c) Modbus
  RTU + TCP (the `PI_*` mailbox transport) are open-standard
  protocols whose semantics are pinned in the source.
- **Closed-source-swap impact.** Replacing OpenPLC with a
  proprietary PLC stack would (a) gate the apparatus's ability
  to produce ladder logic, (b) restrict practitioners to those
  with vendor-paid seats, and (c) shrink the `automation`
  canonical module's integration surface to whatever
  reverse-engineering can recover.
- *Specifics:* see [`design/openplc-mailbox-emitter-pr-shape.md`](design/openplc-mailbox-emitter-pr-shape.md)
  for the platform-side artifact emitter; the sister repo
  owns the bench-vs-field profile discipline (Modbus TCP on
  Linux/OpenPLC Runtime vs. Modbus RTU on CONTROLLINO MEGA
  Pure).

### FastAPI (Pi sidecar stack)

- **Role.** The Python web framework the Pi sidecar in the
  OpenPLC sister repo runs on (FastAPI + Pydantic +
  uvicorn).
- **Why this and not Flask / Django / a proprietary
  framework.** FastAPI's Pydantic-based validation is the
  closest Python-side analog to Zod's role on the TypeScript
  side; the apparatus's `public-endpoint-verification` skill
  has a Pi-sidecar variant that depends on FastAPI's source
  being readable.
- **Closed-source-swap impact.** Would block the Pi sidecar's
  endpoint-verification skill entirely.

---

## Build orchestration

### npm workspaces

- **Role.** The monorepo orchestration layer (`workspaces:
  ["apps/*", "services/*", "packages/*"]` in root `package.json`).
- **Why this and not pnpm / yarn / turbo / nx.** npm workspaces
  works out of the box with the Node we already pin, doesn't
  require a separate lockfile-format migration, and matches the
  granularity we need today. pnpm + turbo would add caching
  benefits at larger scale and are documented watch items in
  [`internal/working-notes/TODOs.md`](../internal/working-notes/TODOs.md);
  not yet warranted.
- **Closed-source-swap impact.** Apparatus skills around
  package-scope migration (`package-scope-migration-preflight`)
  and L2 cross-workspace tests depend on npm-workspace
  resolution semantics; a closed orchestrator would block them.

---

## Brewery-domain libraries

### BeerJSON

- **Role.** The canonical interchange format for brewery recipes
  (mash schedules, water profiles, fermentables, hops, yeast,
  styles). See [`BEERJSON-FIRST.md`](modules/verticals/brewery/BEERJSON-FIRST.md).
- **Why this and not a proprietary brewery-software format.**
  BeerJSON is the industry-standard open format; using a vendor
  format would couple the brewery vertical to that vendor.
- **Closed-source-swap impact.** Recipe import/export would
  shrink to "supports vendor X only"; the BeerXML import-compat
  shim would be more brittle.

---

## Docs / observability / CI

### GitHub Actions

- **Role.** Where CI runs. Workflow files
  (`.github/workflows/**.yml`) are inspectable, which is what
  lets the apparatus's `ci-parity-local-reproduction` skill
  actually reproduce CI locally.
- **Why this and not Jenkins / CircleCI / GitLab CI / a
  proprietary CI service.** GitHub Actions colocates the CI
  surface with the source repo it gates; the only alternatives
  that don't add a second login + secret store are equivalents
  (GitLab CI, Bitbucket Pipelines), and we're on GitHub.
- **Closed-source-swap impact.** The CI-parity skill would
  have to be rewritten per provider; the ci-hygiene rule
  ([`72-ci-parity-local-vs-ci-divergence`](CURSOR-PLUGINS.md))
  would have to be portable across CI surfaces, which it
  currently isn't.

### Markdown

- **Role.** The format every doc in `docs/` and every README is
  written in. The `module-readme-checker` subagent + the
  `module-readme-verification` skill exist precisely because
  Markdown's grammar is readable and the structural CI gate
  (`scripts/docs/check-readmes.py`) can be authored against it.
- **Why this and not AsciiDoc / reStructuredText / a proprietary
  doc format.** Markdown is what every reader expects to read on
  GitHub today; switching formats would force a migration of
  every doc the project has shipped.
- **Closed-source-swap impact.** A closed doc format would block
  the structural-CI-gate skill class entirely.

### Mermaid (where used)

- **Role.** Inline diagrams in Markdown docs (architecture
  diagrams, sequence diagrams). Rendered by GitHub natively.
- **Why this and not draw.io / a proprietary diagram tool.**
  Mermaid is the only major in-Markdown diagram syntax GitHub
  renders natively; alternatives require committing PNG/SVG
  exports that diverge from the source over time.
- **Closed-source-swap impact.** Committed binary diagrams
  would replace text-source diagrams; future-edit costs rise.

---

## Closed-source exceptions (and why)

### Cursor (the IDE itself)

This is the one notable closed-source dependency the project
tolerates.

- **Role.** The IDE the apparatus runs *in*. The rules / skills
  / agents discipline ([`MANIFESTO.md`](../MANIFESTO.md) §1.2)
  is loaded as Cursor plugins ([`CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md));
  without Cursor (or a non-Cursor agent loading the same rule
  pack as project-instructions context — see CURSOR-PLUGINS.md
  §"Non-Cursor agents"), the apparatus is not the same thing.
- **Why this exception is tolerated.** No equivalent agentic
  IDE with rules / skills / agents integration of this shape
  exists today as open source. The alternatives (raw GPT-4 +
  manual prompting; pure CLI agents) require the contributor
  to do work the apparatus is specifically designed to absorb
  ([`MANIFESTO.md`](../MANIFESTO.md) §1.3 "the equalizer"
  claim).
- **Posture if a credible open-source alternative emerges.**
  Track it openly. The non-Cursor-agent path in
  [`CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) §"Non-Cursor agents"
  exists *because* this dependency is the closed exception we
  do not want to deepen: the rule files themselves are open
  source (under `umbraculum-toolset` sister repo), so the
  *content* of the apparatus is portable even if Cursor is
  not.

This is the only entry on this page where the open-source
choice is *not* made. Everything else above is open source
because the apparatus needs it to be.

---

## Where this list comes from + how to extend it

**Tactically.** This list covers every dependency declared in
the workspace `package.json` files at the time of writing, plus
every system dependency the apparatus exercises (Linux, Docker,
git, Cursor). Workspace package versions are pinned via
`package-lock.json`; system dependencies are pinned via
recommended-version language in [`GETTING-STARTED.md`](GETTING-STARTED.md).

**Maintenance discipline.** When a new load-bearing dependency
lands in a `package.json`, an entry here should land in the
same PR. "Load-bearing" is judgement, with the heuristic: *if
removing it would force the apparatus to operate against
documentation instead of source, it is load-bearing for this
page*. Small utility libraries (date-fns, tiny formatters) do
not qualify; the libraries that have rules / skills / subagents
written against them all do.

**Out of scope.** This page does not list:

- npm dev-dependencies that are *only* used in CI hygiene
  (e.g., transient toolchain dependencies pulled by ESLint
  plugins) — they share the open-source-discipline ancestry
  by transitivity.
- Brewery-vertical domain libraries beyond BeerJSON (water
  chemistry calculators, EBC color conversion, etc. — these
  are implemented in-tree, not external dependencies).
- AI-model providers (Anthropic Claude SDK is consumed as an
  npm package; the *model* it talks to is proprietary, but
  that is a runtime configuration, not an apparatus
  dependency).

---

## Related

- [`MANIFESTO.md`](../MANIFESTO.md) §1.4 — the mechanism
  argument this page instantiates.
- [`README.md`](../README.md) §"Stack" — the one-line summary
  every entry here expands.
- [`GETTING-STARTED.md`](GETTING-STARTED.md) — how to install
  the stack; this page is the "why" companion.
- [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) —
  platform shape, with which the dependency choices co-evolved.
- [`CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) — the apparatus
  whose extensibility this page argues open source enables.
- Per-domain docs cross-linked inline above
  ([`CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md),
  [`POSTGRES-REPLICATION-ARCHITECTURE.md`](POSTGRES-REPLICATION-ARCHITECTURE.md),
  [`TYPING.md`](TYPING.md), [`TESTING.md`](TESTING.md),
  [`LINTING.md`](LINTING.md), [`TAMAGUI.md`](TAMAGUI.md),
  [`BEERJSON-FIRST.md`](modules/verticals/brewery/BEERJSON-FIRST.md), etc.).
