# Asking Umbraculum — using the AI consultant

**Tier:** Public
**Audience:** workspace members and admins using the AI consultant in the running app.

> [!NOTE]
> For *how the AI consultant is built*, see [`../AI-CONSULTANT.md`](../AI-CONSULTANT.md). This page is for people using the chat panel at `/ai`.

---

## 1. What you can ask

The AI consultant answers questions grounded in **your workspace's data**. Below are categories that work well today. The model picks tools based on phrasing — being specific helps.

**Recipes (brewery)**

- *"Show me the IPA recipes in my workspace."*
- *"What's the OG, FG, ABV, and IBU for my Pale Ale recipe?"*

**Water chemistry**

- *"What's the water profile and predicted mash pH for recipe `<id>`?"*

**Brew sessions and inventory**

- *"What's the current step of my most recent brew session?"*
- *"How much Pilsner malt do I have on hand?"*

**Equipment**

- *"What's the kettle volume on my main equipment profile?"*

**Vessels (automation)**

- *"List my vessels and their current temperatures."*
- *"What's the state of vessel FV-1 right now?"*

**Products (PIM)**

- *"Find products with SKU containing `IPA`."*
- *"Show product detail for `<productId>`."*
- *"List categories in this workspace."*

**Production planning (MRP)**

- *"List production orders in this workspace."*
- *"Explain material requirements for production order `<orderId>`."*

**Capacity and schedule (CRP)**

- *"Explain capacity load for the next week."*
- *"List scheduling conflicts."*
- *"What resources are projected from automation vessels?"*

**Document export**

- *"Generate a PDF work order for production order `<orderId>`"* — uses the `render_document` tool or you can use the page's **Export** button on MRP/CRP screens.

The AI may chain tools for compound questions — e.g. *"do I have enough Pilsner malt for the next brew?"* The chat panel shows each tool call and result.

**Analytics (reporting)**

- *"How many production orders per status this month?"* — uses the reporting tool on curated views (not raw SQL).

**Product help (documentation search)**

- *"How does MRP material requirements work?"* — searches ingested public help articles.

**Suggested changes (proposals)**

- *"Can we push order PO-1042 by two days?"* — the AI may draft a **proposal** card with **Apply** or **Dismiss**. Nothing changes until you confirm Apply. If domain write routes are not yet live, Apply records your confirmation as preview-only.

**Context from the page you're on:** Open `/ai?fromRoute=productionOrders` (or use **Ask AI** links on some pages) so the assistant prefers tools for that area.

---

## 2. What the AI can see in your workspace

At **workspace scope**, inside your active workspace:

- Recipes, water settings, brew sessions, inventory, equipment (brewery)
- Vessels and telemetry (automation)
- Products, categories, attribute sets (PIM)
- Production orders and material requirements — including read-time projections from brewery (MRP)
- Resources, capacity, schedule, conflicts — including projections from automation/brewery (CRP)
- Registered document templates via `render_document` (outputs only; does not change domain records)

It **cannot** see:

- Other workspaces (switch workspace first)
- Billing, admin settings, raw PLC/Modbus internals
- The public internet or external APIs

---

## 3. What the AI cannot do (yet)

- **No autonomous edits** to recipes, products, vessels, inventory, or planning records
- **No PLC setpoint or mode changes**
- **No billing or membership changes**
- **No creating or rescheduling production orders** (read-only MRP/CRP advisor)
- **No ad-hoc SQL or analytics dashboards** (reporting DSL not shipped)

`render_document` submits a rendering job — it produces a file, it does not mutate operational data.

---

## 4. How to get the best answers

- Be specific: recipe names, vessel codes (`FV-1`), SKUs, production order ids
- One focused question at a time when possible
- Ask *"Which tool did you use?"* if an answer looks wrong
- Say *"Re-query without memory"* to force a fresh tool call

---

## 5. Privacy + BYOK

Your workspace supplies an **Anthropic API key** (BYOK). Keys are encrypted at rest; Anthropic bills you directly. AI access requires a paid tier (`premium`, `pro`, or `pro_plus`). See [`../AI-CONSULTANT.md`](../AI-CONSULTANT.md) §6.

---

## 6. Per-workspace memory

The AI keeps durable notes (facts, recurring issues) composed into every prompt for your workspace. Admins can inspect or clear memory in the AI settings dashboard.

---

## 7. When the AI is wrong

- Ask it to re-run the relevant tool
- Fix underlying data in the app if tools return wrong numbers
- Security/tenancy issues: follow [`../../SECURITY.md`](../../SECURITY.md)

---

*More modules and help pages may be added over time. Prompt and tool contracts: [`../design/canonical-ai-prompt-composition-surface.md`](../design/canonical-ai-prompt-composition-surface.md).*
