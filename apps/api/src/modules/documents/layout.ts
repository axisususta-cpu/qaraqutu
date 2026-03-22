import PDFDocument from "pdfkit";
import type { DocumentIdentity, LayoutContext } from "./types";
import type { CanonicalEvent } from "../../contracts";

/** Aligned with qaraqutu-web institutional palette (print-safe). */
export const PDF_COLORS = {
  headerBand: "#0a0a0a",
  headerText: "#f0eeea",
  headerMuted: "#9a9893",
  accent: "#D4561A",
  tableHeaderBg: "#eceae6",
  border: "#c9cfd6",
  borderStrong: "#8b95a5",
  text: "#1a1a18",
  textSoft: "#3d3d38",
  textMuted: "#5c5c56",
  pass: "#059669",
  fail: "#DC2626",
  unknown: "#D97706",
  unverified: "#6b7280",
  footerBand: "#161615",
  footerMuted: "#8a8884",
  footerText: "#c8c6c1",
} as const;

export const PAGE_SIZE = "A4" as const;
export const MARGINS = { top: 52, right: 48, bottom: 72, left: 48 };
export const CONTENT_WIDTH = 595 - MARGINS.left - MARGINS.right;

export const FONT_SIZES = {
  coverBrand: 20,
  coverMeta: 8,
  sectionMono: 8.5,
  body: 10.5,
  label: 8,
  value: 10.5,
  small: 8,
  footer: 7,
  badge: 7.5,
} as const;

export const SPACING = { section: 14, bulletIndent: 14, rowPad: 5 };

const COVER_BAND_H = 108;
const THIN_HEADER_H = 34;

function stateColors(state: string): { bg: string; border: string; fg: string } {
  const s = state.toUpperCase();
  if (s === "PASS") return { bg: "#ecfdf5", border: PDF_COLORS.pass, fg: PDF_COLORS.pass };
  if (s === "FAIL") return { bg: "#fef2f2", border: PDF_COLORS.fail, fg: PDF_COLORS.fail };
  if (s === "UNKNOWN") return { bg: "#fffbeb", border: PDF_COLORS.unknown, fg: PDF_COLORS.unknown };
  return { bg: "#f3f4f6", border: PDF_COLORS.unverified, fg: PDF_COLORS.unverified };
}

function patchDocumentForFooters(doc: InstanceType<typeof PDFDocument>) {
  const originalEnd = doc.end.bind(doc);
  (doc as any).end = function endPatched(this: InstanceType<typeof PDFDocument>) {
    try {
      const range = this.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        this.switchToPage(i);
        drawDoctrineFooterBand(this);
      }
    } catch {
      /* no buffered pages */
    }
    originalEnd();
  };
}

function drawDoctrineFooterBand(doc: InstanceType<typeof PDFDocument>) {
  const pw = doc.page.width;
  const ph = doc.page.height;
  const bandH = 42;
  const y0 = ph - bandH;
  doc.save();
  doc.rect(0, y0, pw, bandH).fill(PDF_COLORS.footerBand);
  const doctrine =
    "Witness protocol · Recorded ≠ Derived · Derived ≠ Verdict · Trace ≠ truth · Issuance ≠ blame · Not a court ruling.";
  doc
    .fillColor(PDF_COLORS.footerMuted)
    .font("Courier")
    .fontSize(FONT_SIZES.footer)
    .text(doctrine, MARGINS.left, y0 + 8, { width: CONTENT_WIDTH, align: "center", lineGap: 1 });
  doc
    .fillColor(PDF_COLORS.footerText)
    .font("Courier")
    .fontSize(FONT_SIZES.footer - 0.5)
    .text(`QARAQUTU · protocol-grade export · ${new Date().toISOString().slice(0, 10)}`, MARGINS.left, y0 + 24, {
      width: CONTENT_WIDTH,
      align: "center",
    });
  doc.restore();
}

