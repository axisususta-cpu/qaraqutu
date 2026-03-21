/**
 * QARAQUTU Light Theme — institutional, corporate, logo-aligned.
 * Black/orange/gray derived from real logo family. Brand-dominant, protocol-grade.
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
