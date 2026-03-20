# QARAQUTU Institutional Role Shell Map v1 — Delivery Report

**Scope:** Local edit only. No deploy, no smoke, no browser, no Vercel.

---

## 1. Exact Files Changed

### Added
- `apps/web/lib/institutional-roles.ts` — Role model, 8 roles, CANONICAL_CORE_FIELDS
- `apps/web/lib/role-information-ordering.ts` — Role-specific section ordering
- `apps/web/lib/document-family-map.ts` — Document family mapping to roles
- `apps/web/lib/role-shell-config.ts` — Verifier/UI shell hooks (structure only)
- `apps/web/lib/institutional-role-system.ts` — Barrel export
- `apps/web/INSTITUTIONAL_ROLE_SHELL_DELIVERY.md` — This report

### Modified
- `apps/web/app/docs/page.tsx` — "Institutional use families" section
- `apps/web/app/components/documents/DocumentShell.tsx` — roleTargetedSubtitle prop

---

## 2. Exact Role Model / Shell Map Additions

**8 Institutional Roles:**
- clerk / intake
- field / police-gendarmerie
- administrative / municipality-public-body
- notary / authenticity
- legal / judge-prosecutor-counsel
- claims / insurance
- technical / manufacturer-autonomous-saas
- oversight / auditor-manager

**Per role:** id, labelEn, labelTr, shortPurposeEn, shortPurposeTr, primaryReviewPriority, defaultSidebarOrder, preferredDocumentFamily, forbiddenConflationNote

**Immutable core:** eventId, bundleId, manifestId, receiptId, version, recorded, derived, unknownDisputed, verificationTrace, artifactIssuance

---

## 3. Exact Verifier/UI Structure Additions

- `lib/role-shell-config.ts` — getRoleShellHooks, getDocumentRecommendationMap, getSectionEmphasisMap
- RoleOrderingDefinition — sectionOrder, emphasisMap per role
- RoleShellPresentationHooks — sectionOrder, sectionEmphasis, recommendedDocuments, coverSubtitleKey

---

## 4. Exact Docs Additions

**Section:** "Institutional use families — Role-based review and export mapping"

- One canonical event core, many institutional shells
- Same event spine preserved; priority/visibility/document vary by role
- 8 institutional roles, trace-linked document families
- Authenticity, receipt, version visibility
- Note: Role-based shells are structural; backend role switching not yet implemented

---

## 5. Exact Document Family Mapping Additions

**8 Document Families:**
- Incident / Event Report
- Verification Summary
- Trace Appendix
- Claims Pack
- Legal Pack
- Technical Pack
- Administrative Packet
- Authenticity Receipt

**Per family:** code, labelEn, labelTr, shortPurposeEn, shortPurposeTr, primaryAudience, canonicalSections, sealMetadataNote, doctrineSafetyNote

---

## 6. Exact Reusable Config/Constants/Components Added or Updated

- `institutional-roles.ts` — INSTITUTIONAL_ROLES, CANONICAL_CORE_FIELDS
- `role-information-ordering.ts` — ROLE_ORDERING_DEFINITIONS
- `document-family-map.ts` — DOCUMENT_FAMILY_MAP
- `role-shell-config.ts` — getRoleShellHooks, getDocumentRecommendationMap, getSectionEmphasisMap
- `institutional-role-system.ts` — barrel
- DocumentShell — roleTargetedSubtitle prop

---

## 7. Exact Commit SHA

Not committed.

---

## 8. Pushed

**No.**

---

## 9. Deployed

**No.**

---

## 10. What Remains Unverified

- Role shell integration in Verifier UI (structure only; no runtime switching)
- Document family usage in export flow
- TR/EN labels in live UI
