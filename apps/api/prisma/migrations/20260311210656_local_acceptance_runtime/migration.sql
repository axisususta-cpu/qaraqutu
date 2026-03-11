-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "manifestId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "eventClass" TEXT NOT NULL,
    "scenarioKey" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "verificationState" TEXT NOT NULL,
    "vehicleVin" TEXT,
    "fleetId" TEXT,
    "policyOrClaimRef" TEXT,
    "incidentLocation" TEXT,
    "recordedEvidence" JSONB,
    "derivedEvidence" JSONB,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manifest" (
    "id" TEXT NOT NULL,
    "manifestId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,

    CONSTRAINT "Manifest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Export" (
    "id" TEXT NOT NULL,
    "exportId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "manifestId" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "verificationState" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedEvidenceSnapshot" JSONB,
    "derivedEvidenceSnapshot" JSONB,
    "redactionApplied" BOOLEAN NOT NULL DEFAULT false,
    "redactedItemCount" INTEGER,
    "redactionBasis" TEXT,
    "policySnapshot" JSONB,

    CONSTRAINT "Export_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "exportId" TEXT,
    "actionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRun" (
    "id" TEXT NOT NULL,
    "verificationRunId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "manifestId" TEXT NOT NULL,
    "verificationState" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationTranscript" (
    "id" TEXT NOT NULL,
    "transcriptId" TEXT NOT NULL,
    "verificationRunId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationTranscript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationTranscriptStep" (
    "id" TEXT NOT NULL,
    "transcriptId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "check" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "VerificationTranscriptStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmokeRun" (
    "id" TEXT NOT NULL,
    "smokeRunId" TEXT NOT NULL,
    "overallResult" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "environment" TEXT NOT NULL,
    "datasetVersion" TEXT NOT NULL,
    "buildVersion" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,

    CONSTRAINT "SmokeRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmokeCheck" (
    "id" TEXT NOT NULL,
    "smokeRunId" TEXT NOT NULL,
    "checkName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "detail" TEXT,

    CONSTRAINT "SmokeCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantPolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enabledExportProfiles" TEXT[],
    "enabledVisibilityClasses" TEXT[],
    "redactionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventId_key" ON "Event"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_bundleId_key" ON "Bundle"("bundleId");

-- CreateIndex
CREATE UNIQUE INDEX "Manifest_manifestId_key" ON "Manifest"("manifestId");

-- CreateIndex
CREATE UNIQUE INDEX "Export_exportId_key" ON "Export"("exportId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptId_key" ON "Receipt"("receiptId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_exportId_key" ON "Receipt"("exportId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRun_verificationRunId_key" ON "VerificationRun"("verificationRunId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationTranscript_transcriptId_key" ON "VerificationTranscript"("transcriptId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationTranscript_verificationRunId_key" ON "VerificationTranscript"("verificationRunId");

-- CreateIndex
CREATE UNIQUE INDEX "SmokeRun_smokeRunId_key" ON "SmokeRun"("smokeRunId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPolicy_tenantId_key" ON "TenantPolicy"("tenantId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manifest" ADD CONSTRAINT "Manifest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manifest" ADD CONSTRAINT "Manifest_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_exportId_fkey" FOREIGN KEY ("exportId") REFERENCES "Export"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRun" ADD CONSTRAINT "VerificationRun_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationTranscript" ADD CONSTRAINT "VerificationTranscript_verificationRunId_fkey" FOREIGN KEY ("verificationRunId") REFERENCES "VerificationRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationTranscriptStep" ADD CONSTRAINT "VerificationTranscriptStep_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "VerificationTranscript"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmokeCheck" ADD CONSTRAINT "SmokeCheck_smokeRunId_fkey" FOREIGN KEY ("smokeRunId") REFERENCES "SmokeRun"("smokeRunId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPolicy" ADD CONSTRAINT "TenantPolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
