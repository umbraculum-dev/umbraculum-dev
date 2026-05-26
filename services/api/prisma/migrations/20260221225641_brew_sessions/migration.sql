-- CreateEnum
CREATE TYPE "brew_session_status" AS ENUM ('draft', 'running', 'paused', 'stopped');

-- CreateEnum
CREATE TYPE "brew_session_step_status" AS ENUM ('pending', 'done', 'skipped', 'not_applicable');

-- CreateEnum
CREATE TYPE "brew_session_step_timer_state" AS ENUM ('idle', 'running', 'paused', 'stopped');

-- CreateEnum
CREATE TYPE "brew_session_log_kind" AS ENUM ('session_created', 'session_started', 'session_paused', 'session_stopped', 'steps_saved', 'step_status_saved', 'step_timer_started', 'step_timer_paused', 'step_timer_stopped');

-- AlterTable
ALTER TABLE "equipment_profiles" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "brew_sessions" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "brew_session_status" NOT NULL DEFAULT 'draft',
    "started_at" TIMESTAMP(3),
    "paused_at" TIMESTAMP(3),
    "stopped_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brew_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brew_session_steps" (
    "id" TEXT NOT NULL,
    "brew_session_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "section_name" TEXT,
    "name" TEXT NOT NULL,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL,
    "minutes_planned" INTEGER,
    "status" "brew_session_step_status" NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "timer_state" "brew_session_step_timer_state" NOT NULL DEFAULT 'idle',
    "timer_started_at" TIMESTAMP(3),
    "timer_last_started_at" TIMESTAMP(3),
    "timer_paused_at" TIMESTAMP(3),
    "timer_stopped_at" TIMESTAMP(3),
    "timer_accumulated_seconds" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brew_session_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brew_session_logs" (
    "id" TEXT NOT NULL,
    "brew_session_id" TEXT NOT NULL,
    "step_id" TEXT,
    "kind" "brew_session_log_kind" NOT NULL,
    "message" TEXT NOT NULL,
    "payload_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brew_session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brew_sessions_account_id_idx" ON "brew_sessions"("account_id");

-- CreateIndex
CREATE INDEX "brew_sessions_recipe_id_idx" ON "brew_sessions"("recipe_id");

-- CreateIndex
CREATE INDEX "brew_sessions_account_id_recipe_id_idx" ON "brew_sessions"("account_id", "recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "brew_sessions_account_id_code_key" ON "brew_sessions"("account_id", "code");

-- CreateIndex
CREATE INDEX "brew_session_steps_brew_session_id_idx" ON "brew_session_steps"("brew_session_id");

-- CreateIndex
CREATE INDEX "brew_session_steps_brew_session_id_sort_order_idx" ON "brew_session_steps"("brew_session_id", "sort_order");

-- CreateIndex
CREATE INDEX "brew_session_steps_section_id_idx" ON "brew_session_steps"("section_id");

-- CreateIndex
CREATE INDEX "brew_session_logs_brew_session_id_idx" ON "brew_session_logs"("brew_session_id");

-- CreateIndex
CREATE INDEX "brew_session_logs_step_id_idx" ON "brew_session_logs"("step_id");

-- CreateIndex
CREATE INDEX "brew_session_logs_brew_session_id_created_at_idx" ON "brew_session_logs"("brew_session_id", "created_at");

-- AddForeignKey
ALTER TABLE "brew_sessions" ADD CONSTRAINT "brew_sessions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brew_sessions" ADD CONSTRAINT "brew_sessions_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brew_session_steps" ADD CONSTRAINT "brew_session_steps_brew_session_id_fkey" FOREIGN KEY ("brew_session_id") REFERENCES "brew_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brew_session_logs" ADD CONSTRAINT "brew_session_logs_brew_session_id_fkey" FOREIGN KEY ("brew_session_id") REFERENCES "brew_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brew_session_logs" ADD CONSTRAINT "brew_session_logs_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "brew_session_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
