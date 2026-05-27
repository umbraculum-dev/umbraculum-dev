# AI reporting DSL — horizontal surface (Layer B)

**Tier:** Public  
**Status:** Shipped MVP (post-α H2 Wave C, 2026-05)  
**Audience:** platform maintainers, module authors, AI consultant implementors  
**Related:** [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §6.1 Layer B, [`POSTGRES-REPLICATION-ARCHITECTURE.md`](../POSTGRES-REPLICATION-ARCHITECTURE.md)

---

## 1. Summary

The reporting DSL lets the AI answer **bounded analytics questions** without raw SQL. The model emits a **typed query AST**; the server validates and executes against **curated Postgres views** on a read-only connection.

| Invariant | Enforcement |
|-----------|-------------|
| **No raw SQL from the model** | Only Zod-validated AST → parameterized SQL builder |
| **Row cap** | `limit` ≤ 100 (hard reject above) |
| **Date range required** | `dateFrom` + `dateTo` on every query |
| **Workspace scope** | Every view includes `workspace_id`; executor binds `$workspaceId` |
| **Timeout** | 5s statement timeout on executor connection |
| **PII** | Views exclude email/phone unless explicitly allowlisted |

---

## 2. Curated view registry (MVP)

| View | Metrics | Dimensions | Module owner |
|------|---------|------------|--------------|
| `reporting.mrp_order_status_counts` | `order_count` | `status` | mrp |
| `reporting.brewery_inventory_summary` | `on_hand_qty` | `category` | brewery (vertical) |

Views are created in migrations under `services/api/prisma/migrations/`. Future: `registerModule({ reportingViews })` (not shipped in MVP).

Execution uses `DATABASE_URL_RO` (replica) when set; falls back to primary with read-only transaction.

---

## 3. Query AST (subset)

```ts
{
  view: "mrp_order_status_counts" | "brewery_inventory_summary",
  metrics: string[],      // subset of view allowlist
  dimensions?: string[],
  filters?: { field: string; op: "eq"; value: string | number }[],
  dateFrom: string,       // ISO date
  dateTo: string,
  limit?: number          // default 50, max 100
}
```

Validated by `ReportingQueryAstSchema` in `services/api/src/services/ai/reporting/reportingAst.ts`.

---

## 4. Tool: `platform.reportingQuery`

| Field | Value |
|-------|--------|
| **Scope** | `read` |
| **Owner** | platform (registered beside `render_document`) |
| **Input** | AST object above |
| **Output** | `{ ok: true, rows: Record<string, unknown>[], rowCount, truncated }` |

Platform overlay reminds the model to prefer this tool for aggregate questions instead of guessing.

---

## 5. Worked example

**Question:** “How many production orders per status this month?”

```json
{
  "view": "mrp_order_status_counts",
  "metrics": ["order_count"],
  "dimensions": ["status"],
  "dateFrom": "2026-05-01",
  "dateTo": "2026-05-31",
  "limit": 50
}
```

**Result rows:**

```json
[
  { "status": "planned", "order_count": 12 },
  { "status": "in_progress", "order_count": 3 }
]
```

---

## 6. Deferred (not MVP)

- CRM/WMS views, cross-module joins, model-written SQL, `ai_readonly` role (optional hardening).

---

## 7. Maintenance

- Add views via migration + extend `ReportingViewRegistry` in code.
- Update [`AI-CONSULTANT.md`](../AI-CONSULTANT.md) with example questions.
- Build log: [`ai-consultant-post-alpha-h2-build-log.md`](ai-consultant-post-alpha-h2-build-log.md).
