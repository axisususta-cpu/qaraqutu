"use client";

/**
 * Role-based export family — claims, legal, technical.
 * Protocol-grade, not generic SaaS.
 */
const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  accent: "#D4561A",
  text: "#e8eef8",
  textMuted: "#7a95b8",
} as const;

const ROLES = [
  { id: "claims", label: "Claims", pack: "Dispute-ready summaries, canonical refs" },
  { id: "legal", label: "Legal", pack: "Chain-centric, manifest, receipt, provenance" },
  { id: "technical", label: "Technical", pack: "Event object, evidence separation" },
] as const;

export function RoleExportDiagram() {
  return (
    <div
      style={{
        border: `1px solid ${UI.border}`,
        borderRadius: 8,
        padding: "1.15rem 1.35rem",
        background: "rgba(10, 22, 40, 0.5)",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: UI.textMuted,
          marginBottom: "0.85rem",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Role-based export family
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.75rem",
        }}
      >
        {ROLES.map((r) => (
          <div
            key={r.id}
            style={{
              border: `1px solid ${UI.borderSoft}`,
              borderRadius: 6,
              padding: "0.65rem 0.85rem",
            }}
          >
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: UI.text,
                marginBottom: "0.2rem",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {r.label}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: UI.textMuted,
                lineHeight: 1.4,
              }}
            >
              {r.pack}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
