import Link from "next/link";

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#E5E7EB",
        padding: "1.5rem 2rem",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Hero */}
        <section style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "0.75rem" }}>
            Dispute-grade evidence for vehicle incidents.
          </h1>
          <p style={{ fontSize: "0.95rem", opacity: 0.9, maxWidth: 640 }}>
            QARAQUTU is a premium evidence SaaS for automotive, fleet,
            insurance, claims, and legal review teams. It turns fragmented
            incident material into a canonical event object with verification
            and role-appropriate evidence packs.
          </p>
        </section>

        {/* Problem statement */}
        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            The problem
          </h2>
          <ul style={{ fontSize: "0.85rem", paddingLeft: "1rem" }}>
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
        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Product system
          </h2>
          <ul style={{ fontSize: "0.85rem", paddingLeft: "1rem" }}>
            <li>
              <strong>Canonical event object</strong> — one event, one
              truth-bearing object that anchors all surfaces.
            </li>
            <li>
              <strong>Verifier</strong> — a bounded assessment of the referenced
              event package; it does not make liability or guilt determinations.
            </li>
            <li>
              <strong>Role-based export family</strong> — claims and legal packs
              that present the same canonical truth with different emphasis.
            </li>
            <li>
              <strong>Receipt and manifest linkage</strong> — exports are tied
              back to manifests and receipts so the evidence chain remains
              auditable.
            </li>
          </ul>
        </section>

        {/* Role-aware review flow */}
        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Role-aware review flow
          </h2>
          <ul style={{ fontSize: "0.85rem", paddingLeft: "1rem" }}>
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
        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Export family
          </h2>
          <p style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            The current export family includes:
          </p>
          <ul style={{ fontSize: "0.85rem", paddingLeft: "1rem" }}>
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
        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Verification
          </h2>
          <p style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            Verification is framed as a bounded assessment of an event package.
            In this version, verification state is one of PASS, FAIL, UNKNOWN,
            or UNVERIFIED. It is not a liability engine, does not determine
            guilt, and does not replace judicial or independent expert review.
          </p>
        </section>

        {/* Surfaces + CTAs */}
        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Product surfaces
          </h2>
          <ul style={{ fontSize: "0.85rem", paddingLeft: "1rem" }}>
            <li>
              <strong>Console</strong> — canonical event review with visible
              recorded vs derived separation.
            </li>
            <li>
              <strong>Verifier</strong> — bounded assessment of an event package
              and its verification state.
            </li>
            <li>
              <strong>Docs</strong> — protocol and API overview for technical
              reviewers and partners.
            </li>
            <li>
              <strong>Admin / diagnostics</strong> — environment and dataset
              diagnostics for operational use.
            </li>
          </ul>
          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              fontSize: "0.8rem",
            }}
          >
            <Link
              href="/console"
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: 4,
                border: "1px solid #374151",
                textDecoration: "none",
                color: "#E5E7EB",
              }}
            >
              Open Console
            </Link>
            <Link
              href="/verifier"
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: 4,
                border: "1px solid #374151",
                textDecoration: "none",
                color: "#E5E7EB",
              }}
            >
              Open Verifier
            </Link>
            <Link
              href="/docs"
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: 4,
                border: "1px solid #374151",
                textDecoration: "none",
                color: "#E5E7EB",
              }}
            >
              Open Docs
            </Link>
            <Link
              href="/admin"
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: 4,
                border: "1px solid #374151",
                textDecoration: "none",
                color: "#E5E7EB",
              }}
            >
              Open Admin
            </Link>
          </div>
        </section>

        {/* Institutional notice */}
        <section style={{ marginTop: "1.5rem", borderTop: "1px solid #111827", paddingTop: "0.75rem" }}>
          <p style={{ fontSize: "0.75rem", opacity: 0.7 }}>
            QARAQUTU is a dispute-grade evidence system. It is not a liability
            engine, not a judicial decision system, and not a substitute for
            independent legal, claims, or technical judgment. Verifier states
            and exports are role-appropriate presentation artifacts linked to a
            canonical record, not unilateral findings about fault or outcome.
          </p>
        </section>
      </div>
    </div>
  );
}

