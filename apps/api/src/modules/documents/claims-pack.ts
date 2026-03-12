import type { CanonicalEvent, RecordedEvidenceItem, DerivedEvidenceItem } from "../../contracts";
import PDFDocument from "pdfkit";
import {
  buildLayoutContext,
  createDocument,
  drawBulletList,
  drawDocumentTitle,
  drawKeyValueRows,
  drawParagraph,
  drawSectionHeading,
  drawNoticeSection,
  attachFooterIdentity,
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

  const footerText = `Event ID: ${identity.eventId} | Export ID: ${identity.exportId} | Receipt ID: ${
    identity.receiptId ?? "N/A"
  }`;
  attachFooterIdentity(doc, footerText);

  // 1. Title
  drawDocumentTitle(ctx, "Claims Review Evidence Pack");

  // 2. Identification
  ensurePageSpace(ctx, 120);
  drawSectionHeading(ctx, "Identification");
  drawKeyValueRows(ctx, [
    { label: "Event ID", value: identity.eventId },
    { label: "Bundle ID", value: identity.bundleId },
    { label: "Manifest ID", value: identity.manifestId },
    { label: "Export ID", value: identity.exportId },
    { label: "Receipt ID", value: identity.receiptId },
    { label: "Verification State", value: identity.verificationState },
    { label: "Generated At", value: identity.generatedAt },
    { label: "Export Purpose", value: identity.exportPurpose },
  ]);

  // 3. Event Summary
  ensurePageSpace(ctx, 120);
  drawSectionHeading(ctx, "Event Summary");
  drawParagraph(ctx, event.summary);

  // 4. Asset & Context
  ensurePageSpace(ctx, 160);
  drawSectionHeading(ctx, "Asset & Context");
  drawKeyValueRows(ctx, [
    { label: "Vehicle VIN", value: event.vehicleVin },
    { label: "Fleet", value: event.fleetId },
    { label: "Policy / Claim", value: event.policyOrClaimRef },
    { label: "Location", value: event.incidentLocation },
    { label: "Event Class", value: event.eventClass },
    { label: "Scenario Key", value: event.scenarioKey },
    {
      label: "Occurred At",
      value: new Date(event.occurredAt).toISOString(),
    },
  ]);

  // 5. Recorded Evidence
  ensurePageSpace(ctx, 160);
  drawSectionHeading(ctx, "Recorded Evidence");
  const recordedItems = (event.recordedEvidence ?? []).map((item: RecordedEvidenceItem) => {
    const parts = [
      item.displayLabel,
      item.contentType,
      item.sourceId,
      item.capturedAt,
    ].filter(Boolean);
    return parts.join(" • ");
  });
  drawBulletList(
    ctx,
    recordedItems,
    "No recorded evidence items were included in this export."
  );

  // 6. Derived Evidence
  ensurePageSpace(ctx, 160);
  drawSectionHeading(ctx, "Derived Evidence");
  const derivedItems = (event.derivedEvidence ?? []).map((item: DerivedEvidenceItem) => {
    const parts = [
      item.displayLabel,
      item.humanSummary,
      item.derivationNote,
    ].filter(Boolean);
    return parts.join(" — ");
  });
  drawBulletList(
    ctx,
    derivedItems,
    "No derived evidence items were included in this export."
  );

  // 7. Manifest & Receipt
  ensurePageSpace(ctx, 120);
  drawSectionHeading(ctx, "Manifest & Receipt");
  drawKeyValueRows(ctx, [
    { label: "Manifest ID", value: identity.manifestId },
    { label: "Receipt ID", value: identity.receiptId },
    { label: "Export Profile", value: identity.exportProfile },
    {
      label: "Verification State Snapshot",
      value: identity.verificationState,
    },
  ]);

  // 8. Redactions & Exclusions
  ensurePageSpace(ctx, 120);
  drawSectionHeading(ctx, "Redactions & Exclusions");
  if (identity.redactionApplied) {
    const basis =
      identity.redactionBasis ??
      "One or more evidence items were excluded from this export in accordance with tenant visibility policy.";
    drawParagraph(
      ctx,
      `${basis} Redacted or excluded items: ${
        typeof identity.redactedItemCount === "number"
          ? identity.redactedItemCount
          : "at least one"
      }.`
    );
  } else {
    drawParagraph(
      ctx,
      "No policy-driven redactions or exclusions were applied in this claims export."
    );
  }

  // 9. Notice
  ensurePageSpace(ctx, 120);
  drawNoticeSection(
    ctx,
    "This claims evidence pack is a role-appropriate presentation of a canonical event. The canonical system record remains authoritative. Recorded and derived materials remain distinct, and this document does not constitute a liability or legal decision."
  );

  return doc;
}

