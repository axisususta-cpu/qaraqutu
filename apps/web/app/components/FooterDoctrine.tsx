"use client";

import { useLanguage } from "../../lib/LanguageContext";
import { MSG } from "../../lib/i18n/messages";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

export function FooterDoctrine() {
  const { lang } = useLanguage();
  const m = MSG[lang];
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0.65rem 2rem 0",
        borderTop: "1px solid var(--border-soft)",
        background: "var(--panel)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "0.72rem",
          lineHeight: 1.5,
          color: "var(--text-soft)",
          fontFamily: MONO,
          letterSpacing: "0.02em",
        }}
      >
        {m.footerWitnessLine1}
      </p>
      <p
        style={{
          margin: "0.35rem 0 0",
          fontSize: "0.68rem",
          lineHeight: 1.55,
          color: "var(--text-muted)",
          maxWidth: 920,
        }}
      >
        {m.footerWitnessLine2}
      </p>
    </div>
  );
}
