# Asking Umbraculum — using the AI consultant

**Tier:** Public
**Audience:** workspace members and admins using the AI consultant in the running app.

> [!NOTE]
> This is the first end-user help doc in `docs/help/`. For *how the AI consultant is built* and *what architecturally guarantees these answers*, see [`../AI-CONSULTANT.md`](../AI-CONSULTANT.md). This page is intentionally lighter: it is for people using the chat panel at `/ai`, not building it.

---

## 1. What you can ask

The AI consultant answers questions grounded in **your workspace's data**. Below are the categories of question it can handle today, with concrete phrasings that work well. The model picks tools based on phrasing, so being specific helps.

**Recipes**

- *"Show me the IPA recipes in my workspace."*
- *"What's the OG, FG, ABV, and IBU for my Pale Ale recipe?"*
- *"Find recipes with 'saison' in the name."*

**Water chemistry**

- *"What's the water profile and predicted mash pH for recipe `<id>`?"*
- *"What salt additions are configured for my next brew?"*

**Brew sessions**

- *"What's the current step of my most recent brew session?"*
- *"Is there a brew session running right now?"*
- *"When did the latest session start, and is it paused or stopped?"*

**Ingredient inventory**

- *"How much Pilsner malt do I have on hand?"*
- *"List the hops in my inventory."*
- *"Do I have detergent and sanitizer in stock?"*

**Equipment profiles**

- *"What's the kettle volume on my main equipment profile?"*
- *"Find my mash tun's mash efficiency setting."*

**Vessels and tank state (automation)**

- *"List my vessels and their current temperatures."*
- *"What's the state of vessel FV-1 right now? Is it in alarm?"*

The AI may chain tools together for compound questions — e.g. *"do I have enough Pilsner malt for the next brew session?"* combines a brew-session lookup, a recipe lookup, and an inventory check. The chat panel shows each tool call and its result, so you can audit the reasoning.

---

## 2. What the AI can see in your workspace

The AI consultant operates **at workspace scope**. Inside your active workspace it can see:

- Recipes (BeerJSON canonical form)
- Recipe water settings (source/target water profiles, salt additions, predicted mash pH)
- Brew sessions and their steps (status, scheduled date, current step)
- Inventory items by category (fermentable, hop, speciality, acid/salt, detergent/sanitizer, kegging)
- Equipment profiles (kettle, mash tun, fermenters — geometry, efficiency, evaporation)
- Vessels exposed by the automation module (current temperature, mode, alarm state)

It **cannot** see:

- Data in other workspaces — even if you are a member of more than one. To ask about a different workspace, switch into it first.
- Server logs, system configuration, billing data, or anything outside the operational entities above.
- Hardware below the automation module's vessel abstraction (no raw PLC registers, no Modbus internals).
- Internet pages, third-party APIs, or any data not stored in your workspace.

This is a tenancy guarantee, not a UX limitation: the workspace boundary is enforced at the service layer before any tool result reaches the AI.

---

## 3. What the AI cannot do (yet)

The consultant today is **read-only** with respect to your workspace data:

- It cannot create, edit, or delete recipes, sessions, inventory, equipment, or vessels.
- It cannot start, pause, or stop a brew session.
- It cannot change a vessel's setpoint, mode, or alarm threshold.
- It cannot send commands to the PLC or any other piece of brewery hardware.
- It cannot change billing, subscription, membership, or workspace settings.

When you ask the AI to *do* something rather than *answer* something, today it will tell you what it would do and ask you to make the change yourself through the relevant page. The "AI proposes, human confirms, platform writes" flow is the explicit design target ([`../AI-CONSULTANT.md`](../AI-CONSULTANT.md) §4); autonomous write tools are not v0.

---

## 4. How to get the best answers

A few small habits change answer quality dramatically.

