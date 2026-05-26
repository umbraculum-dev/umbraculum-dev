# Billing + Entitlements (Workspace-based) — Stripe (Web) + RevenueCat (Unified) + Fastify (Authoritative)

**Context (what you have today)**
- You already have **auth** and a multi-tenant model: **Workspaces** with **Users** and **Memberships** (many users per workspace).
- Note: in practice, a **Workspace usually represents an organization/team** (brewery/club) for billing and limits.
- You plan **tiers** (Free / Premium / Pro / Pro Plus) that primarily control **limits/quotas**, e.g.:
  - “number of recipes per workspace”
  - “number of versions per recipe”

This document summarizes the **technical architecture** and the **choices we made**, and defines the **minimal Fastify endpoints + webhook contracts** to implement.

---

## Decisions we made (and why)

### 1) Billing entity is the Workspace (not the user)
**Decision:** all billing, entitlements, and enforcement are **per workspace**.

**Implications**
- A Stripe subscription upgrades a **workspace**, not the purchasing user.
- Entitlements in RevenueCat represent the **workspace’s tier**.
- Limits (e.g., max recipes/workspace) are enforced **per workspace** in Fastify.

### 2) “Only workspace admins can purchase”
**Decision:** purchasing/upgrading is restricted to members with a **`brewery_admin`** role in that workspace.

**Implications**
- The UI should show paywalls/upgrade CTAs to everyone, but the **purchase action** is enabled only for workspace admins.
- Backend also enforces this (never rely on UI-only checks).

### 3) Use Stripe for Web purchases; use Store billing for Mobile
**Decision:**  
- **Web** checkout uses Stripe (hosted checkout; no cart/e-commerce).
- **Mobile** purchases use native App Store / Google Play flows via the RevenueCat SDK (if you allow mobile purchase).

### 4) No “e-commerce/cart”: use Stripe Pricing Table (preferred)
**Decision:** prefer **Stripe Pricing Table** embedded in a simple pricing page.

**Why**
- You get a clean tier comparison UI with minimal maintenance.
- You can pass a deterministic identifier: `client_reference_id = billing_intent_id` (critical for mapping “who bought?” and which workspace the purchase should apply to).

### 5) RevenueCat App User ID represents the User
**Decision:** RevenueCat `app_user_id` is **`user_id`** (string).

**Why**
- Mobile purchases must be supported from day 1.
- RevenueCat identity is fundamentally customer/user-centric, and using `user_id` avoids treating “workspace switching” like “identity switching”.

**Implications**
- RevenueCat customer state lives on the user identity.
- We must explicitly bind a purchase to a workspace in our backend (see “Purchase intent + workspace binding” below).

### 6) Backend (Fastify) is the source of truth for enforcement
**Decision:** Fastify (and your DB) is authoritative for access control and quotas.

**Implications**
- Client entitlements are for UX (show/hide) but all “valuable actions” must be enforced server-side.
- RevenueCat webhooks update your DB to keep enforcement consistent.

### 7) Stripe → RevenueCat linking is done manually (recommended)
**Decision:** on Stripe subscription creation, your backend posts the Stripe subscription token to RevenueCat:
- `POST /v1/receipts` with `X-Platform: stripe`, `fetch_token=sub_...`, `app_user_id=user_id`.

**Why**
- Guarantees correct mapping of a Stripe subscription to the correct user (no anonymous, no heuristics).
- Allows retries, observability, and deterministic idempotency.

---

## Purchase intent + workspace binding (required when RevenueCat app_user_id = user_id)

### What this solves

We enforce limits per workspace, but RevenueCat entitlement state is attached to a user.

To keep the system simple and authoritative:
- Stripe and RevenueCat tell us “this user has an active tier”
- Our backend decides which workspace that tier applies to

### V1 deliberate constraint (keep it simple)

If a user is a `brewery_admin` of multiple workspaces, mobile billing becomes ambiguous because the App Store / Play Store subscription is user-centric.

