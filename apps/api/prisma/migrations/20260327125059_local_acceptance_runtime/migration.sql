-- AlterTable
ALTER TABLE "SmokeCheck" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "SmokeCheck_smokeRunId_createdAt_idx" ON "SmokeCheck"("smokeRunId", "createdAt");

-- CreateIndex
CREATE INDEX "SmokeCheck_checkName_category_result_createdAt_idx" ON "SmokeCheck"("checkName", "category", "result", "createdAt");

-- CreateIndex
CREATE INDEX "SmokeRun_startedAt_idx" ON "SmokeRun"("startedAt");

-- CreateIndex
CREATE INDEX "SmokeRun_overallResult_startedAt_idx" ON "SmokeRun"("overallResult", "startedAt");
