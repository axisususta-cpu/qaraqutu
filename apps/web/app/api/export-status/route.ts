import { NextRequest, NextResponse } from "next/server";
import { resolveBffUpstreamToken } from "../../../lib/access-token";
import { hasTrustedAccessSession, resolveTrustedRole } from "../../../lib/trusted-access";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000");

export async function GET(req: NextRequest) {
  if (!hasTrustedAccessSession(req)) {
    return NextResponse.json({ error: "ACCESS_REQUIRED" }, { status: 401 });
  }

  const trustedRole = resolveTrustedRole(req);
  if (!trustedRole) {
    return NextResponse.json({ error: "ROLE_CONTEXT_REQUIRED" }, { status: 403 });
  }

  const token = resolveBffUpstreamToken(req);

  if (token.length < 12) {
    return NextResponse.json({ error: "ACCESS_REQUIRED" }, { status: 403 });
  }

  try {
    const res = await fetch(`${API_BASE}/v1/system/diagnostics`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-qaraqutu-access": token,
        "x-qaraqutu-role": trustedRole,
      },
      cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: "ACCESS_REQUIRED" }, { status: 403 });
    }

    if (!res.ok) {
      return NextResponse.json({ state: "backend_unavailable" }, { status: 200 });
    }

    return NextResponse.json({ state: "export_ready", trusted_role: trustedRole }, { status: 200 });
  } catch {
    return NextResponse.json({ state: "backend_unavailable" }, { status: 200 });
  }
}
