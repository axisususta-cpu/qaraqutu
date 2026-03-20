"use client";

import { getInstitutionalRole } from "../../../lib/institutional-roles";
import type { InstitutionalRoleId } from "../../../lib/institutional-roles";

const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
} as const;

const DISPLAY_ROLES: InstitutionalRoleId[] = ["legal", "field", "technical", "claims"];

/**
 * "How this review reads by role" — static explanatory strip.
 * No backend role switching; guidance only.
 */
export function InstitutionalGuidanceStrip() {
  return (
    <div
      style={{
        padding: "0.5rem 0.75rem",
        borderBottom: `1px solid ${UI.borderSoft}`,
        background: "rgba(10, 22, 40, 0.4)",
        fontSize: "0.7rem",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: UI.textMuted,
          marginBottom: "0.4rem",
        }}
      >
        How this review reads by role
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem" }}>
        {DISPLAY_ROLES.map((id) => {
          const role = getInstitutionalRole(id);
          if (!role) return null;
          return (
            <span
              key={id}
              style={{
                color: UI.textSoft,
                display: "inline-flex",
                alignItems: "baseline",
                gap: "0.35rem",
              }}
            >
              <span style={{ fontWeight: 600, color: UI.text }}>{role.labelEn}:</span>
              <span>{role.shortPurposeEn}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
