"use client";

import { ProtocolSeal } from "../ProtocolSeal";
import { LogoPrimary } from "../LogoPrimary";

const UI = {
  border: "#1a2d4a",
  borderSoft: "rgba(26, 45, 74, 0.6)",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
  accent: "#D4561A",
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
  children,
  showCover = true,
}: DocumentShellProps) {
  const date = generatedAt ?? new Date().toISOString().slice(0, 10);

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        background: "#060d1a",
        color: UI.text,
        fontFamily: "'Inter', sans-serif",
        border: `1px solid ${UI.border}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {showCover && (
        <div
          style={{
            padding: "1.5rem 2rem",
            borderBottom: `1px solid ${UI.border}`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <LogoPrimary href="/" height={24} />
            <div
              style={{
                marginTop: "0.75rem",
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: UI.textMuted,
              }}
            >
              {documentType}
            </div>
            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.85rem",
                fontFamily: "'JetBrains Mono', monospace",
                color: UI.text,
              }}
            >
              {documentId}
            </div>
          </div>
          <ProtocolSeal size={40} label="Protocol" />
        </div>
      )}

      <div
        style={{
          padding: "1rem 2rem",
          fontSize: "0.7rem",
          color: UI.textMuted,
          borderBottom: `1px solid ${UI.borderSoft}`,
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {eventId && <span>Event: {eventId}</span>}
        {bundleId && <span>Bundle: {bundleId}</span>}
        {manifestId && <span>Manifest: {manifestId}</span>}
        <span>Version: {version}</span>
        <span>Date: {date}</span>
      </div>

      <div style={{ padding: "1.25rem 2rem" }}>{children}</div>

      <footer
        style={{
          padding: "0.5rem 2rem",
          fontSize: "0.65rem",
          color: UI.textMuted,
          borderTop: `1px solid ${UI.borderSoft}`,
          textAlign: "center",
        }}
      >
        QARAQUTU — Verifier-first witness protocol. Not a liability engine or judicial substitute.
      </footer>
    </div>
  );
}
