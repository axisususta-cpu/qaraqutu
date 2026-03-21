"use client";

import { getInstitutionalRolesBySidebarOrder } from "../../../lib/institutional-roles";
import { THEME } from "../../../lib/theme";

const UI = THEME;

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
        borderRadius: 6,
        padding: "1.1rem 1.35rem",
        background: UI.panel,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.6rem",
        }}
      >
        {roles.map((r) => (
          <div
            key={r.id}
            style={{
              border: `1px solid ${UI.borderSoft}`,
              borderRadius: 6,
              padding: "0.6rem 0.75rem",
              borderLeft: `3px solid ${UI.accent}`,
              minHeight: 56,
            }}
          >
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: UI.text,
                marginBottom: "0.25rem",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {r.labelEn}
            </div>
            <div style={{ fontSize: "0.7rem", color: UI.textMuted, lineHeight: 1.4 }}>
              {r.shortPurposeEn}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
