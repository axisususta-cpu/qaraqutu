"use client";

import { DOCUMENT_FAMILY_MAP } from "../../../lib/document-family-map";
import { getInstitutionalRolesBySidebarOrder } from "../../../lib/institutional-roles";



/**
 * Role → Document family mapping — visible matrix.
 */
export function RoleDocumentMapping() {
  const roles = getInstitutionalRolesBySidebarOrder();

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "1.15rem 1.35rem",
        background: "var(--panel)",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "0.85rem",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Role → Document family
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {roles.map((r) => {
          const families = r.preferredDocumentFamily
            .map((c) => DOCUMENT_FAMILY_MAP.find((d) => d.code === c)?.labelEn ?? c)
            .join(", ");
          return (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.35rem 0",
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <div
                style={{
                  minWidth: 150,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {r.labelEn}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{families}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

