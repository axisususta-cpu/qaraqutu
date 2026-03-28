import { NextRequest, NextResponse } from "next/server";
import { ACCESS_SESSION_COOKIE, getRequestIp, getUserAgent, verifySessionToken } from "../../../../lib/access-auth";
import { accessPrisma } from "../../../../lib/access-db";
import { writeAccessAudit } from "../../../../lib/access-audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const userAgent = getUserAgent(req);
  const parsed = verifySessionToken(req.cookies.get(ACCESS_SESSION_COOKIE)?.value);

  if (parsed) {
    const existing = await accessPrisma.accessSession.findUnique({ where: { id: parsed.sid } });
    if (existing && !existing.revokedAt) {
      await accessPrisma.accessSession.update({
        where: { id: parsed.sid },
        data: { revokedAt: new Date() },
      });
      await writeAccessAudit({
        email: existing.email,
        role: existing.role,
        result: "rejected",
        reason: "session_signed_out",
        ip,
        userAgent,
        sessionId: existing.id,
      });
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ACCESS_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
