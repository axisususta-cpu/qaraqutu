import type { NextRequest } from "next/server";
import { accessPrisma } from "./access-db";
import { ACCESS_SESSION_COOKIE, verifySessionToken } from "./access-auth";
import { QARAQUTU_ACCESS_COOKIE, normalizeQaraqutuAccessToken } from "./access-token";

export type AccessAdminActor = {
  actorId: string;
  actorType: "session" | "shared_token";
  email: string | null;
  role: string | null;
};

function hasSharedTokenAdmin(req: NextRequest): AccessAdminActor | null {
  const allowFallback = (process.env.ACCESS_ALLOW_SHARED_TOKEN_FALLBACK ?? "").toLowerCase() === "true";
  if (!allowFallback) {
    return null;
  }

  const expected = normalizeQaraqutuAccessToken(process.env.QARAQUTU_ACCESS_TOKEN);
  if (expected.length < 12) {
    return null;
  }

  const cookieToken = normalizeQaraqutuAccessToken(req.cookies.get(QARAQUTU_ACCESS_COOKIE)?.value);
  const headerToken = normalizeQaraqutuAccessToken(req.headers.get("x-qaraqutu-access"));
  if (cookieToken !== expected && headerToken !== expected) {
    return null;
  }

  return {
    actorId: "shared-token-admin",
    actorType: "shared_token",
    email: null,
    role: "shared_token",
  };
}

export async function authenticateAccessAdmin(req: NextRequest): Promise<AccessAdminActor | null> {
  const parsed = verifySessionToken(req.cookies.get(ACCESS_SESSION_COOKIE)?.value);
  if (parsed) {
    const session = await accessPrisma.accessSession.findUnique({ where: { id: parsed.sid } });
    if (session && !session.revokedAt && session.expiresAt.getTime() > Date.now()) {
      return {
        actorId: session.email,
        actorType: "session",
        email: session.email,
        role: session.role,
      };
    }
  }

  return hasSharedTokenAdmin(req);
}
