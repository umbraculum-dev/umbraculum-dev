# Academic use and experimentation

**Tier:** Public  
**Status:** v1.0 (living document)  
**Audience:** students, university labs, capstone teams, instructors, early-career developers building portfolio projects — and evaluators who need to know whether Umbraculum matches their expectations at public alpha  
**Related:** [`GETTING-STARTED.md`](GETTING-STARTED.md), [`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md), [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](PUBLIC-ALPHA-ANNOUNCEMENT.md), [`LICENSING.md`](LICENSING.md), [`MODULES.md`](MODULES.md) §3.2, [`design/ecosystem-case-studies.md`](design/ecosystem-case-studies.md) §"For young community members"

---

## 1. What this page is

Umbraculum at public alpha is **not** positioned as a drop-in replacement for production-scale ERP, CRM, or accounting suites on day one. It **is** positioned as a **tryable stack** for building **workspace-shaped operational applications** — composable modules, web (+ optional native), contracts at the API edge, and a unified AI consultant architecture.

**Students and university labs** are a primary intended audience for that tryability: capstones, coursework prototypes, hackathons, research demos, and portfolio work where the goal is **learn the platform shape** and **ship something inspectable**, not run payroll for a factory next quarter.

This page states what **free** means, what **alpha depth** implies for a semester project, suggested project shapes, and an honest **fit filter** so the brochure and docs do not waste your time if you need mature ERP breadth today.

---

## 2. Free to learn, build, and self-host

| What | Cost at public alpha |
|------|----------------------|
| **Clone the monorepo, run locally** | **Free** — `docker compose up`; see [`GETTING-STARTED.md`](GETTING-STARTED.md) |
| **Fork and modify the AGPL core** | **Free** under [AGPLv3](LICENSING.md) obligations (network use, source offer when you deploy modified core to others) |
| **Ship a Tier 6 vertical in your own repo** | **Free to start** — pin MIT [`@umbraculum/module-sdk`](../packages/module-sdk/README.md) and `@umbraculum/*-contracts`; no certification fee; see [`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md) |
| **Study the brewery reference vertical** | **Free** — in-repo worked example; not proof every vertical belongs in the core monorepo ([`GLOSSARY.md`](GLOSSARY.md) §"Where code lives") |
| **Contribute via PR** | **Free** — DCO sign-off only; no CLA ([`CONTRIBUTING.md`](../CONTRIBUTING.md)) |
| **Hosted Umbraculum cloud (future)** | **Not GA at alpha** — any future managed service may have tiers; self-host remains the documented path |
| **AI consultant on a hosted `free` workspace** | **Not included** — AI unlocks on paid workspace tiers; self-hosters use BYOK; see [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §7 |

**One-line pitch:** *Free to experiment on your laptop or lab machines. Paid pieces are optional AI unlock on hosted workspaces and future managed hosting — not pay-to-compile your capstone.*

There is **no Umbraculum certification program** and no badge wall ([`GETTING-STARTED.md`](GETTING-STARTED.md) §"No certification track"). Skill is shown by **public repos, demos, and conversation** — which also helps domain experts find you later ([`design/ecosystem-case-studies.md`](design/ecosystem-case-studies.md)).

---

## 3. Why this audience fits public alpha

Alpha depth — uneven module maturity, read-only MRP/CRP proofs, open doors on WMS/CRM — is **acceptable** when the deliverable is:

- a **prototype** or **portfolio** vertical (lab inventory, formulation tracker, small-batch ops demo),
- a **course artifact** with a fixed end date,
- **research** on composable ops software, AI tools, or industrial interfaces,

and **not acceptable** when the deliverable is:

- production ERP replacement,
- audited financial close,
- multi-site warehouse go-live on day one.

Umbraculum's early growth vector is **experimenters who become contributors and vertical builders** — not enterprise buyers expecting SAP breadth at `v0.0.1-alpha`. That is consistent with [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](PUBLIC-ALPHA-ANNOUNCEMENT.md) and the modesty note in [`design/ecosystem-case-studies.md`](design/ecosystem-case-studies.md): we offer a **tool**, not a lottery ticket.

---

## 4. Suggested project shapes (semester-friendly)

These respect the **vertical configuration** model ([RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) Tier 6): consume canonical domains; do not reimplement CRM as `UniversityCRM`.

| Project idea | Consumes | You build |
|--------------|----------|-----------|
| **Cosmetics / food formulation lab** | `pim` (products, attributes), optional read-only `mrp` | Formulation UI, batch records, your constants/rules |
| **Campus lab equipment booking** | `automation` (vessels/equipment metaphor), platform auth | Booking flows, lab-specific seed data |
| **Small-batch production demo** | `mrp` / `crp` read models, brewery patterns as reference | Your vertical config + demo data — not a second MRP engine |
| **Capstone "operational app"** | Platform shared layout + one canonical module | Tier 6 vertical in **your repo**, MIT SDK, public GitHub |

**Learning path:** skim [`GLOSSARY.md`](GLOSSARY.md) → [`MODULES.md`](MODULES.md) → clone and [`GETTING-STARTED.md`](GETTING-STARTED.md) → [`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md) when you start your own vertical repo.

**Alpha discipline for courses:** pin a release tag (e.g. `v0.0.1-alpha`), expect breaking changes on `main`, and treat [`ROADMAP.md`](ROADMAP.md) as the maturity source of truth — not marketing slides.

---

## 5. AI, apparatus, and coursework

- **AI consultant optional for v1 capstones.** Core value for students is often module composition, contracts, web UI, and domain math — not paid-tier AI unlock.
- **If you need AI in coursework:** self-host + BYOK (your own provider key) and understand tier gating on hosted workspaces ([`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §7).
- **Cursor umbraculum-toolset plugins** help contributors land CI-clean PRs ([`CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md)); they are **recommended for core contribution**, not a legal requirement to learn the stack or run a vertical in your own repo.

---

## 6. Fit filter — should you open the docs?

**Good fit — continue to [docs.umbraculum.dev](https://docs.umbraculum.dev) and [`GETTING-STARTED.md`](GETTING-STARTED.md):**

- You want to **build or extend** a workspace-shaped app (web, optional native).
- You are fine with **self-host**, **TypeScript**, and **alpha maturity**.
- Your goal is **learning, research, portfolio, or open-source contribution** — not production ERP next quarter.
- You may ship a **Tier 6 vertical** in your own repository without waiting for WMS/CRM to ship here.

**Probably not a fit — consider Odoo Community, a vertical SaaS, or a course stack your institution already supports:**

- You need **accounting, payroll, POS, or full-suite ERP** on a fixed go-live date.
- You require **vendor SLA**, certified implementers, or mature mobile ERP apps today.
- You cannot tolerate **alpha churn** during a short graded window (unless you pin a tag and scope down).

This filter is intentional on the [brochure](https://umbraculum.dev/) so visitors self-select before diving into the full doc set.

---

## 7. For instructors

- **Set expectations** using [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](PUBLIC-ALPHA-ANNOUNCEMENT.md) §"What public alpha is — and is not."
- **Prefer vertical-in-own-repo** assignments aligned with [`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md) — reduces coupling to brewery reference data.
- **Forum** at [`forum.umbraculum.dev`](https://forum.umbraculum.dev) is the canonical place for student questions that outlive a single course ([`CORE-DEVELOPMENT-AND-COMMUNITY.md`](CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6).
- **AGPL awareness:** if students deploy modified core to the public internet as a service, ensure they understand AGPL network-use obligations ([`LICENSING.md`](LICENSING.md) — not legal advice; consult campus counsel for institutional deployments).

---

## 8. Cross-references

- [`GETTING-STARTED.md`](GETTING-STARTED.md) — machine setup and first contribution path  
- [`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md) — ISV / capstone vertical in your repo  
- [`design/ecosystem-case-studies.md`](design/ecosystem-case-studies.md) — learnability ladder; young community members first  
- [`design/ecosystem-case-study-odoo.md`](design/ecosystem-case-study-odoo.md) §4.1 — when Odoo wins on ERP breadth  
- [`WEBSITE.md`](WEBSITE.md) — brochure vs docs publishing  
