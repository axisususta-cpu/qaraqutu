"use client";

/**
 * Evidence layer discipline — Recorded, Derived, Unknown/Disputed, Verification Trace, Artifact Issuance.
 * Doctrine-preserving visual.
 */
const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  accent: "#D4561A",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
} as const;

const LAYERS = [
  { id: "recorded", label: "Recorded", note: "Source-origin, directly captured" },
  { id: "derived", label: "Derived", note: "Interpretation, reconstruction" },
  { id: "unknown", label: "Unknown / Disputed", note: "Explicitly framed" },
  { id: "trace", label: "Verification Trace", note: "Steps, not truth" },
  { id: "issuance", label: "Artifact Issuance", note: "Protocol artifact, not blame" },
] as const;

export function EvidenceLayerDiagram() {
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
        Evidence layer discipline
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {LAYERS.map((layer) => (
          <div
            key={layer.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.35rem 0",
              borderBottom:
                layer.id !== LAYERS[LAYERS.length - 1].id
                  ? `1px solid ${UI.borderSoft}`
                  : "none",
            }}
          >
            <div
              style={{
                width: 4,
                height: 20,
                background: layer.id === "issuance" ? UI.accent : UI.border,
                borderRadius: 2,
              }}
            />
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: UI.text,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {layer.label}
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: UI.textMuted,
                  marginLeft: "0.5rem",
                }}
              >
                {layer.note}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
