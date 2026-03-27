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

function redactionSummaryLines(identity: DocumentIdentity): string[] {
  const entries = identity.redactionRecord?.entries ?? [];
  const grouped = new Map<string, number>();
  for (const entry of entries) {
    const key = `${entry.layer}:${entry.field}:${entry.visibility_class}`;
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }
  return Array.from(grouped.entries()).map(([key, count]) => {
    const [layer, field, visibilityClass] = key.split(":");
    return `${count} ${layer}.${field} removal(s) under ${visibilityClass}`;
  });
}

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

  drawCoverHeaderBand(doc, identity.outputTitle ?? "Claims Review Evidence Pack", identity);

  drawExportAndIdentityGrid(ctx);

  drawSectionHeading(ctx, "Incident summary");
  drawParagraph(
    ctx,
    "Bounded snapshot of the referenced event; does not establish fault, coverage, or final outcome."
  );
  drawParagraph(ctx, event.summary);

  drawSectionHeading(ctx, "Review posture & next step");
  drawParagraph(
    ctx,
    "·  Use for dispute-grade reference against canonical IDs.\n·  Escalate unknowns via verifier inspection; do not merge evidence layers."
  );

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
    const lines = redactionSummaryLines(identity);
    if (lines.length > 0) {
      drawParagraph(ctx, lines.map((line) => `·  ${line}`).join("\n"));
    }
  } else {
    drawParagraph(ctx, "No policy-driven redactions or exclusions were applied in this claims export.");
  }

  ensurePageSpace(ctx, 200);
  drawIssuanceNotice(
    ctx,
    "Presentation of a canonical event; the system record is authoritative. Not a liability decision, coverage determination, or substitute for investigation."
  );

  return doc;
}
