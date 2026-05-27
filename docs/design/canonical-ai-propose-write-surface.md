# AI propose-write — horizontal surface

**Tier:** Public  
**Status:** Shipped (post-α H2 Wave B, 2026-05)  
**Audience:** module authors, API maintainers, AI consultant implementors, reviewers  
**Related:** [`canonical-ai-prompt-composition-surface.md`](canonical-ai-prompt-composition-surface.md), [`canonical-mrp-module-surface.md`](canonical-mrp-module-surface.md) §10, [`AI-CONSULTANT.md`](../AI-CONSULTANT.md)

---

## 1. Summary

| Concern | Rule |
|---------|------|
| **Autonomous domain writes** | **Forbidden** — tools with `scope: "propose"` create a persisted proposal only |
| **Human confirmation** | Required via `POST /ai/proposals/:id/apply` or dismiss via `POST /ai/proposals/:id/reject` |
| **Orchestrator** | Must not chain apply inside the tool loop; apply is a separate HTTP action |
| **Write exception today** | `render_document` (`scope: "write"`) submits rendering jobs only |

Propose-write is the first mutable-domain AI path. It returns a **proposal id** and human-readable diff; the chat UI surfaces **Apply** / **Dismiss**.

---

## 2. Proposal lifecycle

```mermaid
sequenceDiagram
  participant U as Operator
  participant Chat as AI_chat_SSE
  participant Orch as Orchestrator
  participant Tool as mrp.proposeOrderAdjustment
  participant Store as ai_proposals
  participant API as POST_apply

  U->>Chat: Ask to reschedule order
  Chat->>Orch: runChatTurn
  Orch->>Tool: tool_use
  Tool->>Store: INSERT pending
  Tool-->>Orch: proposalId + summary
  Orch-->>Chat: event proposal + tool_result
  U->>API: Apply (confirm)
  API->>Store: status applied
  Note over API: Domain write when MRP PATCH routes exist; preview-only until then
```

| Status | Meaning |
|--------|---------|
| `pending` | Awaiting operator action |
| `applied` | Operator confirmed; domain mutation attempted or recorded as preview-only |
| `rejected` | Operator dismissed |

---

## 3. Data model (`ai_proposals`)

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID | Primary key; returned to model and UI |
| `workspace_id` | UUID | L2 isolation — all queries scoped |
| `user_id` | UUID | Proposer (chat turn user) |
| `module_code` | text | e.g. `mrp`, `crp` |
| `proposal_type` | text | e.g. `orderAdjustment`, `scheduleAdjustment` |
| `payload_json` | JSON | Module-specific diff + target entity ids |
| `summary` | text | Human-readable one-liner for chat card |
| `status` | enum | `pending` \| `applied` \| `rejected` |
| `applied_at` / `rejected_at` | timestamptz | Set on terminal transitions |

---

## 4. HTTP API

All routes require active workspace context (`requireActiveWorkspace`).

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/ai/proposals` | List recent proposals for workspace (member) |
| `GET` | `/ai/proposals/:id` | Fetch one proposal (member, L2) |
| `POST` | `/ai/proposals/:id/apply` | Human confirm — workspace member |
| `POST` | `/ai/proposals/:id/reject` | Dismiss — workspace member |

`POST /ai/chat` is unchanged; proposals are created only inside propose-scope tools.

### SSE event (chat stream)

```json
{ "type": "proposal", "proposalId": "…", "moduleCode": "mrp", "proposalType": "orderAdjustment", "summary": "…" }
```

---

## 5. Tools (Wave B MVP)

| Tool | Scope | Module | Notes |
|------|-------|--------|--------|
| `mrp.proposeOrderAdjustment` | `propose` | mrp | Timing/qty/split suggestions; never calls write services |
| `crp.proposeScheduleAdjustment` | `propose` | crp | Capacity/schedule hint proposals |

Input/output shapes live in `@umbraculum/contracts` (`packages/contracts/src/ai/aiProposals.ts`).

**Apply behaviour (2026-05):** When underlying MRP/CRP PATCH/write routes are read-only, apply marks the proposal `applied` and returns `appliedPreviewOnly: true` in the response envelope. Wire real domain writes when H1 2027 write workflows land.

---

## 6. UI pattern

- Chat turn accumulates `proposals[]` from SSE `proposal` events.
- Card shows `summary`, **Apply**, **Dismiss** (calls apply/reject API with session cookies).
- Deep-link to MRP production-order page when `payload_json.productionOrderId` is present.

---

## 7. Maintenance

- New propose tools: register with `scope: "propose"`, document in module surface § AI tools.
- Update [`AI-CONSULTANT.md`](../AI-CONSULTANT.md) tool table when adding tools.
- Build log: [`ai-consultant-post-alpha-h2-build-log.md`](ai-consultant-post-alpha-h2-build-log.md).

---

## 8. Worked example

**Operator:** “Can we push PO-1042 by two days?”

1. Model calls `mrp.proposeOrderAdjustment` with `{ "productionOrderId": "…", "suggestedStartDate": "2026-06-02" }`.
2. Tool loads order via read service, builds diff, inserts proposal, returns `{ "ok": true, "proposalId": "…", "summary": "Move PO-1042 start from 2026-05-31 to 2026-06-02" }`.
3. Chat shows proposal card; operator taps **Apply**.
4. API sets `applied`; response notes preview-only until write routes ship.