For v1 we intentionally choose:
- A user may only have mobile billing applied to **one workspace at a time**
- If a user needs multiple workspaces on paid tiers, they must manage additional workspace subscriptions via **web (Stripe)**, or use a separate user identity for the other workspace

This is driven by platform + ecosystem constraints and the cost/complexity of implementing multi-workspace mobile billing semantics.

### Purchase intent model

Before starting any purchase flow, create a backend “purchase intent” that binds:
- `user_id` (who is purchasing)
- `workspace_id` (which workspace should be upgraded)
- `plan_code` (which tier)
- `provider` (`stripe|apple|google`)
- an idempotency key + expiry

The purchase intent id is then used as the stable mapping key throughout the flow.

### Restore purchases (v1)

RevenueCat can restore a user’s purchases across reinstalls/devices, but a restore event does not inherently specify which workspace should receive the paid tier.

For v1 we resolve this explicitly in UX:

- User navigates to Billing on native.
- UI shows a workspace picker (or uses the current `activeWorkspaceId`) and explains: “Your subscription will be applied to this workspace.”
- When the user taps “Restore purchases”, the client:
  - creates a purchase intent for the selected workspace:
    - `POST /workspaces/:workspaceId/billing/intent` with `provider = apple|google` and `mode = restore`
  - calls RevenueCat restore on-device
  - then calls a backend confirm endpoint with `{ billingIntentId }` so the backend can:
    - set/update `billing_user_workspace_binding` for this `user_id` → selected `workspace_id`
    - refresh authoritative `workspace_billing` for the bound workspace (either immediately by querying RevenueCat, or shortly after via webhook)

Backend guardrails (v1):
- If the user has an active paid entitlement but no binding exists yet, do not auto-apply it to an arbitrary workspace. Require an explicit restore flow (workspace selection) to establish the binding.

---

## Tier model (4 entitlements = tiers)

Example entitlements (mutually exclusive):
- `tier_free` (optional, usually implied)
- `tier_premium`
- `tier_pro`
- `tier_pro_plus`

**Rule in backend:** “effective tier” is the highest active entitlement, or the explicit tier stored in your DB.

**Example limit policy**
- `free.max_recipes_per_workspace = 5`
- `free.max_versions_per_recipe = 2`
- `pro.max_recipes_per_workspace = 99`
- `pro.max_versions_per_recipe = 5`
- `pro_plus.max_recipes_per_workspace = 1000`
- `pro_plus.max_versions_per_recipe = 99`

---

## System diagram (Option A)

### Web (Stripe Pricing Table)
1. User logs in → chooses active workspace.
2. Client creates a purchase intent:
   - `POST /workspaces/:workspaceId/billing/intent`
   - Response includes `billingIntentId` (purchase intent id) and pricing table config.
3. Pricing page embeds Stripe Pricing Table with:
   - `client_reference_id = billing_intent_id` (must be set)
4. Stripe Checkout completes → Stripe emits webhook.
5. Fastify Stripe webhook:
   - reads `billing_intent_id` from `checkout.session.client_reference_id`
   - resolves purchase intent → `{ user_id, workspace_id, plan_code }`
   - reads `sub_...` from `checkout.session.subscription`
   - calls RevenueCat receipts API with `app_user_id=user_id` and `fetch_token=sub_...`
   - marks intent as fulfilled and sets/updates the user → workspace billing binding in DB
6. RevenueCat updates entitlements and emits **RevenueCat webhook** to your Fastify endpoint.
7. Fastify updates DB authoritative state and enforcement takes effect for the bound workspace.

### Mobile (RevenueCat SDK)
1. User logs in (RevenueCat identity is user-scoped):
   - Client configures RevenueCat SDK with `app_user_id = user_id`.
2. User chooses active workspace.
3. Client creates a purchase intent:
   - `POST /workspaces/:workspaceId/billing/intent` (admin-only)
