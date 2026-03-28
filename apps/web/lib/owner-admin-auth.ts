import crypto from "crypto";
import type { NextResponse } from "next/server";

export const OWNER_ADMIN_COOKIE = "qq_owner_admin";
export const OWNER_ADMIN_TTL_MINUTES = 30;

type OwnerAdminPayload = {
  actor: "owner_admin";
  exp: number;
};

function getOwnerAdminPassword(): string {
  return (process.env.QARAQUTU_OWNER_ADMIN_PASSWORD ?? "").trim();
}

export function isOwnerAdminPasswordConfigured(): boolean {
  return getOwnerAdminPassword().length >= 8;
}

function getOwnerAdminSigningSecret(): string {
  const explicit = (process.env.QARAQUTU_OWNER_ADMIN_SESSION_SECRET ?? "").trim();
  if (explicit.length >= 16) {
    return explicit;
  }

  const ownerPassword = getOwnerAdminPassword();
  const sessionSecret = (process.env.ACCESS_SESSION_SECRET ?? "").trim();
  const legacy = (process.env.QARAQUTU_ACCESS_TOKEN ?? "").trim();
  const base = sessionSecret.length >= 16 ? sessionSecret : legacy;

  if (base.length >= 16 && ownerPassword.length >= 8) {
    return `${base}:owner-admin:${ownerPassword}`;
  }

  if (process.env.NODE_ENV !== "production") {
    return "qaraqutu-dev-owner-admin-secret";
  }

  throw new Error("OWNER_ADMIN_SECRET_NOT_CONFIGURED");
}

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromB64url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sha256(input: string): Buffer {
  return crypto.createHash("sha256").update(input).digest();
}

export function verifyOwnerAdminPassword(candidate: string): boolean {
  const expected = getOwnerAdminPassword();
  if (expected.length < 8) {
    return false;
  }

  const left = sha256(candidate);
  const right = sha256(expected);
  return crypto.timingSafeEqual(left, right);
}

export function signOwnerAdminSession(actor: "owner_admin", expiresAt: Date): string {
  const payload: OwnerAdminPayload = {
    actor,
    exp: expiresAt.getTime(),
  };
  const encoded = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", getOwnerAdminSigningSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyOwnerAdminSession(token: string | undefined): OwnerAdminPayload | null {
  if (!token || typeof token !== "string") return null;
  const [encoded, incomingSig] = token.split(".");
  if (!encoded || !incomingSig) return null;

  const expectedSig = crypto
    .createHmac("sha256", getOwnerAdminSigningSecret())
    .update(encoded)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(incomingSig), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const payload = JSON.parse(fromB64url(encoded)) as OwnerAdminPayload;
    if (payload.actor !== "owner_admin") return null;
    if (payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setOwnerAdminCookie(response: NextResponse): Date {
  const expiresAt = new Date(Date.now() + OWNER_ADMIN_TTL_MINUTES * 60_000);
  const token = signOwnerAdminSession("owner_admin", expiresAt);

  response.cookies.set({
    name: OWNER_ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OWNER_ADMIN_TTL_MINUTES * 60,
  });

  return expiresAt;
}

export function clearOwnerAdminCookie(response: NextResponse): void {
  response.cookies.set({
    name: OWNER_ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
