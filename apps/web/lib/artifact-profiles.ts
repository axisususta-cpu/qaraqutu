/**
 * Artifact Profile Matrix v1.
 * Role-bound controlled issuance from the same event spine.
 * Not "export"; issuance = same event, different purpose, different tone.
 */

export type ArtifactProfileCode =
  | "claims"
  | "legal"
  | "technical"
  | "safety"
  | "governance"
  | "regulatory"
  | "public_safety";

export type CanonicalSystemId = "vehicle" | "drone" | "robot";

export interface ArtifactProfileMeta {
  code: ArtifactProfileCode;
  labelTr: string;
  labelEn: string;
  /** Short purpose for UI (Artifact Profile Matrix v1 §16). */
  purposeShortTr: string;
  purposeShortEn: string;
  /** Primary CTA: "X artifact başlat" / "Start X artifact". */
  ctaTr: string;
  ctaEn: string;
  /** Which domains can use this profile. */
  allowedDomains: CanonicalSystemId[];
  /** Conditional: only in certain contexts. */
  conditional?: boolean;
}

/** Master artifact family — Verifier Demo Case Spec v2 / Artifact Profile Matrix v1. */
export const ARTIFACT_PROFILE_MATRIX: ArtifactProfileMeta[] = [
  {
    code: "claims",
    labelTr: "Hasar / Claim",
    labelEn: "Claims",
    purposeShortTr: "Hasar/claim süreci için sade ama bağlamlı olay özeti.",
    purposeShortEn: "Concise, context-bound event summary for claims/damage process.",
    ctaTr: "Claims artifact başlat",
    ctaEn: "Start Claims artifact",
    allowedDomains: ["vehicle", "drone", "robot"],
  },
  {
    code: "legal",
    labelTr: "Hukukî inceleme",
    labelEn: "Legal",
    purposeShortTr: "Belirsizliği koruyan, zinciri bozmayan hukukî inceleme taslağı.",
    purposeShortEn: "Legal review draft preserving uncertainty and chain integrity.",
    ctaTr: "Legal review artifact başlat",
    ctaEn: "Start Legal review artifact",
    allowedDomains: ["vehicle", "drone", "robot"],
  },
  {
    code: "technical",
    labelTr: "Teknik",
    labelEn: "Technical",
    purposeShortTr: "Telemetri, karar akışı ve rekonstrüksiyon odaklı teknik paket.",
    purposeShortEn: "Technical pack focused on telemetry, decision flow, reconstruction.",
    ctaTr: "Technical reconstruction artifact başlat",
    ctaEn: "Start Technical reconstruction artifact",
    allowedDomains: ["vehicle", "drone", "robot"],
  },
  {
    code: "safety",
    labelTr: "Güvenlik",
    labelEn: "Safety",
    purposeShortTr: "Risk, önleme ve güvenli sonraki adımı öne çıkaran güvenlik notu.",
    purposeShortEn: "Safety note emphasizing risk, prevention, and safe next step.",
    ctaTr: "Safety oversight artifact başlat",
    ctaEn: "Start Safety oversight artifact",
    allowedDomains: ["vehicle", "drone", "robot"],
  },
  {
    code: "governance",
    labelTr: "Kurumsal gözetim",
    labelEn: "Governance",
    purposeShortTr: "Kurumsal gözetim ve sorumluluk sınırı için yönetim notu.",
    purposeShortEn: "Governance memo for oversight and accountability boundary.",
    ctaTr: "Governance memo artifact başlat",
    ctaEn: "Start Governance memo artifact",
    allowedDomains: ["vehicle", "drone", "robot"],
  },
  {
    code: "regulatory",
    labelTr: "Düzenleyici yanıt",
    labelEn: "Regulatory",
    purposeShortTr: "Kayıt, trace ve gözetim görünürlüğünü öne çıkaran düzenleyici yanıt çerçevesi.",
    purposeShortEn: "Regulatory response frame emphasizing record, trace, oversight visibility.",
    ctaTr: "Regulatory response artifact başlat",
    ctaEn: "Start Regulatory response artifact",
    allowedDomains: ["vehicle", "drone", "robot"],
    conditional: true,
  },
  {
    code: "public_safety",
    labelTr: "Kamusal güvenlik",
    labelEn: "Public Safety",
    purposeShortTr: "Kamusal risk ve davranış bağlamını öne çıkaran koruyucu çıktı.",
    purposeShortEn: "Protective output emphasizing public risk and behavior context.",
    ctaTr: "Public safety artifact başlat",
    ctaEn: "Start Public safety artifact",
    allowedDomains: ["vehicle", "drone", "robot"],
    conditional: true,
  },
];

export function getArtifactProfilesForDomain(
  domain: CanonicalSystemId
): ArtifactProfileMeta[] {
  return ARTIFACT_PROFILE_MATRIX.filter((p) =>
    p.allowedDomains.includes(domain)
  );
}

export function getArtifactProfile(
  code: ArtifactProfileCode
): ArtifactProfileMeta | null {
  return ARTIFACT_PROFILE_MATRIX.find((p) => p.code === code) ?? null;
}

/** Profiles currently supported by the Vehicle export API (claims, legal only). */
export const API_SUPPORTED_PROFILES: ArtifactProfileCode[] = ["claims", "legal"];
