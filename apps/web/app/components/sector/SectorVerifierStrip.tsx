"use client";

import Link from "next/link";
import { THEME } from "../../../lib/theme";

const UI = THEME;

/**
 * How this system applies across sectors — compact strip for Verifier context.
 * Does not add new Verifier features; explanatory link only.
 */
export function SectorVerifierStrip() {
  return (
    <div
      style={{
        padding: "0.35rem 2.5rem",
        borderBottom: `1px solid ${UI.borderSoft}`,
        background: UI.panel,
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
            color: UI.textMuted,
            marginRight: "0.35rem",
          }}
        >
          By sector:
        </span>
        <span style={{ color: UI.textSoft }}>
          Insurance → Claims pack
        </span>
        <span style={{ color: UI.textMuted }}>|</span>
        <span style={{ color: UI.textSoft }}>
          Notary / IP → Authenticity, Trace
        </span>
        <span style={{ color: UI.textMuted }}>|</span>
        <span style={{ color: UI.textSoft }}>
          Municipality → Administrative packet
        </span>
        <span style={{ color: UI.textMuted }}>|</span>
        <span style={{ color: UI.textSoft }}>
          Police / Field → Incident, Trace
        </span>
        <span style={{ color: UI.textMuted }}>|</span>
        <span style={{ color: UI.textSoft }}>
          Technical → Technical pack
        </span>
        <span style={{ color: UI.textMuted, marginLeft: "0.5rem" }}>—</span>
        <Link
          href="/docs#sector-specific-witness-scenarios"
          style={{
            color: UI.accent,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Sector scenarios
        </Link>
      </div>
    </div>
  );
}
