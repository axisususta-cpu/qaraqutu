import type { CanonicalEvent, RecordedEvidenceItem, DerivedEvidenceItem } from "../../contracts";
import PDFDocument from "pdfkit";
import {
  attachFooterIdentity,
  buildLayoutContext,
  createDocument,
  drawCoverHeaderBand,
  drawExportMetadataGrid,
  drawIdentityChain,
  drawIssuanceNotice,
  drawKeyValueRows,
  drawParagraph,
  drawSectionHeading,
  drawEvidenceStackedPanels,
  drawUnknownDisputedBlock,
  drawVerificationTraceTable,
  ensurePageSpace,
} from "./layout";
import type { DocumentIdentity } from "./types";

export function renderLegalPdf(
  identity: DocumentIdentity,
  event: CanonicalEvent & {
    vehicleVin?: string;
    fleetId?: string;
    policyOrClaimRef?: string;
    incidentLocation?: string;
  }
): InstanceType<typeof PDFDocument> {
  const doc = createDocument();
  const ctx = buildLayoutContext(doc, identity, event as any);

  const footerText = `Event ${identity.eventId} · Export ${identity.exportId} · Receipt ${identity.receiptId ?? "N/A"}`;
  attachFooterIdentity(doc, footerText);

  drawCoverHeaderBand(doc, "Legal Review Evidence Pack", identity);

  ensurePageSpace(ctx, 80);
  drawExportMetadataGrid(ctx);
  drawIdentityChain(ctx);

  ensurePageSpace(ctx, 100);
  drawSectionHeading(ctx, "Incident summary");
  drawParagraph(
    ctx,
    "Concise narrative bound to the export snapshot. This text does not carry judicial weight and does not merge recorded and derived layers."
  );
  drawParagraph(ctx, event.summary);

  ensurePageSpace(ctx, 100);
  drawSectionHeading(ctx, "Canonical chain reference");
  drawParagraph(
    ctx,
    "This export is a presentation artifact linked to a canonical event record. Event, bundle, manifest, export, and receipt identifiers form the authoritative reference chain for downstream review."
  );
  drawKeyValueRows(ctx, [
    { label: "Canonical event", value: identity.eventId },
    { label: "Canonical bundle", value: identity.bundleId },
    { label: "Canonical manifest", value: identity.manifestId },
    { label: "Canonical export", value: identity.exportId },
    { label: "Canonical receipt", value: identity.receiptId },
  ]);

  const recordedItems = (event.recordedEvidence ?? []).map((item: RecordedEvidenceItem) => {
    const parts = [item.displayLabel, item.contentType, item.sourceId, item.capturedAt].filter(Boolean);
    return parts.join(" · ");
  });
  const derivedItems = (event.derivedEvidence ?? []).map((item: DerivedEvidenceItem) => {
    const parts = [`${item.displayLabel} (derived)`, item.humanSummary, item.derivationNote].filter(Boolean);
    return parts.join(" — ");
  });
  drawEvidenceStackedPanels(
    ctx,
    recordedItems,
    derivedItems,
    "No recorded evidence items were included in this export snapshot.",
    "No derived analysis items were included in this export snapshot."
  );

  drawUnknownDisputedBlock(ctx, event.unknownDisputed);
  drawVerificationTraceTable(ctx, event.verificationTrace ?? []);

  ensurePageSpace(ctx, 90);
  drawSectionHeading(ctx, "Data provenance");
  drawKeyValueRows(ctx, [
    { label: "Manifest ID", value: identity.manifestId },
    { label: "Source tenant", value: identity.tenantId ?? "—" },
  ]);
  drawParagraph(
    ctx,
    "Data in this export reflects the manifest inventory and associated materials at generation time. Provenance is trace-linked; it is not a guarantee of completeness for all possible proceedings."
  );

  ensurePageSpace(ctx, 100);
  drawSectionHeading(ctx, "Redactions & exclusions");
  if (identity.redactionApplied) {
    const basis =
      identity.redactionBasis ??
      "One or more evidence items were excluded or redacted in accordance with tenant visibility and legal-review policy.";
    drawParagraph(
      ctx,
      `${basis} Redacted or excluded items: ${
        typeof identity.redactedItemCount === "number" ? identity.redactedItemCount : "at least one"
      }.`
    );
  } else {
    drawParagraph(ctx, "No policy-driven redactions or exclusions were applied in this legal review export.");
  }

  drawIssuanceNotice(
    ctx,
    "This Legal Review Evidence Pack supports counsel-facing review of chain-bound references. It does not constitute a judicial finding, liability determination, or substitute for independent legal judgement.",
    ["Interpretations remain bounded by evidence available at export time."]
  );

  return doc;
}
