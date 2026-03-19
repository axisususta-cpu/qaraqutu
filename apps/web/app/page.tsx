import Link from "next/link";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const UI = {
  bg: "#060d1a",
  panel: "#0a1628",
  panelRaised: "#0d1a2f",
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.72)",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
  accent: "#D4561A",
  accentSoft: "rgba(212, 86, 26, 0.10)",
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
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        {/* Hero */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2.15fr) minmax(0, 1.45fr)",
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
              QARAQUTU - Witness protocol
            </div>
            <h1 style={{ fontSize: "2.05rem", margin: 0, lineHeight: 1.2 }}>
              One product. Verifier-first. Three verticals.
            </h1>
            <p
              style={{
                fontSize: "0.96rem",
                color: UI.textSoft,
                opacity: 0.95,
                maxWidth: 680,
                lineHeight: 1.6,
                marginTop: "0.85rem",
              }}
            >
              QARAQUTU is a verifier-first witness protocol for dispute-grade event packages across Vehicle, Drone, and
              Robot. The Verifier is the main review station: a bounded assessment with recorded evidence, derived
              assessment, verification trace, and artifact issuance. Golden is the internal quality
              bar and reference for the verifier, not a separate product or primary surface.
            </p>
            <div
              style={{
                marginTop: "0.95rem",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "0.5rem",
                maxWidth: 700,
              }}
            >
              {[
                "Verifier is the primary surface",
                "Recorded and derived stay separated",
                "Trace supports review, not final truth",
                "Issuance is protocol artifact, not blame",
              ].map((line) => (
                <div
                  key={line}
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${UI.borderSoft}`,
                    background: UI.panel,
                    padding: "0.48rem 0.62rem",
                    fontSize: "0.79rem",
                    color: UI.textSoft,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "1.05rem",
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
                  background: UI.accentSoft,
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
              Event spine - three verticals
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
            <div
              style={{
                marginTop: "0.7rem",
                borderRadius: 8,
                border: `1px dashed ${UI.border}`,
                padding: "0.5rem 0.6rem",
                fontSize: "0.77rem",
                color: UI.textMuted,
                lineHeight: 1.5,
              }}
            >
              Protocol position: QARAQUTU preserves chain-of-review integrity; it does not act as a liability engine or
              judicial substitute.
            </div>
          </div>
        </section>

        {/* Problem + system */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "1rem",
          }}
        >
          {/* Problem statement */}
          <section
            style={{
              borderRadius: 10,
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "1rem 1.1rem",
            }}
          >
            <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", marginTop: 0 }}>The problem</h2>
            <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: UI.textSoft, margin: 0 }}>
              <li>Incident review data is fragmented across logs, captures, and exported files.</li>
              <li>Recorded facts and derived interpretations are often collapsed into one narrative layer.</li>
              <li>Claims, legal, and technical teams rarely anchor decisions on the same canonical object.</li>
            </ul>
          </section>

          {/* Product system summary */}
          <section
            style={{
              borderRadius: 10,
              border: `1px solid ${UI.border}`,
              background: UI.panelRaised,
              padding: "1rem 1.1rem",
            }}
          >
            <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", marginTop: 0 }}>Product system</h2>
            <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: UI.textSoft, margin: 0 }}>
              <li>
                <strong>Single product:</strong> one canonical event model across Vehicle, Drone, and Robot.
              </li>
              <li>
                <strong>Verifier:</strong> primary review station with bounded protocol states, not liability judgement.
              </li>
              <li>
                <strong>Golden:</strong> internal quality reference for verifier continuity, not an independent product.
              </li>
              <li>
                <strong>Issuance family:</strong> role-aware claims/legal artifacts tied to receipts and manifest linkage.
              </li>
            </ul>
          </section>
        </section>

        {/* Role-aware review + export family */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "1rem",
          }}
        >
          <section
            style={{
              borderRadius: 10,
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "1rem 1.1rem",
            }}
          >
            <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", marginTop: 0 }}>Role-aware review flow</h2>
            <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: UI.textSoft, margin: 0 }}>
              <li>
                <strong>Claims</strong> receives concise dispute-ready summaries tied to canonical references.
              </li>
              <li>
                <strong>Legal</strong> receives chain-centric artifacts with manifest, receipt, and provenance framing.
              </li>
              <li>
                <strong>Technical</strong> remains anchored to the canonical event object and evidence separation.
              </li>
            </ul>
          </section>
          <section
            style={{
              borderRadius: 10,
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "1rem 1.1rem",
            }}
          >
            <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", marginTop: 0 }}>Export family</h2>
            <p style={{ fontSize: "0.84rem", opacity: 0.9, color: UI.textSoft, marginTop: 0, marginBottom: "0.45rem" }}>
              Controlled artifact outputs remain role-bounded and trace-linked:
            </p>
            <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: UI.textSoft, margin: 0 }}>
              <li>
                <strong>Claims pack:</strong> JSON/PDF artifact family for claims review posture.
              </li>
              <li>
                <strong>Legal pack:</strong> JSON/PDF artifact family with explicit chain and provenance framing.
              </li>
            </ul>
          </section>
        </section>

        {/* Verification summary */}
        <section
          style={{
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "1rem 1.1rem 1.1rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", marginTop: 0 }}>Verification</h2>
          <p style={{ fontSize: "0.84rem", opacity: 0.9, color: UI.textSoft, margin: 0 }}>
            Verification remains a bounded package assessment. States (PASS, FAIL, UNKNOWN, UNVERIFIED) represent review
            posture, not judicial truth, not liability assignment, and not a substitute for independent legal or expert
            judgement.
          </p>
        </section>

        {/* Surfaces + CTAs */}
        <section
          style={{
            borderRadius: 10,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "1rem 1.1rem 1.1rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", marginTop: 0 }}>Product surfaces</h2>
          <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: UI.textSoft, marginTop: 0 }}>
            <li>
              <strong>Verifier</strong> - primary review station; canonical event inspection and bounded verification
              chain.
            </li>
            <li>
              <strong>Golden</strong> - internal quality reference and rubric surface for verifier continuity; not a
              separate primary product.
            </li>
            <li>
              <strong>Console</strong> - reserved shell for controlled protocol shell preparation and future bounded
              operator surface; not active execution.
            </li>
            <li>
              <strong>Docs</strong> - protocol and API framing for implementation alignment.
            </li>
            <li>
              <strong>Admin / diagnostics</strong> - diagnostics-only workbench for environment and verification health.
            </li>
          </ul>
          <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.6rem", fontSize: "0.8rem" }}>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: `1px solid ${UI.border}`,
                color: UI.text,
                background: UI.accentSoft,
              }}
            >
              Verifier (primary)
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: `1px solid ${UI.border}`,
                color: UI.textSoft,
              }}
            >
              Golden (internal reference)
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: `1px solid ${UI.border}`,
                color: UI.textSoft,
              }}
            >
              Console (reserved preparation shell)
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
              Admin (diagnostics-only)
            </span>
          </div>
        </section>

        {/* Institutional notice */}
        <section
          style={{
            marginTop: "0.4rem",
            borderTop: `1px solid ${UI.border}`,
            paddingTop: "0.85rem",
            paddingBottom: "0.1rem",
          }}
        >
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