- **Be specific about scope.** *"My next brew session"* lands cleanly; *"the brew"* may not. *"Pilsner malt"* lands; *"malt"* triggers a less useful list.
- **Name the entity if you have it.** Recipe names, vessel codes (e.g. `FV-1`, `K1`), and equipment-profile names are the strongest hints the AI can use.
- **One question at a time, when possible.** Compound questions ("recipe + inventory + sessions in one breath") work, but they're noisier than three follow-ups. Use compound queries when you actually want the cross-cutting answer, not as a shortcut.
- **If an answer is uncertain, ask what tool the AI used.** *"Which tool did you use to get that?"* surfaces whether the AI looked at live data or paraphrased a memory.
- **If something looks wrong, ask the AI to re-check.** *"Re-run the inventory check for Pilsner malt without using memory."* The AI can re-call the underlying tool.

There are no magic prompts. The chat panel is conversational on purpose; precision in your phrasing is the only lever.

---

## 5. Privacy + BYOK

The AI consultant uses **your workspace's own API key** for the underlying language model (currently Anthropic). This is the BYOK (*Bring Your Own Key*) model.

- **Where your key lives.** Encrypted at rest in the workspace's settings (AES-256-GCM); the encryption master key lives in the app's environment, not the database. A database dump without the master key is useless.
- **What the AI sees.** Only data inside your active workspace, fetched through the typed tool layer described above.
- **What gets logged for usage metering.** Token counts per request (so admins can see usage in the AI dashboard); the request payload itself is not stored after the response is returned.
- **Who pays for tokens.** Anthropic bills your workspace directly through your API key. Umbraculum does not resell tokens in v0.
- **Tier unlock.** AI access is gated by the workspace's billing tier — `premium`, `pro`, or `pro_plus`. Workspaces on `free` will be prompted to upgrade through the standard billing flow before the AI panel becomes interactive.

The full BYOK + tier-unlock posture lives in [`../AI-CONSULTANT.md`](../AI-CONSULTANT.md) §6 and [`../PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §7.

---

## 6. Per-workspace memory

The AI maintains a **per-workspace memory** — durable notes that get composed into every prompt for your workspace.

- **What it remembers.** Seasonal patterns, supplier quirks, recurring issues, operator preferences ("we always sparge at 78°C"), corrections you made to earlier answers.
- **What it does not remember.** Anything from another workspace; anything you explicitly mark as one-off; anything outside the operational categories listed in §2.
- **How memory accumulates.** As you use the consultant, it offers to note things worth remembering. You can also tell it explicitly: *"Remember that our brew lengths default to 22 litres."*
- **How to inspect or clear memory.** The AI dashboard (admin view) shows the current memory entries; admins can clear individual entries or the whole memory.

Memory is workspace-scoped by construction — your workspace's notes never enter another workspace's prompts, even if the same operator is in both.

---

## 7. When the AI is wrong

The AI makes mistakes. Some kinds of mistake matter more than others.

- **Wrong factual answer (e.g. wrong OG, wrong inventory count).** Ask the AI to re-run the underlying tool: *"Re-check that against `brewery.recipeLookup`."* If it's still wrong, the underlying data is probably wrong — fix it through the relevant page and re-ask.
- **AI seems out of date.** The AI does not cache live workspace data between turns; every tool call hits live data. If you just changed something and the AI hasn't seen it, ask explicitly: *"Re-query, the data just changed."*
- **AI gives a plausible-but-wrong reason or invents a tool.** Tell the AI: *"Don't reason — call the tool."* Or: *"You don't have that tool; use the closest one you do have."*
- **AI does something it should not have done.** Today this can only mean it gave bad advice (it cannot perform writes), but report it anyway — operator feedback shapes the safety policy in [`../PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §6.5.
- **Safety-relevant issues.** If you find a way to make the AI return data from a workspace you should not see, treat it as a security report and follow [`../../SECURITY.md`](../../SECURITY.md) rather than the regular support path. Same for any apparent tenancy bypass.

The chat panel keeps a transcript of recent conversations; you can reference a turn by quoting it back to the AI, and you can copy the transcript when escalating.

---

*This is the first operator-facing doc in `docs/help/`. As additional canonical modules ship (next plausibly `mrp` or `crp` per [`../ROADMAP.md`](../ROADMAP.md)) and as the brewery vertical's surface grows, additional help docs will land here following a similar shape.*