function drawThinPageHeader(doc: InstanceType<typeof PDFDocument>) {
  const pw = doc.page.width;
  doc.save();
  doc.rect(0, 0, pw, THIN_HEADER_H).fill(PDF_COLORS.headerBand);
  doc.fillColor(PDF_COLORS.headerMuted).font("Courier").fontSize(7.5).text("QARAQUTU", MARGINS.left, 12);
  doc.restore();
  doc.y = THIN_HEADER_H + 12;
}

export function createDocument(): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({
    margin: MARGINS.top,
    size: PAGE_SIZE,
    bufferPages: true,
    info: { Producer: "QARAQUTU API", Creator: "QARAQUTU" },
  });
  patchDocumentForFooters(doc);
  doc.on("pageAdded", () => drawThinPageHeader(doc));
  return doc;
}

export function drawCoverHeaderBand(
  doc: InstanceType<typeof PDFDocument>,
  documentFamilyTitle: string,
  identity: DocumentIdentity
) {
  const pw = doc.page.width;
  doc.save();
  doc.rect(0, 0, pw, COVER_BAND_H).fill(PDF_COLORS.headerBand);

  doc.fillColor(PDF_COLORS.headerText).font("Helvetica-Bold").fontSize(FONT_SIZES.coverBrand).text("QARAQUTU", MARGINS.left, 28);

  doc
    .fillColor(PDF_COLORS.accent)
    .font("Courier-Bold")
    .fontSize(9)
    .text(documentFamilyTitle.toUpperCase(), MARGINS.left, 54);

  const profileLine = `ISSUANCE PROFILE · ${identity.exportProfile.toUpperCase()} · ${identity.exportPurpose}`;
  doc.fillColor(PDF_COLORS.headerMuted).font("Courier").fontSize(FONT_SIZES.coverMeta).text(profileLine, MARGINS.left, 70, {
    width: CONTENT_WIDTH,
  });

  const metaY = 86;
  doc.fillColor(PDF_COLORS.headerText).font("Courier").fontSize(8).text(`EVENT  ${identity.eventId}`, MARGINS.left, metaY);

  const badge = stateColors(identity.verificationState);
  const bx = MARGINS.left + CONTENT_WIDTH - 118;
  doc.roundedRect(bx, metaY - 2, 110, 18, 2).fillAndStroke(badge.bg, badge.border);
  doc
    .fillColor(badge.fg)
    .font("Courier-Bold")
    .fontSize(FONT_SIZES.badge)
    .text(identity.verificationState, bx, metaY + 3, { width: 110, align: "center" });

  doc.restore();
  doc.y = COVER_BAND_H + 16;
}

export function drawSectionHeading(ctx: LayoutContext, label: string) {
  const { doc } = ctx;
  ensurePageSpace(ctx, 44);
  const y0 = doc.y;
  doc.save();
  doc.fillColor(PDF_COLORS.accent).rect(MARGINS.left, y0, 3, 11).fill();
  doc
    .fillColor(PDF_COLORS.text)
    .font("Courier-Bold")
    .fontSize(FONT_SIZES.sectionMono)
    .text(label.toUpperCase(), MARGINS.left + 10, y0 - 1, { width: CONTENT_WIDTH - 12 });
  doc.restore();
  doc.y = y0 + 14;
  doc
    .moveTo(MARGINS.left, doc.y)
    .lineTo(MARGINS.left + CONTENT_WIDTH, doc.y)
    .strokeColor(PDF_COLORS.borderStrong)
    .lineWidth(0.75)
    .stroke();
  doc.moveDown(0.55);
}

export function drawDocumentTitle(ctx: LayoutContext, title: string) {
  drawSectionHeading(ctx, title);
}

