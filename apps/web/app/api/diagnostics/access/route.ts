import { NextResponse } from "next/server";
import { accessPrisma } from "../../../../lib/access-db";

export const runtime = "nodejs";

function maskEmail(email: string): string {
  const [localPart, domainPart] = email.split("@");
  if (!localPart || !domainPart) {
    return "redacted";
  }

  const visibleLocal = localPart.slice(0, 2);
  return `${visibleLocal}***@${domainPart}`;
}

function sessionLabel(sessionId: string | null): string | null {
  if (!sessionId) {
    return null;
  }

  if (sessionId.length <= 10) {
    return sessionId;
  }

  return `${sessionId.slice(0, 6)}...${sessionId.slice(-4)}`;
}

export async function GET() {
  const pendingRequestCount = await accessPrisma.accessRequest.count({ where: { status: "pending" } });
  const activeCredentialCount = await accessPrisma.temporaryAccessCredential.count({
    where: {
      revokedAt: null,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  const recent = await accessPrisma.accessAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      email: true,
      role: true,
      requestedNext: true,
      result: true,
      reason: true,
      sessionId: true,
      createdAt: true,
      expiresAt: true,
      verifiedAt: true,
    },
  });

  return NextResponse.json({
    email_delivery_mode: "manual_temporary_owner_issued",
    acceptance_preview_enabled: false,
    acceptance_preview_allowlist_count: 0,
    pending_request_count: pendingRequestCount,
    active_credential_count: activeCredentialCount,
    recent_access: recent.map((entry: (typeof recent)[number]) => ({
      email: entry.email ? maskEmail(entry.email) : null,
      role: entry.role,
      requested_next: entry.requestedNext,
      result: entry.result,
      reason: entry.reason,
      session_id: sessionLabel(entry.sessionId),
      created_at: entry.createdAt.toISOString(),
      expires_at: entry.expiresAt?.toISOString() ?? null,
      verified_at: entry.verifiedAt?.toISOString() ?? null,
    })),
  });
}