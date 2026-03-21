"use client";

/**
 * Canonical review spine — System → Scenario → Event → Review.
 * Wire/protocol trace language.
 */


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
        Canonical review spine
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          flexWrap: "wrap",
        }}
      >
        {NODES.map((node, i) => (
          <div key={node.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                border: "1px solid var(--border)",
                padding: "0.4rem 0.7rem",
                borderRadius: 4,
                fontSize: "0.8rem",
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--text)",
                background: node.id === "review" ? "rgba(212, 86, 26, 0.08)" : "transparent",
                borderColor: node.id === "review" ? "var(--accent)" : undefined,
              }}
            >
              {node.label}
            </div>
            {i < NODES.length - 1 ? (
              <span
                style={{
                  color: "var(--text-muted)",
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

