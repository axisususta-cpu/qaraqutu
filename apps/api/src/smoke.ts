import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { renderClaimsPdf } from "./modules/documents/claims-pack";
import type { DocumentIdentity } from "./modules/documents/types";
import type { CanonicalEvent, VerificationState } from "./contracts";
import { hasBearerAccess } from "./security";

const prisma = new PrismaClient();

function firstQueryValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function parseDateQuery(value: unknown): Date | null {
  const raw = firstQueryValue(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseLimitQuery(value: unknown, fallback: number): number {
  const raw = firstQueryValue(value);
  const parsed = raw ? Number.parseInt(raw, 10) : fallback;
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, 100);
}

export function registerSmokeRoutes(app: FastifyInstance) {
  app.get("/v1/system/smoke", async (request, reply) => {
    if ((process.env.NODE_ENV ?? "development") === "production" && !hasBearerAccess(request)) {
      return reply.code(403).send({ error: "ACCESS_REQUIRED" });
    }

    const now = new Date().toISOString();

    const events = await prisma.event.findMany();
    const event = events[0] ?? null;

    const dataset = {
      event_count: events.length,
      event_ids: events.map((e) => e.eventId),
    };

    if (!event) {
      return {
        timestamp: now,
        availability: { ok: true },
        dataset,
        verifier: { ok: false, reason: "NO_EVENTS" },
        claims_export: { ok: false, reason: "NO_EVENTS" },
        legal_export: { ok: false, reason: "NO_EVENTS" },
        receipt_linkage: { ok: false, reason: "NO_EVENTS" },
      };
    }

    const bundle = await prisma.bundle.findFirst({ where: { eventId: event.id } });
    const manifest = bundle
      ? await prisma.manifest.findFirst({ where: { bundleId: bundle.id } })
      : null;

    if (!bundle || !manifest) {
      return {
        timestamp: now,
        availability: { ok: true },
        dataset,
        verifier: { ok: false, reason: "BUNDLE_OR_MANIFEST_MISSING" },
        claims_export: { ok: false, reason: "BUNDLE_OR_MANIFEST_MISSING" },
        legal_export: { ok: false, reason: "BUNDLE_OR_MANIFEST_MISSING" },
        receipt_linkage: { ok: false, reason: "BUNDLE_OR_MANIFEST_MISSING" },
      };
    }

    const verifier = {
      ok: true,
      sample_event_id: event.eventId,
      verification_state: event.verificationState,
    };

    // Claims export (JSON)
    const claimsExportId = `QEX-${randomUUID()}`;
    const claimsReceiptId = `QRC-${randomUUID()}`;
    const createdClaimsExport = await prisma.export.create({
      data: {
        exportId: claimsExportId,
        eventId: event.id,
        bundleId: bundle.bundleId,
        manifestId: manifest.manifestId,
        profile: "claims",
        format: "json",
        purpose: "claims_submission_smoke",
        verificationState: event.verificationState,
      },
    });
    const createdClaimsReceipt = await prisma.receipt.create({
      data: {
        receiptId: claimsReceiptId,
        eventId: event.id,
        exportId: createdClaimsExport.id,
        actionType: "export_claims_json_smoke",
      },
    });

    // Legal export (PDF)
    const legalExportId = `QEX-${randomUUID()}`;
    const legalReceiptId = `QRC-${randomUUID()}`;
    const createdLegalExport = await prisma.export.create({
      data: {
        exportId: legalExportId,
        eventId: event.id,
        bundleId: bundle.bundleId,
        manifestId: manifest.manifestId,
        profile: "legal",
        format: "pdf",
        purpose: "legal_review_smoke",
        verificationState: event.verificationState,
      },
    });
    const createdLegalReceipt = await prisma.receipt.create({
      data: {
        receiptId: legalReceiptId,
        eventId: event.id,
        exportId: createdLegalExport.id,
        actionType: "export_legal_pdf_smoke",
      },
    });

    const claims_export = {
      ok: true,
      event_id: event.eventId,
      export_id: createdClaimsExport.exportId,
      receipt_id: createdClaimsReceipt.receiptId,
    };

    const legal_export = {
      ok: true,
      event_id: event.eventId,
      export_id: createdLegalExport.exportId,
      receipt_id: createdLegalReceipt.receiptId,
    };

    const receipts = await prisma.receipt.findMany({
      where: { exportId: { in: [createdClaimsExport.id, createdLegalExport.id] } },
    });

    const receipt_linkage = {
      ok:
        receipts.length >= 2 &&
        receipts.some((r) => r.receiptId === claimsReceiptId) &&
        receipts.some((r) => r.receiptId === legalReceiptId),
    };

    return {
      timestamp: now,
      availability: { ok: true },
      dataset,
      verifier,
      claims_export,
      legal_export,
      receipt_linkage,
    };
  });

  app.get("/v1/system/smoke-history", async (request, reply) => {
    if ((process.env.NODE_ENV ?? "development") === "production" && !hasBearerAccess(request)) {
      return reply.code(403).send({ error: "ACCESS_REQUIRED" });
    }

    const query = request.query as Record<string, unknown>;
    const startedFrom = parseDateQuery(query.started_from);
    const startedTo = parseDateQuery(query.started_to);
    const overallResult = firstQueryValue(query.overall_result)?.trim().toUpperCase() || undefined;
    const checkName = firstQueryValue(query.check_name)?.trim() || undefined;
    const checkCategory = firstQueryValue(query.check_category)?.trim() || undefined;
    const checkResult = firstQueryValue(query.check_result)?.trim().toUpperCase() || undefined;
    const limit = parseLimitQuery(query.limit, 20);

    if (query.started_from != null && !startedFrom) {
      return reply.code(400).send({ error: "INVALID_STARTED_FROM" });
    }
    if (query.started_to != null && !startedTo) {
      return reply.code(400).send({ error: "INVALID_STARTED_TO" });
    }

    const runScopeWhere: Record<string, unknown> = {};
    if (startedFrom || startedTo) {
      runScopeWhere.startedAt = {
        ...(startedFrom ? { gte: startedFrom } : {}),
        ...(startedTo ? { lte: startedTo } : {}),
      };
    }
    if (overallResult) {
      runScopeWhere.overallResult = overallResult;
    }

    const checkWhere: Record<string, unknown> = {};
    if (checkName) checkWhere.checkName = checkName;
    if (checkCategory) checkWhere.category = checkCategory;
    if (checkResult) checkWhere.result = checkResult;
    const hasCheckFilter = Object.keys(checkWhere).length > 0;

    const runsWhere = {
      ...runScopeWhere,
      ...(hasCheckFilter ? { checks: { some: checkWhere } } : {}),
    };

    const [totalRuns, totalChecks, runs] = await Promise.all([
      prisma.smokeRun.count({ where: runsWhere as any }),
      prisma.smokeCheck.count({
        where: {
          ...(checkWhere as any),
          run: runScopeWhere as any,
        },
      }),
      prisma.smokeRun.findMany({
        where: runsWhere as any,
        orderBy: { startedAt: "desc" },
        take: limit,
        include: {
          checks: {
            where: hasCheckFilter ? (checkWhere as any) : undefined,
            orderBy: { createdAt: "asc" },
          },
        },
      }),
    ]);

    return {
      filters: {
        started_from: startedFrom?.toISOString() ?? null,
        started_to: startedTo?.toISOString() ?? null,
        overall_result: overallResult ?? null,
        check_name: checkName ?? null,
        check_category: checkCategory ?? null,
        check_result: checkResult ?? null,
        limit,
      },
      total_runs: totalRuns,
      total_checks: totalChecks,
      items: runs.map((run) => ({
        smoke_run_id: run.smokeRunId,
        overall_result: run.overallResult,
        started_at: run.startedAt.toISOString(),
        finished_at: run.finishedAt?.toISOString() ?? null,
        environment: run.environment,
        dataset_version: run.datasetVersion,
        build_version: run.buildVersion,
        schema_version: run.schemaVersion,
        checks: run.checks.map((check) => ({
          smoke_run_id: run.smokeRunId,
          check_name: check.checkName,
          check_category: check.category,
          check_result: check.result,
          check_detail: check.detail,
          recorded_at: check.createdAt.toISOString(),
        })),
      })),
    };
  });

  // Internal long-form PDF fixture for multi-page validation
  app.get("/v1/system/pdf-fixture/claims-long", async (request, reply) => {
    if ((process.env.NODE_ENV ?? "development") === "production" && !hasBearerAccess(request)) {
      return reply.code(403).send({ error: "ACCESS_REQUIRED" });
    }

    const now = new Date().toISOString();
    const identity: DocumentIdentity = {
      eventId: "QEV-SMOKE-LONG",
      bundleId: "QBN-SMOKE-LONG",
      manifestId: "QMF-SMOKE-LONG",
      exportId: `QEX-${randomUUID()}`,
      receiptId: null,
      verificationState: "UNVERIFIED" as VerificationState,
      generatedAt: now,
      exportProfile: "claims",
      exportPurpose: "internal_pdf_fixture",
      schemaVersion: "v1",
      tenantId: "TENANT-SMOKE",
      transcriptId: "QTR-FIXTURE-SYNTH",
      verificationRunId: "QVR-FIXTURE-SYNTH",
    };

    const recordedEvidence = Array.from({ length: 80 }).map((_, idx) => ({
      recordId: `REC-LONG-${idx}`,
      sourceType: "telemetry_trace",
      sourceId: `SRC-LONG-${idx}`,
      capturedAt: now,
      contentType: "application/octet-stream",
      hash: `hash-long-${idx}`,
      sizeOrLength: 4096,
      recordedFlag: true as const,
      derivationNote: null,
      originConfidence: 0.9,
      displayLabel: `Long recorded evidence item #${idx + 1} — ${"Lorem ipsum dolor sit amet. ".repeat(8)}`,
      machineLabel: "long_recorded",
    }));

    const derivedEvidence = Array.from({ length: 60 }).map((_, idx) => ({
      derivedId: `DER-LONG-${idx}`,
      derivedType: "long_form_analysis",
      derivedFrom: [`REC-LONG-${idx}`],
      generatedAt: now,
      method: "long_analysis_v1",
      confidence: 0.8,
      recordedFlag: false as const,
      derivationNote: "Synthetic long-form derived analysis for PDF paging.",
      displayLabel: `Long derived evidence item #${idx + 1}`,
      machineLabel: "long_derived",
      humanSummary:
        "This is a synthetic long-form derived evidence summary used to exercise multi-page layout behavior. " +
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(6),
      sourceDependencies: [`REC-LONG-${idx}`],
    }));

    const event: CanonicalEvent = {
      eventId: identity.eventId,
      bundleId: identity.bundleId,
      manifestId: identity.manifestId,
      vehicleVin: "VIN-LONG-FIXTURE",
      fleetId: "FLEET-LONG-FIXTURE",
      policyOrClaimRef: "POLICY-LONG-FIXTURE",
      incidentLocation: "Internal Fixture Location",
      eventClass: "fixture_long",
      scenarioKey: "Internal Long-Form PDF Fixture",
      occurredAt: now,
      summary:
        "Internal long-form evidence fixture used to validate multi-page PDF layout behavior for claims packs. " +
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore. ".repeat(20),
      verificationState: identity.verificationState,
      recordedEvidence,
      derivedEvidence,
      verificationTrace: [
        { step: 0, check: "Manifest hash binding", result: "PASS", note: "Fixture step — not a live verifier outcome." },
        { step: 1, check: "Evidence inventory parity", result: "OPEN", note: "Synthetic open item for layout." },
      ],
      unknownDisputed: [
        "Fixture: scope of derived summaries vs. raw telemetry not adjudicated in this export.",
      ],
    };

    const pdf = renderClaimsPdf(identity, event);
    let pageCount = 1;
    pdf.on("pageAdded", () => pageCount++);
    const chunks: Buffer[] = [];
    pdf.on("data", (c: Buffer) => chunks.push(c));
    await new Promise<void>((resolve, reject) => {
      pdf.on("end", () => {
        reply
          .type("application/pdf")
          .header(
            "Content-Disposition",
            `attachment; filename="${identity.exportId}.pdf"`
          )
          .header("x-qaraqutu-pages", String(pageCount))
          .send(Buffer.concat(chunks));
        resolve();
      });
      pdf.on("error", reject);
      pdf.end();
    });
    return;
  });
}

