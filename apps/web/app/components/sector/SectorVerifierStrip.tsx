"use client";

import Link from "next/link";


/**
 * How this system applies across sectors — compact strip for Verifier context.
 * Does not add new Verifier features; explanatory link only.
 */
export function SectorVerifierStrip() {
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
          By sector:
        </span>
        <span style={{ color: "var(--text-soft)" }}>
          Insurance → Claims pack
        </span>
        <span style={{ color: "var(--text-muted)" }}>|</span>
        <span style={{ color: "var(--text-soft)" }}>
          Notary / IP → Authenticity, Trace
        </span>
        <span style={{ color: "var(--text-muted)" }}>|</span>
        <span style={{ color: "var(--text-soft)" }}>
          Municipality → Administrative packet
        </span>
        <span style={{ color: "var(--text-muted)" }}>|</span>
        <span style={{ color: "var(--text-soft)" }}>
          Police / Field → Incident, Trace
        </span>
        <span style={{ color: "var(--text-muted)" }}>|</span>
        <span style={{ color: "var(--text-soft)" }}>
          Technical → Technical pack
        </span>
        <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>—</span>
        <Link
          href="/docs#sector-specific-witness-scenarios"
          style={{
            color: "var(--accent)",
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

