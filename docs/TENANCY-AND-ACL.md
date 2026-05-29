# Tenancy and ACL (workspace-scoped authorization)

**Tier:** Public  
**Status:** v1.0 (as-built + intended policy; role wiring in progress)  
**Audience:** contributors, module authors, self-hosting operators.

> **Not authentication.** Login, sessions, cookie vs bearer, and the webview bridge are in [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md).  
> **Not data routing.** Where Prisma lives vs where clients call HTTP is in [`DATA-ACCESS-BOUNDARIES.md`](DATA-ACCESS-BOUNDARIES.md).

This document is the **single contributor-facing guide** for workspace tenancy and access control on the API platform.

---

## 1. Summary

| Concept | Implementation |
|---|---|
| **Tenancy unit** | `Workspace` — users belong via `WorkspaceMember` |
| **Active scope** | Session `activeWorkspaceId` (explicit; never implicit) |
| **Workspace roles** | `brewery_admin`, `member`, `viewer` (Prisma enum `WorkspaceRole`) |
| **Membership gate** | `WorkspacesService.assertMembership` — **widely enforced today** |
| **Role gate** | `AclService.requireRole` — **central API; wiring in progress** |
| **Platform admin** | `User.isPlatformAdmin` + `requirePlatformAdmin` — **separate from workspace roles** |
| **Enforcement layer** | Application-level (Fastify + service methods); RLS deferred |

---

## 2. Models and terminology

- **Workspace** — the tenant boundary (club, brewery, operator org). Domain tables carry `workspaceId` (or FK to `Workspace`).
- **WorkspaceMember** — links `User` ↔ `Workspace` with a `role`.
- **Active workspace** — stored on `Session.activeWorkspaceId`. Workspace-scoped routes require it via `requireActiveWorkspace()`.

> **Obsolete terms:** older docs may say `account` / `account_id` / `/accounts`. The platform uses **workspace** / `workspaceId` / `/workspaces`.

### Roles (database identifiers)

```prisma
enum WorkspaceRole {
  brewery_admin
  member
  viewer
}
```

User-facing copy may show `brewery-admin` (hyphen); persistence uses `brewery_admin` (underscore). Docs sometimes mention `owner` as a product label — there is **no** separate `owner` enum value today; workspace creators receive `brewery_admin`.

---

## 3. Request flow

```
Client (web / native)
  → Nginx
  → Fastify route
      requireSession()              → 401 if not authenticated
      requireActiveWorkspace()      → 401 if no active workspace selected
      (optional) requirePlatformAdmin()  → 403; global admin only
  → Service method
      assertMembership()            → 403 if not a workspace member (today)
      requireRole([...])              → 403 if role insufficient (intended default)
      Prisma queries scoped by workspaceId
```

### Code entry points

| Concern | File |
|---|---|
| Session + active workspace | [`services/api/src/plugins/sessionAuth.ts`](../services/api/src/plugins/sessionAuth.ts) |
| Request context helpers | [`services/api/src/plugins/requestContext.ts`](../services/api/src/plugins/requestContext.ts) |
| Membership | [`services/api/src/services/workspacesService.ts`](../services/api/src/services/workspacesService.ts) |
| Role checks (central) | [`services/api/src/services/acl.ts`](../services/api/src/services/acl.ts) |
| Platform admin | [`services/api/src/plugins/requirePlatformAdmin.ts`](../services/api/src/plugins/requirePlatformAdmin.ts) |

---

## 4. Three authorization gates

### 4.1 Authentication (who are you?)

Handled by `sessionAuthPlugin` and `requireSession()`. See [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md).

### 4.2 Tenancy / membership (are you in this workspace?)

`WorkspacesService.assertMembership(userId, workspaceId)` throws `403 not_a_member` if the user has no `WorkspaceMember` row.

**This is the baseline enforced across brewery, PIM, MRP, CRP, automation, AI services, and most module routes today.**

Every workspace-scoped service method should:

