# Native strategy, risk posture, and CI (prose)

Path convention: `$REPO_ROOT` = monorepo clone ([`DEVELOPMENT.md`](../DEVELOPMENT.md)).

This document captures **why** we accept certain trade-offs for native development today, **what** keeps that posture professionally safe for a small team or solo maintainer, and **whether** continuous integration (e.g. GitHub Actions) is recommended—and how to keep it lean.

Operational commands remain in `docs/DEVELOPMENT-NATIVE-LOCAL.md`.

**Ubuntu Touch** is **not** an Expo/React Native target. Operator UI on Lomiri uses the **web slice** in a Click Morph webapp wrapper — see [`docs/design/ubuntu-touch-shell-strategy.md`](design/ubuntu-touch-shell-strategy.md). Native strategy in this doc applies to **iOS/Android only**.

---

## 1. Context you confirmed

- **Shipping timeline:** Uncertain; not committed to app-store native within the next three months.
- **Stakeholder pressure:** You are designing primarily for yourself as the client—no external legal or contractual deadline forcing a native release cadence.
- **Workflow preference:** Stay **Mac-free** as long as reasonable (Linux-first development).

Those constraints are legitimate inputs to architecture. They do **not** mean “anything goes”; they mean the **cost** of heavy native infra (custom dev clients, local iOS builds, paid CI matrices) should be deferred until the **value** of shipping native binaries clearly exceeds that cost.

---

## 2. Honest vision: professionalism versus “disaster later”

### 2.1 What would be unprofessional or reckless

It would be reckless to:

- Ignore known ABI mismatches (React vs `react-native-renderer`, React vs `react-dom`) and hope Metro “sorts it out.”
- Hard-code LAN IPs and forget they drift (DHCP, Wi-Fi vs Ethernet), then wonder why Expo Go fails intermittently.
- Let the API container die silently (`esbuild` missing, Prisma client stale) and blame “the mobile app.”
- Bump `apps/web` React and blindly bump `apps/native` to match without checking **Expo Go’s** supported versions.

None of that is “moving fast”; it is **undefined behavior** that wastes days.

### 2.2 What is professionally acceptable for your situation

Using **Expo Go** on a physical device with **documented** version pins and **documented** divergence from web (`apps/web` on a newer React minor than `apps/native`) is **acceptable** when:

1. The divergence is **explicit** (documented baseline table + exception in `DEVELOPMENT-LOCAL.md`).
2. Everyone touching native deps knows to run **`expo install --check`** (and `--fix` when needed) before merging.
3. Shared packages (`packages/platform/ui`, `packages/verticals/brewery/recipes-ui`, etc.) avoid relying on **React patch/minor-only internals** that differ between 19.1 and 19.2—stick to public, stable APIs.
4. You keep the **triage order** in `docs/DEVELOPMENT-NATIVE-LOCAL.md` (API → LAN → phone browser → versions → cache → device log).

That is **controlled technical debt**, not gambling. The debt becomes expensive only if you **stop maintaining** those guardrails or if you need capabilities Expo Go cannot provide (custom native code, store-grade signing workflows, etc.).

### 2.3 Where real “disaster” risk still lives (even with docs)

- **Shared UI packages:** If a change assumes web-only behavior or a newer React feature, native can fail at runtime with crypt errors. Mitigation: discipline in reviews + optional lightweight checks (see §5).
- **Implicit coupling to Expo’s schedule:** A future Expo SDK upgrade might force a coordinated bump across native **and** possibly web. Mitigation: upgrade in a dedicated branch; run `expo install --check` + manual smoke on device before merge.
- **Operational fragility:** Anything that restarts the API watcher after `packages/platform/contracts` rebuilds can expose missing `node_modules` (the `esbuild` incident). Mitigation: documented recovery (`docker compose exec api npm install`, restart); optionally a tiny smoke script or CI job hitting `/api/health`.

So: you are **not** condemned to disaster by staying on Expo Go short-term. You **are** vulnerable if mitigations exist only in chat history instead of **repo docs + habits (+ optional lean CI)**.

---

## 3. Mac-free development: how it changes the recommendation

**It reinforces staying on Expo Go for daily development** on Linux: scan QR or enter `exp://<LAN_IP>:8081`, no Xcode, no local iOS simulator.

**It does not rule out Option C-2 (custom dev client) forever.** When you eventually want store builds:

