import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000");

/** Server-side proxy for /v1/system/diagnostics so the browser does not hit the API cross-origin. */
export async function GET() {
  try {
    const token = process.env.QARAQUTU_ACCESS_TOKEN?.trim() ?? "";
    const res = await fetch(`${API_BASE}/v1/system/diagnostics`, {
      next: { revalidate: 10 },
      headers: token.length >= 12 ? { Authorization: `Bearer ${token}` } : undefined,
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
