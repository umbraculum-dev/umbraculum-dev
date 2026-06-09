# Sister-repo PR shape — OpenPLC mailbox artifact emitter

**Tier:** Public
**Status:** Draft 2026-05-19 — handoff to OpenPLC sister-repo maintainer
**Audience:** OpenPLC sister-repo maintainer (project lead is the same person as the platform `automation` module owner; this doc exists so the work can be picked up later without re-deriving context)
**Builds on:** [`canonical-automation-module-surface.md`](./canonical-automation-module-surface.md) §12.2 (B1), §12.5 (Phase A entry checklist step 4)
**Pairs with:** [`@umbraculum/automation-contracts`](../../packages/canonical/automation/contracts/) — the platform mirror that will consume this artifact (renamed from `@brewery/automation-contracts` as sub-plan #9 slot 4 on 2026-05-19; sister-repo emits JSON-only artifacts so this is a doc-only update on the sister side)

> **Disclaimer.** This document describes the *shape* of the sister-repo PR — what files to emit, how the platform will consume them, and what gates the platform side waits for. It does not specify alarm-layer behavior, PLC ladder structure, or `PI_*` semantic content. Those remain owned by the sister repo.

---

## 1. Goal

Replace today's manual / undocumented `PI_*` knowledge with a **machine-readable artifact** the OpenPLC sister repo emits as part of its build, so the platform's `@umbraculum/automation-contracts` package can mirror it (M2 mechanism per design §12.2).

Outcomes:

1. Adapter authors (starting with `brewery.openplc.v1`) read addresses and scaling from a typed source rather than copy-pasted constants.
2. Mailbox drift between the PLC runtime and the platform becomes visible in PR diffs (artifact is checked in on the platform side, regenerated on the sister-repo side).
3. Platform `CONTRACT_VERSION` and PLC `runtime_version` sit on the existing integrated-release-baseline rails, not a parallel scheme.

## 2. What the sister repo emits

A single artifact — JSON is the canonical form; a TS export is convenience.

### 2.1 `mailbox.json` (canonical)

```json
{
  "contractVersion": "0.1.0",
  "integratedReleaseTag": "<tag from integrated-release-baseline rule>",
  "entries": [
    {
      "name": "PI_FIRMWARE_VERSION",
      "address": 0,
      "kind": "input_register",
      "scalar": "uint16",
      "writable": false,
      "description": "Runtime firmware version (informational handshake)."
    },
    {
      "name": "PI_K1_CURRENT_TEMP_C_X10",
      "address": 100,
      "kind": "holding_register",
      "scalar": "int16",
      "scale": 0.1,
      "unit": "degC",
      "writable": false,
      "description": "Fermenter K1 current temperature, fixed-point x10."
    }
  ]
}
```

Field shapes match the [`MailboxSpec`](../../packages/canonical/automation/contracts/src/mailbox.ts) type so the platform mirror is a no-op `JSON.parse` on the platform side. No nested objects beyond `entries[]`.

### 2.2 Generation

The sister repo's existing build pipeline (the same one that produces the runtime upload bundle via `prepare_openplc_runtime_upload.py`) reads the canonical `PI_*` declarations and writes `mailbox.json`. The script is sister-repo-internal — the platform never executes it.

A small wrapper makes the artifact reproducible:

```
make mailbox-artifact
# writes ./build/mailbox.json
```

Optional convenience: emit a TypeScript wrapper too (`mailbox.ts`), so platforms that prefer TS-native consumption can import without a JSON loader. The TS form must be a `MailboxSpec` constant — no logic.

### 2.3 Where it lives in the sister repo

Suggested: `out/mailbox.json` (excluded from runtime upload bundle by `prepare_openplc_runtime_upload.py` — runtime never sees this file).

Whatever path is chosen, document it in the sister-repo `DEVELOPMENT.md` so the platform-side mirror PR (Phase A step 5) can cite it.

## 3. Required `PI_*` register: `PI_FIRMWARE_VERSION`

If the sister repo does not already expose a runtime version register, add one as part of this PR.

- **Name:** `PI_FIRMWARE_VERSION` (literal — the platform exports this name as `FIRMWARE_VERSION_REGISTER_NAME`).
- **Address:** sister-repo discretion; just declare it in the artifact.
- **Kind:** `input_register` (read-only by adapters).
- **Scalar:** `uint16` is fine — encode as `major * 1000 + minor * 10 + patch_capped` or whatever scheme the sister repo prefers, **as long as it can be lossy-recovered** to the integrated-baseline `contract_version` semver string for the handshake.

Adapters use this name to look up the address dynamically; never a hard-coded address.

## 4. Versioning rails (re-using existing baseline)

The integrated-release-baseline rule already moves `integrated_release_tag`, PLC version, sidecar version, contract_version, API version together. Phase A keeps that rail and **does not add a new version**:

- `mailbox.json.contractVersion` — same string the sister repo already publishes as `contract_version` (sister-repo `pyproject.toml` is canonical).
- `mailbox.json.integratedReleaseTag` — optional; copy from the same baseline if available.

The platform's `CONTRACT_VERSION` constant in [`packages/canonical/automation/contracts/src/version.ts`](../../packages/canonical/automation/contracts/src/version.ts) tracks this string. Phase A starts at `0.0.0-dev`; the first agreed non-`-dev` version is set when this PR merges.

## 5. CI / verification on the sister-repo side (recommended)

Light touch, not strictly required for Phase A:

- A unit test that loads `mailbox.json` and asserts `entries[].name` matches the prefix convention (`I_/Q_/M_/AI_/AI_RAW_/CFG_/SVC_/P_/PI_`); the PLC variable-prefix verifier can be reused.
- A unit test that asserts `PI_FIRMWARE_VERSION` is present.
- A bench-profile smoke test that reads the firmware register and sanity-checks the round-trip with `mailbox.json.contractVersion`.

The platform side will mirror the artifact with its own typecheck + vitest gate (already wired).

## 6. Platform-side hand-off (informational — sister-repo maintainer can ignore)

After this PR merges, the platform side does **one** PR to `umbraculum-dev`:

1. Drop the emitted `mailbox.json` into `packages/canonical/automation/contracts/data/mailbox.json` (or sibling `.ts`); add a small loader.
2. Bump `CONTRACT_VERSION` from `0.0.0-dev` to the agreed value.
3. Add a vitest assertion that the loaded artifact has `PI_FIRMWARE_VERSION` and parses cleanly into `MailboxSpec`.
4. Commit + push.

That's Phase A step 5. Phase B (Prisma schema + read path) starts after that.

## 7. What this PR explicitly does NOT do

- Add or modify alarm-layer logic (frozen at `2.0.1-dev` per sister-repo `DEVELOPMENT.md`).
- Change the runtime upload bundle produced by `prepare_openplc_runtime_upload.py` (the artifact is dev-tooling only).
- Promise mailbox stability to any third party — this is dev/pilot per design §12.1; we still iterate freely until the first paying customer.
- Standardise units or scalar encodings beyond what the existing `PI_*` declarations already use — the artifact mirrors what is, it does not refactor it.

## 8. References

- [`docs/design/canonical-automation-module-surface.md`](./canonical-automation-module-surface.md) §12.2 (B1), §12.5 step 4
- [`packages/canonical/automation/contracts/src/mailbox.ts`](../../packages/canonical/automation/contracts/src/mailbox.ts) — `MailboxSpec` type the artifact must conform to
- [`packages/canonical/automation/contracts/src/version.ts`](../../packages/canonical/automation/contracts/src/version.ts) — `CONTRACT_VERSION` and `classifyContractVersionSkew`
- OpenPLC sister-repo `DEVELOPMENT.md` — `PI_*` prefix convention, `prepare_openplc_runtime_upload.py`, alarm-layer stability, integrated-release baseline

---

*Draft 2026-05-19. Update this doc when the sister-repo PR lands so step 4 in design §12.5 flips to Done and step 5 becomes actionable.*
