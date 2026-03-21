"use client";

import { DOCUMENT_FAMILY_MAP } from "../../../lib/document-family-map";
import { getInstitutionalRole } from "../../../lib/institutional-roles";

import { THEME } from "../../../lib/theme";

const UI = THEME;

/**
 * Document family → Role mapping — visible matrix.
 */
export function DocumentFamilyRoleMatrix() {
  return (
    <div
      style={{
        border: `1px solid ${UI.border}`,
        borderRadius: 8,
        padding: "1.15rem 1.35rem",
        background: UI.panel,
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
        Document family → Primary audience
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {DOCUMENT_FAMILY_MAP.map((d) => {
          const roleLabels = d.primaryAudience
            .map((id) => getInstitutionalRole(id)?.labelEn ?? id)
            .join(", ");
          return (
            <div
              key={d.code}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.35rem 0",
                borderBottom: `1px solid ${UI.borderSoft}`,
              }}
            >
              <div
                style={{
                  minWidth: 170,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: UI.text,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {d.labelEn}
              </div>
              <div style={{ fontSize: "0.72rem", color: UI.textMuted }}>{roleLabels}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
