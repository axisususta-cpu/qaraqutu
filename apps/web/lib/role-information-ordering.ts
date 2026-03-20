/**
 * Role-specific information ordering v1.
 * Skeleton for role-adaptive presentation — no backend.
 * Immutable core: Event ID, Bundle ID, Manifest ID, Receipt ID, Version,
 * Recorded, Derived, Unknown/Disputed, Verification Trace, Artifact Issuance.
 */

import type { InstitutionalRoleId } from "./institutional-roles";

export type SectionKey =
  | "intake_summary"
  | "completeness"
  | "ids"
  | "receipt"
  | "recorded_evidence"
  | "source_list"
  | "time_sequence"
  | "trace_appendix"
  | "administrative_summary"
  | "version_chain"
  | "access_history"
  | "manifest"
  | "authenticity_signals"
  | "recorded"
  | "derived"
  | "unknown_disputed"
  | "trace"
  | "legal_pack"
  | "dispute_summary"
  | "canonical_refs"
  | "claims_pack"
  | "system_scenario_event"
  | "source_references"
  | "packet_structure"
  | "export_history"
  | "version_history"
  | "issuance_history";

export interface RoleOrderingDefinition {
  roleId: InstitutionalRoleId;
  sectionOrder: SectionKey[];
  emphasisMap: Partial<Record<SectionKey, "primary" | "secondary" | "tertiary">>;
}

/** Role-specific section ordering — config only, no runtime switching yet. */
export const ROLE_ORDERING_DEFINITIONS: RoleOrderingDefinition[] = [
  {
    roleId: "clerk",
    sectionOrder: ["intake_summary", "completeness", "ids", "receipt"],
    emphasisMap: { intake_summary: "primary", completeness: "primary", ids: "secondary", receipt: "secondary" },
  },
  {
    roleId: "field",
    sectionOrder: ["recorded_evidence", "source_list", "time_sequence", "trace_appendix"],
    emphasisMap: { recorded_evidence: "primary", source_list: "primary", time_sequence: "secondary", trace_appendix: "secondary" },
  },
  {
    roleId: "administrative",
    sectionOrder: ["administrative_summary", "version_chain", "access_history"],
    emphasisMap: { administrative_summary: "primary", version_chain: "secondary", access_history: "tertiary" },
  },
  {
    roleId: "notary",
    sectionOrder: ["manifest", "receipt", "version_chain", "authenticity_signals"],
    emphasisMap: { manifest: "primary", receipt: "primary", version_chain: "secondary", authenticity_signals: "secondary" },
  },
  {
    roleId: "legal",
    sectionOrder: ["recorded", "derived", "unknown_disputed", "trace", "legal_pack"],
    emphasisMap: { recorded: "primary", derived: "primary", unknown_disputed: "primary", trace: "secondary", legal_pack: "secondary" },
  },
  {
    roleId: "claims",
    sectionOrder: ["dispute_summary", "canonical_refs", "claims_pack"],
    emphasisMap: { dispute_summary: "primary", canonical_refs: "primary", claims_pack: "secondary" },
  },
  {
    roleId: "technical",
    sectionOrder: ["system_scenario_event", "source_references", "packet_structure", "trace"],
    emphasisMap: { system_scenario_event: "primary", source_references: "primary", packet_structure: "secondary", trace: "secondary" },
  },
  {
    roleId: "oversight",
    sectionOrder: ["access_history", "export_history", "version_history", "issuance_history"],
    emphasisMap: { access_history: "primary", export_history: "primary", version_history: "secondary", issuance_history: "secondary" },
  },
];

export function getRoleOrdering(roleId: InstitutionalRoleId): RoleOrderingDefinition | null {
  return ROLE_ORDERING_DEFINITIONS.find((r) => r.roleId === roleId) ?? null;
}
