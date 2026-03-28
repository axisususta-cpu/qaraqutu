-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nameOrOrg" TEXT NOT NULL,
    "requestedSurface" TEXT NOT NULL,
    "optionalReason" TEXT,
    "requestedRole" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requesterIp" TEXT,
    "requesterUserAgent" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "deniedAt" TIMESTAMP(3),
    "deniedBy" TEXT,
    "deniedReason" TEXT,

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemporaryAccessCredential" (
    "id" TEXT NOT NULL,
    "requestId" TEXT,
    "email" TEXT NOT NULL,
    "nameOrOrg" TEXT,
    "role" TEXT NOT NULL,
    "requestedSurface" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordSalt" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedFromIp" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,

    CONSTRAINT "TemporaryAccessCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccessRequest_status_requestedAt_idx" ON "AccessRequest"("status", "requestedAt");

-- CreateIndex
CREATE INDEX "AccessRequest_email_requestedAt_idx" ON "AccessRequest"("email", "requestedAt");

-- CreateIndex
CREATE INDEX "TemporaryAccessCredential_email_issuedAt_idx" ON "TemporaryAccessCredential"("email", "issuedAt");

-- CreateIndex
CREATE INDEX "TemporaryAccessCredential_expiresAt_idx" ON "TemporaryAccessCredential"("expiresAt");

-- AddForeignKey
ALTER TABLE "TemporaryAccessCredential" ADD CONSTRAINT "TemporaryAccessCredential_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "AccessRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
