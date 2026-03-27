import { NextRequest, NextResponse } from "next/server";
import type { ArtifactReverificationResponse } from "contracts";
import { resolveBffUpstreamToken } from "../../../../../lib/access-token";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000");

function isSafeExportId(value: string): boolean {
  return /^QEX-[a-zA-Z0-9-]{6,120}$/.test(value);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ exportId: string }> }) {
  const token = resolveBffUpstreamToken(req);
  const { exportId } = await ctx.params;
  if (!isSafeExportId(exportId)) {
    return NextResponse.json({ error: "INVALID_EXPORT_ID" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "INVALID_REQUEST_BODY" }, { status: 400 });
  }
  if (token.length < 12) {
    return NextResponse.json({ error: "ACCESS_GATE_NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    const res = await fetch(`${API_BASE}/v1/exports/${exportId}/reverify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-qaraqutu-access": token,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as ArtifactReverificationResponse | { error?: string };
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "REVERIFY_UPSTREAM_UNAVAILABLE" }, { status: 503 });
  }
}