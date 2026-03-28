-- CreateTable
CREATE TABLE "AccessMagicLinkToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "requestedNext" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessMagicLinkToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessSession" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "subject" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessAuditLog" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT,
    "requestedNext" TEXT,
    "result" TEXT NOT NULL,
    "reason" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "AccessAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessMagicLinkToken_tokenHash_key" ON "AccessMagicLinkToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AccessMagicLinkToken_email_createdAt_idx" ON "AccessMagicLinkToken"("email", "createdAt");

-- CreateIndex
CREATE INDEX "AccessMagicLinkToken_expiresAt_idx" ON "AccessMagicLinkToken"("expiresAt");

-- CreateIndex
CREATE INDEX "AccessSession_email_createdAt_idx" ON "AccessSession"("email", "createdAt");

-- CreateIndex
CREATE INDEX "AccessSession_expiresAt_idx" ON "AccessSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AccessAuditLog_createdAt_idx" ON "AccessAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AccessAuditLog_email_createdAt_idx" ON "AccessAuditLog"("email", "createdAt");

-- CreateIndex
CREATE INDEX "AccessAuditLog_result_createdAt_idx" ON "AccessAuditLog"("result", "createdAt");
