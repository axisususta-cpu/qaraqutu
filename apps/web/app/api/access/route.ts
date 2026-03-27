import { NextRequest, NextResponse } from "next/server";
import { normalizeQaraqutuAccessToken, QARAQUTU_ACCESS_COOKIE } from "../../../lib/access-token";
import {
  defaultTrustedRole,
  normalizeTrustedRole,
  normalizeTrustedSubject,
  QARAQUTU_ROLE_COOKIE,
  QARAQUTU_SUBJECT_COOKIE,
} from "../../../lib/trusted-access";

function safeNext(next: unknown): string {
  if (typeof next !== "string") return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  return next;
}

export async function POST(req: NextRequest) {
  const expected = normalizeQaraqutuAccessToken(process.env.QARAQUTU_ACCESS_TOKEN);
  if (expected.length < 12) {
    return NextResponse.json(
      {
        error: "ACCESS_GATE_NOT_CONFIGURED",
        message: "Access gate is not configured for this environment.",
      },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => null)) as null | {
    token?: unknown;
    next?: unknown;
    role?: unknown;
    subject?: unknown;
  };
  const token = typeof body?.token === "string" ? normalizeQaraqutuAccessToken(body.token) : "";
  const next = safeNext(body?.next);
  const trustedRole = normalizeTrustedRole(typeof body?.role === "string" ? body.role : null) ?? defaultTrustedRole();
  const rawSubject = typeof body?.subject === "string" ? body.subject : null;
  const trustedSubject = rawSubject == null || rawSubject.trim().length === 0 ? null : normalizeTrustedSubject(rawSubject);

  if (!token || token !== expected) {
    return NextResponse.json(
      { error: "ACCESS_DENIED", message: "Not authorized for this restricted surface." },
      { status: 403 }
    );
  }

  if (rawSubject != null && trustedSubject == null) {
    return NextResponse.json(
      { error: "INVALID_SUBJECT_CONTEXT", message: "Trusted subject is invalid for this access session." },
      { status: 400 }
    );
  }

  const res = NextResponse.redirect(new URL(next, req.url), 303);
  res.cookies.set({
    name: QARAQUTU_ACCESS_COOKIE,
    value: expected,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  });
  res.cookies.set({
    name: QARAQUTU_ROLE_COOKIE,
    value: trustedRole,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  if (trustedSubject) {
    res.cookies.set({
      name: QARAQUTU_SUBJECT_COOKIE,
      value: trustedSubject,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  } else {
    res.cookies.set({
      name: QARAQUTU_SUBJECT_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }
  return res;
}

