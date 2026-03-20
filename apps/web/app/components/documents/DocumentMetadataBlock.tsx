"use client";

const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  text: "#e8eef8",
  textSoft: "#b8cce0",
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
 * Protocol-grade, institutional tone.
 */
export function DocumentMetadataBlock({ label, note, children }: DocumentMetadataBlockProps) {
  return (
    <div
      style={{
        marginBottom: "1.25rem",
        border: `1px solid ${UI.borderSoft}`,
        borderRadius: 4,
        overflow: "hidden",
        background: "rgba(10, 22, 40, 0.3)",
      }}
    >
      <div
        style={{
          padding: "0.55rem 0.9rem",
          background: "rgba(26, 45, 74, 0.25)",
          borderBottom: `1px solid ${UI.borderSoft}`,
          fontSize: "0.72rem",
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: UI.text,
        }}
      >
        {label}
      </div>
      {note && (
        <div
          style={{
            padding: "0.4rem 0.9rem",
            fontSize: "0.65rem",
            color: UI.textMuted,
            fontStyle: "italic",
            borderBottom: `1px solid ${UI.borderSoft}`,
          }}
        >
          {note}
        </div>
      )}
      <div
        style={{
          padding: "0.9rem 1rem",
          fontSize: "0.8rem",
          color: UI.text,
          lineHeight: 1.6,
        }}
      >
        {children}
      </div>
    </div>
  );
}
