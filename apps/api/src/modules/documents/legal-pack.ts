import type { CanonicalEvent, RecordedEvidenceItem, DerivedEvidenceItem } from "../../contracts";
import PDFDocument from "pdfkit";
import {
  attachFooterIdentity,
  buildLayoutContext,
  createDocument,
  drawCoverHeaderBand,
  drawEvidenceStackedPanels,
  drawExportAndIdentityGrid,
  drawIssuanceNotice,
  drawKeyValueRows,
  drawParagraph,
  drawSectionHeading,
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

  drawCoverHeaderBand(doc, identity.outputTitle ?? "Legal Review Evidence Pack", identity);

  drawExportAndIdentityGrid(ctx);

  drawSectionHeading(ctx, "Incident summary");
  drawParagraph(
    ctx,
    "Narrative bound to this export snapshot; not judicial weight; recorded and derived stay separated."
  );
  drawParagraph(ctx, event.summary);

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

  drawSectionHeading(ctx, "Data provenance");
  drawKeyValueRows(ctx, [
    { label: "Manifest ID", value: identity.manifestId },
    { label: "Source tenant", value: identity.tenantId ?? "—" },
  ]);
  drawParagraph(
    ctx,
    "Reflects manifest inventory at generation time; trace-linked provenance, not a completeness guarantee for all proceedings."
  );

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

  ensurePageSpace(ctx, 200);
  drawIssuanceNotice(
    ctx,
    "Counsel-facing chain-bound reference; not a judicial finding, liability determination, or substitute for independent legal judgement.",
    ["Interpretations stay bounded by evidence available at export time."]
  );

  return doc;
}
