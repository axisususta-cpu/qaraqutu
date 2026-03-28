import { NextRequest, NextResponse } from "next/server";
import { ACCESS_SESSION_COOKIE, ACCESS_SESSION_TTL_MINUTES, getRequestIp, getUserAgent, hashMagicToken, safeNext, signSessionToken } from "../../../../lib/access-auth";
import { accessPrisma } from "../../../../lib/access-db";
import { writeAccessAudit } from "../../../../lib/access-audit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const next = safeNext(req.nextUrl.searchParams.get("next"));
  const ip = getRequestIp(req);
  const userAgent = getUserAgent(req);

  if (!token) {
    await writeAccessAudit({
      result: "failed",
      reason: "missing_token",
      requestedNext: next,
      ip,
      userAgent,
    });
    return NextResponse.redirect(new URL(`/access?next=${encodeURIComponent(next)}&error=missing_token`, req.url), 303);
  }

  const tokenHash = hashMagicToken(token);
  const record = await accessPrisma.accessMagicLinkToken.findUnique({ where: { tokenHash } });

  if (!record) {
    await writeAccessAudit({
      result: "failed",
      reason: "invalid_token",
      requestedNext: next,
      ip,
      userAgent,
    });
    return NextResponse.redirect(new URL(`/access?next=${encodeURIComponent(next)}&error=invalid_token`, req.url), 303);
  }

  if (record.consumedAt) {
    await writeAccessAudit({
      email: record.email,
      role: record.role,
      requestedNext: record.requestedNext,
      result: "rejected",
      reason: "token_already_used",
      ip,
      userAgent,
    });
    return NextResponse.redirect(new URL(`/access?next=${encodeURIComponent(next)}&error=token_used`, req.url), 303);
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    await writeAccessAudit({
      email: record.email,
      role: record.role,
      requestedNext: record.requestedNext,
      result: "expired",
      reason: "magic_link_expired",
      ip,
      userAgent,
      createdAt: new Date(),
      expiresAt: record.expiresAt,
    });
    return NextResponse.redirect(new URL(`/access?next=${encodeURIComponent(next)}&error=expired`, req.url), 303);
  }

  const sessionExpiresAt = new Date(Date.now() + ACCESS_SESSION_TTL_MINUTES * 60_000);
  const session = await accessPrisma.accessSession.create({
    data: {
      email: record.email,
      role: record.role,
      expiresAt: sessionExpiresAt,
    },
  });

  await accessPrisma.accessMagicLinkToken.update({
    where: { id: record.id },
    data: {
      consumedAt: new Date(),
      sessionId: session.id,
    },
  });

  await writeAccessAudit({
    email: record.email,
    role: record.role,
    requestedNext: record.requestedNext,
    result: "verified",
    ip,
    userAgent,
    sessionId: session.id,
    createdAt: new Date(),
    expiresAt: sessionExpiresAt,
    verifiedAt: new Date(),
  });

  const sessionToken = signSessionToken({
    sid: session.id,
    email: session.email,
    role: session.role as any,
    exp: sessionExpiresAt.getTime(),
  });

  const redirectTarget = safeNext(record.requestedNext || next);
  const response = NextResponse.redirect(new URL(redirectTarget, req.url), 303);
  response.cookies.set({
    name: ACCESS_SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_SESSION_TTL_MINUTES * 60,
  });
  return response;
}
