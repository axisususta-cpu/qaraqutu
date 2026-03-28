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
  const acceptancePreviewAllowlist = (process.env.ACCESS_ACCEPTANCE_PREVIEW_ALLOWLIST ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const acceptancePreviewEnabled =
    (process.env.ACCESS_ACCEPTANCE_PREVIEW_ENABLED ?? "").toLowerCase() === "true";
  const providerConfigured =
    (process.env.RESEND_API_KEY?.trim().length ?? 0) > 0 &&
    (process.env.ACCESS_EMAIL_FROM?.trim().length ?? 0) > 0;

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
    email_delivery_mode: providerConfigured
      ? "provider"
      : acceptancePreviewEnabled && acceptancePreviewAllowlist.length > 0
      ? "allowlist_preview_only"
      : "unconfigured",
    acceptance_preview_enabled: acceptancePreviewEnabled,
    acceptance_preview_allowlist_count: acceptancePreviewAllowlist.length,
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