# QARAQUTU Brand Asset Manifest

Replace placeholder SVGs with final assets. Code expects these paths.

## Required Assets

| Path | Usage | Min Size | Notes |
|------|-------|----------|-------|
| `public/brand/logo-primary.svg` | Header, hero, footer, docs, deck, OG | 120×32 min | Horizontal mark |
| `public/brand/logo-icon.svg` | Favicon, app icon, small avatar | 32×32 | Square mark |
| `public/brand/seal.svg` | Report seal, artifact badge, PDF cover | 48×48 | Protocol stamp |

## Favicon / App Icon

| Path | Size | Format |
|------|------|--------|
| `public/favicon.ico` | 32×32 | ICO |
| `public/apple-touch-icon.png` | 180×180 | PNG |
| `public/icon-192.png` | 192×192 | PNG |
| `public/icon-512.png` | 512×512 | PNG |

## Usage Points (Code References)

- `apps/web/lib/brand.ts` — BRAND_PATHS
- `apps/web/app/components/LogoPrimary.tsx` — primary logo
- `apps/web/app/components/LogoIcon.tsx` — icon mark
- `apps/web/app/components/ProtocolSeal.tsx` — seal
- `apps/web/app/layout.tsx` — metadata, favicon
- `apps/web/app/page.tsx` — hero brand anchor
- `apps/web/app/docs/page.tsx` — docs brand anchor
