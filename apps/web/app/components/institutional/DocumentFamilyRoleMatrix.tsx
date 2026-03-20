"use client";

import { DOCUMENT_FAMILY_MAP } from "../../../lib/document-family-map";
import { getInstitutionalRole } from "../../../lib/institutional-roles";

const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  text: "#e8eef8",
  textMuted: "#7a95b8",
} as const;

/**
 * Document family → Role mapping — visible matrix.
 */
export function DocumentFamilyRoleMatrix() {
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
                  minWidth: 160,
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
