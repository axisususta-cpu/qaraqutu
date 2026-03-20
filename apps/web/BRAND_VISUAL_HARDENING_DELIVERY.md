# QARAQUTU Logo + Document Visual Hardening — Delivery Report

**Scope:** Local edit only. No deploy, no smoke, no browser, no Vercel.

---

## 1. Exact Files Changed

### Modified
- `apps/web/public/brand/logo-primary.svg` — Geometric Q + wordmark
- `apps/web/public/brand/logo-icon.svg` — Refined square mark with Q
- `apps/web/public/brand/seal.svg` — Protocol stamp with concentric circles
- `apps/web/app/layout.tsx` — OG image, Twitter card, metadataBase
- `apps/web/lib/brand.ts` — BRAND_PATHS.ogImage
- `apps/web/BRAND_ASSET_MANIFEST.md` — Updated asset list
- `apps/web/app/components/documents/DocumentShell.tsx` — Cover, metadata grid, receipt/manifest/trace props, footer doctrine
- `apps/web/app/components/documents/DocumentMetadataBlock.tsx` — Typography, spacing
- `apps/web/app/components/documents/DocumentSection.tsx` — Heading border, spacing
- `apps/web/app/components/documents/index.ts` — DocumentLinkageSlot export

### Added
- `apps/web/public/brand/og-image.svg` — 1200×630 social preview
- `apps/web/app/components/documents/DocumentLinkageSlot.tsx` — QR/receipt/manifest/trace slot

---

## 2. Exact Placeholder Assets Replaced

| Asset | Before | After |
|-------|--------|-------|
| `logo-primary.svg` | Text-only "QARAQUTU" | Geometric Q + wordmark |
| `logo-icon.svg` | Rect + "Q" text | Geometric Q in square |
| `seal.svg` | Circle + "Q" text | Concentric circles + geometric Q |

---

## 3. Exact Logo Usage Points Updated

- Header: LogoPrimary 26px (unchanged)
- Footer: LogoPrimary 20px (unchanged)
- Hero: LogoPrimary 32px (unchanged)
- Docs: LogoPrimary 28px (unchanged)
- Document cover: LogoPrimary 28px, ProtocolSeal 44px
- Favicon/app icon: `/brand/logo-icon.svg` (unchanged path)
- OG/social: `/brand/og-image.svg` (new)
- metadataBase: `NEXT_PUBLIC_APP_URL` or `https://qaraqutu-web.vercel.app`

---

## 4. Exact Document/Artifact Visual Hardening Changes

- **DocumentShell:** Cover gradient, stronger metadata grid, receiptId/manifestRef/traceRef props, footer doctrine (Recorded/Derived/Unknown/Trace/Issuance)
- **DocumentMetadataBlock:** Panel background, letter-spacing, border
- **DocumentSection:** Section heading border-bottom, spacing
- **DocumentLinkageSlot:** New component for QR/receipt/manifest/trace linkage areas

---

## 5. Exact Reusable Components Adjusted

- `DocumentShell` — receiptId, manifestRef, traceRef; cover layout; metadata grid
- `DocumentMetadataBlock` — background, typography
- `DocumentSection` — heading style
- `DocumentLinkageSlot` — new

---

## 6. Exact Commit SHA

Not committed. Changes are uncommitted.

---

## 7. Pushed

**No.**

---

## 8. Deployed

**No.**

---

## 9. What Remains Unverified

- Visual appearance in browser
- OG image resolution in social platforms (metadataBase set)
- Document shell in live export flow
- Favicon/icon display
