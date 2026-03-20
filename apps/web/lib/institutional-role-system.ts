/**
 * Institutional Role System v1 — barrel export.
 * One canonical event core, many institutional shells.
 */

export {
  type InstitutionalRoleId,
  type InstitutionalRole,
  type DocumentFamilyCode,
  CANONICAL_CORE_FIELDS,
  INSTITUTIONAL_ROLES,
  getInstitutionalRole,
  getInstitutionalRolesBySidebarOrder,
} from "./institutional-roles";

export {
  type SectionKey,
  type RoleOrderingDefinition,
  ROLE_ORDERING_DEFINITIONS,
  getRoleOrdering,
} from "./role-information-ordering";

export {
  type DocumentFamilyMeta,
  DOCUMENT_FAMILY_MAP,
  getDocumentFamily,
  getDocumentFamiliesForRole,
} from "./document-family-map";

export {
  type RoleShellPresentationHooks,
  getRoleShellHooks,
  getDocumentRecommendationMap,
  getSectionEmphasisMap,
} from "./role-shell-config";
