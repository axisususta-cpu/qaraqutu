"use client";

import { ProtocolSeal } from "../ProtocolSeal";
import { LogoPrimary } from "../LogoPrimary";


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
  /** Optional role-targeted subtitle (e.g. from institutional role shortPurpose). */
  roleTargetedSubtitle?: string;
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
  roleTargetedSubtitle,
  children,
  showCover = true,
}: DocumentShellProps) {
  const date = generatedAt ?? new Date().toISOString().slice(0, 10);

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        background: "var(--panel)",
        color: "var(--text)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        border: "1px solid var(--border)",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
      }}
    >
      {showCover && (
        <div
          style={{
            padding: "1.85rem 2rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--panel-raised)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1.75rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <LogoPrimary href="/" height={32} />
            <div
              style={{
                marginTop: "1rem",
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
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
                color: "var(--text)",
                letterSpacing: "0.04em",
              }}
            >
              {documentId}
            </div>
            {roleTargetedSubtitle && (
              <div
                style={{
                  marginTop: "0.4rem",
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.03em",
                }}
              >
                {roleTargetedSubtitle}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
            <ProtocolSeal size={42} label="Protocol" />
          </div>
        </div>
      )}

      <div
        style={{
          padding: "0.8rem 2rem",
          fontSize: "0.67rem",
          color: "var(--text-muted)",
          borderBottom: "1px solid var(--border)",
          background: "var(--panel-raised)",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "0.6rem 2rem",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.04em",
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
          padding: "0.75rem 2rem",
          fontSize: "0.62rem",
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border)",
          background: "var(--panel-raised)",
          textAlign: "center",
          lineHeight: 1.55,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.03em",
        }}
      >
        QARAQUTU — Verifier-first witness protocol. Not a liability engine or judicial substitute. Recorded, Derived,
        Unknown/Disputed, Trace, and Issuance remain explicitly separated.
      </div>
    </div>
  );
}

