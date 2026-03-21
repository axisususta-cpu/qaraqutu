/**
 * QARAQUTU Brand System v1.
 * Usage hierarchy, paths, and design tokens.
 * Internal discipline — not public copy.
 */

export const BRAND = {
  name: "QARAQUTU",
  tagline: "Witness · Verifier · Trace · Issuance",
  description:
    "Verifier-first witness protocol for dispute-grade event packages across Vehicle, Drone, and Robot.",
} as const;

/** Asset paths — QARAQUTU logo family. Real assets from brand-drop. */
export const BRAND_PATHS = {
  /** Primary horizontal logo — header, hero, footer, docs, one-page intro. */
  primaryLogo: "/brand/logo-primary.svg",
  /** Square/icon mark — favicon, app icon, manifest, compact utility. */
  iconMark: "/brand/logo-icon-square.svg",
  iconMarkPng: "/brand/logo-icon-square.png",
  /** Seal/protocol badge — document cover, report seal, artifact badge, verification stamp. */
  seal: "/brand/logo-seal.svg",
  /** Cube-only mark — micro/secondary usage. */
  cubeMark: "/brand/logo-cube.svg",
  /** Wordmark monument — supporting visual only, not primary logo. */
  wordmarkMonument: "/brand/logo-wordmark-monument.svg",
  /** Multilingual support — supporting visual only. */
  multilingualSupport: "/brand/brand-multilingual-support.svg",
  /** OG/social preview — 1200×630. */
  ogImage: "/brand/og-image.png",
} as const;

/** Color tokens — light theme, logo-aligned. */
export const BRAND_COLORS = {
  /** Page background — institutional off-white. */
  bg: "#f5f6f8",
  /** Surface — white panels. */
  panel: "#ffffff",
  /** Primary text — near-black. */
  text: "#0a0a0a",
  textSoft: "#374151",
  textMuted: "#6b7280",
  /** Borders — trace gray. */
  border: "#d1d5db",
  borderSoft: "#e5e7eb",
  /** Orange — accent from logo. */
  accent: "#D4561A",
  accentSoft: "rgba(212, 86, 26, 0.08)",
  accentBorder: "#B54516",
} as const;

/** Usage hierarchy — internal discipline. */
export const BRAND_USAGE = {
  primary: {
    contexts: ["header", "hero", "footer", "docs-brand", "deck", "og"],
    minHeight: 24,
    clearspace: 8,
  },
  compact: {
    contexts: ["favicon", "app-icon", "avatar", "utility"],
    maxSize: 32,
    useIconMark: true,
  },
  seal: {
    contexts: ["report-seal", "artifact-badge", "pdf-cover", "verification-stamp"],
    maxSize: 48,
    useAsTrustMark: true,
    notAsPrimaryLogo: true,
  },
  lightBackground: {
    textColor: BRAND_COLORS.text,
    logoVariant: "dark",
  },
  orangeEmphasis: {
    useSparingly: true,
    contexts: ["cta", "active-state", "verification-attention"],
  },
  forbidden: [
    "Orange everywhere",
    "Logo stretched or distorted",
    "Seal as primary logo",
    "Playful or flashy tone",
  ],
} as const;
