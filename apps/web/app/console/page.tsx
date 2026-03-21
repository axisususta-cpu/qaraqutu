"use client";

import { THEME } from "../../lib/theme";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const UI = { ...THEME };

const SHELL_LANES = [
  {
    title: "Execution boundary",
    detail:
      "No free-form command line is exposed. Future execution paths are bounded to protocol-defined operations only.",
  },
  {
    title: "Role-bounded operations",
    detail:
      "Operator capabilities are expected to be role-scoped. This shell does not imply unrestricted operational control.",
  },
  {
    title: "Trace-bound interaction",
    detail:
      "Any future shell action is expected to remain linked to verification trace and issuance discipline, not ad-hoc edits.",
  },
  {
    title: "Operator confirmation layer",
    detail:
      "High-impact protocol actions are planned behind explicit confirmation boundaries and controlled review checkpoints.",
  },
  {
    title: "Human escalation boundary",
    detail:
      "Ambiguous or risk-bearing flows are designed to escalate to bounded human review instead of implicit automation.",
  },
  {
    title: "Future module slots",
    detail:
      "This surface reserves structured lanes for controlled protocol modules. It is not an active command workstation.",
  },
] as const;

export default function ConsolePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: UI.bg,
        color: UI.text,
        padding: "1.75rem 2rem",
        fontFamily: SANS,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <section
          style={{
            borderRadius: 12,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "1rem 1.1rem 1.15rem",
          }}
        >
          <h1 style={{ fontSize: "1.35rem", margin: 0, marginBottom: "0.45rem" }}>
            Console — controlled protocol shell preparation
          </h1>
          <p style={{ fontSize: "0.84rem", color: UI.textSoft, maxWidth: 820, lineHeight: 1.6, margin: 0 }}>
            Reserved internal surface for shaping future bounded protocol operations. This page is not public, not a
            free-form execution terminal, and not an operations dashboard.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginTop: "0.85rem" }}>
            {["Reserved surface", "Controlled shell", "Authorized access required", "Protocol evolution"].map((pill) => (
              <span
                key={pill}
                style={{
                  fontSize: "0.74rem",
                  border: `1px solid ${UI.border}`,
                  background: UI.accentSoft,
                  color: UI.textSoft,
                  borderRadius: 999,
                  padding: "0.15rem 0.55rem",
                  fontFamily: MONO,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {pill}
              </span>
            ))}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1.6fr)",
            gap: "1rem",
          }}
        >
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${UI.border}`,
              background: UI.panel,
              padding: "1rem 1.1rem 1.15rem",
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: UI.textMuted,
                marginBottom: "0.45rem",
                fontFamily: MONO,
              }}
            >
              Reserved protocol shell
            </div>
            <p
              style={{
                fontSize: "0.84rem",
                color: UI.textSoft,
                margin: 0,
                marginBottom: "0.45rem",
                lineHeight: 1.6,
              }}
            >
              This shell is intentionally non-active. It prepares bounded protocol lanes for later internal capability,
              without exposing free-form execution or replacing verifier inspection flow.
            </p>
            <ul style={{ fontSize: "0.8rem", color: UI.textSoft, margin: 0, paddingLeft: "1.05rem", lineHeight: 1.6 }}>
              <li>Not a verifier alternative: canonical review stays in verifier inspection station.</li>
              <li>Not an admin diagnostics board: diagnostics remain in admin workbench.</li>
              <li>Not an execution terminal: no open command entry and no ad-hoc operational actions.</li>
            </ul>
          </div>

          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${UI.border}`,
              background: UI.panelRaised,
              padding: "1rem 1.1rem 1.15rem",
            }}
          >
            <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.45rem" }}>Readiness status</h2>
            <p
              style={{
                fontSize: "0.82rem",
                color: UI.textMuted,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Shell readiness is controlled and phased. This surface signals protocol evolution status, not active
              production execution.
            </p>
            <div
              style={{
                marginTop: "0.75rem",
                borderRadius: 8,
                border: `1px dashed ${UI.border}`,
                padding: "0.7rem 0.8rem",
                fontSize: "0.8rem",
                lineHeight: 1.6,
                background: "#081224",
              }}
            >
              <div style={{ color: UI.textSoft, marginBottom: "0.2rem" }}>
                <strong>Current mode:</strong> reserved preparation shell
              </div>
              <div style={{ color: UI.textMuted }}>
                No command runner, no production operation trigger, and no expanded operator privileges are enabled in
                this stage.
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            borderRadius: 12,
            border: `1px solid ${UI.border}`,
            background: UI.panel,
            padding: "1rem 1.1rem 1.15rem",
          }}
        >
          <h2 style={{ fontSize: "0.96rem", margin: 0, marginBottom: "0.55rem" }}>Controlled shell lanes (planned)</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "0.75rem",
            }}
          >
            {SHELL_LANES.map((lane) => (
              <div
                key={lane.title}
                style={{
                  borderRadius: 10,
                  border: `1px solid ${UI.border}`,
                  background: "#081325",
                  padding: "0.75rem 0.8rem",
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.75rem",
                    color: UI.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "0.25rem",
                  }}
                >
                  {lane.title}
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: 1.55, color: UI.textSoft }}>{lane.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

