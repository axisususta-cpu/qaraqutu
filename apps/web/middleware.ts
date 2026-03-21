import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "qq_access";

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
  const token = process.env.QARAQUTU_ACCESS_TOKEN;
  if (!token || token.trim().length < 12) return false;
  const cookieToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const headerToken = req.headers.get("x-qaraqutu-access");
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
  const isDevLocal = process.env.NODE_ENV !== "production";

  // Allow public access tooling.
  if (pathname === "/access" || pathname === "/restricted" || pathname.startsWith("/api/access")) {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    return res;
  }

  const protectedSurface =
    pathname === "/admin" ||
    pathname === "/console" ||
    pathname === "/verifier/golden" ||
    pathname.startsWith("/api/diagnostics") ||
    (!isDevLocal && pathname.includes("/api/events/") && pathname.endsWith("/exports")) ||
    pathname.startsWith("/api/exports/") && pathname.endsWith("/download");

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
        : pathname.includes("/api/events/") && pathname.endsWith("/exports")
        ? "artifact-issuance"
        : pathname.startsWith("/api/exports/") && pathname.endsWith("/download")
        ? "artifact-download"
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

