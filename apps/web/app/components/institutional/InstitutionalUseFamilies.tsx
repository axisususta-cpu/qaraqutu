"use client";

import { getInstitutionalRolesBySidebarOrder } from "../../../lib/institutional-roles";

const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  accent: "#D4561A",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
} as const;

/**
 * Institutional Use Families — visible role cards.
 * Protocol-grade, severe. One canonical event core, many institutional shells.
 */
export function InstitutionalUseFamilies() {
  const roles = getInstitutionalRolesBySidebarOrder();

  return (
    <div
      style={{
        border: `1px solid ${UI.border}`,
        borderRadius: 8,
        padding: "1rem 1.25rem",
        background: "rgba(10, 22, 40, 0.5)",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: UI.textMuted,
          marginBottom: "0.75rem",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Institutional use families
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.5rem",
        }}
      >
        {roles.map((r) => (
          <div
            key={r.id}
            style={{
              border: `1px solid ${UI.borderSoft}`,
              borderRadius: 6,
              padding: "0.5rem 0.65rem",
              borderLeft: `3px solid ${UI.accent}`,
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: UI.text,
                marginBottom: "0.2rem",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {r.labelEn}
            </div>
            <div style={{ fontSize: "0.68rem", color: UI.textMuted, lineHeight: 1.35 }}>
              {r.shortPurposeEn}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
