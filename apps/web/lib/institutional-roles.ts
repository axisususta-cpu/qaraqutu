/**
 * Institutional Role Shell Map v1.
 * One canonical event core, many institutional shells.
 * Role-adaptive information architecture — no backend fabrication.
 */

export type InstitutionalRoleId =
  | "clerk"
  | "field"
  | "administrative"
  | "notary"
  | "legal"
  | "claims"
  | "technical"
  | "oversight";

export type DocumentFamilyCode =
  | "incident_report"
  | "verification_summary"
  | "trace_appendix"
  | "claims_pack"
  | "legal_pack"
  | "technical_pack"
  | "administrative_packet"
  | "authenticity_receipt";

export interface InstitutionalRole {
  id: InstitutionalRoleId;
  labelEn: string;
  labelTr: string;
  shortPurposeEn: string;
  shortPurposeTr: string;
  primaryReviewPriority: string[];
  defaultSidebarOrder: number;
  preferredDocumentFamily: DocumentFamilyCode[];
  forbiddenConflationNote: string;
}

/** Immutable core fields — never lost, only reordered by role. */
export const CANONICAL_CORE_FIELDS = [
  "eventId",
  "bundleId",
  "manifestId",
  "receiptId",
  "version",
  "recorded",
  "derived",
  "unknownDisputed",
  "verificationTrace",
  "artifactIssuance",
] as const;

/** Institutional Role Shell Map v1. */
export const INSTITUTIONAL_ROLES: InstitutionalRole[] = [
  {
    id: "clerk",
    labelEn: "Clerk / Intake",
    labelTr: "Kâtip / Kabul",
    shortPurposeEn: "Intake, completeness, IDs, receipt.",
    shortPurposeTr: "Kabul, eksiksizlik, kimlikler, makbuz.",
    primaryReviewPriority: ["intake_summary", "completeness", "ids", "receipt"],
    defaultSidebarOrder: 1,
    preferredDocumentFamily: ["incident_report", "authenticity_receipt"],
    forbiddenConflationNote: "Do not conflate recorded and derived in intake view.",
  },
  {
    id: "field",
    labelEn: "Field / Police-Gendarmerie",
    labelTr: "Saha / Polis-Jandarma",
    shortPurposeEn: "Recorded evidence, source list, time sequence, trace.",
    shortPurposeTr: "Kayıtlı kanıt, kaynak listesi, zaman dizisi, iz.",
    primaryReviewPriority: ["recorded_evidence", "source_list", "time_sequence", "trace_appendix"],
    defaultSidebarOrder: 2,
    preferredDocumentFamily: ["incident_report", "trace_appendix", "verification_summary"],
    forbiddenConflationNote: "Recorded and derived must remain distinct.",
  },
  {
    id: "administrative",
    labelEn: "Administrative / Municipality-Public Body",
    labelTr: "İdari / Belediye-Kamu Kurumu",
    shortPurposeEn: "Administrative packet, version chain, access history.",
    shortPurposeTr: "İdari paket, sürüm zinciri, erişim geçmişi.",
    primaryReviewPriority: ["administrative_summary", "version_chain", "access_history"],
    defaultSidebarOrder: 3,
    preferredDocumentFamily: ["administrative_packet", "verification_summary"],
    forbiddenConflationNote: "Do not present derived as administrative fact.",
  },
  {
    id: "notary",
    labelEn: "Notary / Authenticity",
    labelTr: "Noter / Özgünlük",
    shortPurposeEn: "Manifest, receipt, version chain, authenticity signals.",
    shortPurposeTr: "Manifest, makbuz, sürüm zinciri, özgünlük sinyalleri.",
    primaryReviewPriority: ["manifest", "receipt", "version_chain", "authenticity_signals"],
    defaultSidebarOrder: 4,
    preferredDocumentFamily: ["authenticity_receipt", "verification_summary", "trace_appendix"],
    forbiddenConflationNote: "Authenticity does not imply liability or verdict.",
  },
  {
    id: "legal",
    labelEn: "Legal / Judge-Prosecutor-Counsel",
    labelTr: "Hukukî / Hakim-Savcı-Avukat",
    shortPurposeEn: "Recorded, derived, unknown-disputed, trace, legal pack.",
    shortPurposeTr: "Kayıtlı, türetilmiş, bilinmeyen-tartışmalı, iz, hukukî paket.",
    primaryReviewPriority: ["recorded", "derived", "unknown_disputed", "trace", "legal_pack"],
    defaultSidebarOrder: 5,
    preferredDocumentFamily: ["legal_pack", "verification_summary", "trace_appendix", "incident_report"],
    forbiddenConflationNote: "Derived ≠ verdict. Trace ≠ truth itself. Issuance ≠ blame.",
  },
  {
    id: "claims",
    labelEn: "Claims / Insurance",
    labelTr: "Hasar / Sigorta",
    shortPurposeEn: "Dispute-ready summary, canonical refs, claims pack.",
    shortPurposeTr: "İhtilafa hazır özet, kanonik referanslar, hasar paketi.",
    primaryReviewPriority: ["dispute_summary", "canonical_refs", "claims_pack"],
    defaultSidebarOrder: 6,
    preferredDocumentFamily: ["claims_pack", "verification_summary", "incident_report"],
    forbiddenConflationNote: "Claims pack is role-appropriate artifact, not liability finding.",
  },
  {
    id: "technical",
    labelEn: "Technical / Manufacturer-Autonomous-SaaS",
    labelTr: "Teknik / Üretici-Otonom-SaaS",
    shortPurposeEn: "System/scenario/event, source refs, packet structure, trace.",
    shortPurposeTr: "Sistem/senaryo/olay, kaynak referansları, paket yapısı, iz.",
    primaryReviewPriority: ["system_scenario_event", "source_references", "packet_structure", "trace"],
    defaultSidebarOrder: 7,
    preferredDocumentFamily: ["technical_pack", "trace_appendix", "incident_report"],
    forbiddenConflationNote: "Technical reconstruction is not fault assignment.",
  },
  {
    id: "oversight",
    labelEn: "Oversight / Auditor-Manager",
    labelTr: "Gözetim / Denetçi-Yönetici",
    shortPurposeEn: "Access/export/version/issuance history orientation.",
    shortPurposeTr: "Erişim/export/sürüm/issuance geçmişi yönlendirmesi.",
    primaryReviewPriority: ["access_history", "export_history", "version_history", "issuance_history"],
    defaultSidebarOrder: 8,
    preferredDocumentFamily: ["administrative_packet", "verification_summary", "authenticity_receipt"],
    forbiddenConflationNote: "Oversight view does not grant access beyond policy.",
  },
];

export function getInstitutionalRole(id: InstitutionalRoleId): InstitutionalRole | null {
  return INSTITUTIONAL_ROLES.find((r) => r.id === id) ?? null;
}

export function getInstitutionalRolesBySidebarOrder(): InstitutionalRole[] {
  return [...INSTITUTIONAL_ROLES].sort((a, b) => a.defaultSidebarOrder - b.defaultSidebarOrder);
}
