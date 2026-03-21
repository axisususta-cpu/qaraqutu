"use client";

export interface AuthorityIdentityField {
  label: string;
  value: string;
}

/**
 * Visible authenticity / chain identity grid — protocol-grade, print-friendly.
 * Empty values should be passed as "—" so slots remain visible (anti-fake readability).
 */
export function DocumentAuthorityIdentityGrid({ fields }: { fields: AuthorityIdentityField[] }) {
  return (
    <div
      className="qaraqutu-authority-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(11.5rem, 1fr))",
        gap: "0.55rem 1rem",
        padding: "0.85rem 0",
        borderTop: "1px solid var(--border-soft)",
        borderBottom: "1px solid var(--border-soft)",
      }}
      role="group"
      aria-label="Document identity and chain references"
    >
      {fields.map((f) => (
        <div key={f.label} style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: "0.2rem",
            }}
          >
            {f.label}
          </div>
          <div
            style={{
              fontSize: "0.74rem",
              fontWeight: 600,
              color: "var(--text)",
              fontFamily: "'JetBrains Mono', monospace",
              wordBreak: "break-word",
              lineHeight: 1.4,
            }}
          >
            {f.value}
          </div>
        </div>
      ))}
    </div>
  );
}
