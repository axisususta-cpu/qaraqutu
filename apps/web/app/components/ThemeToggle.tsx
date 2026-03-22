"use client";

import { useTheme } from "../../lib/ThemeContext";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

export function ThemeToggle({ surface = "default" }: { surface?: "default" | "darkBar" }) {
  const { mode, toggle } = useTheme();
  const isDark = mode === "dark";
  const bar = surface === "darkBar";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.22rem 0.6rem",
        borderRadius: 999,
        border: bar ? "1px solid rgba(255,255,255,0.18)" : "1px solid var(--border)",
        background: bar ? "rgba(255,255,255,0.06)" : "var(--panel)",
        color: bar ? "rgba(255,255,255,0.55)" : "var(--text-muted)",
        cursor: "pointer",
        fontSize: "0.74rem",
        fontFamily: MONO,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        transition: "border-color 0.15s, color 0.15s",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: "0.9rem", lineHeight: 1 }}>{isDark ? "☀" : "◑"}</span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
