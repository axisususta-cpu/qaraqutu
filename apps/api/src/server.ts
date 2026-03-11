import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { CanonicalEvent, VerificationState } from "contracts";
import PDFDocument from "pdfkit";
import { renderClaimsPdf } from "./modules/documents/claims-pack";
import { renderLegalPdf } from "./modules/documents/legal-pack";
import type { DocumentIdentity } from "./modules/documents/types";
import { registerVerifierRoutes } from "./verifier";
import { registerSmokeRoutes } from "./smoke";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const ENVIRONMENT = process.env.NODE_ENV ?? "development";
const DATASET_VERSION = process.env.DEMO_DATASET_VERSION ?? "demo-v1";
const SCHEMA_VERSION = "v1";
const BUILD_VERSION = process.env.BUILD_VERSION ?? "0.1.0";

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: true,
});

fastify.get("/health", async () => {
  return { status: "ok" };
});

fastify.get("/v1/system/diagnostics", async () => {
  const [
    recentExports,
    recentVerifications,
    latestVerificationRunRecord,
    latestSmokeRunRecord,
    recentSmokeRunsRecords,
  ] = await Promise.all([
    prisma.export.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { event: true, receipt: true },
    }),
    prisma.verificationRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { transcript: true, event: true },
    }),
    prisma.verificationRun.findFirst({
      orderBy: { createdAt: "desc" },
      include: { transcript: { include: { steps: { orderBy: { stepIndex: "asc" } } } }, event: true },
    }),
    prisma.smokeRun.findFirst({
      orderBy: { startedAt: "desc" },
      include: { checks: true },
    }),
    prisma.smokeRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
  ]);

  const recent_exports = recentExports.map((e) => ({
    export_id: e.exportId,
    profile: e.profile,
    format: e.format,
    event_id: (e as any).event?.eventId ?? null,
    receipt_id: (e as any).receipt?.receiptId ?? null,
    created_at: e.createdAt.toISOString(),
    redaction_applied: (e as any).redactionApplied ?? null,
    redacted_item_count: (e as any).redactedItemCount ?? null,
  }));

  const recent_verifications = recentVerifications.map((r) => ({
    verification_run_id: r.verificationRunId,
    event_id: (r as any).event?.eventId ?? null,
    verification_state: r.verificationState,
    transcript_id: (r as any).transcript?.transcriptId ?? null,
    created_at: r.createdAt.toISOString(),
  }));

  const latest_verification_run = latestVerificationRunRecord
    ? {
        verification_run_id: latestVerificationRunRecord.verificationRunId,
        event_id: (latestVerificationRunRecord as any).event?.eventId ?? null,
        verification_state: latestVerificationRunRecord.verificationState,
        transcript_id: (latestVerificationRunRecord as any).transcript?.transcriptId ?? null,
        created_at: latestVerificationRunRecord.createdAt.toISOString(),
        transcript_summary: (latestVerificationRunRecord as any).transcript?.steps?.map((s: any) => ({
          step: s.stepIndex,
          check: s.check,
          result: s.result,
          note: s.note,
        })) ?? [],
      }
    : null;

  const latest_smoke_run = latestSmokeRunRecord
    ? {
        smoke_run_id: latestSmokeRunRecord.smokeRunId,
        overall_result: latestSmokeRunRecord.overallResult,
        started_at: latestSmokeRunRecord.startedAt.toISOString(),
        finished_at: latestSmokeRunRecord.finishedAt
          ? latestSmokeRunRecord.finishedAt.toISOString()
          : null,
        environment: latestSmokeRunRecord.environment,
        dataset_version: latestSmokeRunRecord.datasetVersion,
        build_version: latestSmokeRunRecord.buildVersion,
        schema_version: latestSmokeRunRecord.schemaVersion,
        checks: latestSmokeRunRecord.checks.map((c) => ({
          check_name: c.checkName,
          category: c.category,
          result: c.result,
        })),
      }
    : null;

  const recent_smoke_runs = recentSmokeRunsRecords.map((r) => ({
    smoke_run_id: r.smokeRunId,
    overall_result: r.overallResult,
    started_at: r.startedAt.toISOString(),
    finished_at: r.finishedAt ? r.finishedAt.toISOString() : null,
    environment: r.environment,
    dataset_version: r.datasetVersion,
    build_version: r.buildVersion,
    schema_version: r.schemaVersion,
  }));

  const tenantPolicy = await prisma.tenantPolicy.findFirst({
    include: { tenant: true },
  });

  return {
    environment: ENVIRONMENT,
    dataset_version: DATASET_VERSION,
    schema_version: SCHEMA_VERSION,
    build_version: BUILD_VERSION,
    supported_export_profiles: ["claims", "legal"],
    recent_exports,
    recent_verifications,
    latest_verification_run,
    latest_smoke_run,
    recent_smoke_runs,
    tenant_policy: tenantPolicy
      ? {
          tenant_id: tenantPolicy.tenant.slug,
          enabled_export_profiles: tenantPolicy.enabledExportProfiles,
          enabled_visibility_classes: tenantPolicy.enabledVisibilityClasses,
          redaction_enabled: tenantPolicy.redactionEnabled,
        }
      : null,
  };
});

