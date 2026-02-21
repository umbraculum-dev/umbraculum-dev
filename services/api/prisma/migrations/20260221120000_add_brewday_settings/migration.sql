-- CreateTable
CREATE TABLE "brewday_settings" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "brewing_type" TEXT NOT NULL DEFAULT 'all_grain',
    "sections_json" JSONB NOT NULL,
    "custom_sections_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brewday_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brewday_settings_account_id_key" ON "brewday_settings"("account_id");

-- CreateIndex
CREATE INDEX "brewday_settings_account_id_idx" ON "brewday_settings"("account_id");

-- AddForeignKey
ALTER TABLE "brewday_settings" ADD CONSTRAINT "brewday_settings_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
