import { NextRequest, NextResponse } from "next/server";
import { accessPrisma } from "../../../../lib/access-db";
import { getRequestIp, getUserAgent, isValidEmail, normalizeEmail, safeNext } from "../../../../lib/access-auth";
import { defaultTrustedRole } from "../../../../lib/trusted-access";
import { writeAccessAudit } from "../../../../lib/access-audit";

export const runtime = "nodejs";

function normalizeNameOrOrg(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function normalizeOptionalReason(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }

  const normalized = raw.trim();
  return normalized.length ? normalized : null;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { email?: unknown; requested_surface?: unknown; optional_reason?: unknown; name_or_org?: unknown; next?: unknown }
    | null;

  const email = normalizeEmail(body?.email);
  const requestedNext = safeNext(body?.requested_surface ?? body?.next);
  const normalizedSurface = requestedNext === "/" ? "/verifier" : requestedNext;
  const nameOrOrg = normalizeNameOrOrg(body?.name_or_org);
  const optionalReason = normalizeOptionalReason(body?.optional_reason);
  const role = defaultTrustedRole();
  const ip = getRequestIp(req);
  const userAgent = getUserAgent(req);

  if (!isValidEmail(email)) {
    await writeAccessAudit({
      email: email || null,
      role,
      requestedNext,
      result: "rejected",
      reason: "invalid_email",
      ip,
      userAgent,
    });
    return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
  }

  if (nameOrOrg.length < 2 || nameOrOrg.length > 160) {
    await writeAccessAudit({
      email,
      role,
      requestedNext: normalizedSurface,
      result: "rejected",
      reason: "invalid_name_or_org",
      ip,
      userAgent,
    });
    return NextResponse.json({ error: "INVALID_NAME_OR_ORG" }, { status: 400 });
  }

  if (optionalReason && optionalReason.length > 500) {
    await writeAccessAudit({
      email,
      role,
      requestedNext: normalizedSurface,
      result: "rejected",
      reason: "optional_reason_too_long",
      ip,
      userAgent,
    });
    return NextResponse.json({ error: "OPTIONAL_REASON_TOO_LONG" }, { status: 400 });
  }

  const recentRequestCount = await accessPrisma.accessAuditLog.count({
    where: {
      ip,
      reason: "manual_request_received",
      createdAt: { gte: new Date(Date.now() - 5 * 60_000) },
    },
  });

  if (recentRequestCount >= 5) {
    await writeAccessAudit({
      email,
      role,
      requestedNext: normalizedSurface,
      result: "failed",
      reason: "manual_request_rate_limited",
      ip,
      userAgent,
    });
    return NextResponse.json({ error: "RATE_LIMITED", reason: "manual_request_rate_limited" }, { status: 429 });
  }

  const requestRecord = await accessPrisma.accessRequest.create({
    data: {
      email,
      nameOrOrg,
      requestedSurface: normalizedSurface,
      optionalReason,
      requestedRole: role,
      requesterIp: ip,
      requesterUserAgent: userAgent,
    },
  });

  await writeAccessAudit({
    email,
    role,
    requestedNext: normalizedSurface,
    result: "requested",
    reason: "manual_request_received",
    ip,
    userAgent,
  });

  return NextResponse.json({
    ok: true,
    mode: "pending_review",
    request_id: requestRecord.id,
    requested_surface: normalizedSurface,
    status: "pending",
  });
}
