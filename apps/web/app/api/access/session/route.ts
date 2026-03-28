import { NextRequest, NextResponse } from "next/server";
import { ACCESS_SESSION_COOKIE, getRequestIp, getUserAgent, verifySessionToken } from "../../../../lib/access-auth";
import { accessPrisma } from "../../../../lib/access-db";
import { writeAccessAudit } from "../../../../lib/access-audit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const ip = getRequestIp(req);
  const userAgent = getUserAgent(req);
  const cookieValue = req.cookies.get(ACCESS_SESSION_COOKIE)?.value;
  const parsed = verifySessionToken(cookieValue);

  if (!parsed) {
    return NextResponse.json({ authenticated: false, reason: "missing_or_invalid_session" }, { status: 401 });
  }

  const session = await accessPrisma.accessSession.findUnique({ where: { id: parsed.sid } });
  if (!session) {
    await writeAccessAudit({
      email: parsed.email,
      role: parsed.role,
      result: "rejected",
      reason: "session_not_found",
      ip,
      userAgent,
      sessionId: parsed.sid,
    });
    const res = NextResponse.json({ authenticated: false, reason: "session_not_found" }, { status: 401 });
    res.cookies.set({ name: ACCESS_SESSION_COOKIE, value: "", path: "/", maxAge: 0 });
    return res;
  }

  if (session.revokedAt) {
    await writeAccessAudit({
      email: session.email,
      role: session.role,
      result: "rejected",
      reason: "session_revoked",
      ip,
      userAgent,
      sessionId: session.id,
    });
    const res = NextResponse.json({ authenticated: false, reason: "session_revoked" }, { status: 401 });
    res.cookies.set({ name: ACCESS_SESSION_COOKIE, value: "", path: "/", maxAge: 0 });
    return res;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await writeAccessAudit({
      email: session.email,
      role: session.role,
      result: "expired",
      reason: "session_expired",
      ip,
      userAgent,
      sessionId: session.id,
      expiresAt: session.expiresAt,
    });
    const res = NextResponse.json({ authenticated: false, reason: "session_expired" }, { status: 401 });
    res.cookies.set({ name: ACCESS_SESSION_COOKIE, value: "", path: "/", maxAge: 0 });
    return res;
  }

  return NextResponse.json({
    authenticated: true,
    session_id: session.id,
    email: session.email,
    role: session.role,
    expires_at: session.expiresAt.toISOString(),
  });
}
