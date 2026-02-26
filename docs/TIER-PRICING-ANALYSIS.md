# Tier Pricing Analysis for Brewery App

**Status:** Draft (pre-development)  
**Purpose:** Base document for current and future analysis; to be discussed before implementation.

---

## Current State

### Data model
- **Workspace** = tenant (replaces "Account" in older docs).
- **Recipe**: `workspaceId`, `versionGroupId`, `version` (0–99).
- **Recipe count**: distinct `versionGroupId` per workspace (one "recipe" = one version group).
- **Version count**: versions per `versionGroupId` (0–99).

### Auth
- `requireActiveWorkspace(req)` → `{ userId, activeWorkspaceId }`.
- All recipe endpoints use `workspaceId`; membership checked via `WorkspacesService.assertMembership()`.

### Existing limits
- **Version limit**: hardcoded 99 in `createRecipeVersionFromCurrent` (`recipesService.ts` lines 117–122).
- **Recipe limit**: none.
- **Billing**: Stripe planned; no billing models in current Prisma schema.

### Architecture docs (Rev00/Rev01)
- `Subscription` (userId, provider, planCode, stripeCustomerId, stripeSubscriptionId, status).
- `Entitlement` (userId, planCode, features Json, limits Json, validUntil).
- `StripeEvent` (idempotent webhook storage).
- Phase 7: "Feature gating and plan limits (API enforced; UI mirrored)".

---

## 1. Billing Scope: User vs Workspace

**Recommendation: workspace-scoped billing**

- Workspace = brewery/team.
- One subscription per workspace.
- All members share the same limits.

**Alternative: user-scoped**

- Each user has their own tier.
- Limits apply per user across workspaces they belong to.
- More complex and less common for team products.

---

## 2. Data Model

### Option A: Entitlement on Workspace (recommended)

```prisma
model Workspace {
  // ... existing
  entitlement Entitlement?
}

model Entitlement {
  id           String   @id @default(uuid())
  workspaceId  String   @unique @map("workspace_id")
  planCode     String   @map("plan_code")   // "free" | "pro" | "premium"
  maxRecipes   Int      @map("max_recipes")
  maxVersions  Int      @map("max_versions")
  validUntil   DateTime? @map("valid_until")
  updatedAt    DateTime @updatedAt @map("updated_at")
  createdAt    DateTime @default(now()) @map("created_at")

  workspace    Workspace @relation(...)
}
```

- One row per workspace.
- `planCode` + `maxRecipes` + `maxVersions` define the tier.
- `validUntil` for trials or grace periods.

### Option B: Plan config + workspace reference

```prisma
model Plan {
  code        String   @id  // "free", "pro", "premium"
  maxRecipes  Int
  maxVersions Int
  priceCents  Int?
}

model WorkspaceEntitlement {
  workspaceId  String
  planCode     String
  stripeCustomerId String?
  stripeSubscriptionId String?
  currentPeriodEnd DateTime?
  // ...
}
```

- Central plan definitions.
- Workspace links to plan and Stripe IDs.

### History / past tiers

- Store `Subscription` (or `WorkspaceSubscription`) with `planCode`, `status`, `currentPeriodEnd`, `stripeSubscriptionId`.
- Keep `Entitlement` as current effective tier.
- History = `Subscription` rows (or audit log) for past plans and status changes.

---

## 3. Enforcement Points (ACL / limits)

### API layer

1. **Recipe creation** (`POST /recipes`, `duplicateRecipe`):
   - Count distinct `versionGroupId` for workspace.
   - Compare to `entitlement.maxRecipes`.
   - Reject with `403` / `plan_limit_exceeded` if over.

2. **Version creation** (`createRecipeVersionFromCurrent`):
   - Count versions for the `versionGroupId`.
   - Compare to `entitlement.maxVersions`.
   - Reject if over (replace hardcoded 99).

3. **Reads** (list, get):
   - No change; existing workspace scoping is enough.

### Service pattern

```ts
// EntitlementsService
async assertRecipeLimit(workspaceId: string): Promise<void> {
  const ent = await this.getEntitlement(workspaceId);
  const count = await this.prisma.recipe.groupBy({
    by: ["versionGroupId"],
    where: { workspaceId },
  });
  if (count.length >= ent.maxRecipes) {
    throw new ForbiddenError("plan_limit_recipes", "Recipe limit reached. Upgrade to add more.");
  }
}

async assertVersionLimit(workspaceId: string, versionGroupId: string): Promise<void> {
  const ent = await this.getEntitlement(workspaceId);
  const agg = await this.prisma.recipe.aggregate({
    where: { workspaceId, versionGroupId },
    _count: true,
  });
  if (agg._count >= ent.maxVersions) {
    throw new ForbiddenError("plan_limit_versions", "Version limit reached. Upgrade for more.");
  }
}
```

