-- CreateTable
CREATE TABLE "ConnectedDevicePilotShell" (
    "id" TEXT NOT NULL,
    "singletonKey" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "system" TEXT NOT NULL,
    "incidentClass" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "manifestId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL,
    "sourceLane" TEXT NOT NULL,
    "contractVersion" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectedDevicePilotShell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedDevicePilotShell_singletonKey_key" ON "ConnectedDevicePilotShell"("singletonKey");

-- CreateIndex
CREATE INDEX "ConnectedDevicePilotShell_acceptedAt_idx" ON "ConnectedDevicePilotShell"("acceptedAt");
