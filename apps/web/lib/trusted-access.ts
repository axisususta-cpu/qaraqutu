import type { NextRequest } from "next/server";
import { normalizeQaraqutuAccessToken, QARAQUTU_ACCESS_COOKIE } from "./access-token";

export type TrustedRoleId =
  | "insurance"
  | "police"
  | "adjudication"
  | "operator"
  | "expert"
  | "manufacturer"
  | "software"
  | "engineering";

export const QARAQUTU_ROLE_COOKIE = "qq_role";
export const QARAQUTU_SUBJECT_COOKIE = "qq_subject";

export const TRUSTED_ROLES: Array<{
  id: TrustedRoleId;
  tr: string;
  en: string;
  exportProfile: "claims" | "legal";
}> = [
  { id: "police", tr: "Polis", en: "Police", exportProfile: "legal" },
  { id: "insurance", tr: "Sigorta", en: "Insurance", exportProfile: "claims" },
  { id: "adjudication", tr: "Muhakeme", en: "Adjudication", exportProfile: "legal" },
  { id: "operator", tr: "Operatör", en: "Operator", exportProfile: "legal" },
  { id: "expert", tr: "Bilirkişi", en: "Expert", exportProfile: "legal" },
  { id: "manufacturer", tr: "Üretici", en: "Manufacturer", exportProfile: "legal" },
  { id: "software", tr: "Yazılım", en: "Software", exportProfile: "legal" },
  { id: "engineering", tr: "Mühendislik", en: "Engineering", exportProfile: "legal" },
];

type CookieReader = {
  get(name: string): { value?: string } | undefined;
};

export function normalizeTrustedRole(raw: string | undefined | null): TrustedRoleId | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  return TRUSTED_ROLES.find((role) => role.id === normalized)?.id ?? null;
}

export function normalizeTrustedSubject(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const normalized = raw.trim();
  if (!/^[a-zA-Z0-9:_-]{3,80}$/.test(normalized)) return null;
  return normalized;
}

export function defaultTrustedRole(): TrustedRoleId {
  return normalizeTrustedRole(process.env.QARAQUTU_DEFAULT_ROLE) ?? "adjudication";
}

export function trustedRoleExportProfile(role: TrustedRoleId): "claims" | "legal" {
  return TRUSTED_ROLES.find((item) => item.id === role)?.exportProfile ?? "legal";
}

function expectedAccessToken(): string {
  return normalizeQaraqutuAccessToken(process.env.QARAQUTU_ACCESS_TOKEN);
}

export function hasTrustedAccessFromCookies(cookies: CookieReader): boolean {
  const expected = expectedAccessToken();
  if (expected.length < 12) return false;
  const actual = normalizeQaraqutuAccessToken(cookies.get(QARAQUTU_ACCESS_COOKIE)?.value);
  return actual === expected;
}

export function hasTrustedAccessSession(req: NextRequest): boolean {
  return hasTrustedAccessFromCookies(req.cookies);
}

export function resolveTrustedRoleFromCookies(cookies: CookieReader): TrustedRoleId | null {
  if (!hasTrustedAccessFromCookies(cookies)) {
    return null;
  }

  return normalizeTrustedRole(cookies.get(QARAQUTU_ROLE_COOKIE)?.value) ?? defaultTrustedRole();
}

export function resolveTrustedRole(req: NextRequest): TrustedRoleId | null {
  return resolveTrustedRoleFromCookies(req.cookies);
}

export function resolveTrustedSubjectFromCookies(cookies: CookieReader): string | null {
  if (!hasTrustedAccessFromCookies(cookies)) {
    return null;
  }

  return normalizeTrustedSubject(cookies.get(QARAQUTU_SUBJECT_COOKIE)?.value);
}

export function resolveTrustedSubject(req: NextRequest): string | null {
  return resolveTrustedSubjectFromCookies(req.cookies);
}