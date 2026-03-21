"use client";



export interface DocumentMetadataBlockProps {
  /** Label (e.g. "Recorded", "Derived", "Unknown / Disputed"). */
  label: string;
  /** Optional doctrine note. */
  note?: string;
  children: React.ReactNode;
  /** Stronger panel for authority / filing surfaces. */
  variant?: "default" | "authority";
}

/**
 * Reusable metadata block — doctrine-preserving section header.
 * Protocol-grade, institutional tone.
 */
export function DocumentMetadataBlock({ label, note, children, variant = "default" }: DocumentMetadataBlockProps) {
  const authority = variant === "authority";
  return (
    <div
      style={{
        marginBottom: "1.25rem",
        border: authority ? "1px solid var(--border-strong)" : "1px solid var(--border-soft)",
        borderRadius: authority ? 2 : 4,
        overflow: "hidden",
        background: authority ? "var(--panel)" : "var(--panel-raised)",
        boxShadow: authority ? "inset 0 1px 0 var(--border-subtle)" : undefined,
      }}
    >
      <div
        style={{
          padding: "0.6rem 0.95rem",
          background: "var(--border-muted)",
          borderBottom: "1px solid var(--border-soft)",
          fontSize: "0.72rem",
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text)",
        }}
      >
        {label}
      </div>
      {note && (
        <div
          style={{
            padding: "0.4rem 0.9rem",
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
            borderBottom: "1px solid var(--border-soft)",
          }}
        >
          {note}
        </div>
      )}
      <div
        style={{
          padding: "0.95rem 1.05rem",
          fontSize: "0.8rem",
          color: "var(--text)",
          lineHeight: 1.6,
        }}
      >
        {children}
      </div>
    </div>
  );
}

