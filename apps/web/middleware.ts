import { NextRequest, NextResponse } from "next/server";
import { normalizeQaraqutuAccessToken, QARAQUTU_ACCESS_COOKIE } from "./lib/access-token";

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

function applySecurityHeaders(res: NextResponse) {
  // Baseline hardening (avoid breaking Next dev/runtime).
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()"
  );
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  res.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");

  const isProd = process.env.NODE_ENV === "production";
  const csp = [
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "form-action 'self'",
    // Next.js needs inline styles in many cases; keep narrow elsewhere.
    "default-src 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https:",
    // Keep 'unsafe-eval' to avoid breaking Next/React tooling. Tighten later.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "connect-src 'self' https: http:",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
  res.headers.set("Content-Security-Policy", csp);
}

function hasLegacySharedTokenAccess(req: NextRequest): boolean {
  const allowFallback = (process.env.ACCESS_ALLOW_SHARED_TOKEN_FALLBACK ?? "").trim().toLowerCase() === "true";
  if (!allowFallback) return false;

  const token = normalizeQaraqutuAccessToken(process.env.QARAQUTU_ACCESS_TOKEN);
  if (token.length < 12) return false;
  const cookieToken = normalizeQaraqutuAccessToken(req.cookies.get(QARAQUTU_ACCESS_COOKIE)?.value);
  const headerToken = normalizeQaraqutuAccessToken(req.headers.get("x-qaraqutu-access"));
  return cookieToken === token || headerToken === token;
}

async function hasEmailSessionAccess(req: NextRequest): Promise<boolean> {
  try {
    const sessionUrl = new URL("/api/access/session", req.url);
    const response = await fetch(sessionUrl, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });
    if (!response.ok) return false;
    const body = (await response.json().catch(() => null)) as { authenticated?: boolean } | null;
    return body?.authenticated === true;
  } catch {
    return false;
  }
}

async function hasOwnerAdminAccess(req: NextRequest): Promise<boolean> {
  try {
    const sessionUrl = new URL("/api/admin/auth/session", req.url);
    const response = await fetch(sessionUrl, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });
    if (!response.ok) return false;
    const body = (await response.json().catch(() => null)) as { authenticated?: boolean } | null;
    return body?.authenticated === true;
  } catch {
    return false;
  }
}

function restrictedRedirect(req: NextRequest, surface: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/restricted";
  url.searchParams.set("surface", surface);
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  const res = NextResponse.rewrite(url);
  applySecurityHeaders(res);
  return res;
}

function accessRedirect(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/access";
  url.search = "";
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  const res = NextResponse.redirect(url, 307);
  applySecurityHeaders(res);
  return res;
}

function adminRedirect(req: NextRequest, reason: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/admin-login";
  url.search = "";
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  url.searchParams.set("error", reason);
  const res = NextResponse.redirect(url, 307);
  applySecurityHeaders(res);
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public access tooling.
  if (
    pathname === "/access" ||
    pathname === "/admin-login" ||
    pathname === "/restricted" ||
    pathname === "/api/access" ||
    pathname === "/api/access/login" ||
    pathname === "/api/access/request" ||
    pathname === "/api/access/session" ||
    pathname === "/api/access/sign-out" ||
    pathname === "/api/access/verify" ||
    pathname === "/api/admin/auth/login" ||
    pathname === "/api/admin/auth/logout" ||
    pathname === "/api/admin/auth/session"
  ) {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    return res;
  }

  // Public verifier BFF (`/api/events/*/exports`, `/api/exports/*/download`) must not be
  // cookie-rewritten: POST would hit a page route and return 405. Upstream API auth uses
  // server-side QARAQUTU_ACCESS_TOKEN from route handlers.
  const protectedPageSurface =
    pathname === "/verifier" ||
    pathname === "/console" ||
    pathname === "/protected" ||
    pathname === "/verifier/golden";

  const protectedApiSurface = false;
  const ownerOnlyApiSurface = pathname.startsWith("/api/admin/") || pathname.startsWith("/api/diagnostics");
  const ownerOnlyPageSurface = pathname === "/admin";

  const hasAccess = (await hasEmailSessionAccess(req)) || hasLegacySharedTokenAccess(req);
  const hasOwnerAdmin = await hasOwnerAdminAccess(req);

  if (ownerOnlyPageSurface && !hasOwnerAdmin) {
    return adminRedirect(req, "owner_admin_required");
  }

  if (ownerOnlyApiSurface && !hasOwnerAdmin) {
    const res = NextResponse.json({ error: "OWNER_ADMIN_REQUIRED" }, { status: 401 });
    applySecurityHeaders(res);
    return res;
  }

  if ((protectedPageSurface || protectedApiSurface) && !hasAccess) {
    // Minimal audit trace (no secrets).
    console.warn("qaraqutu_access_denied", {
      surface: pathname,
      ip: getClientIp(req),
      ua: req.headers.get("user-agent") ?? "unknown",
      rid: req.headers.get("x-vercel-id") ?? req.headers.get("x-request-id") ?? "unknown",
    });

    const surfaceName =
      pathname === "/admin"
        ? "admin"
        : pathname === "/console"
        ? "console"
        : pathname === "/verifier/golden"
        ? "golden"
        : pathname.startsWith("/api/diagnostics")
        ? "owner-admin-diagnostics"
        : "protected";

    if (protectedPageSurface) {
      return accessRedirect(req);
    }

    return restrictedRedirect(req, surfaceName);
  }

  const res = NextResponse.next();
  applySecurityHeaders(res);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

