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
            One product. Verifier-first. Three verticals.
          </h1>
          <p style={{ fontSize: "0.95rem", opacity: 0.9, maxWidth: 640 }}>
            QARAQUTU is the single product for dispute-grade event verification:
            Vehicle, Drone, and Robot. The main review station is the Verifier—a
            bounded assessment of the event package with recorded evidence,
            derived assessment, verification trace, and artifact issuance. Golden
            is the internal quality bar and reference for the verifier, not a separate product or primary surface.
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
              href="/verifier"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: 4,
                border: "1px solid #475569",
                background: "rgba(30, 58, 95, 0.4)",
                textDecoration: "none",
                color: "#E5E7EB",
                fontWeight: 600,
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
              Docs
            </Link>
            <Link
              href="/verifier/golden"
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: 4,
                border: "1px solid #374151",
                textDecoration: "none",
                color: "#94A3B8",
              }}
            >
              Golden (reference)
            </Link>
            <Link
              href="/console"
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: 4,
                border: "1px solid #374151",
                textDecoration: "none",
                color: "#94A3B8",
              }}
            >
              Console
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
              Admin
            </Link>
          </div>
        </section>

        {/* Institutional notice */}
        <section style={{ marginTop: "1.5rem", borderTop: "1px solid #111827", paddingTop: "0.75rem" }}>
          <p style={{ fontSize: "0.75rem", opacity: 0.7 }}>
            QARAQUTU is a dispute-grade evidence system. It is not a liability
            engine, not a judicial decision system, and not a substitute for
            independent legal, claims, or technical judgment. Verifier states
            and exports are role-appropriate artifacts linked to
            a canonical record, not unilateral findings about fault or outcome.
          </p>
        </section>
      </div>
    </div>
  );
}

