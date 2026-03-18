import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000");

function isSafeId(value: string): boolean {
  return /^[a-zA-Z0-9_-]{6,80}$/.test(value);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  const token = process.env.QARAQUTU_ACCESS_TOKEN;
  if (!token || token.trim().length < 12) {
    return NextResponse.json(
      { error: "ACCESS_GATE_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const { eventId } = await ctx.params;
  if (!isSafeId(eventId)) {
    return NextResponse.json({ error: "INVALID_EVENT_ID" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "INVALID_REQUEST_BODY" }, { status: 400 });
  }

  const res = await fetch(`${API_BASE}/v1/events/${eventId}/exports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  return NextResponse.json(json, { status: res.status });
}

