/**
 * Role Shell Config v1.
 * Verifier/UI shell guidance — structure and typing only.
 * No backend; future role-based shells can plug in here.
 */

import type { InstitutionalRoleId } from "./institutional-roles";
import type { DocumentFamilyCode } from "./institutional-roles";
import { getInstitutionalRole } from "./institutional-roles";
import { getRoleOrdering } from "./role-information-ordering";
import { getDocumentFamiliesForRole } from "./document-family-map";

export interface RoleShellPresentationHooks {
  roleId: InstitutionalRoleId;
  sectionOrder: string[];
  sectionEmphasis: Record<string, "primary" | "secondary" | "tertiary">;
  recommendedDocuments: DocumentFamilyCode[];
  coverSubtitleKey?: string;
}

/**
 * Role-specific presentation hooks — for future Verifier/UI integration.
 * Structure only; no runtime role switching until backend supports it.
 */
export function getRoleShellHooks(roleId: InstitutionalRoleId): RoleShellPresentationHooks | null {
  const role = getInstitutionalRole(roleId);
  const ordering = getRoleOrdering(roleId);
  const docFamilies = getDocumentFamiliesForRole(roleId);

  if (!role || !ordering) return null;

  return {
    roleId,
    sectionOrder: ordering.sectionOrder,
    sectionEmphasis: ordering.emphasisMap as Record<string, "primary" | "secondary" | "tertiary">,
    recommendedDocuments: role.preferredDocumentFamily,
    coverSubtitleKey: role.shortPurposeEn,
  };
}

/** Role-specific document recommendation map — for document/export UI. */
export function getDocumentRecommendationMap(roleId: InstitutionalRoleId): DocumentFamilyCode[] {
  const role = getInstitutionalRole(roleId);
  return role?.preferredDocumentFamily ?? [];
}

/** Role-specific section emphasis — for future Verifier layout. */
export function getSectionEmphasisMap(roleId: InstitutionalRoleId): Record<string, "primary" | "secondary" | "tertiary"> | null {
  const ordering = getRoleOrdering(roleId);
  return ordering?.emphasisMap ?? null;
}
