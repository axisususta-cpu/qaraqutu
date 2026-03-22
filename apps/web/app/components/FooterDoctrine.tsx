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
        maxWidth: 1180,
        margin: "0 auto",
        padding: "1.35rem 2rem 1.15rem",
        borderTop: "1px solid #1f1f1d",
        background: "#0a0a0a",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "0.78rem",
          lineHeight: 1.45,
          color: "rgba(255,255,255,0.88)",
          fontFamily: MONO,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {m.footerWitnessLine1}
      </p>
      <p
        style={{
          margin: "0.5rem 0 0",
          fontSize: "0.8rem",
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.52)",
          maxWidth: 920,
        }}
      >
        {m.footerWitnessLine2}
      </p>
    </div>
  );
}
