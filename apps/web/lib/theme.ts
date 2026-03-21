/**
 * QARAQUTU Light Theme — institutional, corporate, logo-aligned.
 * Black/orange/gray from real logo family. No dark-theme remnants.
 */

export const THEME = {
  /** Page background — warm off-white, institutional. */
  bg: "#f5f6f8",
  /** Header/footer surface. */
  headerBg: "#ffffff",
  /** Raised panels, cards. */
  panel: "#ffffff",
  panelRaised: "#fafbfc",
  panelCard: "#f8f9fa",
  /** Interactive surface — hover, selected. */
  surface: "rgba(212, 86, 26, 0.04)",
  /** Primary text — near-black, record gravity. */
  text: "#0a0a0a",
  /** Secondary text. */
  textSoft: "#374151",
  /** Muted labels, trace. */
  textMuted: "#6b7280",
  textDim: "#9ca3af",
  /** Borders — graphite/trace gray. */
  border: "#d1d5db",
  borderSoft: "#e5e7eb",
  borderMuted: "#f3f4f6",
  borderStrong: "#9ca3af",
  borderSubtle: "rgba(0, 0, 0, 0.06)",
  /** Accent — orange from logo, controlled signal. */
  accent: "#D4561A",
  accentSoft: "rgba(212, 86, 26, 0.08)",
  accentBorder: "#B54516",
  accentHover: "rgba(212, 86, 26, 0.12)",
  /** Active/hover states. */
  activeBg: "rgba(212, 86, 26, 0.06)",
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
