/**
 * QARAQUTU — Canonical report / artifact authority model.
 * Doctrine-safe: no verdict language, no blame assignment, no crypto theater.
 * Maps issuance profiles and sectors to visible document families without treating them as separate products.
 */

import type { ExportProfileCode } from "contracts";
import type { Lang } from "./i18n/messages";
import { MSG } from "./i18n/messages";

export type CanonicalSectorId = "vehicle" | "drone" | "robot";

/** Visible document families — authority metadata, not separate SKUs. */
export type DocumentFamilyId =
  | "incident_event"
  | "verification_summary"
  | "trace_appendix"
  | "claims_pack"
  | "legal_pack"
  | "technical_pack"
  | "administrative_packet"
  | "authenticity_receipt";

/** Institution-facing audience — selects jargon layer only; does not change canonical record. */
export type InstitutionAudienceId =
  | "insurance_claims"
  | "notary_authenticity"
  | "legal_court"
  | "municipality_admin"
  | "police_field"
  | "technical_vendor";

export const DOCUMENT_FAMILY_IDS: DocumentFamilyId[] = [
  "incident_event",
  "verification_summary",
  "trace_appendix",
  "claims_pack",
  "legal_pack",
  "technical_pack",
  "administrative_packet",
  "authenticity_receipt",
];

/** Resolve localized document family title from the shared dictionary. */
export function documentFamilyLabel(id: DocumentFamilyId, lang: Lang): string {
  const m = MSG[lang];
  const key: Record<DocumentFamilyId, keyof typeof MSG.en> = {
    incident_event: "docFamily_incidentEvent",
    verification_summary: "docFamily_verificationSummary",
    trace_appendix: "docFamily_traceAppendix",
    claims_pack: "docFamily_claimsPack",
    legal_pack: "docFamily_legalPack",
    technical_pack: "docFamily_technicalPack",
    administrative_packet: "docFamily_administrativePacket",
    authenticity_receipt: "docFamily_authenticityReceipt",
  };
  return m[key[id]] as string;
}

export function sectorIncidentReportLabel(sector: CanonicalSectorId, lang: Lang): string {
  const m = MSG[lang];
  const key: Record<CanonicalSectorId, keyof typeof MSG.en> = {
    vehicle: "docSector_vehicleIncident",
    drone: "docSector_droneIncident",
    robot: "docSector_robotIncident",
  };
  return m[key[sector]] as string;
}

export function artifactProfileToDocumentFamily(profile: ExportProfileCode | null | undefined): DocumentFamilyId {
  if (profile === "claims") return "claims_pack";
  if (profile === "legal") return "legal_pack";
  return "verification_summary";
}

/** Primary family shown when issuing; incident layer is always named by sector for context. */
export function resolveIssuanceDocumentFamilies(
  profile: ExportProfileCode,
  sector: CanonicalSectorId
): { primary: DocumentFamilyId; contextualIncident: CanonicalSectorId } {
  return {
    primary: artifactProfileToDocumentFamily(profile),
    contextualIncident: sector,
  };
}

export const DEFAULT_AUDIENCE_BY_PROFILE: Record<ExportProfileCode, InstitutionAudienceId> = {
  claims: "insurance_claims",
  legal: "legal_court",
};

export const INSTITUTION_AUDIENCES: InstitutionAudienceId[] = [
  "insurance_claims",
  "notary_authenticity",
  "legal_court",
  "municipality_admin",
  "police_field",
  "technical_vendor",
];
