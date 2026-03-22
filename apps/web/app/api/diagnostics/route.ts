import { NextRequest, NextResponse } from "next/server";
import { resolveBffUpstreamToken } from "../../../lib/access-token";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000");

/** Server-side proxy for /v1/system/diagnostics so the browser does not hit the API cross-origin. */
export async function GET(req: NextRequest) {
  try {
    const token = resolveBffUpstreamToken(req);
    const res = await fetch(`${API_BASE}/v1/system/diagnostics`, {
      cache: "no-store",
      headers:
        token.length >= 12
          ? { Authorization: `Bearer ${token}`, "x-qaraqutu-access": token }
          : undefined,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: "DIAGNOSTICS_FETCH_FAILED" },
      { status: 502 }
    );
  }
}
