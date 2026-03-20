/**
 * Document Family Mapping v1.
 * Institutional role matrix — trace-linked document families.
 */

import type { DocumentFamilyCode, InstitutionalRoleId } from "./institutional-roles";

export interface DocumentFamilyMeta {
  code: DocumentFamilyCode;
  labelEn: string;
  labelTr: string;
  shortPurposeEn: string;
  shortPurposeTr: string;
  primaryAudience: InstitutionalRoleId[];
  canonicalSections: string[];
  sealMetadataNote: string;
  doctrineSafetyNote: string;
}

/** Document family definitions — institutional mapping. */
export const DOCUMENT_FAMILY_MAP: DocumentFamilyMeta[] = [
  {
    code: "incident_report",
    labelEn: "Incident / Event Report",
    labelTr: "Olay / Event Raporu",
    shortPurposeEn: "Canonical event with metadata, document ID, linkage.",
    shortPurposeTr: "Metadata, belge ID ve bağlantı ile kanonik olay.",
    primaryAudience: ["clerk", "field", "legal", "claims", "technical"],
    canonicalSections: ["Event ID", "Bundle ID", "Manifest ID", "Recorded", "Derived", "Unknown/Disputed", "Summary"],
    sealMetadataNote: "Seal on cover; metadata bar with Event, Bundle, Manifest, Version, Date.",
    doctrineSafetyNote: "Recorded and Derived remain in separate sections. Not a liability finding.",
  },
  {
    code: "verification_summary",
    labelEn: "Verification Summary",
    labelTr: "Doğrulama Özeti",
    shortPurposeEn: "Bounded assessment, trace reference.",
    shortPurposeTr: "Sınırlı değerlendirme, iz referansı.",
    primaryAudience: ["field", "administrative", "notary", "legal", "claims", "oversight"],
    canonicalSections: ["Verification State", "Trace Reference", "Recorded/Derived Separation Note"],
    sealMetadataNote: "Protocol seal; trace ref in metadata.",
    doctrineSafetyNote: "Verification is integrity assessment, not judicial decision.",
  },
  {
    code: "trace_appendix",
    labelEn: "Trace Appendix",
    labelTr: "İz Ekleri",
    shortPurposeEn: "Verification steps, not truth itself.",
    shortPurposeTr: "Doğrulama adımları, gerçeğin kendisi değil.",
    primaryAudience: ["field", "notary", "legal", "technical"],
    canonicalSections: ["Trace Steps", "Check/Result/Note", "Source Linkage"],
    sealMetadataNote: "Trace ref in metadata; seal optional.",
    doctrineSafetyNote: "Trace supports review; it does not constitute truth or verdict.",
  },
  {
    code: "claims_pack",
    labelEn: "Claims Pack",
    labelTr: "Hasar Paketi",
    shortPurposeEn: "Dispute-ready summary, canonical refs.",
    shortPurposeTr: "İhtilafa hazır özet, kanonik referanslar.",
    primaryAudience: ["claims"],
    canonicalSections: ["Summary", "Recorded", "Derived", "Unknown/Disputed", "Trace Ref", "Receipt"],
    sealMetadataNote: "Seal on cover; receipt linkage in metadata.",
    doctrineSafetyNote: "Claims pack is role-appropriate artifact, not liability assignment.",
  },
  {
    code: "legal_pack",
    labelEn: "Legal Pack",
    labelTr: "Hukukî Paket",
    shortPurposeEn: "Chain-centric, manifest, receipt, provenance.",
    shortPurposeTr: "Zincir odaklı, manifest, makbuz, provenans.",
    primaryAudience: ["legal"],
    canonicalSections: ["Recorded", "Derived", "Unknown/Disputed", "Trace", "Manifest", "Receipt", "Provenance"],
    sealMetadataNote: "Protocol seal; manifest and receipt in metadata.",
    doctrineSafetyNote: "Legal pack preserves uncertainty; Derived ≠ verdict; Issuance ≠ blame.",
  },
  {
    code: "technical_pack",
    labelEn: "Technical Pack",
    labelTr: "Teknik Paket",
    shortPurposeEn: "Telemetry, decision flow, reconstruction.",
    shortPurposeTr: "Telemetri, karar akışı, rekonstrüksiyon.",
    primaryAudience: ["technical"],
    canonicalSections: ["System/Scenario/Event", "Source References", "Packet Structure", "Trace"],
    sealMetadataNote: "Trace ref in metadata; seal on cover.",
    doctrineSafetyNote: "Technical reconstruction is not fault or blame assignment.",
  },
  {
    code: "administrative_packet",
    labelEn: "Administrative Packet",
    labelTr: "İdari Paket",
    shortPurposeEn: "Version chain, access history, administrative summary.",
    shortPurposeTr: "Sürüm zinciri, erişim geçmişi, idari özet.",
    primaryAudience: ["administrative", "oversight"],
    canonicalSections: ["Administrative Summary", "Version Chain", "Access History", "Export History"],
    sealMetadataNote: "Version and receipt in metadata.",
    doctrineSafetyNote: "Administrative view does not conflate derived with administrative fact.",
  },
  {
    code: "authenticity_receipt",
    labelEn: "Authenticity Receipt",
    labelTr: "Özgünlük Makbuzu",
    shortPurposeEn: "Manifest, receipt, version chain, authenticity signals.",
    shortPurposeTr: "Manifest, makbuz, sürüm zinciri, özgünlük sinyalleri.",
    primaryAudience: ["clerk", "notary", "oversight"],
    canonicalSections: ["Manifest ID", "Receipt ID", "Version Chain", "Integrity Signals"],
    sealMetadataNote: "Protocol seal; manifest and receipt prominent.",
    doctrineSafetyNote: "Authenticity does not imply liability or verdict.",
  },
];

export function getDocumentFamily(code: DocumentFamilyCode): DocumentFamilyMeta | null {
  return DOCUMENT_FAMILY_MAP.find((d) => d.code === code) ?? null;
}

export function getDocumentFamiliesForRole(roleId: InstitutionalRoleId): DocumentFamilyMeta[] {
  return DOCUMENT_FAMILY_MAP.filter((d) => d.primaryAudience.includes(roleId));
}
