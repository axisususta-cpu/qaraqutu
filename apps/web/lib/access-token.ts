import type { NextRequest } from "next/server";

export const QARAQUTU_ACCESS_COOKIE = "qq_access";

/**
 * Strip BOM and whitespace so Vercel / copy-paste secrets match API Bearer checks.
 */
export function normalizeQaraqutuAccessToken(raw: string | undefined | null): string {
  if (raw == null) return "";
  return raw.replace(/^\uFEFF/, "").trim();
}

/**
 * Token for server-side BFF → qaraqutu-api calls.
 * Prefer `QARAQUTU_ACCESS_TOKEN`; if unset in this runtime, use httpOnly cookie from `/api/access`
 * (same secret when the access gate is configured).
 */
export function resolveBffUpstreamToken(req: NextRequest): string {
  const envTok = normalizeQaraqutuAccessToken(process.env.QARAQUTU_ACCESS_TOKEN);
  if (envTok.length >= 12) return envTok;

  const allowLegacyCookieFallback = (process.env.ACCESS_ALLOW_SHARED_TOKEN_FALLBACK ?? "").toLowerCase() === "true";
  if (!allowLegacyCookieFallback) return "";

  const cookieTok = normalizeQaraqutuAccessToken(req.cookies.get(QARAQUTU_ACCESS_COOKIE)?.value);
  return cookieTok.length >= 12 ? cookieTok : "";
}
