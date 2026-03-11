import PDFDocument from "pdfkit";
import type { DocumentIdentity, LayoutContext } from "./types";
import type { CanonicalEvent } from "contracts";

export const PAGE_SIZE: PDFKit.PDFPageSize = "A4";
export const MARGINS = { top: 50, right: 50, bottom: 50, left: 50 };

export const FONT_SIZES = {
  title: 16,
  sectionTitle: 12,
  label: 9,
  value: 10,
  body: 10,
  footer: 8,
};

export const SPACING = {
  section: 16,
  block: 8,
  bulletIndent: 16,
};

export function createDocument(): PDFDocument {
  return new PDFDocument({ margin: MARGINS.top, size: PAGE_SIZE, bufferPages: true });
}

export function drawDocumentTitle(ctx: LayoutContext, title: string) {
  ctx.doc.fontSize(FONT_SIZES.title).text(title, { align: "left" });
  ctx.doc.moveDown();
}

export function drawSectionHeading(ctx: LayoutContext, label: string) {
  ctx.doc
    .fontSize(FONT_SIZES.sectionTitle)
    .text(label.toUpperCase(), { underline: false });
  // subtle divider
  const y = ctx.doc.y + 2;
  ctx.doc
    .moveTo(MARGINS.left, y)
    .lineTo(ctx.doc.page.width - MARGINS.right, y)
    .strokeColor("#000000")
    .lineWidth(0.5)
    .stroke();
  ctx.doc.moveDown();
}

export function ensurePageSpace(ctx: LayoutContext, minHeight: number) {
  const remaining =
    ctx.doc.page.height - MARGINS.bottom - (ctx.doc.y ?? 0);
  if (remaining < minHeight) {
    ctx.doc.addPage();
  }
}

export function drawKeyValueRows(
  ctx: LayoutContext,
  rows: { label: string; value: string | null | undefined }[]
) {
  rows.forEach((row) => {
    ctx.doc
      .fontSize(FONT_SIZES.label)
      .text(`${row.label}:`, { continued: true });
    ctx.doc
      .fontSize(FONT_SIZES.value)
      .text(` ${row.value ?? "N/A"}`);
  });
  ctx.doc.moveDown();
}

export function drawParagraph(ctx: LayoutContext, text: string) {
  ctx.doc.fontSize(FONT_SIZES.body).text(text);
  ctx.doc.moveDown();
}

export function drawBulletList(
  ctx: LayoutContext,
  items: string[],
  emptyFallback: string
) {
  ctx.doc.fontSize(FONT_SIZES.body);
  if (items.length === 0) {
    ctx.doc.text(emptyFallback);
  } else {
    items.forEach((item) => {
      ctx.doc.text(`- ${item}`, { indent: SPACING.bulletIndent });
    });
  }
  ctx.doc.moveDown();
}

export function drawNoticeSection(ctx: LayoutContext, text: string) {
  drawSectionHeading(ctx, "Notice");
  drawParagraph(ctx, text);
}

export function attachFooterIdentity(doc: PDFDocument, footerText: string) {
  const w = doc.page.width - MARGINS.left - MARGINS.right;
  doc
    .fontSize(FONT_SIZES.footer)
    .text(footerText, MARGINS.left, doc.page.height - MARGINS.bottom + 10, {
      width: w,
      align: "center",
      lineBreak: false,
    });
}

export function buildLayoutContext(
  doc: PDFDocument,
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

