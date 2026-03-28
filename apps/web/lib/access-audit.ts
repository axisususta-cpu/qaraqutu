import { accessPrisma } from "./access-db";

type AccessAuditInput = {
  email?: string | null;
  role?: string | null;
  requestedNext?: string | null;
  result: "requested" | "sent" | "verified" | "failed" | "expired" | "rejected";
  reason?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  sessionId?: string | null;
  createdAt?: Date;
  expiresAt?: Date | null;
  verifiedAt?: Date | null;
};

export async function writeAccessAudit(input: AccessAuditInput): Promise<void> {
  const payload = {
    email: input.email ?? null,
    role: input.role ?? null,
    requestedNext: input.requestedNext ?? null,
    result: input.result,
    reason: input.reason ?? null,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
    sessionId: input.sessionId ?? null,
    createdAt: input.createdAt ?? new Date(),
    expiresAt: input.expiresAt ?? null,
    verifiedAt: input.verifiedAt ?? null,
  };

  await accessPrisma.accessAuditLog.create({ data: payload });
}
