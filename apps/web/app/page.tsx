import Link from "next/link";
import Image from "next/image";
import { LogoPrimary } from "./components/LogoPrimary";
import { VerticalsDiagram } from "./components/diagrams/VerticalsDiagram";
import { CanonicalSpineDiagram } from "./components/diagrams/CanonicalSpineDiagram";
import { EvidenceLayerDiagram } from "./components/diagrams/EvidenceLayerDiagram";
import { RoleExportDiagram } from "./components/diagrams/RoleExportDiagram";
import { InstitutionalUseFamilies } from "./components/institutional/InstitutionalUseFamilies";
import { THEME } from "../lib/theme";

const MEDIA = {
  hero: "/media/home/home-hero-vehicle.jpg",
  vehicle: "/media/home/vehicle-section-dashboard.jpg",
  drone: "/media/home/drone-section.jpg",
  robot: "/media/home/robot-section-factory.jpg",
  documentProtocol: "/media/home/document-protocol-section.jpg",
} as const;

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        padding: "1.75rem 2rem 2.25rem",
        fontFamily: SANS,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        {/* Hero */}
        <section
          className="home-hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2.15fr) minmax(0, 1.45fr)",
            gap: "1.75rem",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ marginBottom: "0.75rem" }}>
              <LogoPrimary href="/" height={34} />
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: THEME.textMuted,
                marginBottom: "0.6rem",
                fontFamily: MONO,
              }}
            >
              Witness protocol
            </div>
            <h1 style={{ fontSize: "2.1rem", margin: 0, lineHeight: 1.25, fontWeight: 600 }}>
              One product. Verifier-first. Three verticals.
            </h1>
            <p
              style={{
                fontSize: "0.96rem",
                color: THEME.textSoft,
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
                    border: `1px solid ${THEME.borderSoft}`,
                    background: THEME.panel,
                    padding: "0.48rem 0.62rem",
                    fontSize: "0.79rem",
                    color: THEME.textSoft,
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
                  border: `1px solid ${THEME.accent}`,
                  background: THEME.accentSoft,
                  textDecoration: "none",
                  color: THEME.text,
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
                  border: `1px solid ${THEME.border}`,
                  textDecoration: "none",
                  color: THEME.textSoft,
                }}
              >
                Docs
              </Link>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              style={{
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                border: `1px solid ${THEME.borderSoft}`,
                aspectRatio: "16/10",
                background: THEME.borderMuted,
              }}
            >
              <Image
                src={MEDIA.hero}
                alt="Vehicle incident review — QARAQUTU verifier-first witness protocol in fleet and claims context"
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <VerticalsDiagram />
            <div
              style={{
                borderRadius: 8,
                border: `1px dashed ${THEME.border}`,
                padding: "0.5rem 0.6rem",
                fontSize: "0.77rem",
                color: THEME.textMuted,
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
              border: `1px solid ${THEME.border}`,
              background: THEME.panel,
              padding: "1rem 1.1rem",
            }}
          >
            <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", marginTop: 0 }}>The problem</h2>
            <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: THEME.textSoft, margin: 0 }}>
              <li>Incident review data is fragmented across logs, captures, and exported files.</li>
              <li>Recorded facts and derived interpretations are often collapsed into one narrative layer.</li>
              <li>Claims, legal, and technical teams rarely anchor decisions on the same canonical object.</li>
            </ul>
          </section>

          {/* Product system summary */}
          <section
            style={{
              borderRadius: 10,
              border: `1px solid ${THEME.border}`,
              background: THEME.panelRaised,
              padding: "1rem 1.1rem",
            }}
          >
            <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", marginTop: 0 }}>Product system</h2>
            <div style={{ marginBottom: "0.75rem" }}>
              <CanonicalSpineDiagram />
            </div>
            <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: THEME.textSoft, margin: 0 }}>
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

        {/* Three verticals — supporting visuals */}
        <section
          className="home-verticals-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "1rem",
          }}
        >
          {[
            { key: "vehicle", img: MEDIA.vehicle, label: "Vehicle", trace: "Event → Bundle → Manifest", alt: "Vehicle incident dashboard — canonical event review and verification trace" },
            { key: "drone", img: MEDIA.drone, label: "Drone", trace: "Mission → Telemetry → Link", alt: "Drone operations — mission and telemetry linkage for QARAQUTU witness protocol" },
            { key: "robot", img: MEDIA.robot, label: "Robot", trace: "Interaction → Safety → Handoff", alt: "Robot and industrial safety — interaction and handoff trace for protocol-grade review" },
          ].map((v) => (
            <div
              key={v.key}
              style={{
                borderRadius: 10,
                border: `1px solid ${THEME.border}`,
                background: THEME.panel,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4/3",
                  background: THEME.borderMuted,
                }}
              >
                <Image
                  src={v.img}
                  alt={v.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 340px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "0.65rem 0.85rem", borderTop: `1px solid ${THEME.borderSoft}` }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: THEME.text, marginBottom: "0.2rem", fontFamily: MONO }}>{v.label}</div>
                <div style={{ fontSize: "0.7rem", color: THEME.textMuted, fontFamily: MONO }}>{v.trace}</div>
              </div>
            </div>
          ))}
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
              border: `1px solid ${THEME.border}`,
              background: THEME.panel,
              padding: "1rem 1.1rem",
            }}
          >
            <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", marginTop: 0 }}>Role-aware review flow</h2>
            <div style={{ marginBottom: "0.75rem" }}>
              <RoleExportDiagram />
            </div>
            <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: THEME.textSoft, margin: 0 }}>
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
              border: `1px solid ${THEME.border}`,
              background: THEME.panel,
              padding: "1rem 1.1rem",
            }}
          >
            <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", marginTop: 0 }}>Evidence layer discipline</h2>
            <div
              style={{
                marginBottom: "0.75rem",
                borderRadius: 8,
                overflow: "hidden",
                border: `1px solid ${THEME.borderSoft}`,
                aspectRatio: "16/9",
                maxHeight: 200,
                position: "relative",
                background: THEME.borderMuted,
              }}
            >
              <Image
                src={MEDIA.documentProtocol}
                alt="Document and protocol artifact family — trace-linked, role-bounded evidence outputs"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <EvidenceLayerDiagram />
            </div>
            <p style={{ fontSize: "0.84rem", opacity: 0.9, color: THEME.textSoft, marginTop: 0, marginBottom: "0.45rem" }}>
              Controlled artifact outputs remain role-bounded and trace-linked:
            </p>
            <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: THEME.textSoft, margin: 0 }}>
              <li>
                <strong>Claims pack:</strong> JSON/PDF artifact family for claims review posture.
              </li>
              <li>
                <strong>Legal pack:</strong> JSON/PDF artifact family with explicit chain and provenance framing.
              </li>
            </ul>
          </section>
        </section>

        {/* Institutional use families */}
        <section
          style={{
            borderRadius: 10,
            border: `1px solid ${THEME.border}`,
            background: THEME.panelRaised,
            padding: "1.25rem 1.35rem",
          }}
        >
          <h2 style={{ fontSize: "1rem", marginBottom: "0.4rem", marginTop: 0, fontWeight: 600 }}>Institutional use families</h2>
          <p style={{ fontSize: "0.85rem", opacity: 0.92, color: THEME.textSoft, marginTop: 0, marginBottom: "1rem", lineHeight: 1.55 }}>
            One canonical event core, many institutional shells. The same event spine is preserved; only priority,
            visibility, and document recommendation vary by role.
          </p>
          <InstitutionalUseFamilies />
        </section>

        {/* Verification summary */}
        <section
          style={{
            borderRadius: 10,
            border: `1px solid ${THEME.border}`,
            background: THEME.panel,
            padding: "1rem 1.1rem 1.1rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", marginTop: 0 }}>Verification</h2>
          <p style={{ fontSize: "0.84rem", opacity: 0.9, color: THEME.textSoft, margin: 0 }}>
            Verification remains a bounded package assessment. States (PASS, FAIL, UNKNOWN, UNVERIFIED) represent review
            posture, not judicial truth, not liability assignment, and not a substitute for independent legal or expert
            judgement.
          </p>
        </section>

        {/* Surfaces + CTAs */}
        <section
          style={{
            borderRadius: 10,
            border: `1px solid ${THEME.border}`,
            background: THEME.panel,
            padding: "1rem 1.1rem 1.1rem",
          }}
        >
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", marginTop: 0 }}>Product surfaces</h2>
          <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: THEME.textSoft, marginTop: 0 }}>
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
                border: `1px solid ${THEME.border}`,
                color: THEME.text,
                background: THEME.accentSoft,
              }}
            >
              Verifier (primary)
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: `1px solid ${THEME.border}`,
                color: THEME.textSoft,
              }}
            >
              Golden (internal reference)
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: `1px solid ${THEME.border}`,
                color: THEME.textSoft,
              }}
            >
              Console (reserved preparation shell)
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: `1px solid ${THEME.border}`,
                color: THEME.textSoft,
              }}
            >
              Docs
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: `1px solid ${THEME.border}`,
                color: THEME.textSoft,
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
            borderTop: `1px solid ${THEME.border}`,
            paddingTop: "0.85rem",
            paddingBottom: "0.1rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", opacity: 0.8, color: THEME.textMuted, maxWidth: 820, lineHeight: 1.6 }}>
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