- **Android:** Build APK/AAB on Linux or via **EAS Build** (cloud)—still Mac-free on your desk.
- **iOS:** You still do **not** need a Mac on your desk if you use **EAS Build** with Apple Developer credentials; Apple’s toolchain runs on Expo’s builders. The pain shifts to **account/credential management**, not buying a Mac.

So “Mac-free” pushes the long-term path toward **EAS (or similar remote iOS builds)** rather than “never ship iOS.” For now, deferring C-2 is consistent with Mac-free **and** with your uncertain ship date.

---

## 4. Recommended strategy summary (today → revisit)

**Today (aligned with your answers):**

- Keep **Expo Go + SDK 54** as the primary dev loop on Linux.
- Keep **`apps/native` pinned** to what Expo Go expects (see baseline table in `docs/DEVELOPMENT-NATIVE-LOCAL.md`), including **`react-dom` matching `react`** for Metro web preview.
- Accept **temporary React minor drift** vs `apps/web`; document it and do **not** “fix” it by forcing native to web’s React until Expo Go supports it **or** you adopt a dev client.
- Maintain **`docs/DEVELOPMENT-NATIVE-LOCAL.md`** as the single operational source of truth (LAN IP, Metro detached vs interactive, troubleshooting).

**Revisit Option C-2 when:** you decide you will distribute native binaries (Play Store / TestFlight / sideload) **or** when Expo Go blocks a feature you need (custom native module, specific native dependency version).

**No change required** solely because “three months” passed—you revisit when **intent or capability** changes.

---

## 5. EAS internal demo (July 2026)

