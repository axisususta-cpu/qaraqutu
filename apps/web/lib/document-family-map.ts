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
    code: "pass_witness_summary",
    labelEn: "PASS Witness Summary",
    labelTr: "PASS Tanık Özeti",
    shortPurposeEn: "Primary PASS issuance summary bound to the canonical witness line.",
    shortPurposeTr: "Kanonik tanıklık çizgisine bağlı ana PASS issuance özeti.",
    primaryAudience: ["claims", "field", "legal", "technical"],
    canonicalSections: ["Recorded", "Derived", "Verification Trace", "Issuance Notice"],
    sealMetadataNote: "Seal, receipt, and manifest linkage remain visible.",
    doctrineSafetyNote: "Witnesses the package. Does not assign blame or verdict.",
  },
  {
    code: "pass_verification_summary",
    labelEn: "PASS Verification Summary",
    labelTr: "PASS Doğrulama Özeti",
    shortPurposeEn: "PASS result on the main issuance line with bounded verification language.",
    shortPurposeTr: "Ana issuance çizgisinde bounded verification diliyle PASS sonucu.",
    primaryAudience: ["claims", "legal", "notary", "oversight"],
    canonicalSections: ["Verification State", "Trace Reference", "Recorded/Derived Separation"],
    sealMetadataNote: "Trace ref and receipt remain explicit.",
    doctrineSafetyNote: "PASS here is issuance posture, not liability truth.",
  },
  {
    code: "pass_incident_review_summary",
    labelEn: "PASS Incident Review Summary",
    labelTr: "PASS Olay İnceleme Özeti",
    shortPurposeEn: "Institution-ready review summary that stays within PASS issuance discipline.",
    shortPurposeTr: "PASS issuance disiplini içinde kalan kurum hazır inceleme özeti.",
    primaryAudience: ["legal", "claims", "administrative", "oversight"],
    canonicalSections: ["Incident Summary", "Recorded", "Derived", "Open Limitations"],
    sealMetadataNote: "Manifest and event IDs are prominent in the metadata bar.",
    doctrineSafetyNote: "Review summary does not elevate derived analysis into a ruling.",
  },
  {
    code: "pass_limitation_annex",
    labelEn: "PASS Limitation Annex",
    labelTr: "PASS Sınırlama Eki",
    shortPurposeEn: "Carries bounded gaps while preserving PASS on the main issuance line.",
    shortPurposeTr: "Ana issuance çizgisinde PASS’i korurken bounded boşlukları taşır.",
    primaryAudience: ["claims", "legal", "technical"],
    canonicalSections: ["Limitation Register", "Missing Inputs", "Bounded Notice"],
    sealMetadataNote: "Annex remains receipt-linked to the same PASS artifact package.",
    doctrineSafetyNote: "Missing support material does not become FAIL by itself.",
  },
  {
    code: "pass_vehicle_incident_report",
    labelEn: "PASS Vehicle Incident Report",
    labelTr: "PASS Araç Olay Raporu",
    shortPurposeEn: "Vehicle-sector incident report bound to the PASS witness and verification line.",
    shortPurposeTr: "PASS tanıklık ve doğrulama çizgisine bağlı araç-sektörü olay raporu.",
    primaryAudience: ["field", "claims", "legal"],
    canonicalSections: ["Vehicle Incident Context", "Recorded", "Derived", "Trace Ref"],
    sealMetadataNote: "Vehicle report inherits manifest and receipt linkage from issuance.",
    doctrineSafetyNote: "Incident report is not a blame sheet.",
  },
  {
    code: "integrity_failure_notice",
    labelEn: "Integrity Failure Notice",
    labelTr: "Bütünlük İhlali Bildirimi",
    shortPurposeEn: "FAIL notice reserved for re-verification and integrity breach handling.",
    shortPurposeTr: "Yalnızca yeniden doğrulama ve bütünlük ihlali hattına ayrılmış FAIL bildirimi.",
    primaryAudience: ["notary", "legal", "oversight"],
    canonicalSections: ["Re-Verification Outcome", "Integrity Checks", "Failure Classification"],
    sealMetadataNote: "Notice links back to the original PASS issuance receipt.",
    doctrineSafetyNote: "Artifact integrity failed; the event itself is not reclassified as a failed incident.",
  },
  {
    code: "tamper_detected_notice",
    labelEn: "Tamper Detected Notice",
    labelTr: "Kurcalama Tespit Bildirimi",
    shortPurposeEn: "Re-verification notice for a tampered returning copy.",
    shortPurposeTr: "Oynanmış geri dönen kopya için yeniden doğrulama bildirimi.",
    primaryAudience: ["notary", "legal", "technical"],
    canonicalSections: ["Tamper Findings", "Hash Mismatch", "Seal Comparison"],
    sealMetadataNote: "Compares returning copy with original seal metadata.",
    doctrineSafetyNote: "Tamper detection is about artifact integrity, not event blame.",
  },
  {
    code: "chain_breach_notice",
    labelEn: "Chain Breach Notice",
    labelTr: "Zincir Kırılması Bildirimi",
    shortPurposeEn: "Re-verification notice when receipt, manifest, or issue chain no longer match.",
    shortPurposeTr: "Makbuz, manifest veya issuance zinciri artık eşleşmediğinde kullanılan yeniden doğrulama bildirimi.",
    primaryAudience: ["notary", "oversight", "legal"],
    canonicalSections: ["Chain Comparison", "Receipt Reference", "Manifest Linkage"],
    sealMetadataNote: "Original and returning chain identifiers are shown side by side.",
    doctrineSafetyNote: "Broken chain invalidates the artifact copy, not the underlying event record.",
  },
  {
    code: "artifact_invalidity_notice",
    labelEn: "Artifact Invalidity Notice",
    labelTr: "Artefakt Geçersizlik Bildirimi",
    shortPurposeEn: "Final notice for artifact copies that can no longer be treated as valid issuance outputs.",
    shortPurposeTr: "Artık geçerli issuance çıktısı sayılamayan artefakt kopyaları için nihai bildirim.",
    primaryAudience: ["legal", "notary", "oversight"],
    canonicalSections: ["Invalidity Basis", "Re-Verification Trace", "Original Receipt Link"],
    sealMetadataNote: "Original receipt linkage remains visible for institutional filing.",
    doctrineSafetyNote: "Invalid artifact copy does not rewrite canonical truth claims.",
  },
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
