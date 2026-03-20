"use client";

/**
 * Canonical review spine — System → Scenario → Event → Review.
 * Wire/protocol trace language.
 */
const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  accent: "#D4561A",
  text: "#e8eef8",
  textMuted: "#7a95b8",
} as const;

const NODES = [
  { id: "system", label: "System" },
  { id: "scenario", label: "Scenario" },
  { id: "event", label: "Event" },
  { id: "review", label: "Review" },
] as const;

export function CanonicalSpineDiagram() {
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
        Canonical review spine
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        {NODES.map((node, i) => (
          <div key={node.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                border: `1px solid ${UI.border}`,
                padding: "0.4rem 0.7rem",
                borderRadius: 4,
                fontSize: "0.8rem",
                fontFamily: "'JetBrains Mono', monospace",
                color: UI.text,
                background: node.id === "review" ? "rgba(212, 86, 26, 0.08)" : "transparent",
                borderColor: node.id === "review" ? UI.accent : undefined,
              }}
            >
              {node.label}
            </div>
            {i < NODES.length - 1 ? (
              <span
                style={{
                  color: UI.textMuted,
                  fontSize: "0.7rem",
                }}
              >
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
