# QARAQUTU Brand System — Delivery Report

**Scope:** Local edit only. No deploy, no smoke, no browser, no Vercel.

---

## 1. Exact Files Changed

### Modified
- `apps/web/app/layout.tsx` — LogoPrimary in header/footer, metadata, icons, manifest
- `apps/web/app/page.tsx` — LogoPrimary hero, VerticalsDiagram, CanonicalSpineDiagram, EvidenceLayerDiagram, RoleExportDiagram
- `apps/web/app/docs/page.tsx` — LogoPrimary brand anchor, Document/artifact family section

### Added
- `apps/web/lib/brand.ts` — Brand constants, paths, colors, usage hierarchy
- `apps/web/BRAND_ASSET_MANIFEST.md` — Required asset paths, usage points
- `apps/web/BRAND_SYSTEM_DELIVERY.md` — This delivery report
- `apps/web/public/brand/logo-primary.svg` — Primary logo placeholder
- `apps/web/public/brand/logo-icon.svg` — Icon mark placeholder
- `apps/web/public/brand/seal.svg` — Protocol seal placeholder
- `apps/web/public/manifest.json` — PWA manifest
- `apps/web/app/components/LogoPrimary.tsx` — Primary logo component
- `apps/web/app/components/LogoIcon.tsx` — Icon mark component
- `apps/web/app/components/ProtocolSeal.tsx` — Seal component
- `apps/web/app/components/diagrams/VerticalsDiagram.tsx` — One product / three verticals
- `apps/web/app/components/diagrams/CanonicalSpineDiagram.tsx` — System → Scenario → Event → Review
- `apps/web/app/components/diagrams/EvidenceLayerDiagram.tsx` — Recorded, Derived, Unknown, Trace, Issuance
- `apps/web/app/components/diagrams/RoleExportDiagram.tsx` — Claims, Legal, Technical
- `apps/web/app/components/diagrams/index.ts` — Diagram exports
- `apps/web/app/components/documents/DocumentShell.tsx` — Reusable report shell
- `apps/web/app/components/documents/DocumentMetadataBlock.tsx` — Metadata block
- `apps/web/app/components/documents/DocumentSection.tsx` — Document section
- `apps/web/app/components/documents/index.ts` — Document exports

---

## 2. Exact Brand System Additions

- **lib/brand.ts:** BRAND, BRAND_PATHS, BRAND_COLORS, BRAND_USAGE
- **Primary logo:** `/brand/logo-primary.svg` — header, hero, footer, docs
- **Icon mark:** `/brand/logo-icon.svg` — favicon, app icon
- **Seal:** `/brand/seal.svg` — report seal, artifact badge, document cover
- **Metadata:** title, description, icons, openGraph, manifest

---

## 3. Exact Logo Usage Points

| Location | Component | Size |
|----------|-----------|------|
| Header | LogoPrimary | 26px |
| Footer | LogoPrimary | 20px |
| Hero | LogoPrimary | 32px |
| Docs | LogoPrimary | 28px |
| Document cover | LogoPrimary + ProtocolSeal | 24px + 40px seal |

---

## 4. Exact Investor-Narrative Visual Additions

- **VerticalsDiagram** — Vehicle, Drone, Robot with trace labels
- **CanonicalSpineDiagram** — System → Scenario → Event → Review
- **EvidenceLayerDiagram** — Recorded, Derived, Unknown/Disputed, Trace, Issuance
- **RoleExportDiagram** — Claims, Legal, Technical packs

Integrated into: `app/page.tsx` (Problem + system, Role-aware + Export family sections)

---

## 5. Exact Artifact/Document System Additions

- **DocumentShell** — Cover with logo + seal, metadata bar, footer
- **DocumentMetadataBlock** — Doctrine-preserving section (Recorded, Derived, etc.)
- **DocumentSection** — Heading hierarchy, numbering
- **Docs page** — "Document / artifact family" section describing structure

---

## 6. Exact Reusable Components or Structures Added

- `LogoPrimary`, `LogoIcon`, `ProtocolSeal`
- `VerticalsDiagram`, `CanonicalSpineDiagram`, `EvidenceLayerDiagram`, `RoleExportDiagram`
- `DocumentShell`, `DocumentMetadataBlock`, `DocumentSection`
- `lib/brand.ts` — Single source for brand constants

---

## 7. Exact Files Requiring Future Asset Replacement

See `BRAND_ASSET_MANIFEST.md`. Replace when final assets available:

- `public/brand/logo-primary.svg`
- `public/brand/logo-icon.svg`
- `public/brand/seal.svg`
- Optional: `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`

---

## 8. Commit SHA

Pre-commit HEAD: `3fc44af`. Changes are uncommitted.

---

## 9. Pushed

**No.**

---

## 10. Deployed

**No.**

---

## 11. What Remains Unverified

- Visual appearance in browser (no smoke)
- Favicon display in browser tab
- Manifest registration
- Document shell in live export flow (components exist; export UI integration not done)
- OG/social preview rendering
