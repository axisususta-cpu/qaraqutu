import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_SESSION_COOKIE,
  getRequestIp,
  getUserAgent,
  isValidEmail,
  normalizeEmail,
  safeNext,
  signSessionToken,
} from "../../../../lib/access-auth";
import { accessPrisma } from "../../../../lib/access-db";
import { TEMPORARY_ACCESS_TTL_MINUTES, verifyTemporaryPassword } from "../../../../lib/access-temporary";
import { writeAccessAudit } from "../../../../lib/access-audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { email?: unknown; password?: unknown; next?: unknown }
    | null;

  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";
  const next = safeNext(body?.next);
  const ip = getRequestIp(req);
  const userAgent = getUserAgent(req);

  if (!isValidEmail(email) || password.trim().length < 8) {
    await writeAccessAudit({
      email: email || null,
      requestedNext: next,
      result: "failed",
      reason: "temporary_login_invalid_input",
      ip,
      userAgent,
    });
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 400 });
  }

  const recentFailures = await accessPrisma.accessAuditLog.count({
    where: {
      ip,
      result: "failed",
      reason: { in: ["temporary_login_invalid_password", "temporary_login_missing_credential", "temporary_login_expired"] },
      createdAt: { gte: new Date(Date.now() - 5 * 60_000) },
    },
  });

  if (recentFailures >= 10) {
    await writeAccessAudit({
      email,
      requestedNext: next,
      result: "failed",
      reason: "temporary_login_rate_limited",
      ip,
      userAgent,
    });
    return NextResponse.json({ error: "RATE_LIMITED", reason: "temporary_login_rate_limited" }, { status: 429 });
  }

  const credential = await accessPrisma.temporaryAccessCredential.findFirst({
    where: {
      email,
      revokedAt: null,
      usedAt: null,
    },
    orderBy: { issuedAt: "desc" },
  });

  if (!credential) {
    const latestRequest = await accessPrisma.accessRequest.findFirst({
      where: { email },
      orderBy: { requestedAt: "desc" },
      select: { status: true, requestedRole: true, requestedSurface: true, deniedAt: true },
    });

    const denialReason = latestRequest?.status === "denied" ? "temporary_login_denied" : "temporary_login_missing_credential";
    await writeAccessAudit({
      email,
      role: latestRequest?.requestedRole ?? null,
      requestedNext: latestRequest?.requestedSurface ?? next,
      result: "failed",
      reason: denialReason,
      ip,
      userAgent,
    });
    return NextResponse.json(
      {
        error: latestRequest?.status === "denied" ? "ACCESS_DENIED" : "ACCESS_PENDING_REVIEW",
        reason: denialReason,
        denied_at: latestRequest?.deniedAt?.toISOString() ?? null,
      },
      { status: 401 }
    );
  }

  if (credential.expiresAt.getTime() <= Date.now()) {
    await writeAccessAudit({
      email,
      role: credential.role,
      requestedNext: credential.requestedSurface,
      result: "expired",
      reason: "temporary_login_expired",
      ip,
      userAgent,
      expiresAt: credential.expiresAt,
    });
    return NextResponse.json({ error: "ACCESS_EXPIRED", reason: "temporary_login_expired" }, { status: 401 });
  }

  if (!verifyTemporaryPassword(password, credential.passwordSalt, credential.passwordHash)) {
    await writeAccessAudit({
      email,
      role: credential.role,
      requestedNext: credential.requestedSurface,
      result: "failed",
      reason: "temporary_login_invalid_password",
      ip,
      userAgent,
    });
    return NextResponse.json({ error: "INVALID_CREDENTIALS", reason: "temporary_login_invalid_password" }, { status: 401 });
  }

  const sessionExpiresAt = new Date(
    Math.min(Date.now() + TEMPORARY_ACCESS_TTL_MINUTES * 60_000, credential.expiresAt.getTime())
  );
  const session = await accessPrisma.accessSession.create({
    data: {
      email,
      role: credential.role,
      subject: credential.nameOrOrg ?? null,
      expiresAt: sessionExpiresAt,
    },
  });

  await accessPrisma.temporaryAccessCredential.update({
    where: { id: credential.id },
    data: {
      usedAt: new Date(),
      usedFromIp: ip,
    },
  });

  await writeAccessAudit({
    email,
    role: credential.role,
    requestedNext: credential.requestedSurface,
    result: "signed_in",
    reason: "temporary_login_success",
    ip,
    userAgent,
    sessionId: session.id,
    expiresAt: sessionExpiresAt,
    verifiedAt: new Date(),
  });

  const sessionToken = signSessionToken({
    sid: session.id,
    email,
    role: credential.role as any,
    exp: sessionExpiresAt.getTime(),
  });

  const response = NextResponse.json({
    ok: true,
    redirect_to: credential.requestedSurface || next,
    role: credential.role,
    expires_at: sessionExpiresAt.toISOString(),
  });
  response.cookies.set({
    name: ACCESS_SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor((sessionExpiresAt.getTime() - Date.now()) / 1000),
  });
  return response;
}