export function ensurePageSpace(ctx: LayoutContext, minHeight: number) {
  const reservedFooter = 52;
  const remaining = ctx.doc.page.height - MARGINS.bottom - reservedFooter - (ctx.doc.y ?? 0);
  if (remaining < minHeight) {
    ctx.doc.addPage();
    ctx.doc.fillColor(PDF_COLORS.text);
  }
}

export function drawKeyValueTable(
  doc: InstanceType<typeof PDFDocument>,
  rows: { label: string; value: string | null | undefined }[]
) {
  const labelW = 130;
  const x0 = MARGINS.left;
  const x1 = x0 + labelW;
  rows.forEach((row) => {
    const y = doc.y;
    doc.rect(x0, y, CONTENT_WIDTH, 20).stroke(PDF_COLORS.border);
    doc
      .fillColor(PDF_COLORS.textMuted)
      .font("Courier")
      .fontSize(FONT_SIZES.label)
      .text(row.label, x0 + SPACING.rowPad, y + 5, { width: labelW - SPACING.rowPad * 2 });
    doc
      .fillColor(PDF_COLORS.text)
      .font("Helvetica")
      .fontSize(FONT_SIZES.value)
      .text(String(row.value ?? "—"), x1 + SPACING.rowPad, y + 4, {
        width: CONTENT_WIDTH - labelW - SPACING.rowPad * 2,
      });
    doc.y = y + 20;
  });
  doc.moveDown(0.45);
}

export function drawKeyValueRows(
  ctx: LayoutContext,
  rows: { label: string; value: string | null | undefined }[]
) {
  drawKeyValueTable(ctx.doc, rows);
}

export function drawExportMetadataGrid(ctx: LayoutContext) {
  drawSectionHeading(ctx, "Export metadata");
  drawKeyValueTable(ctx.doc, [
    { label: "EXPORT ID", value: ctx.identity.exportId },
    { label: "RECEIPT ID", value: ctx.identity.receiptId ?? "—" },
    { label: "GENERATED", value: ctx.identity.generatedAt },
    { label: "SCHEMA", value: ctx.identity.schemaVersion },
    { label: "TENANT", value: ctx.identity.tenantId ?? "—" },
  ]);
}

export function drawIdentityChain(ctx: LayoutContext) {
  drawSectionHeading(ctx, "Identity chain");
  drawKeyValueTable(ctx.doc, [
    { label: "EVENT", value: ctx.identity.eventId },
    { label: "BUNDLE", value: ctx.identity.bundleId },
    { label: "MANIFEST", value: ctx.identity.manifestId },
    { label: "TRANSCRIPT", value: ctx.identity.transcriptId ?? "—" },
    { label: "VERIFICATION RUN", value: ctx.identity.verificationRunId ?? "—" },
  ]);
}

export function drawParagraph(ctx: LayoutContext, text: string) {
  ctx.doc.fillColor(PDF_COLORS.text).font("Helvetica").fontSize(FONT_SIZES.body).text(text, {
    width: CONTENT_WIDTH,
    lineGap: 2,
  });
  ctx.doc.moveDown(0.4);
}

export function drawBulletList(ctx: LayoutContext, items: string[], emptyFallback: string) {
  ctx.doc.font("Helvetica").fontSize(FONT_SIZES.body);
  if (items.length === 0) {
    ctx.doc.fillColor(PDF_COLORS.textMuted).text(emptyFallback, { width: CONTENT_WIDTH, lineGap: 2 });
  } else {
    items.forEach((item) => {
      ctx.doc.fillColor(PDF_COLORS.text).text(`·  ${item}`, {
        indent: SPACING.bulletIndent,
        width: CONTENT_WIDTH - SPACING.bulletIndent,
        lineGap: 2,
      });
    });
  }
  ctx.doc.moveDown(0.4);
}

