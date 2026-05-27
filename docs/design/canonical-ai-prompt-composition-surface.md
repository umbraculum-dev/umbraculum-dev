# AI prompt composition — horizontal surface

**Tier:** Public  
**Status:** Shipped at public-alpha hardening (2026-05)  
**Audience:** module authors, API maintainers, AI consultant implementors, reviewers  
**Related:** [`AI-CONSULTANT.md`](../AI-CONSULTANT.md), [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.3, [`packages/module-sdk/README.md`](../../packages/module-sdk/README.md)

---

## 1. Summary

| Layer | Owner | Status at public α |
|-------|-------|-------------------|
| **Base + platform overlays** | API `promptComposer` | Shipped |
| **Module overlays** | `registerModule({ aiPrompts })` | Shipped |
| **Route overlays** | `aiPrompts.routes` + optional `routeId` on chat | Shipped |
| **Static knowledge snippets** | `aiPrompts.knowledge` | Shipped (2 KB cap per module) |
| **Workspace memory** | `WorkspaceAiMemoryService` | Shipped (v0) |
| **Semantic reporting DSL** | Platform Layer B | **Shipped MVP** — [`canonical-ai-reporting-dsl-surface.md`](canonical-ai-reporting-dsl-surface.md) |
| **pgvector RAG** | Platform Layer C | **D1 shipped** — [`canonical-ai-rag-surface.md`](canonical-ai-rag-surface.md); D2–D3 deferred |
| **Propose-write (human confirm)** | Platform + modules | **Shipped** — [`canonical-ai-propose-write-surface.md`](canonical-ai-propose-write-surface.md) |
| **Managed-AI credits** | Platform §7.3 | **Deferred** H1 2027; multi-provider BYOK router shipped |

Every model call composes a **system prompt** in this order:

1. `BASE` — neutral operational-workspace framing  
2. `PLATFORM_OVERLAY` — cross-module safety and tool discipline  
3. **Module overlays** — one section per registered module (alphabetical by module `code`)  
4. **Route overlay** — optional hint when the client sends `routeId`  
5. **Workspace memory** — per-workspace facts and recurring issues  

Tools are unchanged: still registered via `registerModule({ registerAiTools })` and invoked by the orchestrator.

---

## 2. SDK contract (`registerModule`)

```ts
registerModule(app, {
  code: "mrp",
  registerAiTools(registry, hostApp) { /* ... */ },
  aiPrompts: {
    module: "MRP module overlay text…",
    routes: {
      productionOrders: "User is on production orders; prefer mrp.* tools.",
    },
    knowledge: "Optional static reference bullets (max 2048 chars).",
  },
});
```

### Validation (boot-time)

| Field | Max length | Rules |
|-------|------------|--------|
| `aiPrompts.module` | 4_000 chars | Non-empty if present |
| `aiPrompts.routes[<routeId>]` | 1_500 chars each | Keys must be unique **across all modules** |
| `aiPrompts.knowledge` | 2_048 chars | Non-empty if present |

Duplicate `routes` keys across modules → `registerModule` throws at boot.

### Registry helpers (`@umbraculum/module-sdk`)

- `collectRegisteredModulePromptOverlays()` — sorted module entries for composition  
- `resolveRoutePromptOverlay(routeId)` — lookup route hint; unknown `routeId` → `undefined` (ignored)

---

## 3. Chat API

`POST /ai/chat` body (see `@umbraculum/contracts` `AiChatRequestBody`):

| Field | Required | Notes |
|-------|----------|--------|
| `message` | yes | 1–8000 chars |
| `sessionId` | no | Conversation continuity |
| `routeId` | no | `RouteId` from `@umbraculum/navigation`; unknown values are **ignored** (forward compat) |

Web clients may pass `routeId` via query `?fromRoute=productionOrders` on `/ai`.

---

## 4. Sibling surfaces (post-α H2)

| Capability | Surface doc |
|------------|-------------|
| Propose-write | [`canonical-ai-propose-write-surface.md`](canonical-ai-propose-write-surface.md) |
| Reporting DSL | [`canonical-ai-reporting-dsl-surface.md`](canonical-ai-reporting-dsl-surface.md) |
| RAG | [`canonical-ai-rag-surface.md`](canonical-ai-rag-surface.md) |
| H2 build log | [`ai-consultant-post-alpha-h2-build-log.md`](ai-consultant-post-alpha-h2-build-log.md) |

## 5. What remains deferred

- **Full RAG** — per-workspace activity timelines + memory unify (Layer C D2–D3).  
- **Managed-AI credits** — Umbraculum-resold tokens (`WorkspaceBillingAddon`).  
- **Autonomous domain writes** — only human-confirmed proposals + `render_document` job submit.  
- **Per-workspace module entitlements** — all boot-registered modules contribute overlays until an install model exists.

---

## 6. Maintenance

- When adding a module overlay or route map, update the module's `services/api/src/services/ai/prompts/<code>.ts` and `services/api/src/modules/<code>/index.ts`.  
- When adding a new `RouteId` with a dedicated AI hint, extend the module's `aiPrompts.routes` and [`packages/navigation`](../../packages/navigation/src/index.ts).  
- Operator-facing examples: [`help/asking-umbraculum.md`](../help/asking-umbraculum.md).  
- Feature-level explainer: [`AI-CONSULTANT.md`](../AI-CONSULTANT.md).

---

## 7. Build logs

- Pre-α: [`ai-consultant-pre-alpha-hardening-build-log.md`](ai-consultant-pre-alpha-hardening-build-log.md)  
- Post-α H2: [`ai-consultant-post-alpha-h2-build-log.md`](ai-consultant-post-alpha-h2-build-log.md)