registerVerifierRoutes(fastify);
registerSmokeRoutes(fastify);

function mapEventToCanonical(e: any): CanonicalEvent {
  return {
    eventId: e.eventId,
    bundleId: e.bundleId,
    manifestId: e.manifestId,
    vehicleVin: e.vehicleVin ?? undefined,
    fleetId: e.fleetId ?? undefined,
    policyOrClaimRef: e.policyOrClaimRef ?? undefined,
    incidentLocation: e.incidentLocation ?? undefined,
    eventClass: e.eventClass,
    scenarioKey: e.scenarioKey,
    occurredAt: e.occurredAt.toISOString(),
    summary: e.summary,
    verificationState: e.verificationState as VerificationState,
    recordedEvidence: (e.recordedEvidence ?? []) as CanonicalEvent["recordedEvidence"],
    derivedEvidence: (e.derivedEvidence ?? []) as CanonicalEvent["derivedEvidence"],
  };
}

fastify.get("/v1/events", async () => {
  const events = await prisma.event.findMany({
    orderBy: { occurredAt: "desc" },
  });
  const items = events.map((e) => mapEventToCanonical(e));
  return { items, total: items.length };
});

fastify.get<{
  Params: { eventId: string };
}>("/v1/events/:eventId", async (request, reply) => {
  const { eventId } = request.params;
  const event = await prisma.event.findUnique({
    where: { eventId },
  });
  if (!event) {
    return reply.code(404).send({ error: "EVENT_NOT_FOUND" });
  }
  return { data: mapEventToCanonical(event) };
});

