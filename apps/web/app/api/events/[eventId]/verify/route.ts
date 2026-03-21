import { NextRequest, NextResponse } from "next/server";
import type { VerificationRunResponse } from "contracts";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000");

function isSafeId(value: string): boolean {
  return /^[a-zA-Z0-9_-]{6,80}$/.test(value);
}

function localPreviewVerification(eventId: string, reason: string): VerificationRunResponse & { local_preview: true; preview_reason: string } {
  const now = new Date().toISOString();
  return {
    verification_run_id: `QVR-LOCAL-PREVIEW-${Date.now()}`,
    transcript_id: null,
    event_id: eventId,
    bundle_id: "LOCAL-PREVIEW-BUNDLE",
    manifest_id: "LOCAL-PREVIEW-MANIFEST",
    verification_state: "UNVERIFIED",
    transcript_summary: [
      {
        step: 1,
        check: "local_preview_fallback",
        result: "INFO",
        note: `Local preview fallback enabled: ${reason}. No backend verification claim is made.`,
      },
    ],
    created_at: now,
    local_preview: true,
    preview_reason: reason,
  };
}

export async function POST(_req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await ctx.params;
  if (!isSafeId(eventId)) {
    return NextResponse.json({ error: "INVALID_EVENT_ID" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE}/v1/events/${eventId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));

    if (res.ok) {
      return NextResponse.json(json, { status: res.status });
    }
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        localPreviewVerification(eventId, `upstream_non_ok_${res.status}`),
        { status: 200 }
      );
    }
    return NextResponse.json(json, { status: res.status });
  } catch {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        localPreviewVerification(eventId, "upstream_unreachable"),
        { status: 200 }
      );
    }
    return NextResponse.json({ error: "VERIFY_UPSTREAM_UNAVAILABLE" }, { status: 503 });
  }
}

