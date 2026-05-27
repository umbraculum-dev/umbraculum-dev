# RFC companion documentation audit

**Tier:** Public
**Status:** Living matrix — first pass 2026-05-27
**Audience:** maintainers, plan authors, agents implementing RFC-backed features
**Last reviewed:** 2026-05-27

> [!NOTE]
> Inventory of expected companion artifacts per accepted RFC. Remediation priorities drive the [RFC documentation quality program](https://github.com/umbraculum-dev/umbraculum-dev) (docs-only + toolset rules). Taxonomy: [`docs/rfcs/README.md`](../rfcs/README.md) §3.

---

## 1. Verdict snapshot

| Verdict | RFCs |
|---------|------|
| **Documentation-complete** | 0003, 0006 |
| **Adequate with known gaps** | 0001, 0004, 0005 |
| **Drift-risk — P0 remediation shipped 2026-05-27** | 0007, 0008 |
| **Medium follow-up** | 0002 |
| **Adequate (horizontal native)** | — (see P1 row below) |

---

## 2. Full matrix (0001–0008)

| RFC | Impl. status | Expected companions | Present today | Gap | Priority |
|-----|--------------|---------------------|---------------|-----|----------|
| [0001](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) | Foundational | Automation surface; MODULES/PLATFORM | [`canonical-automation-module-surface.md`](canonical-automation-module-surface.md); ecosystem docs | No single horizontal "modules governance" one-pager | Low | P2 |
| [0002](../rfcs/0002-canonical-module-physical-layout.md) | Shipped | Route audit; brewery migration; native surface | [`web-route-group-audit.md`](web-route-group-audit.md); brewery scope migration; [`canonical-native-platform-surface.md`](canonical-native-platform-surface.md) | No consolidated β-layout cheat sheet | Medium | P1 |
| [0003](../rfcs/0003-validation-library-adoption.md) | Phase 1 | Audit doc | [`validation-library-adoption-audit.md`](validation-library-adoption-audit.md) | — | **Met** | — |
| [0004](../rfcs/0004-canonical-pim.md) | Partial | Module surface + build log | [`canonical-pim-module-surface.md`](canonical-pim-module-surface.md), [`canonical-pim-build-log.md`](canonical-pim-build-log.md) | Open work tracked in surface §8 | Low | P1 |
| [0005](../rfcs/0005-docs-site.md) | P1–P4 + post-P4 | Execution plan + build log | [`rfc-0005-execution-plan.md`](rfc-0005-execution-plan.md), [`rfc-0005-build-log.md`](rfc-0005-build-log.md) | P5–P7 open per plan | Low | P2 |
| [0006](../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) | Shipped | Bundled audit | [`web-route-group-audit.md`](web-route-group-audit.md) | — | **Met** | — |
| [0007](../rfcs/0007-canonical-document-rendering.md) | PR1–7 closed 2026-05-25 | Rationale + horizontal surface + consumer index | Rationale; PIM §8.3; **horizontal surface added 2026-05-27** | Registry must stay updated per new templates | Was **High** | P0 **closed** |
| [0008](../rfcs/0008-notifications-outbound-delivery.md) | Contract only | Boundary surface (pre-impl) | RFC text; **surface added 2026-05-27** | Transport service not built | Was **High** | P0 **closed** |

**Implementation closure references:** RFC-0007 §12 / §15.1; PIM PR7 [`pimChannelFeeds.test.ts`](../../services/api/src/tests/pimChannelFeeds.test.ts); MRP/CRP Wave 6 [`mrp-crp-wave-6-rendering-templates-build-log.md`](mrp-crp-wave-6-rendering-templates-build-log.md).

---

## 3. P0 / P1 / P2 remediation

### P0 (closed 2026-05-27)

| Deliverable | Path | Owner action on change |
|-------------|------|----------------------|
| Rendering horizontal surface | [`canonical-document-rendering-surface.md`](canonical-document-rendering-surface.md) | Update template registry when adding `documentTemplates` |
| Notifications boundary surface | [`canonical-notifications-outbound-delivery-surface.md`](canonical-notifications-outbound-delivery-surface.md) | Amend when RFC-0008 implementation starts |
| RFC-0007 cross-links | [`0007-canonical-document-rendering.md`](../rfcs/0007-canonical-document-rendering.md) §14 | Point to horizontal surface |
| Rendering package README | [`packages/rendering/README.md`](../../packages/rendering/README.md) | Consumer modules subsection |
| AI consultant index | [`AI-CONSULTANT.md`](../AI-CONSULTANT.md) | Template ref SoT = horizontal surface |
| AI prompt composition surface | [`canonical-ai-prompt-composition-surface.md`](canonical-ai-prompt-composition-surface.md) | Update when `aiPrompts` SDK fields or composition order change |

### P1 (next tranche)

| Deliverable | Path | Owner action on change |
|-------------|------|----------------------|
| AI propose-write surface | [`canonical-ai-propose-write-surface.md`](canonical-ai-propose-write-surface.md) | Update API paths, tool names, statuses when propose/apply changes |
| AI reporting DSL surface | [`canonical-ai-reporting-dsl-surface.md`](canonical-ai-reporting-dsl-surface.md) | Update view registry + AST when adding reporting views |
| AI RAG surface | [`canonical-ai-rag-surface.md`](canonical-ai-rag-surface.md) | Update ingest corpus + schema when RAG phases ship |
| AI post-α H2 build log | [`ai-consultant-post-alpha-h2-build-log.md`](ai-consultant-post-alpha-h2-build-log.md) | Append per wave; link verification commands |
| AI prompt composition (maintenance) | [`canonical-ai-prompt-composition-surface.md`](canonical-ai-prompt-composition-surface.md) | Sync module `aiPrompts` + route maps when adding modules or RouteIds |
| Native horizontal surface | [`canonical-native-platform-surface.md`](canonical-native-platform-surface.md) | Update route matrix when promoting native routes; update §5 when demo scope shifts |
| Demo host runbook | [`demo-host-runbook.md`](demo-host-runbook.md) | Update demo accounts table when seed emails change |
| Cloud hosted track (stub) | [`cloud-hosted-product-track.md`](cloud-hosted-product-track.md) | Amend when `cloud.umbraculum.dev` work starts |
| RFC-0002 native companion | [`0002-canonical-module-physical-layout.md`](../rfcs/0002-canonical-module-physical-layout.md) §5 | Link to native surface when `registerNativeModule` behavior changes |

- Module surfaces: ensure **Rendering** subsections in MRP/CRP/PIM/automation point at horizontal surface + module refs (MRP/CRP updated in Wave 6).
- Optional: [`canonical-module-physical-layout-as-built.md`](canonical-module-physical-layout-as-built.md) — β-layout cheat sheet (RFC-0002).
- RFC index: brewery migration doc rollup under RFC-0002 row.

### P2 (automation)

- [`scripts/docs/check-rfc-companion-links.py`](../../scripts/docs/check-rfc-companion-links.py) — companion path existence check.
- Promote to blocking CI after one green cycle on `main`.

---

## 4. Maintenance

- Refresh **Last reviewed** on this file when any RFC row changes or a new RFC is accepted.
- When accepting **0009+**, add a row before merging the RFC index update.
- Quarterly: spot-check template registry in rendering surface against `listRegisteredDocumentTemplates()` / module `documentTemplates.ts` files.

---

## 5. Cross-references

- [`docs/rfcs/README.md`](../rfcs/README.md) §3 — taxonomy
- [`plan-documentation-context-template.md`](plan-documentation-context-template.md) — plan authoring
- [`docs/CURSOR-PLUGINS.md`](../CURSOR-PLUGINS.md) — rules `48-rfc-companion-documentation-gate`, `49-plan-documentation-context`