fastify.post<{
  Params: { eventId: string };
  Body: { profile: string; format: "json" | "pdf"; purpose: string };
}>("/v1/events/:eventId/exports", async (request, reply) => {
  const { eventId } = request.params;
  const { profile, format, purpose } = request.body;

  const event = await prisma.event.findUnique({ where: { eventId } });
  if (!event) {
    return reply.code(404).send({ error: "EVENT_NOT_FOUND" });
  }

  const tenantPolicy = await prisma.tenantPolicy.findUnique({
    where: { tenantId: event.tenantId },
  });

  const supportedProfiles = ["claims", "legal"];
  const supportedFormats = ["json", "pdf"];
  if (!profile || !supportedProfiles.includes(profile)) {
    return reply.code(400).send({
      error: "UNSUPPORTED_EXPORT_REQUEST",
      export_profile: profile ?? null,
      format: format ?? null,
    });
  }
  if (!format || !supportedFormats.includes(format)) {
    return reply.code(400).send({
      error: "UNSUPPORTED_EXPORT_REQUEST",
      export_profile: profile,
      format: format ?? null,
    });
  }

  if (
    tenantPolicy &&
    tenantPolicy.enabledExportProfiles.length > 0 &&
    !tenantPolicy.enabledExportProfiles.includes(profile)
  ) {
    return reply.code(403).send({
      error: "POLICY_EXPORT_PROFILE_NOT_ALLOWED",
      export_profile: profile,
    });
  }

  // Compute visibility-filtered evidence and policy snapshot once at creation time.
  const profileVisibilityDefaults: Record<string, string[]> = {
    claims: ["claims_review"],
    legal: ["claims_review", "legal_review", "technical_review"],
  };

  const recordedEvidenceSource =
    (event as any).recordedEvidence ?? [];
  const derivedEvidenceSource =
    (event as any).derivedEvidence ?? [];

  const tenantAllowed =
    tenantPolicy?.enabledVisibilityClasses &&
    tenantPolicy.enabledVisibilityClasses.length > 0
      ? new Set(tenantPolicy.enabledVisibilityClasses)
      : null;
  const profileAllowed = new Set(
    profileVisibilityDefaults[profile] ?? []
  );

  function decideVisibility(item: any, fallback: string): string {
    return typeof item?.visibility_class === "string"
      ? item.visibility_class
      : fallback;
  }

  const filteredRecorded: any[] = [];
  const filteredDerived: any[] = [];
  let redactedCount = 0;

  for (const item of Array.isArray(recordedEvidenceSource)
    ? recordedEvidenceSource
    : []) {
    const vis = decideVisibility(item, "claims_review");
    const allowedByProfile = profileAllowed.has(vis);
    const allowedByTenant = tenantAllowed ? tenantAllowed.has(vis) : true;
    if (allowedByProfile && allowedByTenant) {
      filteredRecorded.push(item);
    } else {
      redactedCount++;
    }
  }

  for (const item of Array.isArray(derivedEvidenceSource)
    ? derivedEvidenceSource
    : []) {
    const vis = decideVisibility(item, "legal_review");
    const allowedByProfile = profileAllowed.has(vis);
    const allowedByTenant = tenantAllowed ? tenantAllowed.has(vis) : true;
    if (allowedByProfile && allowedByTenant) {
      filteredDerived.push(item);
    } else {
      redactedCount++;
    }
  }

  const redactionAppliedCreation = redactedCount > 0;
  const redactionBasisCreation = redactionAppliedCreation
    ? "visibility_policy"
    : null;

  const policySnapshot =
    tenantPolicy
      ? {
          enabledExportProfiles: tenantPolicy.enabledExportProfiles,
          enabledVisibilityClasses: tenantPolicy.enabledVisibilityClasses,
          redactionEnabled: tenantPolicy.redactionEnabled,
        }
      : null;

  // If redaction is disabled but exclusions would be required, reject instead of creating a redacted artifact.
  if (tenantPolicy && !tenantPolicy.redactionEnabled && redactedCount > 0) {
    return reply.code(403).send({
      error: "POLICY_VISIBILITY_VIOLATION",
      export_profile: profile,
    });
  }

  const bundle = await prisma.bundle.findFirst({ where: { eventId: event.id } });
  const manifest = bundle
    ? await prisma.manifest.findFirst({ where: { bundleId: bundle.id } })
    : null;

  if (!bundle || !manifest) {
    return reply.code(500).send({ error: "BUNDLE_OR_MANIFEST_MISSING" });
  }

  const exportId = `QEX-${randomUUID()}`;
  const receiptId = `QRC-${randomUUID()}`;

  const createdExport = await prisma.export.create({
    data: {
      exportId,
      eventId: event.id,
      bundleId: bundle.id,
      manifestId: manifest.id,
      profile,
      format,
      purpose,
      verificationState: event.verificationState,
      recordedEvidenceSnapshot: filteredRecorded,
      derivedEvidenceSnapshot: filteredDerived,
      redactionApplied: redactionAppliedCreation,
      redactedItemCount: redactedCount || null,
      redactionBasis: redactionBasisCreation,
      policySnapshot,
    },
  });

  const createdReceipt = await prisma.receipt.create({
    data: {
      receiptId,
      eventId: event.id,
      exportId: createdExport.id,
      actionType: `export_${profile}_${format}`,
    },
  });

  return reply.code(201).send({
    export_id: exportId,
    receipt_id: receiptId,
    event_id: event.eventId,
    bundle_id: bundle.bundleId,
    manifest_id: manifest.manifestId,
    verification_state: event.verificationState,
    export_profile: profile,
    export_purpose: purpose,
    schema_version: "v1",
    download_url: `/v1/exports/${exportId}/download`,
  });
});

