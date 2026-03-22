"use client";

import Link from "next/link";
import { useLanguage } from "../../../lib/LanguageContext";
import { MSG } from "../../../lib/i18n/messages";

/**
 * How this system applies across sectors — compact strip for Verifier context.
 * Does not add new Verifier features; explanatory link only.
 */
export function SectorVerifierStrip() {
  const { lang } = useLanguage();
  const msg = MSG[lang];

  const segments = [
    msg.verifierSectorStripClaims,
    msg.verifierSectorStripNotary,
    msg.verifierSectorStripMuni,
    msg.verifierSectorStripField,
    msg.verifierSectorStripTechnical,
  ];

  return (
    <div
      style={{
        padding: "0.35rem 2.5rem",
        borderBottom: "1px solid var(--border-soft)",
        background: "var(--panel)",
        fontSize: "0.68rem",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem 1rem", alignItems: "baseline" }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--chip-text)",
            marginRight: "0.35rem",
            padding: "0.1rem 0.4rem",
            borderRadius: 4,
            background: "var(--chip-bg)",
            border: `1px solid ${"var(--chip-border)"}`,
          }}
        >
          {msg.verifierSectorStripBadge}
        </span>
        {segments.map((text, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "baseline", gap: "0.35rem" }}>
            {i > 0 ? <span style={{ color: "var(--text-muted)" }}>|</span> : null}
            <span style={{ color: "var(--text-soft)" }}>{text}</span>
          </span>
        ))}
        <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>—</span>
        <Link
          href="/docs#sector-specific-witness-scenarios"
          style={{
            color: "var(--accent)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          {msg.verifierSectorScenariosLink}
        </Link>
      </div>
    </div>
  );
}
