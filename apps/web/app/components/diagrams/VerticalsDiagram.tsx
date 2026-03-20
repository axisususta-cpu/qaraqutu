"use client";

/**
 * One product / three verticals — Vehicle, Drone, Robot.
 * Severe wire/protocol/trace language. Protocol-grade.
 */
const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  accent: "#D4561A",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
} as const;

export function VerticalsDiagram() {
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
        One product · three verticals
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.75rem",
        }}
      >
        {[
          { id: "vehicle", label: "Vehicle", trace: "Event → Bundle → Manifest" },
          { id: "drone", label: "Drone", trace: "Mission → Telemetry → Link" },
          { id: "robot", label: "Robot", trace: "Interaction → Safety → Handoff" },
        ].map((v) => (
          <div
            key={v.id}
            style={{
              border: `1px solid ${UI.borderSoft}`,
              borderRadius: 6,
              padding: "0.6rem 0.75rem",
              borderLeft: `3px solid ${UI.accent}`,
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: UI.text,
                marginBottom: "0.25rem",
              }}
            >
              {v.label}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: UI.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {v.trace}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