fastify.get<{
  Params: { exportId: string };
}>("/v1/exports/:exportId/download", async (request, reply) => {
  const { exportId } = request.params;
  const exp = await prisma.export.findUnique({
    where: { exportId },
    include: { event: true, receipt: true },
  } as any);

  if (!exp) {
    return reply.code(404).send({ error: "EXPORT_NOT_FOUND" });
  }

  const event = exp.event as any;
  const bundle = await prisma.bundle.findFirst({ where: { eventId: event.id } });
  const manifest = bundle
    ? await prisma.manifest.findFirst({ where: { bundleId: bundle.id } })
    : null;

  if (!bundle || !manifest) {
    return reply.code(500).send({ error: "BUNDLE_OR_MANIFEST_MISSING" });
  }

  const receipt = await prisma.receipt.findFirst({
    where: { exportId: exp.id },
  });

  if (exp.profile === "claims" && exp.format === "json") {
    const recorded =
      (exp as any).recordedEvidenceSnapshot ??
      (event.recordedEvidence ?? []);
    const derived =
      (exp as any).derivedEvidenceSnapshot ??
      (event.derivedEvidence ?? []);
    const redactionApplied =
      (exp as any).redactionApplied ?? false;
    const redactedItemCount =
      (exp as any).redactedItemCount ?? 0;
    const redactionBasis =
      (exp as any).redactionBasis ?? null;

    const payload = {
      event_id: event.eventId,
      bundle_id: bundle.bundleId,
      manifest_id: manifest.manifestId,
      export_id: exp.exportId,
      receipt_id: receipt?.receiptId ?? null,
      verification_state: exp.verificationState as VerificationState,
      export_profile: exp.profile,
      export_purpose: exp.purpose,
      generated_at: exp.createdAt.toISOString(),
      tenant_id: event.tenantId,
      schema_version: "v1",
      recorded_evidence: recorded,
      derived_evidence: derived,
      redaction_applied: redactionApplied,
      redacted_item_count: redactedItemCount,
      redaction_basis: redactionBasis,
    };

    return reply
      .type("application/json")
      .header(
        "Content-Disposition",
        `attachment; filename="${exp.exportId}.json"`
      )
      .send(payload);
  }

  if (exp.format === "pdf") {
    const recorded =
      (exp as any).recordedEvidenceSnapshot ??
      (event.recordedEvidence ?? []);
    const derived =
      (exp as any).derivedEvidenceSnapshot ??
      (event.derivedEvidence ?? []);
    const redactionApplied =
      (exp as any).redactionApplied ?? false;
    const redactedItemCount =
      (exp as any).redactedItemCount ?? 0;
    const redactionBasis =
      (exp as any).redactionBasis ?? null;
    const identity: DocumentIdentity = {
      eventId: event.eventId,
      bundleId: bundle.bundleId,
      manifestId: manifest.manifestId,
      exportId: exp.exportId,
      receiptId: receipt?.receiptId ?? null,
      verificationState: exp.verificationState as VerificationState,
      generatedAt: exp.createdAt.toISOString(),
      exportProfile: exp.profile,
      exportPurpose: exp.purpose,
      schemaVersion: "v1",
      tenantId: event.tenantId,
      redactionApplied,
      redactedItemCount,
      redactionBasis,
    };

    const canonicalEvent: CanonicalEvent = {
      eventId: event.eventId,
      bundleId: bundle.bundleId,
      manifestId: manifest.manifestId,
      vehicleVin: event.vehicleVin ?? undefined,
      fleetId: event.fleetId ?? undefined,
      policyOrClaimRef: event.policyOrClaimRef ?? undefined,
      incidentLocation: event.incidentLocation ?? undefined,
      eventClass: event.eventClass,
      scenarioKey: event.scenarioKey,
      occurredAt: event.occurredAt.toISOString(),
      summary: event.summary,
      verificationState: exp.verificationState as VerificationState,
      recordedEvidence: JSON.parse(JSON.stringify(recorded)) as CanonicalEvent["recordedEvidence"],
      derivedEvidence: JSON.parse(JSON.stringify(derived)) as CanonicalEvent["derivedEvidence"],
    };

    let pdf: PDFDocument;
    if (exp.profile === "claims") {
      pdf = renderClaimsPdf(identity, canonicalEvent as any);
    } else if (exp.profile === "legal") {
      pdf = renderLegalPdf(identity, canonicalEvent as any);
    } else {
      return reply
        .code(400)
        .send({
          error: "UNSUPPORTED_EXPORT",
          export_profile: exp.profile,
          format: exp.format,
        });
    }

    const chunks: Buffer[] = [];
    pdf.on("data", (c: Buffer) => chunks.push(c));
    await new Promise<void>((resolve, reject) => {
      pdf.on("end", () => {
        reply
          .type("application/pdf")
          .header(
            "Content-Disposition",
            `attachment; filename="${exp.exportId}.pdf"`
          )
          .send(Buffer.concat(chunks));
        resolve();
      });
      pdf.on("error", reject);
      pdf.end();
    });
    return;
  }

  // Legal JSON export
  if (exp.profile === "legal" && exp.format === "json") {
    const recorded =
      (exp as any).recordedEvidenceSnapshot ??
      (event.recordedEvidence ?? []);
    const derived =
      (exp as any).derivedEvidenceSnapshot ??
      (event.derivedEvidence ?? []);
    const redactionApplied =
      (exp as any).redactionApplied ?? false;
    const redactedItemCount =
      (exp as any).redactedItemCount ?? 0;
    const redactionBasis =
      (exp as any).redactionBasis ?? null;

    const payload = {
      event_id: event.eventId,
      bundle_id: bundle.bundleId,
      manifest_id: manifest.manifestId,
      export_id: exp.exportId,
      receipt_id: receipt?.receiptId ?? null,
      verification_state: exp.verificationState as VerificationState,
      export_profile: exp.profile,
      export_purpose: exp.purpose,
      generated_at: exp.createdAt.toISOString(),
      tenant_id: event.tenantId,
      schema_version: "v1",
      recorded_evidence: recorded,
      derived_evidence: derived,
      manifest_reference: {
        manifest_id: manifest.manifestId,
      },
      redaction_applied: redactionApplied,
      redacted_item_count: redactedItemCount,
      redaction_basis: redactionBasis,
      legal_notice:
        "This legal review evidence export is a presentation artifact linked to a canonical event record and does not constitute a judicial finding or liability determination.",
    };

    return reply
      .type("application/json")
      .header(
        "Content-Disposition",
        `attachment; filename="${exp.exportId}.json"`
      )
      .send(payload);
  }

  return reply
    .code(400)
    .send({
      error: "UNSUPPORTED_EXPORT",
      export_profile: exp.profile,
      format: exp.format,
    });
});

const port = Number(process.env.PORT) || 4000;

fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`API listening at ${address}`);
});

