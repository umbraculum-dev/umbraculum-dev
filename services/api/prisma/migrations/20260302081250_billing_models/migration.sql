-- CreateEnum
CREATE TYPE "billing_tier" AS ENUM ('free', 'premium', 'pro', 'pro_plus');

-- CreateEnum
CREATE TYPE "billing_source" AS ENUM ('stripe', 'apple', 'google', 'manual');

-- CreateEnum
CREATE TYPE "billing_purchase_provider" AS ENUM ('stripe', 'apple', 'google');

-- CreateEnum
CREATE TYPE "billing_purchase_intent_status" AS ENUM ('created', 'fulfilled', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "billing_event_provider" AS ENUM ('stripe', 'revenuecat');

-- CreateTable
CREATE TABLE "workspace_billing" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "tier" "billing_tier" NOT NULL DEFAULT 'free',
    "expires_at" TIMESTAMP(3),
    "source" "billing_source" NOT NULL DEFAULT 'manual',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "rc_app_user_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_purchase_intents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "plan_code" TEXT NOT NULL,
    "provider" "billing_purchase_provider" NOT NULL,
    "status" "billing_purchase_intent_status" NOT NULL DEFAULT 'created',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "stripe_checkout_session_id" TEXT,
    "stripe_subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilled_at" TIMESTAMP(3),

    CONSTRAINT "billing_purchase_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_user_workspace_binding" (
    "user_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "provider" "billing_purchase_provider",
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_user_workspace_binding_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "billing_events" (
    "id" TEXT NOT NULL,
    "provider" "billing_event_provider" NOT NULL,
    "external_event_id" TEXT,
    "user_id" TEXT,
    "workspace_id" TEXT,
    "payload_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_billing_workspace_id_key" ON "workspace_billing"("workspace_id");

-- CreateIndex
CREATE INDEX "workspace_billing_workspace_id_idx" ON "workspace_billing"("workspace_id");

-- CreateIndex
CREATE INDEX "workspace_billing_stripe_subscription_id_idx" ON "workspace_billing"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "billing_purchase_intents_user_id_idx" ON "billing_purchase_intents"("user_id");

-- CreateIndex
CREATE INDEX "billing_purchase_intents_workspace_id_idx" ON "billing_purchase_intents"("workspace_id");

-- CreateIndex
CREATE INDEX "billing_purchase_intents_status_idx" ON "billing_purchase_intents"("status");

-- CreateIndex
CREATE INDEX "billing_purchase_intents_expires_at_idx" ON "billing_purchase_intents"("expires_at");

-- CreateIndex
CREATE INDEX "billing_purchase_intents_user_id_workspace_id_idx" ON "billing_purchase_intents"("user_id", "workspace_id");

-- CreateIndex
CREATE INDEX "billing_user_workspace_binding_workspace_id_idx" ON "billing_user_workspace_binding"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_events_external_event_id_key" ON "billing_events"("external_event_id");

-- CreateIndex
CREATE INDEX "billing_events_provider_idx" ON "billing_events"("provider");

-- CreateIndex
CREATE INDEX "billing_events_user_id_idx" ON "billing_events"("user_id");

-- CreateIndex
CREATE INDEX "billing_events_workspace_id_idx" ON "billing_events"("workspace_id");

-- AddForeignKey
ALTER TABLE "workspace_billing" ADD CONSTRAINT "workspace_billing_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_purchase_intents" ADD CONSTRAINT "billing_purchase_intents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_purchase_intents" ADD CONSTRAINT "billing_purchase_intents_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_user_workspace_binding" ADD CONSTRAINT "billing_user_workspace_binding_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_user_workspace_binding" ADD CONSTRAINT "billing_user_workspace_binding_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
