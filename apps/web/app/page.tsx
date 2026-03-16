import Link from "next/link";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const UI = {
  bg: "#060d1a",
  panel: "#0a1628",
  border: "#1a2d4a",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
  accent: "#D4561A",
} as const;

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: UI.bg,
        color: UI.text,
        padding: "1.75rem 2rem 2.25rem",
        fontFamily: SANS,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.9rem" }}>
        {/* Hero */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1.5fr)",
            gap: "1.75rem",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: UI.textMuted,
                marginBottom: "0.5rem",
                fontFamily: MONO,
              }}
            >
              QARAQUTU — Witness protocol
            </div>
            <h1 style={{ fontSize: "1.9rem", margin: 0, lineHeight: 1.25 }}>
              One product. Verifier-first. Three verticals.
            </h1>
            <p
              style={{
                fontSize: "0.95rem",
                color: UI.textSoft,
                opacity: 0.95,
                maxWidth: 640,
                lineHeight: 1.6,
                marginTop: "0.8rem",
              }}
            >
              QARAQUTU is the single product for dispute-grade event verification for Vehicle, Drone, and Robot.
              The main review station is the Verifier — a bounded assessment of the event package with recorded
              evidence, derived assessment, verification trace, and artifact issuance. Golden is the internal quality
              bar and reference for the verifier, not a separate product or primary surface.
            </p>
            <div
              style={{
                marginTop: "1.1rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                fontSize: "0.8rem",
              }}
            >
              <Link
                href="/verifier"
                style={{
                  padding: "0.55rem 1.2rem",
                  borderRadius: 999,
                  border: `1px solid ${UI.accent}`,
                  background: "rgba(212, 86, 26, 0.10)",
                  textDecoration: "none",
                  color: UI.text,
                  fontWeight: 600,
                  fontFamily: MONO,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Open Verifier
              </Link>
              <Link
                href="/docs"
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: 999,
                  border: `1px solid ${UI.border}`,
                  textDecoration: "none",
                  color: UI.textSoft,
                }}
              >
                Docs
              </Link>
            </div>
          </div>
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${UI.border}`,
              background:
                "radial-gradient(circle at top left, rgba(212,86,26,0.16), transparent 55%), #0a1628",
              padding: "0.9rem 1rem 1rem",
              fontSize: "0.8rem",
              color: UI.textSoft,
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: UI.textMuted,
                fontFamily: MONO,
                marginBottom: "0.4rem",
              }}
            >
              Event spine · three verticals
            </div>
            <p style={{ margin: 0, marginBottom: "0.5rem", lineHeight: 1.5 }}>
              Single product spine across Vehicle, Drone, and Robot. Recorded, derived, trace, and artifacts remain
              separated and explicitly framed.
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", lineHeight: 1.5 }}>
              <li>Recorded ≠ Derived</li>
              <li>Derived ≠ Verdict</li>
              <li>Verification trace ≠ truth itself</li>
              <li>Artifact issuance ≠ blame</li>
            </ul>
          </div>
        </section>

        {/* Problem statement */}
        <section
          style={{
            marginBottom: "1.5rem",
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "1rem 1.1rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            The problem
          </h2>
          <ul style={{ fontSize: "0.85rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: UI.textSoft }}>
            <li>
              Incident review data is fragmented across logs, screenshots, and
              exports.
            </li>
            <li>
              Recorded facts and derived interpretations are often mixed
              together.
            </li>
            <li>
              Claims, legal, and technical teams rarely look at the same
              canonical object.
            </li>
          </ul>
        </section>

        {/* Product system summary */}
        <section
          style={{
            marginBottom: "1.5rem",
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "1rem 1.1rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Product system
          </h2>
          <ul style={{ fontSize: "0.85rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: UI.textSoft }}>
            <li>
              <strong>Single product</strong> — QARAQUTU; one canonical event
              model across Vehicle, Drone, and Robot.
            </li>
            <li>
              <strong>Verifier</strong> — the main review station; bounded
              assessment of the event package; no liability or guilt
              determinations.
            </li>
            <li>
              <strong>Golden</strong> — internal quality bar and reference for the verifier; not a separate product or primary surface.
            </li>
            <li>
              <strong>Role-based export family</strong> — claims and legal packs
              tied to manifests and receipts for an auditable chain.
            </li>
          </ul>
        </section>

        {/* Role-aware review flow */}
        <section
          style={{
            marginBottom: "1.5rem",
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "1rem 1.1rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Role-aware review flow
          </h2>
          <ul style={{ fontSize: "0.85rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: UI.textSoft }}>
            <li>
              <strong>Claims teams</strong> open a claims pack for a concise,
              institution-ready view of an incident.
            </li>
            <li>
              <strong>Legal reviewers</strong> open a legal pack focused on
              chain, manifest, receipts, and provenance.
            </li>
            <li>
              <strong>Technical reviewers</strong> work from the canonical event
              and evidence separation visible in the console.
            </li>
          </ul>
        </section>

        {/* Export family summary */}
        <section
          style={{
            marginBottom: "1.5rem",
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "1rem 1.1rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Export family
          </h2>
          <p style={{ fontSize: "0.85rem", opacity: 0.9, color: UI.textSoft }}>
            The current export family includes:
          </p>
          <ul style={{ fontSize: "0.85rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: UI.textSoft }}>
            <li>
              <strong>Claims pack</strong> — claims-oriented JSON and PDF
              exports.
            </li>
            <li>
              <strong>Legal pack</strong> — legal-review oriented JSON and PDF
              exports with explicit chain and provenance sections.
            </li>
          </ul>
        </section>

        {/* Verification summary */}
        <section
          style={{
            marginBottom: "1.5rem",
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "1rem 1.1rem 1.1rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Verification
          </h2>
          <p style={{ fontSize: "0.85rem", opacity: 0.9, color: UI.textSoft }}>
            Verification is framed as a bounded assessment of an event package.
            In this version, verification state is one of PASS, FAIL, UNKNOWN,
            or UNVERIFIED. It is not a liability engine, does not determine
            guilt, and does not replace judicial or independent expert review.
          </p>
        </section>

        {/* Surfaces + CTAs */}
        <section
          style={{
            marginBottom: "1.5rem",
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "1rem 1.1rem 1.1rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Product surfaces
          </h2>
          <ul style={{ fontSize: "0.85rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: UI.textSoft }}>
            <li>
              <strong>Verifier</strong> — main review station; event selection,
              recorded/derived evidence, unknown/disputed, verification trace,
              artifact issuance; Vehicle, Drone, Robot. Primary product surface.
            </li>
            <li>
              <strong>Golden</strong> — internal rubric and reference for the verifier; support surface, not a primary or separate product.
            </li>
            <li>
              <strong>Console</strong> — reserved; canonical event review with recorded vs derived separation.
            </li>
            <li>
              <strong>Docs</strong> — protocol and API overview.
            </li>
            <li>
              <strong>Admin / diagnostics</strong> — environment, smoke,
              verification, and export activity.
            </li>
          </ul>
          <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.6rem", fontSize: "0.8rem" }}>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: `1px solid ${UI.border}`,
                color: UI.textSoft,
              }}
            >
              Verifier
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: `1px solid ${UI.border}`,
                color: UI.textSoft,
              }}
            >
              Golden (reference)
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: `1px solid ${UI.border}`,
                color: UI.textSoft,
              }}
            >
              Console
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: `1px solid ${UI.border}`,
                color: UI.textSoft,
              }}
            >
              Docs
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: `1px solid ${UI.border}`,
                color: UI.textSoft,
              }}
            >
              Admin / diagnostics
            </span>
          </div>
        </section>

        {/* Institutional notice */}
        <section style={{ marginTop: "0.75rem", borderTop: `1px solid ${UI.border}`, paddingTop: "0.75rem" }}>
          <p style={{ fontSize: "0.75rem", opacity: 0.8, color: UI.textMuted, maxWidth: 820, lineHeight: 1.6 }}>
            QARAQUTU is a dispute-grade evidence system. It is not a liability
            engine, not a judicial decision system, and not a substitute for
            independent legal, claims, or technical judgment. Verifier states
            and exports are role-appropriate artifacts linked to
            a canonical record, not unilateral findings about fault or outcome.
          </p>
        </section>
      </div>
    </main>
  );
}
