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
/** Must match PDFDocument `margin` — bottom leaves room for doctrine band (drawn in margin strip). */
export const MARGINS = { top: 48, right: 48, bottom: 56, left: 48 };
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

export const SPACING = { section: 10, bulletIndent: 12, rowPad: 4 };

const COVER_BAND_H = 92;
const THIN_HEADER_H = 28;
const KV_ROW_H = 17;

/** Single-line cell text to avoid PDFKit line_wrapper page storms on long IDs / ISO timestamps. */
function truncateToOneLine(doc: InstanceType<typeof PDFDocument>, text: string, maxW: number): string {
  const raw = text.length ? text : "—";
  if (doc.widthOfString(raw) <= maxW) return raw;
  let lo = 0;
  let hi = raw.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const candidate = `${raw.slice(0, mid)}…`;
    if (doc.widthOfString(candidate) <= maxW) lo = mid;
    else hi = mid - 1;
  }
  return `${raw.slice(0, Math.max(0, lo))}…`;
}

/** Word-wrap for footer copy without PDFKit `width` flow (which paginates when y > maxY). */
function wrapLinesToWidth(doc: InstanceType<typeof PDFDocument>, text: string, maxW: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (doc.widthOfString(next) <= maxW) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length >= maxLines) return lines.slice(0, maxLines);
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

function drawCenteredNoWrapLine(
  doc: InstanceType<typeof PDFDocument>,
  line: string,
  y: number,
  fill: string,
  fontSize: number
) {
  doc.fillColor(fill).font("Courier").fontSize(fontSize);
  const w = doc.widthOfString(line);
  const x = MARGINS.left + Math.max(0, (CONTENT_WIDTH - w) / 2);
  doc.text(line, x, y, { lineBreak: false, lineGap: 0 });
}

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
  const bandH = 44;
  const y0 = ph - bandH;
  const fs = 6.5;
  doc.save();
  doc.rect(0, y0, pw, bandH).fill(PDF_COLORS.footerBand);
  doc.font("Courier").fontSize(fs);

  let yy = y0 + 5;
  const identity = (doc as any).__qaraqutuFooterIdentity as string | undefined;
  if (identity) {
    const idLine = truncateToOneLine(doc, identity, CONTENT_WIDTH);
    drawCenteredNoWrapLine(doc, idLine, yy, PDF_COLORS.footerText, fs);
    yy += 10;
  }

  const doctrine =
    "Witness protocol · Recorded ≠ Derived · Derived ≠ Verdict · Trace ≠ truth · Issuance ≠ blame · Not a court ruling.";
  const doctrineLines = wrapLinesToWidth(doc, doctrine, CONTENT_WIDTH, 2);
  for (let i = 0; i < doctrineLines.length; i++) {
    drawCenteredNoWrapLine(doc, doctrineLines[i], yy + i * 9, PDF_COLORS.footerMuted, fs);
  }
  yy += Math.max(doctrineLines.length, 1) * 9 + 2;

  const dateLine = truncateToOneLine(
    doc,
    `QARAQUTU · protocol-grade export · ${new Date().toISOString().slice(0, 10)}`,
    CONTENT_WIDTH
  );
  drawCenteredNoWrapLine(doc, dateLine, yy, PDF_COLORS.footerText, fs);
  doc.restore();
}

function drawThinPageHeader(doc: InstanceType<typeof PDFDocument>) {
  const pw = doc.page.width;
  doc.save();
  doc.rect(0, 0, pw, THIN_HEADER_H).fill(PDF_COLORS.headerBand);
  doc.fillColor(PDF_COLORS.headerMuted).font("Courier").fontSize(7).text("QARAQUTU", MARGINS.left, 10);
  doc.restore();
  doc.y = THIN_HEADER_H + 8;
}

