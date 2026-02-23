-- CreateEnum
CREATE TYPE "inventory_category" AS ENUM ('fermentable', 'hop', 'speciality', 'acid_salt', 'detergent_sanitizer', 'kegging');

-- CreateEnum
CREATE TYPE "inventory_unit" AS ENUM ('kg', 'g', 'ml', 'count');

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "category" "inventory_category" NOT NULL,
    "ingredient_id" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "inventory_unit" NOT NULL DEFAULT 'kg',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_items_account_id_idx" ON "inventory_items"("account_id");

-- CreateIndex
CREATE INDEX "inventory_items_account_id_category_idx" ON "inventory_items"("account_id", "category");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
