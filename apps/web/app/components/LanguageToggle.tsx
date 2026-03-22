"use client";

import { useLanguage } from "../../lib/LanguageContext";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      style={{
        display: "inline-flex",
        borderRadius: 999,
        border: "1px solid var(--border)",
        overflow: "hidden",
        flexShrink: 0,
      }}
      role="group"
      aria-label="Language selector"
    >
      {(["tr", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          style={{
            padding: "0.22rem 0.55rem",
            background: lang === l ? "var(--accent-soft)" : "transparent",
            color: lang === l ? "var(--accent)" : "var(--text-muted)",
            border: "none",
            cursor: "pointer",
            fontFamily: MONO,
            fontSize: "0.72rem",
            fontWeight: lang === l ? 700 : 400,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "background 0.12s, color 0.12s",
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
