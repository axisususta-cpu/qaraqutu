import { NextRequest, NextResponse } from "next/server";
import { getRequestIp, getUserAgent } from "../../../../../lib/access-auth";
import { writeAccessAudit } from "../../../../../lib/access-audit";
import {
  isOwnerAdminPasswordConfigured,
  setOwnerAdminCookie,
  verifyOwnerAdminPassword,
} from "../../../../../lib/owner-admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  const ip = getRequestIp(req);
  const userAgent = getUserAgent(req);

  if (!isOwnerAdminPasswordConfigured()) {
    await writeAccessAudit({
      role: "owner_admin",
      result: "failed",
      reason: "owner_admin_not_configured",
      ip,
      userAgent,
    });
    return NextResponse.json({ error: "OWNER_ADMIN_NOT_CONFIGURED" }, { status: 503 });
  }

  if (!verifyOwnerAdminPassword(password)) {
    await writeAccessAudit({
      role: "owner_admin",
      result: "failed",
      reason: "owner_admin_login_invalid_password",
      ip,
      userAgent,
    });
    return NextResponse.json({ error: "OWNER_ADMIN_INVALID_PASSWORD" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, actor: "owner_admin" });
  const expiresAt = setOwnerAdminCookie(response);

  await writeAccessAudit({
    role: "owner_admin",
    result: "verified",
    reason: "owner_admin_login_success",
    ip,
    userAgent,
    sessionId: "owner_admin",
    expiresAt,
    verifiedAt: new Date(),
  });

  return response;
}
