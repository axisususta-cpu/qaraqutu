"use client";

const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  text: "#e8eef8",
  textMuted: "#7a95b8",
} as const;

export interface DocumentLinkageSlotProps {
  /** Label: QR, Receipt, Manifest, Trace. */
  label: string;
  /** Optional value/ID to display. */
  value?: string;
  /** Optional ref/link. */
  refLink?: string;
  /** Size in px for QR placeholder. Default 64. */
  size?: number;
  children?: React.ReactNode;
}

/**
 * Slot for QR, receipt, manifest, or trace linkage.
 * Protocol-grade document linkage area.
 */
export function DocumentLinkageSlot({ label, value, refLink, size = 64, children }: DocumentLinkageSlotProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.55rem 0.65rem",
        border: `1px solid ${UI.borderSoft}`,
        borderRadius: 4,
        background: "rgba(10, 22, 40, 0.3)",
      }}
    >
      {children ?? (
        <div
          style={{
            width: size,
            height: size,
            border: `1px dashed ${UI.borderSoft}`,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.6rem",
            color: UI.textMuted,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          fontSize: "0.6rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: UI.textMuted,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {label}
      </div>
      {value && (
        <div style={{ fontSize: "0.65rem", color: UI.text, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      )}
      {refLink && (
        <div style={{ fontSize: "0.6rem", color: UI.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
          {refLink}
        </div>
      )}
    </div>
  );
}
