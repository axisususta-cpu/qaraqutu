"use client";



export interface DocumentMetadataBlockProps {
  /** Label (e.g. "Recorded", "Derived", "Unknown / Disputed"). */
  label: string;
  /** Optional doctrine note. */
  note?: string;
  children: React.ReactNode;
}

/**
 * Reusable metadata block — doctrine-preserving section header.
 * Protocol-grade, institutional tone.
 */
export function DocumentMetadataBlock({ label, note, children }: DocumentMetadataBlockProps) {
  return (
    <div
      style={{
        marginBottom: "1.25rem",
        border: "1px solid var(--border-soft)",
        borderRadius: 4,
        overflow: "hidden",
        background: "var(--panel-raised)",
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

