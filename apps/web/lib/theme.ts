/**
 * QARAQUTU Theme System — light and dark.
 * Both modes derive from the same brand palette: orange/black/gray from the real logo family.
 * Use THEME (light default) or DARK_THEME. CSS custom properties are the runtime source of truth.
 */

export const THEME = {
  /** Page background — warm light, institutional, logo-adjacent. */
  bg: "#faf8f6",
  /** Header/footer surface. */
  headerBg: "#ffffff",
  /** Raised panels, cards. */
  panel: "#ffffff",
  panelRaised: "#fefdfb",
  panelCard: "#f8f6f4",
  /** Interactive surface — hover, selected. */
  surface: "rgba(212, 86, 26, 0.06)",
  /** Primary text — near-black, record gravity, logo ink. */
  text: "#080808",
  /** Secondary text. */
  textSoft: "#2d3748",
  /** Muted labels, trace. */
  textMuted: "#5a6578",
  textDim: "#8b95a5",
  /** Borders — graphite/trace gray, premium. */
  border: "#c9cfd6",
  borderSoft: "#e2e6ea",
  borderMuted: "#f0f1f3",
  borderStrong: "#8b95a5",
  borderSubtle: "rgba(0, 0, 0, 0.05)",
  /** Accent — orange from logo, selective emphasis. */
  accent: "#D4561A",
  accentSoft: "rgba(212, 86, 26, 0.1)",
  accentBorder: "#B54516",
  accentHover: "rgba(212, 86, 26, 0.14)",
  /** Active/hover states. */
  activeBg: "rgba(212, 86, 26, 0.08)",
  /** Orange chip/badge — protocol-grade emphasis, use sparingly. */
  chipBg: "rgba(212, 86, 26, 0.1)",
  chipBorder: "rgba(212, 86, 26, 0.22)",
  chipText: "#D4561A",
  /** CTA gradient — primary action only. */
  ctaGradient: "linear-gradient(135deg, #D4561A, #B54516)",
  ctaShadow: "0 2px 12px rgba(212, 86, 26, 0.2)",
  /** Protocol state colors (doctrine-preserving). */
  success: "#059669",
  successSoft: "rgba(5, 150, 105, 0.08)",
  successBorder: "rgba(5, 150, 105, 0.25)",
  warning: "#D97706",
  warningSoft: "rgba(217, 119, 6, 0.08)",
  warningBorder: "rgba(217, 119, 6, 0.25)",
  error: "#DC2626",
  errorSoft: "rgba(220, 38, 38, 0.08)",
  errorBorder: "rgba(220, 38, 38, 0.25)",
  blue: "#2563EB",
  blueSoft: "rgba(37, 99, 235, 0.08)",
  blueBorder: "rgba(37, 99, 235, 0.25)",
} as const;

/**
 * QARAQUTU Dark Theme — deep graphite, orange accent, same brand.
 * Same institution; different surface. Not cyberpunk, not startup-dark.
 */
export const DARK_THEME = {
  bg: "#0c0c0b",
  headerBg: "#111110",
  panel: "#161614",
  panelRaised: "#1a1a18",
  panelCard: "#1e1e1c",
  surface: "rgba(255, 107, 43, 0.07)",
  text: "#f0ede8",
  textSoft: "#c5c0b5",
  textMuted: "#7a7568",
  textDim: "#4d4840",
  border: "#2c2b28",
  borderSoft: "#222220",
  borderMuted: "#1c1c1a",
  borderStrong: "#454540",
  borderSubtle: "rgba(255,255,255, 0.04)",
  accent: "#FF6B2B",
  accentSoft: "rgba(255, 107, 43, 0.12)",
  accentBorder: "#E05A1C",
  accentHover: "rgba(255, 107, 43, 0.18)",
  activeBg: "rgba(255, 107, 43, 0.09)",
  chipBg: "rgba(255, 107, 43, 0.12)",
  chipBorder: "rgba(255, 107, 43, 0.28)",
  chipText: "#FF7A3D",
  ctaGradient: "linear-gradient(135deg, #FF6B2B, #D4561A)",
  ctaShadow: "0 2px 16px rgba(255, 107, 43, 0.25)",
  success: "#10b981",
  successSoft: "rgba(16, 185, 129, 0.1)",
  successBorder: "rgba(16, 185, 129, 0.28)",
  warning: "#F59E0B",
  warningSoft: "rgba(245, 158, 11, 0.1)",
  warningBorder: "rgba(245, 158, 11, 0.28)",
  error: "#EF4444",
  errorSoft: "rgba(239, 68, 68, 0.1)",
  errorBorder: "rgba(239, 68, 68, 0.28)",
  blue: "#3B82F6",
  blueSoft: "rgba(59, 130, 246, 0.1)",
  blueBorder: "rgba(59, 130, 246, 0.28)",
} as const;

export type ThemeMode = "light" | "dark";
export const THEMES = { light: THEME, dark: DARK_THEME } as const;
