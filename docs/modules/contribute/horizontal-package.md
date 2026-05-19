# Contribute — a horizontal package

**Tier:** Public
**Ceremony level:** **Low** — regular PR with reviewer agreement that the concern is genuinely cross-cutting.
**Audience:** contributors proposing a new shared utility, infrastructure layer, or cross-cutting service consumed by *every* module — not specific to any one domain.

> [!NOTE]
> Horizontal packages are cross-cutting infrastructure. They do **not** have a `code`, do **not** register via `registerModule()`, and are consumed by every canonical module + every vertical configuration. Examples in the ecosystem today: `@umbraculum/i18n`, `@umbraculum/ui`, `@umbraculum/navigation`, `@umbraculum/api-client`, `@umbraculum/module-sdk`.

---

## 1. When this path applies

You're proposing a new package under `packages/<name>/` that:

- Provides cross-cutting infrastructure (utilities, primitives, contracts) consumed by multiple modules — current or planned.
- Has no module-specific knowledge (no brewery-isms, no automation-isms).
- Is platform-neutral or framework-shared (web + native, or API + web).
- Will be MIT-licensed if it's part of the public SDK surface ([LICENSING.md §6.2](../../LICENSING.md)).

If your package contains domain-specific logic (recipe math, BeerJSON shapes, brewing-specific UI components), it's a **vertical-flavored package** with a `@umbraculum/<vertical>-<name>` scope — see [`vertical-configuration.md`](vertical-configuration.md). The asymmetry is enforced by [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md): horizontal packages keep an unprefixed `@umbraculum/<name>` scope; vertical-flavored packages carry a vertical prefix.

---

## 2. The bar — "is this genuinely horizontal?"

Three questions every reviewer asks before merging a new `packages/<name>/`:

1. **Who consumes it?** Name at least two existing consumers (modules or apps). If the answer is "just the brewery vertical", it's not horizontal — it's vertical-flavored.
2. **Does it know anything about a specific domain?** Grep your package for domain words ("brewery", "recipe", "vessel", "Modbus"). If they appear in interfaces or core logic (not just illustrative comments), it's not horizontal.
3. **Does it require platform-level coordination?** If the answer is "yes" (e.g. it intersects with billing, auth, AI orchestration), it might be a platform-service extension proposal, not a new package — that goes through an RFC against `docs/PLATFORM-ARCHITECTURE.md`, not this path.

If you can't answer "yes" to (1) and "no" to (2) and (3), this is the wrong path.

---

## 3. The current horizontal-package set

For reference, the packages currently in the horizontal set (as catalogued in [`docs/MODULES.md`](../../MODULES.md) §3.3):

| Package | Role |
|---|---|
| `@umbraculum/module-sdk` | The SDK every module pins (`registerModule`, reserved codes, `ValidatedSchema<T>`). |
| `@umbraculum/contracts` (becomes `@umbraculum/contracts`, slot 9) | Platform-wide auth/me DTOs, AI tool contract types. |
| `@umbraculum/automation-contracts` | Contracts slice of the `automation` canonical — note: this *is* tied to a canonical module, but is exported as a horizontal-shaped package because it's the consumption surface third parties pin. The β layout in [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md) treats `<code>-contracts/` as the contracts slice of the canonical, not as horizontal infrastructure. The taxonomy is a convenience in §3.3 of the entry page. |
| `@umbraculum/api-client` (becomes `@umbraculum/api-client`, slot 10) | Fetch + auth boundary (cookie web, bearer native). |
| `@umbraculum/i18n` | Cross-platform message catalog (web + native). |
| `@umbraculum/i18n-react` (becomes `@umbraculum/i18n-react`, slot 8) | Universal `useT` hook. |
| `@umbraculum/ui` | Tamagui primitives + design-system components. Industry-agnostic. |
| `@umbraculum/navigation` | Route IDs + cross-platform routing policy. |
| `@umbraculum/media` | Shared assets framework. |
| `@umbraculum/test-mcp` | Test-MCP HTTP server (developer tooling). |

