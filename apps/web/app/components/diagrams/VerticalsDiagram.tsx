"use client";

import { THEME } from "../../../lib/theme";

const UI = THEME;

export function VerticalsDiagram() {
  return (
    <div
      style={{
        border: `1px solid ${UI.border}`,
        borderRadius: 8,
        padding: "1.15rem 1.35rem",
        background: UI.panel,
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: UI.textMuted,
          marginBottom: "0.85rem",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        One product · three verticals
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.9rem",
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
              padding: "0.65rem 0.85rem",
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
