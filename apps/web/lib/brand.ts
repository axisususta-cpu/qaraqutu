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

/** Asset paths — replace with final assets when available. */
export const BRAND_PATHS = {
  /** Primary horizontal logo — header, hero, footer, deck/OG. */
  primaryLogo: "/brand/logo-primary.svg",
  /** Square/icon mark — favicon, app icon, small avatar, utility. */
  iconMark: "/brand/logo-icon.svg",
  /** Seal/protocol badge — report seal, artifact badge, PDF cover, verification stamp. */
  seal: "/brand/seal.svg",
} as const;

/** Color tokens — canonical. */
export const BRAND_COLORS = {
  /** Dark base — canonical seriousness, witness protocol, record gravity. */
  darkBase: "#060d1a",
  nearBlackNavy: "#050b16",
  /** Orange — active emphasis, verification attention, controlled signal. */
  accent: "#D4561A",
  accentSoft: "rgba(212, 86, 26, 0.10)",
  accentBorder: "#B54516",
  /** Gray grid / trace lines — infrastructure, protocol trace, structural layer. */
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.8)",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
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
  darkBackground: {
    textColor: BRAND_COLORS.text,
    logoVariant: "light",
  },
  lightBackground: {
    textColor: "#0a1628",
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
