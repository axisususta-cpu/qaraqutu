"use client";

import { ProtocolSeal } from "../ProtocolSeal";
import { LogoPrimary } from "../LogoPrimary";

const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  borderMuted: "rgba(26, 45, 74, 0.35)",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
  accent: "#D4561A",
  bg: "#060d1a",
  panel: "#0a1628",
} as const;

export interface DocumentShellProps {
  /** Document type: Incident Report, Verification Summary, Trace Appendix, Role-based Export. */
  documentType: string;
  /** Document ID (e.g. QEV-20260311-DEMO-01). */
  documentId: string;
  /** Event/package/manifest linkage. */
  eventId?: string;
  bundleId?: string;
  manifestId?: string;
  /** Version and date. */
  version?: string;
  generatedAt?: string;
  /** Optional receipt/manifest/trace linkage IDs for QR/link area. */
  receiptId?: string;
  manifestRef?: string;
  traceRef?: string;
  /** Children: sections, metadata, content. */
  children: React.ReactNode;
  /** Show cover with seal. */
  showCover?: boolean;
}

/**
 * Reusable document shell — protocol-grade corporate evidence document.
 * Doctrine: Recorded, Derived, Unknown/Disputed, Trace, Issuance remain separated.
 */
export function DocumentShell({
  documentType,
  documentId,
  eventId,
  bundleId,
  manifestId,
  version = "1.0",
  generatedAt,
  receiptId,
  manifestRef,
  traceRef,
  children,
  showCover = true,
}: DocumentShellProps) {
  const date = generatedAt ?? new Date().toISOString().slice(0, 10);

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        background: UI.bg,
        color: UI.text,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        border: `1px solid ${UI.border}`,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.24)",
      }}
    >
      {showCover && (
        <div
          style={{
            padding: "1.75rem 2rem",
            borderBottom: `1px solid ${UI.border}`,
            background: `linear-gradient(180deg, ${UI.panel} 0%, ${UI.bg} 100%)`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1.5rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <LogoPrimary href="/" height={28} />
            <div
              style={{
                marginTop: "1rem",
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: UI.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {documentType}
            </div>
            <div
              style={{
                marginTop: "0.35rem",
                fontSize: "0.9rem",
                fontFamily: "'JetBrains Mono', monospace",
                color: UI.text,
                letterSpacing: "0.04em",
              }}
            >
              {documentId}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
            <ProtocolSeal size={44} label="Protocol" />
          </div>
        </div>
      )}

      <div
        style={{
          padding: "0.9rem 2rem",
          fontSize: "0.68rem",
          color: UI.textMuted,
          borderBottom: `1px solid ${UI.borderSoft}`,
          background: "rgba(10, 22, 40, 0.4)",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "0.75rem 2rem",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.03em",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0 1.25rem" }}>
          {eventId && <span>Event: {eventId}</span>}
          {bundleId && <span>Bundle: {bundleId}</span>}
          {manifestId && <span>Manifest: {manifestId}</span>}
          <span>Version: {version}</span>
          <span>Date: {date}</span>
        </div>
        {(receiptId || manifestRef || traceRef) && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            {receiptId && <span>Receipt: {receiptId}</span>}
            {manifestRef && <span>Manifest ref: {manifestRef}</span>}
            {traceRef && <span>Trace ref: {traceRef}</span>}
          </div>
        )}
      </div>

      <div style={{ padding: "1.5rem 2rem", minHeight: 120 }}>{children}</div>

      <div
        style={{
          padding: "0.6rem 2rem",
          fontSize: "0.62rem",
          color: UI.textMuted,
          borderTop: `1px solid ${UI.borderSoft}`,
          textAlign: "center",
          lineHeight: 1.5,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.02em",
        }}
      >
        QARAQUTU — Verifier-first witness protocol. Not a liability engine or judicial substitute. Recorded, Derived,
        Unknown/Disputed, Trace, and Issuance remain explicitly separated.
      </div>
    </div>
  );
}
