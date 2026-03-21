"use client";

import { useTheme } from "../../lib/ThemeContext";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

export function ThemeToggle() {
  const { mode, toggle } = useTheme();
  const isDark = mode === "dark";

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
        border: "1px solid var(--border)",
        background: "var(--panel)",
        color: "var(--text-muted)",
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
