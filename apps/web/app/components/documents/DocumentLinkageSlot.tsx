"use client";



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
        border: "1px solid var(--border-soft)",
        borderRadius: 4,
        background: "var(--panel-raised)",
      }}
    >
      {children ?? (
        <div
          style={{
            width: size,
            height: size,
            border: `1px dashed ${"var(--border-soft)"}`,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.6rem",
            color: "var(--text-muted)",
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
          color: "var(--text-muted)",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {label}
      </div>
      {value && (
        <div style={{ fontSize: "0.65rem", color: "var(--text)", fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      )}
      {refLink && (
        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
          {refLink}
        </div>
      )}
    </div>
  );
}

