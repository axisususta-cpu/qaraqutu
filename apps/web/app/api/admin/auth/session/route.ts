import { NextRequest, NextResponse } from "next/server";
import { OWNER_ADMIN_COOKIE, verifyOwnerAdminSession } from "../../../../../lib/owner-admin-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const parsed = verifyOwnerAdminSession(req.cookies.get(OWNER_ADMIN_COOKIE)?.value);
  if (!parsed) {
    return NextResponse.json({ authenticated: false, reason: "owner_admin_session_missing_or_expired" }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, actor: parsed.actor, expires_at_epoch_ms: parsed.exp });
}
