import { NextRequest, NextResponse } from "next/server";
import { resolveBffUpstreamToken } from "../../../../../lib/access-token";
import { hasTrustedAccessSession, resolveTrustedRole } from "../../../../../lib/trusted-access";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000");

function isSafeExportId(value: string): boolean {
  // Export IDs are generated as QEX-<uuid>. Keep tolerant but bounded.
  return /^QEX-[a-zA-Z0-9-]{10,120}$/.test(value);
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ exportId: string }> }) {
  if (!hasTrustedAccessSession(req)) {
    return NextResponse.json({ error: "ACCESS_REQUIRED" }, { status: 401 });
  }

  const trustedRole = resolveTrustedRole(req);
  if (!trustedRole) {
    return NextResponse.json({ error: "ROLE_CONTEXT_REQUIRED" }, { status: 403 });
  }

  const token = resolveBffUpstreamToken(req);
  if (token.length < 12) {
    return NextResponse.json({ error: "ACCESS_GATE_NOT_CONFIGURED" }, { status: 503 });
  }

  const { exportId } = await ctx.params;
  if (!isSafeExportId(exportId)) {
    return NextResponse.json({ error: "INVALID_EXPORT_ID" }, { status: 400 });
  }

  const res = await fetch(`${API_BASE}/v1/exports/${exportId}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-qaraqutu-access": token,
      "x-qaraqutu-role": trustedRole,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  }

  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const disposition = res.headers.get("content-disposition") ?? `attachment; filename="${exportId}"`;
  const buf = await res.arrayBuffer();

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
      "Cache-Control": "no-store",
    },
  });
}

