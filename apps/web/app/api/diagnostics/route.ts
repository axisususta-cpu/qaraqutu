import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000");

/** Server-side proxy for /v1/system/diagnostics so the browser does not hit the API cross-origin. */
export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/v1/system/diagnostics`, {
      next: { revalidate: 10 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "DIAGNOSTICS_FETCH_FAILED", message: String(e) },
      { status: 502 }
    );
  }
}
