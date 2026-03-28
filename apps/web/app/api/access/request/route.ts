import { NextRequest, NextResponse } from "next/server";
import { accessPrisma } from "../../../../lib/access-db";
import {
  ACCESS_SESSION_TTL_MINUTES,
  MAGIC_LINK_TTL_MINUTES,
  createMagicLinkToken,
  getRequestIp,
  getUserAgent,
  hashMagicToken,
  isValidEmail,
  normalizeEmail,
  normalizeRole,
  safeNext,
} from "../../../../lib/access-auth";
import { sendMagicLinkEmail } from "../../../../lib/access-mailer";
import { writeAccessAudit } from "../../../../lib/access-audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { email?: unknown; next?: unknown; role?: unknown }
    | null;

  const email = normalizeEmail(body?.email);
  const requestedNext = safeNext(body?.next);
  const role = normalizeRole(body?.role);
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

  const rawToken = createMagicLinkToken();
  const tokenHash = hashMagicToken(rawToken);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MINUTES * 60_000);

  await accessPrisma.accessMagicLinkToken.create({
    data: {
      email,
      role,
      requestedNext,
      tokenHash,
      expiresAt,
    },
  });

  await writeAccessAudit({
    email,
    role,
    requestedNext,
    result: "requested",
    ip,
    userAgent,
    createdAt: new Date(),
    expiresAt,
  });

  const verifyUrl = new URL("/api/access/verify", req.url);
  verifyUrl.searchParams.set("token", rawToken);
  verifyUrl.searchParams.set("next", requestedNext);

  const mailResult = await sendMagicLinkEmail({
    email,
    magicLinkUrl: verifyUrl.toString(),
  });

  if (mailResult.ok) {
    await writeAccessAudit({
      email,
      role,
      requestedNext,
      result: "sent",
      ip,
      userAgent,
      createdAt: new Date(),
      expiresAt,
    });
    return NextResponse.json({
      ok: true,
      mode: "email_sent",
      expires_in_minutes: MAGIC_LINK_TTL_MINUTES,
      session_ttl_minutes: ACCESS_SESSION_TTL_MINUTES,
    });
  }

  if (mailResult.devPreviewUrl) {
    await writeAccessAudit({
      email,
      role,
      requestedNext,
      result: "failed",
      reason: mailResult.reason,
      ip,
      userAgent,
      createdAt: new Date(),
      expiresAt,
    });
    return NextResponse.json({
      ok: true,
      mode: "dev_preview",
      reason: mailResult.reason,
      verify_url: mailResult.devPreviewUrl,
      expires_in_minutes: MAGIC_LINK_TTL_MINUTES,
      session_ttl_minutes: ACCESS_SESSION_TTL_MINUTES,
    });
  }

  if (mailResult.acceptancePreviewUrl) {
    await writeAccessAudit({
      email,
      role,
      requestedNext,
      result: "sent",
      reason: mailResult.reason,
      ip,
      userAgent,
      createdAt: new Date(),
      expiresAt,
    });
    return NextResponse.json({
      ok: true,
      mode: "acceptance_preview",
      reason: mailResult.reason,
      verify_url: mailResult.acceptancePreviewUrl,
      expires_in_minutes: MAGIC_LINK_TTL_MINUTES,
      session_ttl_minutes: ACCESS_SESSION_TTL_MINUTES,
    });
  }

  await writeAccessAudit({
    email,
    role,
    requestedNext,
    result: "failed",
    reason: mailResult.reason,
    ip,
    userAgent,
    createdAt: new Date(),
    expiresAt,
  });

  return NextResponse.json(
    {
      error: "EMAIL_PROVIDER_NOT_CONFIGURED",
      reason: mailResult.reason,
    },
    { status: 503 }
  );
}
