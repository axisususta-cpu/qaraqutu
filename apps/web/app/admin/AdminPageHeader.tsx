"use client";

import { useLanguage } from "../../lib/LanguageContext";
import { MSG } from "../../lib/i18n/messages";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

export function AdminPageHeader() {
  const { lang } = useLanguage();
  const m = MSG[lang];
  return (
    <div>
      <h1 style={{ fontSize: "1.35rem", margin: 0, marginBottom: "0.25rem" }}>
        {m.adminTitle}
      </h1>
      <p
        style={{
          fontSize: "0.84rem",
          color: "var(--text-soft)",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {m.adminSubtitle}
      </p>
    </div>
  );
}

export function AdminPageChips() {
  const { lang } = useLanguage();
  const m = MSG[lang];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
      {[m.adminDiagnosticsOnly, m.adminProtectedSurface].map((chip) => (
        <span
          key={chip}
          style={{
            fontFamily: MONO,
            fontSize: "0.72rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: "1px solid var(--border)",
            background: "var(--accent-soft)",
            color: "var(--text-muted)",
            borderRadius: 999,
            padding: "0.15rem 0.55rem",
          }}
        >
          {chip}
        </span>
      ))}
    </div>
  );
}
