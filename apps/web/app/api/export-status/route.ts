import { NextRequest, NextResponse } from "next/server";
import {
  normalizeQaraqutuAccessToken,
  QARAQUTU_ACCESS_COOKIE,
} from "../../../lib/access-token";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000");

function resolveTokenSource(req: NextRequest) {
  const envToken = normalizeQaraqutuAccessToken(process.env.QARAQUTU_ACCESS_TOKEN);
  if (envToken.length >= 12) {
    return { token: envToken, source: "env" as const };
  }

  const cookieToken = normalizeQaraqutuAccessToken(
    req.cookies.get(QARAQUTU_ACCESS_COOKIE)?.value
  );
  if (cookieToken.length >= 12) {
    return { token: cookieToken, source: "cookie" as const };
  }

  return { token: "", source: "none" as const };
}

export async function GET(req: NextRequest) {
  const { token, source } = resolveTokenSource(req);

  if (token.length < 12) {
    return NextResponse.json(
      {
        state: process.env.NODE_ENV === "production" ? "access_required" : "preview_only",
        token_source: source,
      },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(`${API_BASE}/v1/system/diagnostics`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-qaraqutu-access": token,
      },
      cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json(
        {
          state: "access_required",
          token_source: source,
        },
        { status: 200 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          state: "backend_unavailable",
          token_source: source,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        state: "export_ready",
        token_source: source,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        state: "backend_unavailable",
        token_source: source,
      },
      { status: 200 }
    );
  }
}
