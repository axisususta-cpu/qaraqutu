import { NextRequest, NextResponse } from "next/server";
import type { ExportArtifactResponse } from "contracts";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000");

function isSafeId(value: string): boolean {
  return /^[a-zA-Z0-9_-]{6,80}$/.test(value);
}

function localPreviewExport(eventId: string, body: Record<string, unknown> | null, reason: string): ExportArtifactResponse & {
  local_preview: true;
  preview_reason: string;
} {
  const profile = (body?.profile === "legal" ? "legal" : "claims") as "claims" | "legal";
  const purpose = typeof body?.purpose === "string" ? body.purpose : "local_preview_artifact";
  return {
    export_id: `QEX-LOCAL-PREVIEW-${Date.now()}`,
    receipt_id: `QRC-LOCAL-PREVIEW-${Date.now()}`,
    event_id: eventId,
    bundle_id: "LOCAL-PREVIEW-BUNDLE",
    manifest_id: "LOCAL-PREVIEW-MANIFEST",
    verification_state: "UNVERIFIED",
    export_profile: profile,
    export_purpose: purpose,
    schema_version: "local-preview-v1",
    download_url: "",
    local_preview: true,
    preview_reason: reason,
  };
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  const token = process.env.QARAQUTU_ACCESS_TOKEN?.trim() ?? "";
  const { eventId } = await ctx.params;
  if (!isSafeId(eventId)) {
    return NextResponse.json({ error: "INVALID_EVENT_ID" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  if (token.length < 12 && process.env.NODE_ENV !== "production") {
    return NextResponse.json(localPreviewExport(eventId, body, "access_gate_not_configured"), { status: 200 });
  }
  if (token.length < 12) {
    return NextResponse.json({ error: "ACCESS_GATE_NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    const res = await fetch(`${API_BASE}/v1/events/${eventId}/exports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-qaraqutu-access": token,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      return NextResponse.json(json, { status: res.status });
    }
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(localPreviewExport(eventId, body, `upstream_non_ok_${res.status}`), { status: 200 });
    }
    return NextResponse.json(json, { status: res.status });
  } catch {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(localPreviewExport(eventId, body, "upstream_unreachable"), { status: 200 });
    }
    return NextResponse.json({ error: "EXPORT_UPSTREAM_UNAVAILABLE" }, { status: 503 });
  }
}