1. Derive `workspaceId` from **session context** (`activeWorkspaceId`), not from unvalidated client input alone.
2. Call `assertMembership` before reads or writes.
3. Include `workspaceId` in every Prisma `where` clause (for get-by-id, prefer `findFirst({ where: { id, workspaceId } })` over bare `findUnique({ where: { id } })`).

### 4.3 Role-based ACL (what may you do in this workspace?)

`AclService.requireRole(userId, workspaceId, allowedRoles)` is the **platform-owned** role gate ([RFC-0001 §8.2](rfcs/0001-modules-tiers-governance-and-automation-placement.md)).

```ts
await acl.requireRole(userId, workspaceId, ["member", "brewery_admin"]);
```

**As-built (v0):** `AclService` exists but is **not yet invoked from most routes**. Some paths use ad-hoc checks (e.g. `role !== "brewery_admin"` in AI settings). See [`TESTING.md`](TESTING.md) (Phase 4d deferred).

**Intended baseline policy** (to be applied consistently when wiring lands):

| Role | Baseline intent |
|---|---|
| `viewer` | Read-only |
| `member` | Create / update domain data (recipes, brew sessions, inventory, profiles, …) |
| `brewery_admin` | Workspace settings and admin-only operations (branding, AI BYOK settings, ingredient sync, …) |

Modules must **not** invent parallel permission tables or custom role enums. Declare required roles through platform conventions; future SDK slots may register module-specific role extensions ([RFC-0001 §8.2](rfcs/0001-modules-tiers-governance-and-automation-placement.md)).

### 4.4 Platform admin (global, not workspace-scoped)

`/platform/*` routes use `User.isPlatformAdmin` via `requirePlatformAdmin()`. This is independent of `WorkspaceRole` — a workspace `brewery_admin` is not automatically a platform admin.

---

## 5. AI and ACL inheritance

AI tools run in the API with the same `{ userId, workspaceId }` context as HTTP handlers. They call existing services — **no raw DB access, no parallel ACL layer**.

- Orchestrator: membership check before tool execution ([`services/api/src/services/ai/orchestrator.ts`](../services/api/src/services/ai/orchestrator.ts))
- Tool contract: [`packages/ai-tool-sdk/src/aiTool.ts`](../packages/ai-tool-sdk/src/aiTool.ts) (`AiToolContext`)
- Platform architecture: [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §6

---

## 6. Module author checklist

Before shipping a workspace-scoped route or service:

- [ ] Route uses `requireActiveWorkspace()` (or equivalent) — not user-supplied workspace id alone.
- [ ] Service calls `assertMembership` (minimum) or `AclService.requireRole` (when role policy is defined).
- [ ] Every Prisma query filters by `workspaceId`.
- [ ] ID-based mutations use `workspaceId` + `id` together.
- [ ] No module-private role / permission tables.
- [ ] L2 test includes cross-workspace isolation (second workspace gets 404/403, not data leak). See [`TESTING.md`](TESTING.md).

---

## 7. Testing and follow-on work

| Item | Status | Doc |
|---|---|---|
| Cross-workspace isolation (L2) | Largely covered (Phase 4b) | [`TESTING.md`](TESTING.md) |
| Role-based 403 tests (Phase 4d) | **Deferred** until `requireRole` is wired | [`TESTING.md`](TESTING.md), [`FOUNDATION-HARDENING.md`](FOUNDATION-HARDENING.md) |
| `AclService` route wiring | **Open** | [`rfcs/0001-modules-tiers-governance-and-automation-placement.md`](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §9.2 |

---

## 8. Cross-references

- [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md) — authentication only
- [`DATA-ACCESS-BOUNDARIES.md`](DATA-ACCESS-BOUNDARIES.md) — Prisma vs API client boundary
- [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) — platform shape, AI ACL inheritance
- [`rfcs/0001-modules-tiers-governance-and-automation-placement.md`](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §8 — consumption contract
- [`modules/contribute/horizontal-services-consumption.md`](modules/contribute/horizontal-services-consumption.md) — one-page obligation quick reference
- [`modules/verticals/brewery/IMPLEMENTATION-LOG.md`](modules/verticals/brewery/IMPLEMENTATION-LOG.md) §5 — brewery-vertical notes (links here)