If your package fits alongside this list naturally — read [`@umbraculum/i18n`'s README](../../../packages/i18n/README.md) and [`@umbraculum/ui`'s README](../../../packages/ui/README.md) as the "what a horizontal package looks like" worked examples — you're on the right path.

---

## 4. Procedure

### Step 1 — Open a small RFC-style PR (optional but recommended)

For a non-trivial new package, opening a doc-only PR first (e.g. a short design note under `docs/design/<your-package>-package-shape.md`) lets reviewers agree on the boundary before code lands. This is *not* a formal RFC — it's the same lightweight design-review procedure RFC-0002 §12 describes for amendments. Skip this step for trivial packages.

### Step 2 — Scaffold the package

Layout per [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md):

```
packages/<your-name>/
├── src/
│   ├── index.ts
│   └── (other files)
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts (or equivalent)
├── vitest.config.ts (if it has tests)
└── README.md
```

The `package.json` `name` field follows the convention: `@umbraculum/<your-name>` (no prefix, no `@brewery/` legacy scope for new packages).

### Step 3 — Wire into root scripts

Add the new package's name to root `package.json`'s `build:packages` and `test:packages` scripts ([brewery-scope-migration-per-package-handoff.md slot 2 + slot 6 lessons](../../design/brewery-scope-migration-per-package-handoff.md) — these are HARD STOP files for any package add/rename).

If the package is consumed by the web app, add it to `apps/web/next.config.js`'s `transpilePackages` (HARD STOP).

If it's consumed by the native app via Metro and needs a workspace pin, add it to `apps/native/metro.config.js`'s `extraNodeModules`.

### Step 4 — README following the standards

Every package has a README. Standards: [`docs/DOCS-README-STANDARDS.md`](../../DOCS-README-STANDARDS.md). Copy the template; strip optional sections; do not invent new sections.

### Step 5 — Tests + typecheck

Vitest is the default test framework. The package must pass `npm run typecheck -w @umbraculum/<your-name>` cleanly. New packages should carry all 6 strict TypeScript flags from [`docs/TYPING.md`](../../TYPING.md) ("Per-workspace CI gate" section).

### Step 6 — Ship in a PR

A new horizontal package is a single PR. Reviewers verify:

- The package is genuinely horizontal (§2 above).
- Naming matches conventions (`@umbraculum/<name>` for the workspace, lowercase `<name>` for the directory).
- README follows standards.
- Build / test / typecheck are green.
- Root scripts updated where required.

---

## 5. Common pitfalls

- **Domain-flavored packages without the vertical prefix.** A package that ships recipe-editing components is brewery-flavored — it belongs under `@umbraculum/brewery-recipes-ui`, not `@umbraculum/recipes-ui`. The slot-6 TRAP in [`brewery-scope-migration-per-package-handoff.md`](../../design/brewery-scope-migration-per-package-handoff.md) is the historical record of catching this mistake mechanically.
- **Adding a package that should be inside a module.** If only one module consumes it, and that module is the only one that will *ever* consume it, the code belongs inside the module, not in a sibling package. The bar is "consumed by ≥2 modules".
- **Skipping the root-scripts wiring.** `build:packages`, `test:packages`, `next.config.js transpilePackages`, sometimes `metro.config.js extraNodeModules` — forgetting any of these silently breaks the build. The HARD STOP list in the sub-plan #9 plan doc is the authoritative checklist.
- **Putting platform-service implementations in a package.** Auth, billing, AI orchestrator implementations live in `services/api/src/`, not in horizontal packages. Packages are *contracts and primitives*, not running services (with the exception of `@umbraculum/test-mcp`, which is a developer tool, not a platform runtime).

---

## 6. Cross-references

- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §4 (naming conventions).
- [`docs/DOCS-README-STANDARDS.md`](../../DOCS-README-STANDARDS.md) — README standard for every package.
- [`docs/design/brewery-scope-migration-plan.md`](../../design/brewery-scope-migration-plan.md) §4 — HARD STOP files when adding / renaming packages.
- [`docs/TYPING.md`](../../TYPING.md) — per-workspace strict-flag posture for new TypeScript packages.
- [`docs/MODULES.md`](../../MODULES.md) §3.3 — current horizontal-package catalog.