export function drawEvidenceStackedPanels(
  ctx: LayoutContext,
  recordedLines: string[],
  derivedLines: string[],
  emptyRecorded: string,
  emptyDerived: string
) {
  ensurePageSpace(ctx, 120);
  drawSectionHeading(ctx, "Evidence layers");
  ctx.doc
    .fillColor(PDF_COLORS.textMuted)
    .font("Courier")
    .fontSize(FONT_SIZES.small)
    .text(
      "Recorded witness material is separate from derived synthesis. Layers are not merged in this export.",
      { width: CONTENT_WIDTH, lineGap: 1 }
    );
  ctx.doc.moveDown(0.35);

  const drawPanel = (title: string, accent: string, lines: string[], empty: string) => {
    const y0 = ctx.doc.y;
    ctx.doc.save();
    ctx.doc.font("Helvetica").fontSize(FONT_SIZES.body);
    const bodyText =
      lines.length > 0 ? lines.map((l) => `·  ${l}`).join("\n") : empty;
    const bodyH = ctx.doc.heightOfString(bodyText, { width: CONTENT_WIDTH - 24, lineGap: 2 });
    const totalH = 22 + Math.max(bodyH + 16, 32);
    ctx.doc.rect(MARGINS.left, y0, CONTENT_WIDTH, totalH).stroke(accent).lineWidth(1.1);
    ctx.doc.rect(MARGINS.left, y0, CONTENT_WIDTH, 22).fill(PDF_COLORS.tableHeaderBg);
    ctx.doc.fillColor(PDF_COLORS.text).font("Courier-Bold").fontSize(8).text(title, MARGINS.left + 8, y0 + 7);
    ctx.doc.fillColor(PDF_COLORS.text).font("Helvetica").fontSize(FONT_SIZES.body);
    ctx.doc.text(bodyText, MARGINS.left + 8, y0 + 26, { width: CONTENT_WIDTH - 16, lineGap: 2 });
    ctx.doc.restore();
    ctx.doc.y = y0 + totalH + 10;
  };

  drawPanel("RECORDED", PDF_COLORS.accent, recordedLines, emptyRecorded);
  drawPanel("DERIVED", PDF_COLORS.borderStrong, derivedLines, emptyDerived);
}

export function drawUnknownDisputedBlock(ctx: LayoutContext, items: string[] | undefined) {
  ensurePageSpace(ctx, 80);
  drawSectionHeading(ctx, "Unknown / disputed");
  ctx.doc
    .fillColor(PDF_COLORS.textMuted)
    .font("Helvetica")
    .fontSize(FONT_SIZES.small)
    .text(
      "Unresolved items and scope limits appear when present in the snapshot. This section documents uncertainty — it is not a determination.",
      { width: CONTENT_WIDTH, lineGap: 2 }
    );
  ctx.doc.moveDown(0.35);
  if (items && items.length > 0) {
    items.forEach((item) => {
      ensurePageSpace(ctx, 36);
      const y = ctx.doc.y;
      ctx.doc.rect(MARGINS.left, y, CONTENT_WIDTH, 32).stroke(PDF_COLORS.borderStrong).lineWidth(0.9);
      ctx.doc.fillColor(PDF_COLORS.unknown).font("Courier-Bold").fontSize(7.5).text("OPEN", MARGINS.left + 8, y + 10);
      ctx.doc
        .fillColor(PDF_COLORS.text)
        .font("Helvetica")
        .fontSize(FONT_SIZES.body)
        .text(item, MARGINS.left + 48, y + 6, { width: CONTENT_WIDTH - 56, lineGap: 2 });
      ctx.doc.y = y + 36;
    });
  } else {
    ctx.doc
      .fillColor(PDF_COLORS.textSoft)
      .font("Helvetica")
      .fontSize(FONT_SIZES.body)
      .text("No unknown or disputed items were attached to this export snapshot.", { width: CONTENT_WIDTH });
    ctx.doc.moveDown(0.35);
  }
}