- Call `assertRecipeLimit` before create/duplicate.
- Call `assertVersionLimit` before create version.

---

## 4. Entitlement Resolution

- **Default**: new workspace → `planCode: "free"`, `maxRecipes: 5`, `maxVersions: 2`.
- **After Stripe**: webhook updates `Entitlement` (and optionally `Subscription`) when subscription changes.
- **Caching**: entitlements change rarely; cache per workspace (e.g. Redis or in-memory) with short TTL.

---

## 5. Stripe Integration

### Checkout

- `POST /api/billing/checkout` (or similar):
  - Input: `planCode`, `successUrl`, `cancelUrl`.
  - Create/retrieve Stripe Customer for workspace.
  - Create Checkout Session for subscription.
  - Return `{ url }` for redirect.

### Webhooks

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid` / `invoice.payment_failed` (optional)

Flow:

1. Store event in `StripeEvent` (idempotent by event id).
2. Map Stripe Price/Product → `planCode`.
3. Update `Entitlement` (and `Subscription`) for the workspace.
4. Downgrade: set new limits; do not delete data; enforce limits on new actions.

---

## 6. Client (Web + Native)

### Fetching limits

- `GET /api/workspaces/:id` or `GET /api/me` (or `/api/entitlements`) returns:

```json
{
  "entitlement": {
    "planCode": "free",
    "maxRecipes": 5,
    "maxVersions": 2,
    "recipeCount": 3,
    "canCreateRecipe": true,
    "canCreateVersion": true
  }
}
```

- Or a dedicated `GET /api/entitlements` that returns this for the active workspace.

### UI behavior

- **Create recipe**: disable or hide button when `!canCreateRecipe`; show upgrade CTA.
- **Create version**: same when `!canCreateVersion`.
- **Upgrade CTA**: link to billing/checkout.
- **Recipe list**: show "3/5 recipes" (or similar) for free tier.

### Shared logic

- Put entitlement types and helpers in `packages/contracts` or `packages/api-client`.
- Web and native both call the same API and use the same response shape.

---

## 7. Implementation Order

1. **Schema**: add `Entitlement` (and optionally `Subscription`) to Prisma; migration.
2. **Seed**: create default free entitlements for existing workspaces.
3. **EntitlementsService**: `getEntitlement`, `assertRecipeLimit`, `assertVersionLimit`.
4. **RecipesService**: call asserts before create/duplicate and before create version.
5. **API**: `GET /api/entitlements` (or extend workspace/me).
6. **Stripe**: Products/Prices, Checkout, webhook handler, entitlement updates.
7. **Clients**: entitlement fetching, UI gating, upgrade CTA.

---

## 8. Files to Touch

| Area        | Files |
|-------------|-------|
| Schema     | `services/api/prisma/schema.prisma` |
| Entitlements | New `services/api/src/services/entitlementsService.ts` |
| Recipes    | `services/api/src/services/recipesService.ts` (add asserts) |
| Routes     | New `services/api/src/routes/billing.ts`, extend workspace/me if needed |
| Web        | Recipe list, create buttons, upgrade modal/page |
| Native     | Same pattern in recipe screens |
| Shared     | `packages/contracts` or `packages/api-client` for entitlement types |

---

## 9. Auth vs ACL

- **Auth**: already enforced via `requireActiveWorkspace` and session.
- **ACL**: workspace membership + role (e.g. `brewery_admin` can manage billing).
- **Tier limits**: additional checks on top of auth; enforced in service layer before any write.

---

## 10. Downgrade Behavior

- **Over limit**: allow reads; block new recipes/versions until upgrade or deletion.
- **Grace period**: optional `validUntil` for temporary access after failed payment.
- **Data**: never delete recipes/versions automatically; only enforce limits on new actions.

---

## Tier Model (reference)

| Tier   | Price | Recipes | Versions/recipe |
|--------|-------|---------|-----------------|
| Free   | $0    | 5       | 2               |
| Pro    | $20   | 99      | 5               |
| Premium| $60   | 1000    | 99              |