4. Paywall purchase (admin-only) uses native store UI (RevenueCat SDK).
5. RevenueCat emits webhook → Fastify updates DB for the user and applies the tier to the bound workspace.
6. All members of the workspace receive the upgraded tier (server enforcement + client UI refresh).

---

## Data model (minimal)

### Workspaces & memberships
- `workspaces (id, name, ...)`
- `workspace_memberships (workspace_id, user_id, role, status, ...)`
  - `role ∈ {brewery_admin, member, viewer, ...}`

### Billing
- `workspace_billing`
  - `workspace_id` (PK)
  - `tier` (enum: `free|premium|pro|pro_plus`)
  - `expires_at` (nullable)
  - `source` (enum: `stripe|apple|google|manual`)
  - `stripe_customer_id` (nullable)
  - `stripe_subscription_id` (nullable)
  - `rc_app_user_id` (string; equals `user_id`)
  - `updated_at`

### Purchase intents (required)

- `billing_purchase_intents`
  - `id` (PK) a.k.a. `billingIntentId`
  - `user_id`
  - `workspace_id`
  - `plan_code`
  - `provider` (`stripe|apple|google`)
  - `status` (`created|fulfilled|expired|cancelled`)
  - `expires_at`
  - `created_at`, `fulfilled_at`
  - (optional) `stripe_checkout_session_id`
  - (optional) `stripe_subscription_id`

### Binding: which workspace a user’s mobile billing applies to (v1)

- `billing_user_workspace_binding`
  - `user_id` (PK)
  - `workspace_id`
  - `provider` (`apple|google|stripe`) (optional)
  - `updated_at`

### Limits & usage
- `tier_limits (tier, max_recipes_per_workspace, max_versions_per_recipe, ... )`
- `workspace_usage (workspace_id, period_start, period_end, ...)`

---

# Fastify API: minimal endpoints + contracts

Below are the minimal endpoints to ship Stripe web subscriptions + RevenueCat entitlements + workspace-level enforcement.

## Auth / context assumption
All endpoints assume you have an auth middleware that provides:
- `req.user.id`
- `req.user.activeWorkspaceId` (selected workspace context)
- `req.user.rolesByWorkspace` or membership lookup

---

## 1) Get current workspace billing state (for UI + gating)
### `GET /workspaces/:workspaceId/billing`
**Auth:** requires membership in workspace.  
**Response example:**
```json
{
  "workspaceId": "ws_123",
  "tier": "premium",
  "expiresAt": "2026-06-01T00:00:00Z",
  "limits": {
    "maxRecipesPerWorkspace": 5,
    "maxVersionsPerRecipe": 2
  },
  "usage": {
    "periodStart": "2026-02-01T00:00:00Z",
    "periodEnd": "2026-03-01T00:00:00Z",
    "recipesCount": 3
  }
}
```

**Notes**
- This is what both web and native UIs can call to render “Your plan” and show remaining quota.

---

## 2) Purchase intent (required)
The backend must create a purchase intent to bind a purchase to a workspace while keeping RevenueCat identity user-scoped.

### `POST /workspaces/:workspaceId/billing/intent`
**Auth:** requires workspace membership + `brewery_admin`.  
**Purpose:** creates a `billing_purchase_intents` row and returns the values needed to start the purchase flow (web or native).

**Response example:**
```json
{
  "billingIntentId": "bi_123",
  "workspaceId": "ws_123",
  "planCode": "pro",
  "stripePricingTableId": "prctbl_...",
  "stripePublishableKey": "pk_live_...",
  "clientReferenceId": "bi_123"
}
```

**UI rule (web)**
- You embed `<stripe-pricing-table>` and set `client-reference-id` to `clientReferenceId` (which is the `billingIntentId`).
- Do not trust arbitrary workspace ids from query params; always create the intent via this endpoint.

---

## 3) Stripe webhook (required)
### `POST /webhooks/stripe`
**Purpose:** finalize identity mapping + call RevenueCat receipts API.

**Security**
- Verify Stripe signature header (`Stripe-Signature`) using your Stripe webhook signing secret.
- Reject if signature invalid.