- **Demo host:** `https://demo.umbraculum.dev` — full API + web for walkthroughs and device smoke; **demo-only** ([`docs/design/demo-host-runbook.md`](design/demo-host-runbook.md)). Future customer-facing hosted product is **`cloud.umbraculum.dev`** ([`docs/design/cloud-hosted-product-track.md`](design/cloud-hosted-product-track.md)) — not this host.
- **Config:** [`apps/native/eas.json`](../apps/native/eas.json) — `preview` profile builds an Android APK for internal distribution and bakes `EXPO_PUBLIC_*` URLs to **demo**; iOS uses EAS cloud builders (no local Mac required).
- **CI:** [`.github/workflows/native-eas-build.yml`](../.github/workflows/native-eas-build.yml) — manual `workflow_dispatch` only (requires `EXPO_TOKEN` secret). Not gated on every PR.
- **EAS free tier (monthly quotas + queue):** Cloud builds are **not unlimited**. On the Free plan, Expo enforces a **per calendar month** allowance (typically **30 builds** — **up to 15 Android** and **up to 15 iOS** — plus separate **EAS Update** limits: **1,000 MAUs** and **100 GiB** bandwidth, all **monthly**). **1 concurrency** — only one build at a time. Queued time on the **free-tier queue** is **normal** and can last **well over an hour** before compile starts. That is **acceptable** — we run **occasional** demo APKs, not continuous CI. Agents must not treat a long **Waiting for build to complete** on GHA as a broken pipeline while Expo shows **Queued** / **Waiting to start**. Sources: [Expo billing FAQ](https://docs.expo.dev/billing/faq/), [EAS Free plan limits](https://expo.dev/changelog/2023-08-01-eas-free-plan-limits). Operator runbook: [`apps/native/EAS-DEMO-SETUP.md`](../apps/native/EAS-DEMO-SETUP.md) § “Expo free tier”.
- **GHA vs private repo:** While **umbraculum-dev** is **private**, prefer **local** `eas build` or monitor the build on expo.dev instead of holding **native-eas-build** open during a long queue — the runner bills for the whole poll. After the repo is **public**, manual GHA dispatch on `ubuntu-latest` is fine (standard runners: no minute charges; wall-clock wait for Expo workers is still long).
- **Scope:** Brewery-only brew-day flows per [`docs/design/canonical-native-platform-surface.md`](design/canonical-native-platform-surface.md) §5.
- **Before first build:** Run `eas init` in `apps/native/`, set `expo.extra.eas.projectId` in `app.json` (replace placeholder), add `EXPO_TOKEN` to GitHub secrets. Demo host must be live — see [`docs/design/native-eas-demo-build-log.md`](design/native-eas-demo-build-log.md).

## 6. Mitigations to treat as mandatory (discipline + docs)

These are the **minimum** professional bar for the current stack:

| Mitigation | Purpose |
| --- | --- |
| Baseline version table + `expo install --check` | Prevents Expo Go ABI crashes before they hit the device |
| `react` + `react-dom` same exact version in `apps/native` | Prevents blank Metro web preview at `:8081/` |
| LAN IP pre-flight (`ip`, curl smoke tests) | Prevents `Failed to download remote update` |
| API `/api/health` triage + esbuild recovery doc | Prevents false “native bugs” when API is 502 |
| “Quick triage order” in native doc | Reduces random debugging |
| Shared packages: avoid React internals / version-sensitive APIs | Reduces silent breakage across web vs native |
| `@umbraculum/brewery-beerjson` is in `build:packages` (before `@umbraculum/brewery-recipes-ui`) | Prevents stale `packages/verticals/brewery/beerjson/dist/*` from silently breaking `apps/native` and `packages/verticals/brewery/recipes-ui` consumers (see `DEVELOPMENT-LOCAL.md` → "Shared packages build") |
| `./scripts/check-packages-dist-up-to-date.sh` before pushing | Catches any `packages/*/dist` drift automatically. Now actually covers beerjson too (it didn't before this commit, because beerjson wasn't in the upstream `build:packages` chain). |

Optional enhancements (nice-to-have, not required for solo honesty):

- A **pre-push checklist** in `internal/working-notes/TODOs.md` or a short `scripts/check-native-deps.sh` that runs `expo install --check` in Docker (mirrors CI below).

---

## 6.1 Dev host autodetection (why auto-derive over DHCP / Tailscale / static IP)

**Problem.** The laptop's LAN IP drifts (DHCP renewal, switching WiFi↔Ethernet, network change). With a hardcoded `EXPO_PUBLIC_API_BASE_URL` in `apps/native/app.json` and a hardcoded `REACT_NATIVE_PACKAGER_HOSTNAME` in the Metro command, every drift required two manual edits and a Metro restart. This is the LAN-IP pre-flight item from §5, made automatic.

**Options considered.**

| Option | What it does | Why not as primary |
|---|---|---|
| **A. Auto-derive from Metro `hostUri`** *(chosen)* | `apps/native/src/auth/apiBaseUrl.ts` reads `Constants.expoConfig.hostUri` at runtime and derives `http://<host>:18080` when no explicit URL is set. A `scripts/start-metro-dev.sh` helper detects the laptop's outbound LAN IP and passes it as `REACT_NATIVE_PACKAGER_HOSTNAME`. | — |
| **Metro (SDK 54+)** | [`apps/native/metro.config.js`](../apps/native/metro.config.js) uses `getDefaultConfig` + `mergeConfig` (Expo monorepo defaults for `watchFolders` / `nodeModulesPaths`); only `resolver.extraNodeModules` is merged for React pinning and `brewery-recipes-ui`. `experiments.autolinkingModuleResolution` in [`app.config.js`](../apps/native/app.config.js). | Revisit if `expo doctor` / EAS still warn after dropping manual `disableHierarchicalLookup`. |
| B. DHCP reservation on the router | Bind a fixed IP to the laptop's MAC in router admin; `app.json` stays pinned forever. | Only works on the home LAN. Useless on café/coworking WiFi or mobile hotspot. Assumes router admin access, which we cannot assume for all future contributors or future homes. |
| C. Tailscale | Laptop + phone on a Tailscale tailnet; use a stable `100.x.x.x` or `<hostname>.tailnet.ts.net`. | Solves a bigger problem (works across any network, even when laptop & phone are not on the same LAN) at the cost of an always-on daemon and ~30–80ms latency per request. Sensible **secondary** option if we ever dev away from the home LAN regularly. |
| D. Static IP on the laptop interface | Configure `wlo1`/`enp3s0` with a fixed IP outside the DHCP pool. | Fragile (collides with the router's DHCP pool when networks change) and same network-bound limitation as B. |

**Decision criteria that selected A.**

1. **Zero per-restart manual work** — the only criterion the user actually surfaced as a pain point.
2. **No new daemons, no router config** — we own only the code; the solution must live there too.
3. **Network-agnostic** — works on any network the laptop joins (LAN, café WiFi, hotspot) as long as the phone is on the same network as the laptop (which Expo Go already requires).
4. **Reversible / overridable** — if `extra.EXPO_PUBLIC_API_BASE_URL` (in `app.json`) or `process.env.EXPO_PUBLIC_API_BASE_URL` is present, those still win. EAS staging/production builds and tunnel-mode dev keep working unchanged.
5. **No commit per IP change** — `apps/native/app.json` stops carrying a personal LAN IP, which has been a source of merge noise in this repo (multiple commits across sessions just to swap `192.168.1.124` → `.115` → `.117`).

**When to revisit A.** If we adopt `expo start --tunnel` regularly, `hostUri` becomes the ngrok tunnel URL and auto-derive would point at the tunnel rather than the laptop's API. At that point layer **C (Tailscale)** in as the dev-host-resolution mechanism for tunnel flows, keeping A for LAN flows. Until then, A is sufficient.

**Bound on the change.** This is a `apps/native/**` + one new helper script + three doc updates. It does **not** touch CI, `docker-compose.yml`, the API, the web app, or any shared package.

---

## 7. GitHub Actions (or similar): what is actually being suggested?

### 7.1 CI is not required for “professionalism”

For a **solo** maintainer with **good local discipline** and **solid docs**, you can ship quality **without** GitHub Actions. CI is a **safety net** when humans forget steps or when multiple contributors don’t read the same runbook.

### 7.2 If you add CI: keep it deliberately lean

Goals:

- **Cheap:** minimal minutes, single platform (Ubuntu), no macOS runners (aligned with Mac-free).
- **Fast:** one small job, cache npm where worthwhile.
- **Skippable:** you can merge doc-only or emergency fixes without burning minutes.

**Implemented as `.github/workflows/native-deps.yml`.** The file is intentionally small and matches the recipe below 1:1.

1. **Triggers:**
   - `pull_request` targeting `master` (path-filtered).
   - `push` to `master` (path-filtered).
   - `workflow_dispatch` (manual run from the Actions tab).
2. **`paths` filter** (changes outside these do not trigger the job):
   - `apps/native/**`
   - `packages/**`
   - root `package.json` / `package-lock.json`
   - the workflow file itself (`.github/workflows/native-deps.yml`)
3. **Job:** `actions/checkout@v4` → single Docker step that runs in `node:20-slim`, mounts the repo into `/repo`, cd's into `/repo/apps/native`, and chains: `npm install --no-audit --no-fund && ./node_modules/.bin/expo install --check && npm run typecheck`.
4. **Concurrency:** new runs on the same ref cancel in-flight runs (`concurrency.cancel-in-progress: true`) — keeps minutes lean on rapid pushes.
5. **Timeout:** `timeout-minutes: 10`.

**Manual skip patterns (all supported today):**

- **Commit message tokens:** include `[skip ci]` or `[ci skip]` in the subject or body. The workflow's `if:` clause inspects `github.event.head_commit.message` and skips the job. Use this when you knowingly merge something that should not retrigger CI (e.g. a hotfix verified locally, a follow-up to a recently-green run).
- **`paths` filter:** doc-only PRs (no files matching the `paths` list above) do not trigger the workflow at all — no minutes consumed, no checkmark appears.
- **`workflow_dispatch`:** trigger the workflow manually from the GitHub Actions tab (e.g. before tagging a release, or as reassurance after a dependency bump you did locally).

> **`[skip ci]` caveat:** GitHub itself **does not** auto-skip workflows based on commit messages; the skip only works because we explicitly check the message in the job's `if:`. If you ever copy this workflow to another repo or service, copy the `if:` clause too.

**Cost note:** Public repos on GitHub get free Actions minutes on standard runners; staying on Linux + short jobs keeps usage negligible. Private repos have minute quotas — same lean design applies.

### 6.3 What this repo does **not** need by default

- **macOS runners** for iOS builds (expensive; contradicts Mac-free unless you later add a rare scheduled job via EAS, not local Xcode).
- **Android emulator in CI** (slow, flaky, costly)—device testing stays manual until you invest in a dedicated device lab or cloud device farm.
- **Full `expo start` + E2E on every commit**—overkill for current phase.

### 6.4 Alternative to GitHub Actions

Run the same checks **locally before push**:

```bash
docker run --rm \
  -v "$REPO_ROOT:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "./node_modules/.bin/expo install --check && npm run typecheck"
```

Document that one-liner next to your merge checklist. That is **professionally sufficient** if you always run it before touching native dependencies.

---

## 8. Links

- Native operations & troubleshooting: `docs/DEVELOPMENT-NATIVE-LOCAL.md`
- Project-local rules (Expo Go ABI exception): `DEVELOPMENT-LOCAL.md`
- CI workflow file: `.github/workflows/native-deps.yml`