export function drawVerificationTraceTable(
  ctx: LayoutContext,
  steps: { step: number; check: string; result: string; note: string }[]
) {
  ensurePageSpace(ctx, 100);
  drawSectionHeading(ctx, "Verification trace");
  ctx.doc
    .fillColor(PDF_COLORS.textMuted)
    .font("Helvetica")
    .fontSize(FONT_SIZES.small)
    .text(
      "Each row is a bounded check from a verification run. The trace supports audit; it is not a claim of absolute truth.",
      { width: CONTENT_WIDTH, lineGap: 2 }
    );
  ctx.doc.moveDown(0.4);

  if (steps.length === 0) {
    ctx.doc
      .fillColor(PDF_COLORS.textSoft)
      .font("Helvetica")
      .fontSize(FONT_SIZES.body)
      .text("No verification transcript steps were linked to this export.", { width: CONTENT_WIDTH });
    ctx.doc.moveDown(0.45);
    return;
  }

  steps.forEach((s) => {
    ensurePageSpace(ctx, 52);
    const y = ctx.doc.y;
    ctx.doc.rect(MARGINS.left, y, CONTENT_WIDTH, 46).stroke(PDF_COLORS.border).lineWidth(0.85);
    ctx.doc.fillColor(PDF_COLORS.textMuted).font("Courier").fontSize(7.5).text(`STEP ${s.step}`, MARGINS.left + 8, y + 6);
    ctx.doc.fillColor(PDF_COLORS.text).font("Helvetica-Bold").fontSize(FONT_SIZES.value).text(s.check, MARGINS.left + 8, y + 16, {
      width: CONTENT_WIDTH - 100,
    });
    const rc = stateColors(s.result);
    ctx.doc.roundedRect(MARGINS.left + CONTENT_WIDTH - 88, y + 6, 80, 16, 2).fillAndStroke(rc.bg, rc.border);
    ctx.doc
      .fillColor(rc.fg)
      .font("Courier-Bold")
      .fontSize(7.5)
      .text(s.result, MARGINS.left + CONTENT_WIDTH - 88, y + 9, { width: 80, align: "center" });
    ctx.doc
      .fillColor(PDF_COLORS.textMuted)
      .font("Helvetica")
      .fontSize(FONT_SIZES.small)
      .text(s.note, MARGINS.left + 8, y + 30, { width: CONTENT_WIDTH - 16, lineGap: 1 });
    ctx.doc.y = y + 50;
  });
  ctx.doc.moveDown(0.2);
}

export function drawIssuanceNotice(ctx: LayoutContext, profileLead: string, extraBullets: string[] = []) {
  ensurePageSpace(ctx, 120);
  drawSectionHeading(ctx, "Issuance & bounded notice");
  drawParagraph(ctx, profileLead);
  const bullets = [
    "This pack is a bounded institutional artifact — not marketing material.",
    "Recorded ≠ derived; derived ≠ verdict; trace ≠ final truth; issuance ≠ blame.",
    "Does not replace court, regulator, or independent expert judgement.",
    ...extraBullets,
  ];
  drawBulletList(ctx, bullets, "");
}

export function attachFooterIdentity(doc: InstanceType<typeof PDFDocument>, footerText: string) {
  const ph = doc.page.height;
  const y = ph - MARGINS.bottom + 6;
  doc.save();
  doc
    .fillColor(PDF_COLORS.textMuted)
    .font("Courier")
    .fontSize(FONT_SIZES.footer)
    .text(footerText, MARGINS.left, y, { width: CONTENT_WIDTH, align: "center" });
  doc.restore();
}

export function buildLayoutContext(
  doc: InstanceType<typeof PDFDocument>,
  identity: DocumentIdentity,
  event: CanonicalEvent & {
    vehicleVin?: string;
    fleetId?: string;
    policyOrClaimRef?: string;
    incidentLocation?: string;
    eventClass: string;
    scenarioKey: string;
    occurredAt: string;
  }
): LayoutContext {
  return { doc, identity, event };
}
