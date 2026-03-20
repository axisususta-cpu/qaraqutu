"use client";

const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  text: "#e8eef8",
  textMuted: "#7a95b8",
} as const;

export interface DocumentSectionProps {
  /** Section title (e.g. "Incident Summary", "Verification Trace"). */
  title: string;
  /** Optional section number. */
  number?: number;
  children: React.ReactNode;
}

/**
 * Reusable document section — heading hierarchy, spacing.
 */
export function DocumentSection({ title, number, children }: DocumentSectionProps) {
  return (
    <section style={{ marginBottom: "1.5rem" }}>
      <h3
        style={{
          fontSize: "0.9rem",
          fontWeight: 600,
          marginBottom: "0.5rem",
          marginTop: 0,
          color: UI.text,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.06em",
        }}
      >
        {number != null && (
          <span style={{ color: UI.textMuted, marginRight: "0.5rem" }}>{number}.</span>
        )}
        {title}
      </h3>
      <div style={{ fontSize: "0.82rem", lineHeight: 1.6, color: UI.text }}>{children}</div>
    </section>
  );
}
