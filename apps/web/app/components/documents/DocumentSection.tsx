"use client";

import { THEME } from "../../../lib/theme";

const UI = THEME;

export interface DocumentSectionProps {
  /** Section title (e.g. "Incident Summary", "Verification Trace"). */
  title: string;
  /** Optional section number. */
  number?: number;
  children: React.ReactNode;
}

/**
 * Reusable document section — heading hierarchy, spacing.
 * Protocol-grade typography.
 */
export function DocumentSection({ title, number, children }: DocumentSectionProps) {
  return (
    <section style={{ marginBottom: "1.75rem" }}>
      <h3
        style={{
          fontSize: "0.88rem",
          fontWeight: 600,
          marginBottom: "0.6rem",
          marginTop: 0,
          color: UI.text,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.06em",
          paddingBottom: "0.35rem",
          borderBottom: `1px solid ${UI.borderSoft}`,
        }}
      >
        {number != null && (
          <span style={{ color: UI.textMuted, marginRight: "0.5rem", fontWeight: 500 }}>{number}.</span>
        )}
        {title}
      </h3>
      <div style={{ fontSize: "0.81rem", lineHeight: 1.65, color: UI.text }}>{children}</div>
    </section>
  );
}
