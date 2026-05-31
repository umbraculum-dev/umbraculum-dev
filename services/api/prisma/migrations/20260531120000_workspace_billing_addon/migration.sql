-- RFC-0009 thin slice (F-mod Phase 3): workspace add-on entitlement rows.
CREATE TYPE "platform"."workspace_billing_addon_status" AS ENUM ('active', 'canceled', 'past_due');

CREATE TABLE "platform"."workspace_billing_addons" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "addon_code" TEXT NOT NULL,
    "status" "platform"."workspace_billing_addon_status" NOT NULL DEFAULT 'active',
    "period_start" TIMESTAMP(3),
    "period_end" TIMESTAMP(3),
    "monthly_allowance" JSONB,
    "stripe_subscription_item_id" TEXT,
    "revenue_cat_entitlement_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_billing_addons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workspace_billing_addons_workspace_id_addon_code_key"
  ON "platform"."workspace_billing_addons"("workspace_id", "addon_code");

CREATE INDEX "workspace_billing_addons_workspace_id_idx"
  ON "platform"."workspace_billing_addons"("workspace_id");

CREATE INDEX "workspace_billing_addons_addon_code_idx"
  ON "platform"."workspace_billing_addons"("addon_code");

ALTER TABLE "platform"."workspace_billing_addons"
  ADD CONSTRAINT "workspace_billing_addons_workspace_id_fkey"
  FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
