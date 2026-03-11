import type { CanonicalEvent } from "contracts";
import PDFDocument from "pdfkit";
import {
  attachFooterIdentity,
  buildLayoutContext,
  createDocument,
  drawBulletList,
  drawDocumentTitle,
  drawKeyValueRows,
  drawNoticeSection,
  drawParagraph,
  drawSectionHeading,
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
): PDFDocument {
  const doc = createDocument();
  const ctx = buildLayoutContext(doc, identity, event as any);

  const footerText = `Event ID: ${identity.eventId} | Export ID: ${identity.exportId} | Receipt ID: ${
    identity.receiptId ?? "N/A"
  }`;
  attachFooterIdentity(doc, footerText);

  // 1. Title
  drawDocumentTitle(ctx, "Legal Review Evidence Pack");

  // 2. Identification
  ensurePageSpace(ctx, 140);
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
    { label: "Schema Version", value: identity.schemaVersion },
    { label: "Tenant ID", value: identity.tenantId ?? "N/A" },
  ]);

  // 3. Event Summary
  ensurePageSpace(ctx, 120);
  drawSectionHeading(ctx, "Event Summary");
  drawParagraph(ctx, event.summary);

  // 4. Canonical Chain
  ensurePageSpace(ctx, 160);
  drawSectionHeading(ctx, "Canonical Chain");
  drawParagraph(
    ctx,
    "This export is a presentation artifact linked to a canonical event record. The canonical event, bundle, manifest, export, and receipt together form the authoritative evidence chain."
  );
  drawKeyValueRows(ctx, [
    { label: "Canonical Event ID", value: identity.eventId },
    { label: "Canonical Bundle ID", value: identity.bundleId },
    { label: "Canonical Manifest ID", value: identity.manifestId },
    { label: "Canonical Export ID", value: identity.exportId },
    { label: "Canonical Receipt ID", value: identity.receiptId },
  ]);

  // 5. Verification & Transcript Reference
  ensurePageSpace(ctx, 160);
  drawSectionHeading(ctx, "Verification & Transcript Reference");
  drawKeyValueRows(ctx, [
    { label: "Verification State", value: identity.verificationState },
  ]);
  drawParagraph(
    ctx,
    "Verification is a bounded assessment of the referenced event package. This export profile includes a verification state summary only and does not include a full verification transcript artifact."
  );

  // 6. Recorded Evidence
  ensurePageSpace(ctx, 160);
  drawSectionHeading(ctx, "Recorded Evidence");
  const recordedItems = (event.recordedEvidence ?? []).map((item) => {
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

  // 7. Derived Analysis
  ensurePageSpace(ctx, 160);
  drawSectionHeading(ctx, "Derived Analysis");
  const derivedItems = (event.derivedEvidence ?? []).map((item) => {
    const parts = [
      `${item.displayLabel} (derived)`,
      item.humanSummary,
      item.derivationNote,
    ].filter(Boolean);
    return parts.join(" — ");
  });
  drawBulletList(
    ctx,
    derivedItems,
    "No derived analysis items were included in this export."
  );

  // 8. Data Provenance & Manifest
  ensurePageSpace(ctx, 160);
  drawSectionHeading(ctx, "Data Provenance & Manifest");
  drawKeyValueRows(ctx, [
    { label: "Manifest ID", value: identity.manifestId },
    { label: "Source Tenant ID", value: identity.tenantId ?? "N/A" },
  ]);
  drawParagraph(
    ctx,
    "Data in this export is derived from the canonical manifest and associated event materials. The manifest defines the authoritative inventory of evidence objects."
  );

  // 9. Redactions & Exclusions
  ensurePageSpace(ctx, 120);
  drawSectionHeading(ctx, "Redactions & Exclusions");
  if (identity.redactionApplied) {
    const basis =
      identity.redactionBasis ??
      "One or more evidence items were excluded or redacted in accordance with tenant visibility and legal-review policy.";
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
      "No policy-driven redactions or exclusions were applied in this legal review export."
    );
  }

  // 10. Legal Notice
  ensurePageSpace(ctx, 140);
  drawNoticeSection(
    ctx,
    "This legal review evidence pack does not constitute a judicial finding, liability determination, or a substitute for independent legal review. The canonical system record remains authoritative. Recorded and derived materials remain distinct, and interpretations in this document are bounded by the available evidence at the time of export."
  );

  return doc;
}

