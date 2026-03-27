import type { ExportProfileCode } from "./contracts";

export type TrustedRoleId =
  | "insurance"
  | "police"
  | "adjudication"
  | "operator"
  | "expert"
  | "manufacturer"
  | "software"
  | "engineering";

const TRUSTED_ROLE_EXPORTS: Record<TrustedRoleId, ExportProfileCode[]> = {
  insurance: ["claims"],
  police: ["legal"],
  adjudication: ["legal"],
  operator: ["legal"],
  expert: ["legal"],
  manufacturer: ["legal"],
  software: ["legal"],
  engineering: ["legal"],
};

export function normalizeAccessToken(raw: string): string {
  return raw.replace(/^\uFEFF/, "").trim();
}

const ACCESS_TOKEN_RAW = normalizeAccessToken(process.env.QARAQUTU_ACCESS_TOKEN ?? "");
const ACCESS_TOKEN = ACCESS_TOKEN_RAW.length >= 12 ? ACCESS_TOKEN_RAW : null;

export function getClientIp(request: any): string {
  const xff = request.headers?.["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) return xff.split(",")[0]?.trim() || "unknown";
  const xri = request.headers?.["x-real-ip"];
  if (typeof xri === "string" && xri.length > 0) return xri;
  return request.ip ?? "unknown";
}

export function hasBearerAccess(request: any): boolean {
  if (!ACCESS_TOKEN) return false;
  const auth = request.headers?.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    const provided = normalizeAccessToken(auth.slice("Bearer ".length));
    return provided === ACCESS_TOKEN;
  }
  const alt = request.headers?.["x-qaraqutu-access"];
  return typeof alt === "string" && normalizeAccessToken(alt) === ACCESS_TOKEN;
}

export function normalizeTrustedRole(raw: unknown): TrustedRoleId | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().toLowerCase();
  return normalized in TRUSTED_ROLE_EXPORTS ? (normalized as TrustedRoleId) : null;
}

export function normalizeTrustedSubject(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim();
  if (!/^[a-zA-Z0-9:_-]{3,80}$/.test(normalized)) return null;
  return normalized;
}

export function resolveTrustedRoleHeader(request: any): TrustedRoleId | null {
  return normalizeTrustedRole(request.headers?.["x-qaraqutu-role"]);
}

export function resolveTrustedSubjectHeader(request: any): string | null {
  return normalizeTrustedSubject(request.headers?.["x-qaraqutu-subject"]);
}

export function isRoleAllowedExportProfile(role: TrustedRoleId, profile: ExportProfileCode): boolean {
  return TRUSTED_ROLE_EXPORTS[role]?.includes(profile) ?? false;
}