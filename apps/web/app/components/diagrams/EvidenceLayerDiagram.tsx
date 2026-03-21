"use client";

/**
 * Evidence layer discipline — Recorded, Derived, Unknown/Disputed, Verification Trace, Artifact Issuance.
 * Doctrine-preserving visual.
 */


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
        Evidence layer discipline
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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
                  ? "1px solid var(--border-soft)"
                  : "none",
            }}
          >
            <div
              style={{
                width: 4,
                height: 20,
                background: layer.id === "issuance" ? "var(--accent)" : "var(--border)",
                borderRadius: 2,
              }}
            />
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {layer.label}
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
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

