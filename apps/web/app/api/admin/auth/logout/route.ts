import { NextRequest, NextResponse } from "next/server";
import { clearOwnerAdminCookie, verifyOwnerAdminSession } from "../../../../../lib/owner-admin-auth";
import { getRequestIp, getUserAgent } from "../../../../../lib/access-auth";
import { writeAccessAudit } from "../../../../../lib/access-audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const parsed = verifyOwnerAdminSession(req.cookies.get("qq_owner_admin")?.value);
  const ip = getRequestIp(req);
  const userAgent = getUserAgent(req);

  if (parsed) {
    await writeAccessAudit({
      role: "owner_admin",
      result: "rejected",
      reason: "owner_admin_logout",
      ip,
      userAgent,
      sessionId: "owner_admin",
    });
  }

  const response = NextResponse.json({ ok: true });
  clearOwnerAdminCookie(response);
  return response;
}
