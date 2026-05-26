-- CreateTable
CREATE TABLE "webview_exchange_codes" (
    "id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "active_workspace_id" TEXT,
    "requested_next_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "webview_exchange_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webview_exchange_codes_code_hash_key" ON "webview_exchange_codes"("code_hash");

-- CreateIndex
CREATE INDEX "webview_exchange_codes_session_id_idx" ON "webview_exchange_codes"("session_id");

-- CreateIndex
CREATE INDEX "webview_exchange_codes_user_id_idx" ON "webview_exchange_codes"("user_id");

-- CreateIndex
CREATE INDEX "webview_exchange_codes_expires_at_idx" ON "webview_exchange_codes"("expires_at");

-- CreateIndex
CREATE INDEX "webview_exchange_codes_used_at_idx" ON "webview_exchange_codes"("used_at");

-- AddForeignKey
ALTER TABLE "webview_exchange_codes" ADD CONSTRAINT "webview_exchange_codes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webview_exchange_codes" ADD CONSTRAINT "webview_exchange_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

