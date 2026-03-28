-- Isolated bounded shell storage for uploaded_package lane.
CREATE TABLE "UploadedPackageShell" (
  "id" TEXT NOT NULL,
  "singletonKey" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "uploadedAt" TIMESTAMP(3) NOT NULL,
  "system" TEXT NOT NULL,
  "incidentClass" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "bundleId" TEXT NOT NULL,
  "manifestId" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "packageName" TEXT NOT NULL,
  "packageSha256" TEXT NOT NULL,
  "packageSizeBytes" BIGINT NOT NULL,
  "acceptedAt" TIMESTAMP(3) NOT NULL,
  "sourceLane" TEXT NOT NULL,
  "contractVersion" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UploadedPackageShell_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UploadedPackageShell_singletonKey_key" ON "UploadedPackageShell"("singletonKey");
CREATE INDEX "UploadedPackageShell_acceptedAt_idx" ON "UploadedPackageShell"("acceptedAt");
