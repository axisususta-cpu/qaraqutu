import crypto from "crypto";
import type { NextRequest } from "next/server";
import { defaultTrustedRole, normalizeTrustedRole, type TrustedRoleId } from "./trusted-access";

export const ACCESS_SESSION_COOKIE = "qq_session";
export const MAGIC_LINK_TTL_MINUTES = 10;
export const ACCESS_SESSION_TTL_MINUTES = 20;

export type AccessSessionPayload = {
  sid: string;
  email: string;
  role: TrustedRoleId;
  exp: number;
};

export function normalizeEmail(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200;
}

export function safeNext(raw: unknown): string {
  if (typeof raw !== "string") return "/";
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//")) return "/";
  return raw;
}

export function normalizeRole(raw: unknown): TrustedRoleId {
  return normalizeTrustedRole(typeof raw === "string" ? raw : null) ?? defaultTrustedRole();
}

export function getRequestIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function getUserAgent(req: NextRequest): string {
  return req.headers.get("user-agent") ?? "unknown";
}

export function createMagicLinkToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashMagicToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getSessionSecret(): string {
  const secret =
    process.env.ACCESS_SESSION_SECRET?.trim() ?? process.env.QARAQUTU_ACCESS_TOKEN?.trim() ?? "";
  if (secret.length >= 16) return secret;
  if (process.env.NODE_ENV !== "production") return "qaraqutu-dev-session-secret-change-me";
  throw new Error("ACCESS_SESSION_SECRET_NOT_CONFIGURED");
}

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromB64url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function signSessionToken(payload: AccessSessionPayload): string {
  const encoded = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", getSessionSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string | undefined): AccessSessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, incomingSig] = parts;
  const expectedSig = crypto.createHmac("sha256", getSessionSecret()).update(encoded).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(incomingSig), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const payload = JSON.parse(fromB64url(encoded)) as AccessSessionPayload;
    if (!payload?.sid || !payload?.email || !payload?.role || !payload?.exp) return null;
    if (!normalizeTrustedRole(payload.role)) return null;
    if (payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
