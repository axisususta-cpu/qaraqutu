import type { CanonicalEvent, RecordedEvidenceItem, DerivedEvidenceItem } from "../../contracts";
import PDFDocument from "pdfkit";
import {
  attachFooterIdentity,
  buildLayoutContext,
  createDocument,
  drawBulletList,
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

export function renderClaimsPdf(
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

  drawCoverHeaderBand(doc, "Claims Review Evidence Pack", identity);

  ensurePageSpace(ctx, 80);
  drawExportMetadataGrid(ctx);
  drawIdentityChain(ctx);

  ensurePageSpace(ctx, 100);
  drawSectionHeading(ctx, "Incident summary");
  drawParagraph(
    ctx,
    "Short institutional summary of the referenced event package. Review posture is bounded; this export does not establish fault or coverage outcome."
  );
  drawParagraph(ctx, event.summary);

  ensurePageSpace(ctx, 90);
  drawSectionHeading(ctx, "Review posture & next step");
  drawBulletList(ctx, ["Use this pack for dispute-grade reference against canonical IDs.", "Escalate open unknowns through the verifier inspection surface, not by merging layers."], "");

  const recordedItems = (event.recordedEvidence ?? []).map((item: RecordedEvidenceItem) => {
    const parts = [item.displayLabel, item.contentType, item.sourceId, item.capturedAt].filter(Boolean);
    return parts.join(" · ");
  });
  const derivedItems = (event.derivedEvidence ?? []).map((item: DerivedEvidenceItem) => {
    const parts = [item.displayLabel, item.humanSummary, item.derivationNote].filter(Boolean);
    return parts.join(" — ");
  });
  drawEvidenceStackedPanels(
    ctx,
    recordedItems,
    derivedItems,
    "No recorded evidence items were included in this export snapshot.",
    "No derived evidence items were included in this export snapshot."
  );

  drawUnknownDisputedBlock(ctx, event.unknownDisputed);
  drawVerificationTraceTable(ctx, event.verificationTrace ?? []);

  ensurePageSpace(ctx, 120);
  drawSectionHeading(ctx, "Asset & context");
  drawKeyValueRows(ctx, [
    { label: "Vehicle VIN", value: event.vehicleVin },
    { label: "Fleet", value: event.fleetId },
    { label: "Policy / Claim", value: event.policyOrClaimRef },
    { label: "Location", value: event.incidentLocation },
    { label: "Event class", value: event.eventClass },
    { label: "Scenario key", value: event.scenarioKey },
    { label: "Occurred at", value: new Date(event.occurredAt).toISOString() },
  ]);

  ensurePageSpace(ctx, 100);
  drawSectionHeading(ctx, "Redactions & exclusions");
  if (identity.redactionApplied) {
    const basis =
      identity.redactionBasis ??
      "One or more evidence items were excluded from this export in accordance with tenant visibility policy.";
    drawParagraph(
      ctx,
      `${basis} Redacted or excluded items: ${
        typeof identity.redactedItemCount === "number" ? identity.redactedItemCount : "at least one"
      }.`
    );
  } else {
    drawParagraph(ctx, "No policy-driven redactions or exclusions were applied in this claims export.");
  }

  drawIssuanceNotice(
    ctx,
    "This Claims Evidence Pack is a role-appropriate presentation of a canonical event. The canonical system record remains authoritative. It is not a liability decision, coverage determination, or substitute for independent claims investigation."
  );

  return doc;
}
