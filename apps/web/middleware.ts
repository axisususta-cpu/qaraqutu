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

function hasValidAccess(req: NextRequest): boolean {
  const token = normalizeQaraqutuAccessToken(process.env.QARAQUTU_ACCESS_TOKEN);
  if (token.length < 12) return false;
  const cookieToken = normalizeQaraqutuAccessToken(req.cookies.get(QARAQUTU_ACCESS_COOKIE)?.value);
  const headerToken = normalizeQaraqutuAccessToken(req.headers.get("x-qaraqutu-access"));
  return cookieToken === token || headerToken === token;
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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public access tooling.
  if (pathname === "/access" || pathname === "/restricted" || pathname.startsWith("/api/access")) {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    return res;
  }

  // Public verifier BFF (`/api/events/*/exports`, `/api/exports/*/download`) must not be
  // cookie-rewritten: POST would hit a page route and return 405. Upstream API auth uses
  // server-side QARAQUTU_ACCESS_TOKEN from route handlers.
  const protectedSurface =
    pathname === "/admin" ||
    pathname === "/console" ||
    pathname === "/verifier/golden" ||
    pathname.startsWith("/api/diagnostics");

  if (protectedSurface && !hasValidAccess(req)) {
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
        ? "admin-diagnostics"
        : "protected";

    return restrictedRedirect(req, surfaceName);
  }

  const res = NextResponse.next();
  applySecurityHeaders(res);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

