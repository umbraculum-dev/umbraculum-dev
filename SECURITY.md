# Security policy

We take the security of this project seriously. This document explains
how to responsibly disclose vulnerabilities, what is in scope, and what
to expect from us in return.

> [!NOTE]
> The contact address below is a placeholder pending the choice of
> `<PLATFORM_NAME>` and the project's public domain. It will be replaced
> with a real, monitored mailbox before this repository is flipped to a
> public-facing release (see `docs/PLATFORM-ARCHITECTURE.md` §10.1 for
> the go-public path).

## Reporting a vulnerability

Please report security issues privately to:

- **Email:** `security@<platform-domain>` *(placeholder)*

If you prefer encrypted email, request our PGP key in your initial
message and we will send it before any sensitive details are exchanged.

When reporting, please include — to the extent you have it — the
following so we can reproduce and triage quickly:

- Affected version, branch, or commit hash.
- A clear description of the issue and the security impact.
- Step-by-step reproduction (URLs, payloads, screenshots, or a minimal
  reproducer repo).
- Whether the issue is being actively exploited in the wild.

Please **do not** open a public GitHub issue, post to a public chat, or
share details on social media until we have published a fix or agreed
with you on a coordinated disclosure date.

## What to expect from us

- **Acknowledgement:** within 3 business days of your report.
- **Triage and severity:** within 10 business days, including a
  preliminary severity assessment using CVSS v3.1 where applicable.
- **Standard disclosure window:** **90 days** from the date we
  acknowledge a valid report, unless we agree with the reporter on a
  shorter or longer window. We will publish the fix and a coordinated
  advisory at the end of the window, even if a fix is still in progress
  — we will be honest about the state of the remediation in that case.
- **Credit:** with your permission, we will credit you in the advisory.
  You may also choose to remain anonymous.

If you do not hear back within the acknowledgement window above, please
re-send your report — it is possible (especially during the placeholder
phase) that the inbox was misconfigured.

## Scope

### In scope

The following are considered in scope for security reports against this
repository:

- Source code under this monorepo (`apps/**`, `services/**`,
  `packages/**`, `scripts/**`, root configuration files).
- The default Docker Compose stack defined in `docker-compose.yml` and
  related files, when run with the documented `DEVELOPMENT-LOCAL.md`
  workflow.
- Default container images this repo builds and publishes (when those
  exist; not yet at the time of writing).
- The AI consultant integration described in `docs/PLATFORM-ARCHITECTURE.md`
  §6, including the BYOK key vault (`services/api/src/services/ai/keyVault.ts`)
  and the orchestrator (`services/api/src/services/ai/orchestrator.ts`).

### Out of scope

- **Third-party modules and dependencies.** Please report those upstream
  to the respective project. We will, however, accept reports about
  *how this project integrates* a vulnerable dependency.
- **Customer self-hosted deployments** where the root cause is the
  operator's environment, configuration, network policy, or credentials
  management — not the project's code.
- **Operator-supplied AI keys (BYOK).** A customer pasting a valid
  Anthropic key and the model returning hallucinated content is not a
  security issue against this project. A path that exposes a stored
  encrypted key in plaintext, bypasses authorization, or
  enables key exfiltration **is** in scope.
- **Denial of service from unauthenticated traffic floods** at the
  network layer. We expect operators to terminate such traffic at their
  edge (CDN, WAF). Application-level DoS that an authenticated user can
  trigger cheaply **is** in scope.
- **Social engineering** of project maintainers or community members.
- **Findings from automated scanners** with no demonstrated impact
  (e.g. "missing security header on a static asset" without a concrete
  attack scenario).

## Coordinated disclosure

We aim to publish a security advisory in this repository's
`Security` → `Advisories` tab once a fix is available, and to credit
the reporter unless they have asked to remain anonymous. The advisory
will identify the affected versions, the fix, and any operator-side
mitigations required for self-hosted deployments.
