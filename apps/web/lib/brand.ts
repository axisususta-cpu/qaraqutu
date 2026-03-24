/**
 * QARAQUTU Brand System v1.
 * Usage hierarchy, paths, and design tokens.
 * Internal discipline — not public copy.
 */

export const BRAND = {
  name: "QARAQUTU",
  tagline: "Witness · Verifier · Trace · Issuance",
  /** Primary brand motto — EN surface. */
  motto: "Does not judge. It witnesses.",
  /** Primary brand motto — TR. */
  mottoTr: "Hüküm vermez. Şahitlik eder.",
  description:
    "Verifier-first witness protocol for dispute-grade event packages across Vehicle, Drone, and Robot.",
} as const;

/** Asset paths — QARAQUTU logo family. Final variants from brand-final-variants. */
export const BRAND_PATHS = {
  /** Explicit variant paths — future-proof for light/dark theme switching. */
  primaryLight: "/brand/logo-primary.svg",
  primaryDark: "/brand/logo-qaraqutu.svg",
  sealLight: "/brand/logo-seal-light.svg",
  sealDark: "/brand/logo-seal-dark.svg",
  iconSquareLight: "/brand/logo-icon-square-light.svg",
  iconSquareDark: "/brand/logo-icon-square-dark.svg",
  /** Live defaults — light theme (current QARAQUTU UI). */
  primaryLogo: "/brand/logo-primary.svg",
  seal: "/brand/logo-seal-light.svg",
  iconMark: "/brand/logo-icon-square-light.svg",
  iconMarkPng: "/brand/logo-icon-square.png",
  /** Cube-only mark — micro/secondary usage. */
  cubeMark: "/brand/logo-cube.svg",
  /** Wordmark monument — supporting visual only, not primary logo. */
  wordmarkMonument: "/brand/logo-wordmark-monument.svg",
  /** Multilingual support — supporting visual only. */
  multilingualSupport: "/brand/brand-multilingual-support.svg",
  /** OG/social preview — 1200×630. */
  ogImage: "/brand/og-image.png",
} as const;

/** Color tokens — light theme, logo-aligned. Use THEME from lib/theme as source of truth. */
export const BRAND_COLORS = {
  /** Page background — warm institutional. */
  bg: "#faf8f6",
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
