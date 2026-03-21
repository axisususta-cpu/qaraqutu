"use client";

import { getInstitutionalRole } from "../../../lib/institutional-roles";
import type { InstitutionalRoleId } from "../../../lib/institutional-roles";
import { THEME } from "../../../lib/theme";

const UI = THEME;

const DISPLAY_ROLES: InstitutionalRoleId[] = ["legal", "field", "technical", "claims"];

/**
 * "How this review reads by role" — static explanatory strip.
 * No backend role switching; guidance only.
 */
export function InstitutionalGuidanceStrip() {
  return (
    <div
      style={{
        padding: "0.45rem 2.5rem",
        borderBottom: `1px solid ${UI.borderSoft}`,
        background: UI.panelRaised,
        fontSize: "0.68rem",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 1.25rem", alignItems: "baseline" }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: UI.chipText,
            marginRight: "0.5rem",
            padding: "0.1rem 0.4rem",
            borderRadius: 4,
            background: UI.chipBg,
            border: `1px solid ${UI.chipBorder}`,
          }}
        >
          By role:
        </span>
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
                gap: "0.3rem",
              }}
            >
              <span style={{ fontWeight: 600, color: UI.text }}>{role.labelEn}</span>
              <span style={{ color: UI.textMuted }}>—</span>
              <span>{role.shortPurposeEn}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
