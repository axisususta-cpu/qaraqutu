"use client";

import { ProtocolSeal } from "../ProtocolSeal";
import { LogoPrimary } from "../LogoPrimary";
import { useLanguage } from "../../../lib/LanguageContext";
import { MSG } from "../../../lib/i18n/messages";
import { DocumentAuthorityIdentityGrid } from "./DocumentAuthorityIdentityGrid";
import { DocumentLinkageSlot } from "./DocumentLinkageSlot";

export interface DocumentShellProps {
  /** Primary document line (e.g. family title). */
  documentType: string;
  /** Document ID (e.g. export or protocol document id). */
  documentId: string;
  eventId?: string;
  bundleId?: string;
  manifestId?: string;
  version?: string;
  generatedAt?: string;
  verifiedAt?: string;
  verificationState?: string;
  receiptId?: string;
  manifestRef?: string;
  traceRef?: string;
  exportPurpose?: string;
  exportProfile?: string;
  /** Human-readable audience line (e.g. Insurance / Claims). */
  audienceLabel?: string;
  /** Sector-context subtitle (e.g. Vehicle Incident Report) — same product, sector-aware variant. */
  sectorContextLine?: string;
  roleTargetedSubtitle?: string;
  /** Optional institution framing blocks (doctrine-safe). */
  institutionHeadingTone?: string;
  institutionSubtitle?: string;
  institutionSummary?: string;
  institutionMetadataEmphasis?: string;
  institutionOutputFraming?: string;
  /** Override default authenticity note; otherwise MSG.docAuthenticityNote. */
  authenticityNote?: string;
  pageIdentity?: string;
  children: React.ReactNode;
  showCover?: boolean;
  /** When false, cover is skipped but header strip remains. */
  showLinkageRow?: boolean;
}

const dash = "—";

/**
 * Protocol-grade document shell — cover / body / footer law, PDF-print posture.
 * Doctrine: Recorded, Derived, Unknown/Disputed, Trace, Issuance remain separated in copy.
 */
