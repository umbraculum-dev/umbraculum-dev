-- AlterTable
ALTER TABLE "brew_session_steps" ADD COLUMN     "offset_minutes_from_end" INTEGER,
ADD COLUMN     "relative_to_step_id" TEXT;

-- CreateIndex
CREATE INDEX "brew_session_steps_relative_to_step_id_idx" ON "brew_session_steps"("relative_to_step_id");

-- AddForeignKey
ALTER TABLE "brew_session_steps" ADD CONSTRAINT "brew_session_steps_relative_to_step_id_fkey" FOREIGN KEY ("relative_to_step_id") REFERENCES "brew_session_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