export function createDocument(): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({
    margin: MARGINS as any,
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

  doc.fillColor(PDF_COLORS.headerText).font("Helvetica-Bold").fontSize(18).text("QARAQUTU", MARGINS.left, 24);

  doc
    .fillColor(PDF_COLORS.accent)
    .font("Courier-Bold")
    .fontSize(8.5)
    .text(documentFamilyTitle.toUpperCase(), MARGINS.left, 46);

  const profileLine = `ISSUANCE PROFILE · ${identity.exportProfile.toUpperCase()} · ${identity.exportPurpose}`;
  doc.fillColor(PDF_COLORS.headerMuted).font("Courier").fontSize(7.5).text(profileLine, MARGINS.left, 60, {
    width: CONTENT_WIDTH,
  });

  const metaY = 74;
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
  doc.x = MARGINS.left;
  doc.y = COVER_BAND_H + 10;
}

export function drawSectionHeading(ctx: LayoutContext, label: string) {
  const { doc } = ctx;
  ensurePageSpace(ctx, 30);
  const y0 = doc.y;
  doc.save();
  doc.fillColor(PDF_COLORS.accent).rect(MARGINS.left, y0, 3, 11).fill();
  doc
    .fillColor(PDF_COLORS.text)
    .font("Courier-Bold")
    .fontSize(FONT_SIZES.sectionMono)
    .text(label.toUpperCase(), MARGINS.left + 10, y0 - 1, { width: CONTENT_WIDTH - 12 });
  doc.restore();
  doc.x = MARGINS.left;
  doc.y = y0 + 12;
  doc
    .moveTo(MARGINS.left, doc.y)
    .lineTo(MARGINS.left + CONTENT_WIDTH, doc.y)
    .strokeColor(PDF_COLORS.borderStrong)
    .lineWidth(0.75)
    .stroke();
  doc.x = MARGINS.left;
  doc.moveDown(0.35);
}

export function drawDocumentTitle(ctx: LayoutContext, title: string) {
  drawSectionHeading(ctx, title);
}

const PAGE_BREAK_SLACK = 3;

export function ensurePageSpace(ctx: LayoutContext, minHeight: number) {
  const maxY = ctx.doc.page.maxY();
  const y = ctx.doc.y ?? 0;
  const available = maxY - y;
  if (available + PAGE_BREAK_SLACK < minHeight) {
    ctx.doc.addPage();
    ctx.doc.fillColor(PDF_COLORS.text);
  }
}

/**
 * Key/value rows with **measured** row height. Fixed shallow rows caused PDFKit to wrap long
 * values (export IDs, ISO timestamps) past the painted rect; line_wrapper then fired
 * `continueOnNewPage` for each wrapped line — exploding page count.
 */
export function drawKeyValueTable(
  ctx: LayoutContext,
  rows: { label: string; value: string | null | undefined }[]
) {
  const { doc } = ctx;
  const labelW = 130;
  const x0 = MARGINS.left;
  const x1 = x0 + labelW;
  const valueW = CONTENT_WIDTH - labelW - SPACING.rowPad * 2;
  rows.forEach((row) => {
    const valueStr = String(row.value ?? "—");
    const prevX = doc.x;
    const prevY = doc.y;
    doc.font("Courier").fontSize(FONT_SIZES.label);
    const labelLine = truncateToOneLine(doc, row.label, labelW - SPACING.rowPad * 2);
    doc.font("Helvetica").fontSize(FONT_SIZES.value);
    const valueLine = truncateToOneLine(doc, valueStr, valueW);
    doc.x = prevX;
    doc.y = prevY;

    const rowH = KV_ROW_H;
    ensurePageSpace(ctx, rowH + 2);
    const y = doc.y;
    doc.rect(x0, y, CONTENT_WIDTH, rowH).stroke(PDF_COLORS.border);
    doc
      .fillColor(PDF_COLORS.textMuted)
      .font("Courier")
      .fontSize(FONT_SIZES.label)
      .text(labelLine, x0 + SPACING.rowPad, y + 3, { lineGap: 0 });
    doc
      .fillColor(PDF_COLORS.text)
      .font("Helvetica")
      .fontSize(FONT_SIZES.value)
      .text(valueLine, x1 + SPACING.rowPad, y + 3, { lineGap: 0 });
    doc.x = MARGINS.left;
    doc.y = y + rowH;
  });
  doc.x = MARGINS.left;
  doc.moveDown(0.3);
}

export function drawKeyValueRows(
  ctx: LayoutContext,
  rows: { label: string; value: string | null | undefined }[]
) {
  drawKeyValueTable(ctx, rows);
}

export function drawExportMetadataGrid(ctx: LayoutContext) {
  drawSectionHeading(ctx, "Export metadata");
  drawKeyValueTable(ctx, [
    { label: "EXPORT ID", value: ctx.identity.exportId },
    { label: "RECEIPT ID", value: ctx.identity.receiptId ?? "—" },
    { label: "GENERATED", value: ctx.identity.generatedAt },
    { label: "SCHEMA", value: ctx.identity.schemaVersion },
    { label: "TENANT", value: ctx.identity.tenantId ?? "—" },
  ]);
}

export function drawIdentityChain(ctx: LayoutContext) {
  drawSectionHeading(ctx, "Identity chain");
  drawKeyValueTable(ctx, [
    { label: "EVENT", value: ctx.identity.eventId },
    { label: "BUNDLE", value: ctx.identity.bundleId },
    { label: "MANIFEST", value: ctx.identity.manifestId },
    { label: "TRANSCRIPT", value: ctx.identity.transcriptId ?? "—" },
    { label: "VERIFICATION RUN", value: ctx.identity.verificationRunId ?? "—" },
  ]);
}

/** Single heading + table: saves vertical space vs separate export + identity sections. */
export function drawExportAndIdentityGrid(ctx: LayoutContext) {
  drawSectionHeading(ctx, "Export & identity");
  drawKeyValueTable(ctx, [
    { label: "EXPORT ID", value: ctx.identity.exportId },
    { label: "RECEIPT ID", value: ctx.identity.receiptId ?? "—" },
    { label: "GENERATED", value: ctx.identity.generatedAt },
    { label: "SCHEMA", value: ctx.identity.schemaVersion },
    { label: "TENANT", value: ctx.identity.tenantId ?? "—" },
    { label: "EVENT", value: ctx.identity.eventId },
    { label: "BUNDLE", value: ctx.identity.bundleId },
    { label: "MANIFEST", value: ctx.identity.manifestId },
    { label: "TRANSCRIPT", value: ctx.identity.transcriptId ?? "—" },
    { label: "VERIFICATION RUN", value: ctx.identity.verificationRunId ?? "—" },
  ]);
}

export function drawParagraph(ctx: LayoutContext, text: string) {
  const { doc } = ctx;
  doc.x = MARGINS.left;
  doc.fillColor(PDF_COLORS.text).font("Helvetica").fontSize(FONT_SIZES.body).text(text, {
    width: CONTENT_WIDTH,
    lineGap: 2,
  });
  doc.x = MARGINS.left;
  doc.moveDown(0.28);
}

export function drawBulletList(ctx: LayoutContext, items: string[], emptyFallback: string) {
  const { doc } = ctx;
  doc.x = MARGINS.left;
  doc.font("Helvetica").fontSize(FONT_SIZES.body);
  if (items.length === 0) {
    doc.fillColor(PDF_COLORS.textMuted).text(emptyFallback, { width: CONTENT_WIDTH, lineGap: 2 });
  } else {
    items.forEach((item) => {
      doc.x = MARGINS.left;
      doc.fillColor(PDF_COLORS.text).text(`·  ${item}`, {
        width: CONTENT_WIDTH,
        lineGap: 2,
      });
    });
  }
  doc.x = MARGINS.left;
  doc.moveDown(0.28);
}

export function drawEvidenceStackedPanels(
  ctx: LayoutContext,
  recordedLines: string[],
  derivedLines: string[],
  emptyRecorded: string,
  emptyDerived: string
) {
  drawSectionHeading(ctx, "Evidence layers");
  ctx.doc.x = MARGINS.left;
  ctx.doc.font("Courier").fontSize(FONT_SIZES.small);
  const introLine = truncateToOneLine(
    ctx.doc,
    "Recorded and derived layers are not merged in this export.",
    CONTENT_WIDTH
  );
  const introY = ctx.doc.y;
  ctx.doc.fillColor(PDF_COLORS.textMuted).text(introLine, MARGINS.left, introY);
  ctx.doc.y = introY + ctx.doc.currentLineHeight(true) + 4;
  ctx.doc.x = MARGINS.left;

  const drawPanel = (title: string, accent: string, lines: string[], empty: string) => {
    const { doc } = ctx;
    const rawLines = lines.length > 0 ? lines.map((l) => `·  ${l}`) : [empty];
    doc.save();
    doc.font("Helvetica").fontSize(FONT_SIZES.body);
    const lh = doc.currentLineHeight(true) + 2;
    const innerH = rawLines.length * lh + 8;
    const totalH = 20 + Math.max(innerH, 36);
    doc.restore();
    ensurePageSpace(ctx, totalH + 8);
    const y0 = doc.y;
    doc.save();
    doc.rect(MARGINS.left, y0, CONTENT_WIDTH, totalH).stroke(accent).lineWidth(1.1);
    doc.rect(MARGINS.left, y0, CONTENT_WIDTH, 20).fill(PDF_COLORS.tableHeaderBg);
    doc.fillColor(PDF_COLORS.text).font("Courier-Bold").fontSize(7.5).text(title, MARGINS.left + 6, y0 + 6);
    doc.fillColor(PDF_COLORS.text).font("Helvetica").fontSize(FONT_SIZES.body);
    let yy = y0 + 22;
    rawLines.forEach((ln) => {
      const one = truncateToOneLine(doc, ln, CONTENT_WIDTH - 12);
      doc.text(one, MARGINS.left + 6, yy);
      yy += lh;
    });
    doc.restore();
    doc.y = y0 + totalH + 6;
    doc.x = MARGINS.left;
  };

  drawPanel("RECORDED", PDF_COLORS.accent, recordedLines, emptyRecorded);
  drawPanel("DERIVED", PDF_COLORS.borderStrong, derivedLines, emptyDerived);
}

export function drawUnknownDisputedBlock(ctx: LayoutContext, items: string[] | undefined) {
  drawSectionHeading(ctx, "Unknown / disputed");
  const { doc } = ctx;
  doc.x = MARGINS.left;
  doc.font("Helvetica").fontSize(FONT_SIZES.small);
  const uIntro = truncateToOneLine(
    doc,
    "Open items and scope limits when present; documents uncertainty, not a determination.",
    CONTENT_WIDTH
  );
  const uy = doc.y;
  doc.fillColor(PDF_COLORS.textMuted).text(uIntro, MARGINS.left, uy);
  doc.y = uy + doc.currentLineHeight(true) + 4;
  doc.x = MARGINS.left;
  if (items && items.length > 0) {
    items.forEach((item) => {
      ensurePageSpace(ctx, 34);
      const y = doc.y;
      doc.rect(MARGINS.left, y, CONTENT_WIDTH, 32).stroke(PDF_COLORS.borderStrong).lineWidth(0.9);
      doc.fillColor(PDF_COLORS.unknown).font("Courier-Bold").fontSize(7.5).text("OPEN", MARGINS.left + 8, y + 10);
      doc.font("Helvetica").fontSize(FONT_SIZES.body);
      const itemLine = truncateToOneLine(doc, item, CONTENT_WIDTH - 56);
      doc.fillColor(PDF_COLORS.text).text(itemLine, MARGINS.left + 48, y + 8);
      doc.y = y + 36;
      doc.x = MARGINS.left;
    });
  } else {
    doc.font("Helvetica").fontSize(FONT_SIZES.body);
    const none = truncateToOneLine(
      doc,
      "No unknown or disputed items were attached to this export snapshot.",
      CONTENT_WIDTH
    );
    const ny = doc.y;
    doc.fillColor(PDF_COLORS.textSoft).text(none, MARGINS.left, ny);
    doc.y = ny + doc.currentLineHeight(true) + 4;
    doc.x = MARGINS.left;
  }
}

export function drawVerificationTraceTable(
  ctx: LayoutContext,
  steps: { step: number; check: string; result: string; note: string }[]
) {
  drawSectionHeading(ctx, "Verification trace");
  if (steps.length === 0) {
    const { doc } = ctx;
    doc.x = MARGINS.left;
    doc.font("Helvetica").fontSize(FONT_SIZES.body);
    const none = truncateToOneLine(doc, "No verification transcript steps were linked to this export.", CONTENT_WIDTH);
    const zy = doc.y;
    doc.fillColor(PDF_COLORS.textSoft).text(none, MARGINS.left, zy);
    doc.y = zy + doc.currentLineHeight(true) + 4;
    doc.x = MARGINS.left;
    return;
  }

  const traceRowH = 40;
  steps.forEach((s) => {
    const { doc } = ctx;
    ensurePageSpace(ctx, traceRowH + 4);
    const y = doc.y;
    doc.rect(MARGINS.left, y, CONTENT_WIDTH, traceRowH).stroke(PDF_COLORS.border).lineWidth(0.85);
    doc.fillColor(PDF_COLORS.textMuted).font("Courier").fontSize(7.5).text(`STEP ${s.step}`, MARGINS.left + 8, y + 4);
    doc.font("Helvetica-Bold").fontSize(FONT_SIZES.value);
    const checkOne = truncateToOneLine(doc, s.check, CONTENT_WIDTH - 100);
    doc.fillColor(PDF_COLORS.text).text(checkOne, MARGINS.left + 8, y + 13);
    const rc = stateColors(s.result);
    doc.roundedRect(MARGINS.left + CONTENT_WIDTH - 88, y + 4, 80, 16, 2).fillAndStroke(rc.bg, rc.border);
    doc
      .fillColor(rc.fg)
      .font("Courier-Bold")
      .fontSize(7.5)
      .text(s.result, MARGINS.left + CONTENT_WIDTH - 88, y + 7, { width: 80, align: "center" });
    doc.font("Helvetica").fontSize(FONT_SIZES.small);
    const noteOne = truncateToOneLine(doc, s.note, CONTENT_WIDTH - 16);
    doc.fillColor(PDF_COLORS.textMuted).text(noteOne, MARGINS.left + 8, y + 26);
    doc.y = y + traceRowH;
    doc.x = MARGINS.left;
  });
  ctx.doc.moveDown(0.2);
}

export function drawIssuanceNotice(ctx: LayoutContext, profileLead: string, extraBullets: string[] = []) {
  drawSectionHeading(ctx, "Issuance & bounded notice");
  const bullets = [
    "This pack is a bounded institutional artifact — not marketing material.",
    "Recorded ≠ derived; derived ≠ verdict; trace ≠ final truth; issuance ≠ blame.",
    "Does not replace court, regulator, or independent expert judgement.",
    ...extraBullets,
  ];
  const lines = [profileLead, "", ...bullets.map((b) => `·  ${b}`)];
  const { doc } = ctx;
  doc.fillColor(PDF_COLORS.text).font("Helvetica").fontSize(FONT_SIZES.body);
  for (const ln of lines) {
    if (ln.trim() === "") {
      doc.y += 3;
      continue;
    }
    doc.x = MARGINS.left;
    const one = truncateToOneLine(doc, ln, CONTENT_WIDTH);
    const yy = doc.y;
    doc.text(one, MARGINS.left, yy);
    doc.y = yy + doc.currentLineHeight(true) + 2;
  }
  doc.x = MARGINS.left;
}

/** Stored for doctrine band (drawn on `end`); avoids drawing inside PDFKit maxY and triggering spurious `continueOnNewPage`. */
export function attachFooterIdentity(doc: InstanceType<typeof PDFDocument>, footerText: string) {
  (doc as any).__qaraqutuFooterIdentity = footerText;
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