export function DocumentShell({
  documentType,
  documentId,
  eventId,
  bundleId,
  manifestId,
  version = "1.0",
  generatedAt,
  verifiedAt,
  verificationState,
  receiptId,
  manifestRef,
  traceRef,
  exportPurpose,
  exportProfile,
  audienceLabel,
  sectorContextLine,
  roleTargetedSubtitle,
  institutionHeadingTone,
  institutionSubtitle,
  institutionSummary,
  institutionMetadataEmphasis,
  institutionOutputFraming,
  authenticityNote,
  pageIdentity,
  children,
  showCover = true,
  showLinkageRow = true,
}: DocumentShellProps) {
  const { lang } = useLanguage();
  const messages = MSG[lang];

  const date = generatedAt ?? new Date().toISOString().slice(0, 10);
  const authNote = authenticityNote ?? messages.docAuthenticityNote;
  const pageLine = pageIdentity ?? messages.docPage_identity;
  const manifestDisplay = (manifestRef ?? manifestId) || dash;

  const identityFields = [
    { label: messages.docMeta_documentId, value: documentId || dash },
    { label: messages.docMeta_eventId, value: eventId || dash },
    { label: messages.docMeta_bundleId, value: bundleId || dash },
    { label: messages.docMeta_manifestRef, value: manifestDisplay },
    { label: messages.docMeta_receiptRef, value: receiptId || dash },
    { label: messages.docMeta_traceRef, value: traceRef || dash },
    { label: messages.docMeta_schemaVersion, value: version || dash },
    { label: messages.docMeta_createdAt, value: date },
    { label: messages.docMeta_verifiedAt, value: verifiedAt || dash },
    { label: messages.docMeta_verificationState, value: verificationState || dash },
    { label: messages.docMeta_roleAudience, value: audienceLabel || dash },
    ...(exportProfile ? [{ label: messages.docMeta_exportProfile, value: exportProfile }] : []),
    ...(exportPurpose ? [{ label: messages.docMeta_exportPurpose, value: exportPurpose }] : []),
  ];

  const hasFraming =
    institutionHeadingTone ||
    institutionSubtitle ||
    institutionSummary ||
    institutionMetadataEmphasis ||
    institutionOutputFraming;

  return (
    <div
      className="qaraqutu-document-shell"
      style={{
        maxWidth: 820,
        margin: "0 auto",
        background: "#fcfcfd",
        color: "#111827",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        border: "1px solid #d1d5db",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 1px 0 rgba(15,23,42,0.08), 0 14px 34px rgba(15,23,42,0.08)",
      }}
    >
      {showCover && (
        <div
          className="qaraqutu-document-cover"
          style={{
            padding: "2rem 2.25rem 1.75rem",
            borderBottom: "2px solid #cbd5e1",
            background: "#f8fafc",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1.75rem",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <LogoPrimary href="/" height={34} />
            <div
              style={{
                marginTop: "1.25rem",
                fontSize: "0.65rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#6b7280",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {messages.docCover_label} · {documentType}
            </div>
            {sectorContextLine && (
              <div
                style={{
                  marginTop: "0.45rem",
                  fontSize: "0.72rem",
                  color: "#4b5563",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.06em",
                }}
              >
                {sectorContextLine}
              </div>
            )}
            <div
              style={{
                marginTop: "0.65rem",
                fontSize: "1.05rem",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#111827",
                letterSpacing: "0.03em",
                fontWeight: 600,
              }}
            >
              {documentId}
            </div>
            {audienceLabel && (
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.68rem",
                  color: "#0f766e",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {messages.docMeta_roleAudience}: {audienceLabel}
              </div>
            )}
            {roleTargetedSubtitle && (
              <div
                style={{
                  marginTop: "0.35rem",
                  fontSize: "0.68rem",
                  color: "#6b7280",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.03em",
                }}
              >
                {roleTargetedSubtitle}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 }}>
            <ProtocolSeal size={48} label={messages.docSealLabel} />
          </div>
        </div>
      )}

      {/* Running header strip — visible on screen and print */}
      <div
        className="qaraqutu-document-running-head"
        style={{
          padding: "0.62rem 2rem",
          fontSize: "0.62rem",
          color: "#4b5563",
          borderBottom: "1px solid #dbe2ea",
          background: "#f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{documentType}</span>
        <span style={{ flexShrink: 0 }}>{pageLine}</span>
      </div>

      <div style={{ padding: "0 2rem" }}>
        <div style={{ fontSize: "0.62rem", color: "#6b7280", padding: "0.5rem 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
          {messages.docPrintHint}
        </div>

        <div style={{ marginTop: "0.35rem" }}>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#111827",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: "0.5rem",
            }}
          >
            {messages.docAuthorityStrip_title}
          </div>
          <DocumentAuthorityIdentityGrid fields={identityFields} />
        </div>

        {hasFraming && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.85rem 1rem",
              border: "1px solid #d1d5db",
              borderRadius: 2,
              background: "#ffffff",
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#4b5563",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: "0.55rem",
              }}
            >
              {messages.docInstitutionLayer_title}
            </div>
            {institutionHeadingTone && (
              <div style={{ fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.35rem", color: "#111827" }}>
                {institutionHeadingTone}
              </div>
            )}
            {institutionSubtitle && (
              <div style={{ fontSize: "0.78rem", color: "#374151", lineHeight: 1.55, marginBottom: "0.45rem" }}>
                {institutionSubtitle}
              </div>
            )}
            {institutionSummary && (
              <div style={{ fontSize: "0.76rem", color: "#111827", lineHeight: 1.6, marginBottom: "0.35rem" }}>
                {institutionSummary}
              </div>
            )}
            {institutionMetadataEmphasis && (
              <div style={{ fontSize: "0.72rem", color: "#4b5563", lineHeight: 1.55, marginBottom: "0.35rem" }}>
                <strong style={{ color: "#111827" }}>Metadata: </strong>
                {institutionMetadataEmphasis}
              </div>
            )}
            {institutionOutputFraming && (
              <div style={{ fontSize: "0.72rem", color: "#4b5563", lineHeight: 1.55 }}>
                {institutionOutputFraming}
              </div>
            )}
          </div>
        )}

        {showLinkageRow && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.65rem",
              marginTop: "1rem",
              marginBottom: "0.25rem",
            }}
          >
            <DocumentLinkageSlot label={messages.docLinkage_qr} value={documentId} size={56} />
            <DocumentLinkageSlot label={messages.docMeta_receiptRef} value={receiptId} size={56} />
            <DocumentLinkageSlot label={messages.docMeta_traceRef} value={traceRef} size={56} />
          </div>
        )}

        <div
          style={{
            marginTop: "0.85rem",
            padding: "0.65rem 0.85rem",
            borderLeft: "3px solid #0f766e",
            background: "#ecfeff",
            fontSize: "0.72rem",
            lineHeight: 1.55,
            color: "#0f172a",
          }}
        >
          {authNote}
        </div>
      </div>

      <div
        className="qaraqutu-document-body"
        style={{
          padding: "1.35rem 2rem 1.75rem",
          minHeight: 100,
          borderTop: "1px solid #e5e7eb",
          marginTop: "1rem",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#4b5563",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: "0.75rem",
          }}
        >
          {messages.docBody_label}
        </div>
        {children}
      </div>

      <div
        className="qaraqutu-document-footer"
        style={{
          padding: "0.85rem 2rem 1rem",
          fontSize: "0.62rem",
          color: "#4b5563",
          borderTop: "2px solid #d1d5db",
          background: "#f8fafc",
          lineHeight: 1.55,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.02em",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ marginBottom: "0.35rem", fontWeight: 600, color: "#111827" }}>{documentId}</div>
            {messages.docFooter_doctrineShort}
          </div>
          <div
            style={{
              flexShrink: 0,
              border: "1px solid #2f2f2f",
              background: "#161616",
              padding: "0.2rem 0.38rem",
              opacity: 0.82,
            }}
          >
            <LogoPrimary href={undefined} height={12} variant="onDarkSurface" />
          </div>
        </div>
      </div>
    </div>
  );
}
