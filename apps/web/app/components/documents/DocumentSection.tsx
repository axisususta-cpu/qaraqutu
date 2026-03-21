"use client";



export interface DocumentSectionProps {
  /** Section title (e.g. "Incident Summary", "Verification Trace"). */
  title: string;
  /** Optional section number. */
  number?: number;
  children: React.ReactNode;
  variant?: "default" | "authority";
}

/**
 * Reusable document section — heading hierarchy, spacing.
 * Protocol-grade typography.
 */
export function DocumentSection({ title, number, children, variant = "default" }: DocumentSectionProps) {
  const authority = variant === "authority";
  return (
    <section style={{ marginBottom: "1.75rem" }}>
      <h3
        style={{
          fontSize: authority ? "0.82rem" : "0.88rem",
          fontWeight: 600,
          marginBottom: "0.6rem",
          marginTop: 0,
          color: "var(--text)",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: authority ? "0.1em" : "0.06em",
          textTransform: authority ? "uppercase" : "none",
          paddingBottom: "0.35rem",
          borderBottom: authority ? "2px solid var(--border)" : "1px solid var(--border-soft)",
        }}
      >
        {number != null && (
          <span style={{ color: "var(--text-muted)", marginRight: "0.5rem", fontWeight: 500 }}>{number}.</span>
        )}
        {title}
      </h3>
      <div style={{ fontSize: "0.81rem", lineHeight: 1.65, color: "var(--text)" }}>{children}</div>
    </section>
  );
}

