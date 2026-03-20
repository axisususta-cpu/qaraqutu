"use client";

const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  text: "#e8eef8",
  textMuted: "#7a95b8",
} as const;

export interface DocumentMetadataBlockProps {
  /** Label (e.g. "Recorded", "Derived", "Unknown / Disputed"). */
  label: string;
  /** Optional doctrine note. */
  note?: string;
  children: React.ReactNode;
}

/**
 * Reusable metadata block — doctrine-preserving section header.
 */
export function DocumentMetadataBlock({ label, note, children }: DocumentMetadataBlockProps) {
  return (
    <div
      style={{
        marginBottom: "1rem",
        border: `1px solid ${UI.borderSoft}`,
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "0.5rem 0.75rem",
          background: "rgba(10, 22, 40, 0.6)",
          borderBottom: `1px solid ${UI.borderSoft}`,
          fontSize: "0.75rem",
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: UI.text,
        }}
      >
        {label}
      </div>
      {note && (
        <div
          style={{
            padding: "0.35rem 0.75rem",
            fontSize: "0.68rem",
            color: UI.textMuted,
            fontStyle: "italic",
          }}
        >
          {note}
        </div>
      )}
      <div style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: UI.text }}>
        {children}
      </div>
    </div>
  );
}
