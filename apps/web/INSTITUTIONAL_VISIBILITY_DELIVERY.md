# QARAQUTU Institutional Visibility Layer — Delivery Report

**Scope:** Local edit only. No deploy, no smoke, no browser, no Vercel.

---

## 1. Exact Files Changed

### Added
- `apps/web/app/components/institutional/InstitutionalUseFamilies.tsx` — 8-role cards for landing
- `apps/web/app/components/institutional/InstitutionalGuidanceStrip.tsx` — "How this review reads by role" for Verifier
- `apps/web/app/components/institutional/RoleDocumentMapping.tsx` — Role → Document family matrix
- `apps/web/app/components/institutional/DocumentFamilyRoleMatrix.tsx` — Document family → Primary audience matrix
- `apps/web/INSTITUTIONAL_VISIBILITY_DELIVERY.md` — This report

### Modified
- `apps/web/app/page.tsx` — Institutional use families section
- `apps/web/app/docs/page.tsx` — RoleDocumentMapping, DocumentFamilyRoleMatrix in institutional section
- `apps/web/app/verifier/VerifierContent.tsx` — InstitutionalGuidanceStrip below topbar

---

## 2. Exact Landing Additions

- **Section:** "Institutional use families"
- **Copy:** "One canonical event core, many institutional shells. The same event spine is preserved; only priority, visibility, and document recommendation vary by role."
- **Component:** InstitutionalUseFamilies — 8 role cards (clerk, field, administrative, notary, legal, claims, technical, oversight) with label + short purpose

---

## 3. Exact Docs Additions

- **RoleDocumentMapping** — Role → preferred document family table
- **DocumentFamilyRoleMatrix** — Document family → primary audience table
- **Copy:** "Each role has a primary review priority, preferred document family, and forbidden conflation note."

---

## 4. Exact Verifier Additions

- **InstitutionalGuidanceStrip** — Static strip below topbar
- **Label:** "How this review reads by role"
- **Content:** Legal, Field, Technical, Claims — each with short purpose
- No backend role switching; explanatory only

---

## 5. Exact Role/Document Visibility Improvements

- Role → Document family (RoleDocumentMapping)
- Document family → Primary audience (DocumentFamilyRoleMatrix)
- 8 roles visible on landing
- 4 roles (legal, field, technical, claims) in Verifier guidance strip

---

## 6. Exact Reusable Components/Config Used

- `lib/institutional-roles.ts` — getInstitutionalRolesBySidebarOrder, getInstitutionalRole
- `lib/document-family-map.ts` — DOCUMENT_FAMILY_MAP
- New: InstitutionalUseFamilies, InstitutionalGuidanceStrip, RoleDocumentMapping, DocumentFamilyRoleMatrix

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

- Visual appearance in browser
- Verifier strip layout on narrow viewports
