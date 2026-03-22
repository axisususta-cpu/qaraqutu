import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "qq_access";

function safeNext(next: unknown): string {
  if (typeof next !== "string") return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  return next;
}

export async function POST(req: NextRequest) {
  const expected = process.env.QARAQUTU_ACCESS_TOKEN?.trim() ?? "";
  if (expected.length < 12) {
    return NextResponse.json(
      {
        error: "ACCESS_GATE_NOT_CONFIGURED",
        message: "Access gate is not configured for this environment.",
      },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => null)) as null | { token?: unknown; next?: unknown };
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const next = safeNext(body?.next);

  if (!token || token.trim() !== expected) {
    return NextResponse.json(
      { error: "ACCESS_DENIED", message: "Not authorized for this restricted surface." },
      { status: 403 }
    );
  }

  const res = NextResponse.redirect(new URL(next, req.url), 303);
  res.cookies.set({
    name: ACCESS_COOKIE,
    value: expected,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  });
  return res;
}