**Primary events to handle**
- `checkout.session.completed` (recommended for fulfillment)
- Optionally `customer.subscription.created` for redundancy

**Expected payload (conceptual)**
Stripe sends an event with:
- `event.type`
- `event.data.object` (the session/subscription object)

**What you extract**
From `checkout.session.completed`:
- `billingIntentId = session.client_reference_id`
- `stripeSubscriptionId = session.subscription` (`sub_...`)
- `stripeCustomerId = session.customer` (`cus_...`)
- `stripePriceId` (via line items, or session mode/prices depending on setup)

**Validation rules**
- `billingIntentId` must be present and correspond to a real, unexpired purchase intent.
- The purchase intent must belong to a user who is currently (or was at intent creation time) a `brewery_admin` of the workspace.

**Actions**
1. Resolve `billingIntentId` → `{ user_id, workspace_id, plan_code }`.
2. Persist/update Stripe IDs in `workspace_billing`:
   - `stripe_customer_id`, `stripe_subscription_id`, `source = stripe`
3. Call RevenueCat receipts API:
   - `X-Platform: stripe`
   - `fetch_token = stripeSubscriptionId`
   - `app_user_id = user_id`
4. Mark the purchase intent as fulfilled.
5. Update `billing_user_workspace_binding` so this user’s billing applies to that workspace.
6. Respond `200` quickly (Stripe timeouts are real); retry via queue if needed.

**Idempotency**
- Stripe retries webhooks. Make handler idempotent:
  - Use `event.id` log table or check if `stripe_subscription_id` already processed.

---

## 4) RevenueCat webhook (required)
### `POST /webhooks/revenuecat`
**Purpose:** update your DB authoritative state for workspace tier + expiry.

**Security**
- Validate RevenueCat webhook signature/secret per RC docs (store secret in env).
- Reject invalid signatures.

**Payload**
RevenueCat sends structured events (e.g., INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, etc.).  
You primarily care about:
- `app_user_id` (this should be your `user_id`)
- entitlement state (active/inactive)
- expiration timestamps
- product identifiers (optional; for debugging/tier mapping)

**Actions**
1. Map `app_user_id` → `user_id`.
2. Compute effective tier for this user:
   - if `tier_pro_plus` active → tier = `pro_plus`
   - else if `tier_pro` active → tier = `pro`
   - else if `tier_premium` active → tier = `premium`
   - else → tier = `free`
3. Resolve which workspace should receive this tier:
   - Look up `billing_user_workspace_binding` for `user_id` → `workspace_id`
   - If no binding exists, do not apply to any workspace; keep the event/audit and flag for manual review.
4. Update `workspace_billing` for the bound workspace:
   - `tier`, `expires_at`, `updated_at`, `source`
5. Optionally store an immutable audit row in `billing_events`.

**Idempotency**
- Treat webhook events as “set current state”, not “increment”.
- Keep last processed event id for debugging.

---

## 5) Admin-only “manage subscription” link (optional but useful)
### `POST /workspaces/:workspaceId/billing/portal`
**Auth:** `brewery_admin`.
**Purpose:** create a Stripe Customer Portal session and return URL.

Response:
```json
{ "url": "https://billing.stripe.com/session/..." }
```

This lets workspace admins upgrade/downgrade/cancel without you building any account management UI.

---

# Client implementation notes (Web + Native)

## Active workspace is the billing context
Because billing is workspace-based:
- The user chooses an **active workspace** in UI.
- All billing/limits queries use `activeWorkspaceId`.

## RevenueCat identity + workspace switching
RevenueCat identity is user-scoped:
- Configure RevenueCat SDK with `app_user_id = user_id` on login (and keep it stable).
- When the user switches active workspace, do not re-login RevenueCat; just refresh `/workspaces/:workspaceId/billing` for the authoritative workspace tier and limits.

## Purchase action (admin-only)
- The paywall screen can show tiers to everyone.
- Only `brewery_admin` sees “Subscribe/Upgrade” enabled.
- Backend still enforces admin-only actions for any endpoints that initiate billing.

---

# Recommended implementation order

1) **DB + enforcement**
- Implement `workspace_billing`, `tier_limits`, `workspace_usage`
- Implement enforcement middleware:
  - `requireWorkspaceMembership`
  - `requireBreweryAdmin`
  - `enforceTierLimits` (e.g., max recipes/workspace, max versions/recipe)

2) **RevenueCat webhook first**
- Implement `/webhooks/revenuecat` and update `workspace_billing`.
- Add `/workspaces/:workspaceId/billing` so UI can display tier state.

3) **Purchase intent**
- Implement `POST /workspaces/:workspaceId/billing/intent`
- Enforce the v1 constraint: a user can only bind mobile billing to one workspace at a time

4) **Stripe Pricing Table embed**
- Embed Pricing Table in web app, passing `client-reference-id = billingIntentId`

5) **Stripe webhook + Stripe→RevenueCat receipts linking**
- Implement `/webhooks/stripe`
- On checkout completion, call RevenueCat receipts API.

6) **Mobile purchase (if enabled)**
- Implement RevenueCat SDK login with `user_id`
- Admin-only purchase
- Restore purchases

---

# Notes & guardrails

- **Never** grant plan access purely based on client-side signals.
- Always enforce quotas at Fastify level for valuable actions (e.g., recipe creation, version creation, exports, etc.).
- With tiers-as-limits, store both:
  - `tier` (current)
  - `expires_at` (when it ends)
- Keep an audit log for billing events; it saves days when debugging.

---

## External accounts TODO checklist (Stripe + RevenueCat)

This project can be implemented and tested locally without external accounts (stub mode), but production wiring requires the following.

### Stripe TODOs

- Create Stripe account + set up **4 tiers** (`free`, `premium`, `pro`, `pro_plus`) as products/prices.
- Create Stripe Pricing Table(s) and capture:
  - `STRIPE_PRICING_TABLE_ID`
  - `STRIPE_PUBLISHABLE_KEY`
- Configure Stripe webhook to call:
  - `POST /webhooks/stripe`
- Set `STRIPE_WEBHOOK_SECRET` in your runtime environment.
  - Note: local dev may keep `STRIPE_WEBHOOK_SECRET="..."` as a placeholder; webhook strict mode should only be enabled when a real secret is configured.

### RevenueCat TODOs

- Create RevenueCat project + apps (iOS/Android).
- Define entitlements:
  - `tier_free` (optional)
  - `tier_premium`
  - `tier_pro`
  - `tier_pro_plus`
- Map products (Apple/Google product identifiers) into those entitlements.
- Configure RevenueCat webhooks:
  - endpoint URL: `POST /webhooks/revenuecat`
  - configure a fixed Authorization header value and set it in your runtime environment:
    - `REVENUECAT_WEBHOOK_AUTH` (exact match to the Authorization header that RevenueCat will send)
- Server-side RevenueCat API access:
  - set `REVENUECAT_SECRET_KEY` (RevenueCat secret key) for calling their API from Fastify
  - implement Stripe→RevenueCat linking in the Stripe webhook handler:
    - `POST /v1/receipts` with `X-Platform: stripe`, `fetch_token=sub_...`, `app_user_id=user_id`

### Native TODOs

- Configure RevenueCat SDK in native and call `Purchases.logIn(userId)` after `POST /auth/login/native`.
- Implement “Restore purchases (v1)” UX from this doc (workspace picker + intent + restore + confirm).

---

## Appendix: Tier mapping checklist

For each tier:
- Stripe price id(s): `price_...`
- iOS product id(s): `com.yourapp.tier.pro.monthly`
- Android product id(s): `tier_pro_monthly`
- RevenueCat entitlement: `tier_pro`
- RevenueCat entitlement: `tier_pro_plus`

Ensure:
- exactly one “tier entitlement” is active per workspace at a time (or compute “highest tier wins”).
