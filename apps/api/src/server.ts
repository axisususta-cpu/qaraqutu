import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  ArtifactReverificationRequest,
  ArtifactReverificationResponse,
  CanonicalEvent,
  CreateExportRequest,
  ExportArtifactResponse,
  ExportFormat,
  ExportProfileCode,
  VerificationState,
} from "./contracts";
import PDFDocument from "pdfkit";
import { renderClaimsPdf } from "./modules/documents/claims-pack";
import { renderLegalPdf } from "./modules/documents/legal-pack";
import { buildArtifactPackage, getDocumentFamilies, reverifyArtifactPackage } from "./modules/artifacts/integrity";
import type { DocumentIdentity } from "./modules/documents/types";
import {
  isDoctrineValidationError,
  normalizeDoctrineEvidencePair,
} from "./modules/doctrine/recorded-derived";
import { applyEvidenceRedaction } from "./modules/exports/redaction";
import { registerVerifierRoutes } from "./verifier";
import { registerSmokeRoutes } from "./smoke";
import { randomUUID } from "crypto";
import {
  getClientIp,
  hasBearerAccess,
  resolveTrustedSubjectHeader,
  resolveTrustedRoleHeader,
} from "./security";
import { evaluatePolicy } from "./modules/policy/evaluator";

const prisma = new PrismaClient();

const ENVIRONMENT = process.env.NODE_ENV ?? "development";
const DATASET_VERSION = process.env.DEMO_DATASET_VERSION ?? "demo-v1";
const SCHEMA_VERSION = "v1";
const BUILD_VERSION = process.env.BUILD_VERSION ?? "0.1.0";
const APP_NAME = "qaraqutu-api";
const BUILD_COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown";
const BUILD_TIME = process.env.BUILD_TIME ?? new Date().toISOString();
const API_SUPPORTED_EXPORT_PROFILES: ExportProfileCode[] = ["claims", "legal"];
const API_SUPPORTED_EXPORT_FORMATS: ExportFormat[] = ["json", "pdf"];

type RateKey = string;
const RATE_BUCKETS = new Map<RateKey, { count: number; resetAt: number }>();
const EXPORT_TITLES: Map<string, string> = new Map();
function rateLimit(opts: { windowMs: number; max: number; keyPrefix: string }) {
  return async function onRequest(request: any, reply: any) {
    const now = Date.now();
    const ip = getClientIp(request);
    const key = `${opts.keyPrefix}:${ip}`;
    const existing = RATE_BUCKETS.get(key);
    if (!existing || existing.resetAt <= now) {
      RATE_BUCKETS.set(key, { count: 1, resetAt: now + opts.windowMs });
      return;
    }
    existing.count += 1;
    if (existing.count > opts.max) {
      return reply
        .code(429)
        .header("Retry-After", String(Math.ceil((existing.resetAt - now) / 1000)))
        .send({ error: "RATE_LIMITED" });
    }
  };
}

function attachSecurityHeaders(reply: any) {
  reply.header("X-Frame-Options", "DENY");
  reply.header("X-Content-Type-Options", "nosniff");
  reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
  reply.header(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()"
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeExportPurpose(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type PilotSystem = "vehicle" | "drone" | "robot";
type PilotSeverity = "low" | "medium" | "high";

interface PilotIngestEnvelope {
  event_id: string;
  occurred_at: string;
  system: PilotSystem;
  incident_class: string;
  title: string;
  summary: string;
  bundle_id: string;
  manifest_id: string;
  severity?: PilotSeverity;
}

interface PilotIngestAuditMetadata {
  accepted_at: string;
  source_lane: "connected_device";
  contract_version: string;
  service_id: string;
}

interface PilotIngestReadResponse {
  state: "waiting" | "available";
  event: PilotIngestEnvelope | null;
  audit: PilotIngestAuditMetadata | null;
}

interface UploadedPackageIngestEnvelope {
  package_id: string;
  uploaded_at: string;
  system: PilotSystem;
  incident_class: string;
  title: string;
  summary: string;
  bundle_id: string;
  manifest_id: string;
  severity?: PilotSeverity;
  package_name: string;
  package_sha256: string;
  package_size_bytes: number;
}

interface UploadedPackageIngestAuditMetadata {
  accepted_at: string;
  source_lane: "uploaded_package";
  contract_version: string;
  service_id: string;
}

interface UploadedPackageIngestReadResponse {
  state: "waiting" | "available";
  event: UploadedPackageIngestEnvelope | null;
  audit: UploadedPackageIngestAuditMetadata | null;
}

const PILOT_SERVICE_ID = "connected_device_pilot";
const PILOT_INGEST_CONTRACT_ID = "qaraqutu.connected_device.ingest.v1";
const PILOT_SOURCE_LANE = "connected_device" as const;
const PILOT_SHELL_SINGLETON_KEY = "connected_device_latest";
const UPLOADED_PACKAGE_SERVICE_ID = "uploaded_package_shell";
const UPLOADED_PACKAGE_CONTRACT_ID = "qaraqutu.uploaded_package.ingest.v1";
const UPLOADED_PACKAGE_SOURCE_LANE = "uploaded_package" as const;
const UPLOADED_PACKAGE_SHELL_SINGLETON_KEY = "uploaded_package_latest";
const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/i;

function normalizeSecret(raw: string | undefined): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPilotSystem(value: unknown): value is PilotSystem {
  return value === "vehicle" || value === "drone" || value === "robot";
}

function isPilotSeverity(value: unknown): value is PilotSeverity {
  return value === "low" || value === "medium" || value === "high";
}

function validatePilotEnvelope(payload: unknown): { ok: true; envelope: PilotIngestEnvelope } | { ok: false; reason: string } {
  if (!isObjectLike(payload)) {
    return { ok: false, reason: "payload_object_required" };
  }

  const service = typeof payload.service === "string" ? payload.service.trim() : "";
  const contract = typeof payload.contract === "string" ? payload.contract.trim() : "";

  if (service !== PILOT_SERVICE_ID) {
    return { ok: false, reason: "invalid_service" };
  }

  if (contract !== PILOT_INGEST_CONTRACT_ID) {
    return { ok: false, reason: "invalid_contract" };
  }

  if (!isObjectLike(payload.envelope)) {
    return { ok: false, reason: "envelope_object_required" };
  }

  const envelope = payload.envelope;
  const eventId = typeof envelope.event_id === "string" ? envelope.event_id.trim() : "";
  const occurredAt = typeof envelope.occurred_at === "string" ? envelope.occurred_at.trim() : "";
  const incidentClass = typeof envelope.incident_class === "string" ? envelope.incident_class.trim() : "";
  const title = typeof envelope.title === "string" ? envelope.title.trim() : "";
  const summary = typeof envelope.summary === "string" ? envelope.summary.trim() : "";
  const bundleId = typeof envelope.bundle_id === "string" ? envelope.bundle_id.trim() : "";
  const manifestId = typeof envelope.manifest_id === "string" ? envelope.manifest_id.trim() : "";
  const system = envelope.system;
  const severityRaw = envelope.severity;

  if (!eventId || eventId.length > 64) {
    return { ok: false, reason: "invalid_event_id" };
  }

  if (!occurredAt || Number.isNaN(Date.parse(occurredAt))) {
    return { ok: false, reason: "invalid_occurred_at" };
  }

  if (!isPilotSystem(system)) {
    return { ok: false, reason: "invalid_system" };
  }

  if (!incidentClass || incidentClass.length > 120) {
    return { ok: false, reason: "invalid_incident_class" };
  }

  if (!title || title.length > 140) {
    return { ok: false, reason: "invalid_title" };
  }

  if (!summary || summary.length > 400) {
    return { ok: false, reason: "invalid_summary" };
  }

  if (!bundleId || bundleId.length > 96) {
    return { ok: false, reason: "invalid_bundle_id" };
  }

  if (!manifestId || manifestId.length > 96) {
    return { ok: false, reason: "invalid_manifest_id" };
  }

  if (typeof severityRaw !== "undefined" && !isPilotSeverity(severityRaw)) {
    return { ok: false, reason: "invalid_severity" };
  }

  return {
    ok: true,
    envelope: {
      event_id: eventId,
      occurred_at: occurredAt,
      system,
      incident_class: incidentClass,
      title,
      summary,
      bundle_id: bundleId,
      manifest_id: manifestId,
      severity: isPilotSeverity(severityRaw) ? severityRaw : "medium",
    },
  };
}

function validateUploadedPackageEnvelope(
  payload: unknown
): { ok: true; envelope: UploadedPackageIngestEnvelope } | { ok: false; reason: string } {
  if (!isObjectLike(payload)) {
    return { ok: false, reason: "payload_object_required" };
  }

  const service = typeof payload.service === "string" ? payload.service.trim() : "";
  const contract = typeof payload.contract === "string" ? payload.contract.trim() : "";

  if (service !== UPLOADED_PACKAGE_SERVICE_ID) {
    return { ok: false, reason: "invalid_service" };
  }

  if (contract !== UPLOADED_PACKAGE_CONTRACT_ID) {
    return { ok: false, reason: "invalid_contract" };
  }

  if (!isObjectLike(payload.envelope)) {
    return { ok: false, reason: "envelope_object_required" };
  }

  const envelope = payload.envelope;
  const packageId = typeof envelope.package_id === "string" ? envelope.package_id.trim() : "";
  const uploadedAt = typeof envelope.uploaded_at === "string" ? envelope.uploaded_at.trim() : "";
  const incidentClass = typeof envelope.incident_class === "string" ? envelope.incident_class.trim() : "";
  const title = typeof envelope.title === "string" ? envelope.title.trim() : "";
  const summary = typeof envelope.summary === "string" ? envelope.summary.trim() : "";
  const bundleId = typeof envelope.bundle_id === "string" ? envelope.bundle_id.trim() : "";
  const manifestId = typeof envelope.manifest_id === "string" ? envelope.manifest_id.trim() : "";
  const packageName = typeof envelope.package_name === "string" ? envelope.package_name.trim() : "";
  const packageSha256 = typeof envelope.package_sha256 === "string" ? envelope.package_sha256.trim() : "";
  const packageSizeRaw = envelope.package_size_bytes;
  const packageSize = typeof packageSizeRaw === "number" ? packageSizeRaw : Number.NaN;
  const system = envelope.system;
  const severityRaw = envelope.severity;

  if (!packageId || packageId.length > 80) {
    return { ok: false, reason: "invalid_package_id" };
  }

  if (!uploadedAt || Number.isNaN(Date.parse(uploadedAt))) {
    return { ok: false, reason: "invalid_uploaded_at" };
  }

  if (!isPilotSystem(system)) {
    return { ok: false, reason: "invalid_system" };
  }

  if (!incidentClass || incidentClass.length > 120) {
    return { ok: false, reason: "invalid_incident_class" };
  }

  if (!title || title.length > 140) {
    return { ok: false, reason: "invalid_title" };
  }

  if (!summary || summary.length > 400) {
    return { ok: false, reason: "invalid_summary" };
  }

  if (!bundleId || bundleId.length > 96) {
    return { ok: false, reason: "invalid_bundle_id" };
  }

  if (!manifestId || manifestId.length > 96) {
    return { ok: false, reason: "invalid_manifest_id" };
  }

  if (!packageName || packageName.length > 180) {
    return { ok: false, reason: "invalid_package_name" };
  }

  if (!SHA256_HEX_PATTERN.test(packageSha256)) {
    return { ok: false, reason: "invalid_package_sha256" };
  }

  if (!Number.isInteger(packageSize) || packageSize <= 0 || packageSize > 10_000_000_000) {
    return { ok: false, reason: "invalid_package_size_bytes" };
  }

  if (typeof severityRaw !== "undefined" && !isPilotSeverity(severityRaw)) {
    return { ok: false, reason: "invalid_severity" };
  }

  return {
    ok: true,
    envelope: {
      package_id: packageId,
      uploaded_at: uploadedAt,
      system,
      incident_class: incidentClass,
      title,
      summary,
      bundle_id: bundleId,
      manifest_id: manifestId,
      severity: isPilotSeverity(severityRaw) ? severityRaw : "medium",
      package_name: packageName,
      package_sha256: packageSha256.toLowerCase(),
      package_size_bytes: packageSize,
    },
  };
}

function mapPilotShellRecordToResponse(record: any): PilotIngestReadResponse {
  return {
    state: "available",
    event: {
      event_id: record.eventId,
      occurred_at: record.occurredAt.toISOString(),
      system: record.system,
      incident_class: record.incidentClass,
      title: record.title,
      summary: record.summary,
      bundle_id: record.bundleId,
      manifest_id: record.manifestId,
      severity: record.severity,
    },
    audit: {
      accepted_at: record.acceptedAt.toISOString(),
      source_lane: record.sourceLane,
      contract_version: record.contractVersion,
      service_id: record.serviceId,
    },
  };
}

function mapUploadedPackageShellRecordToResponse(record: any): UploadedPackageIngestReadResponse {
  return {
    state: "available",
    event: {
      package_id: record.packageId,
      uploaded_at: record.uploadedAt.toISOString(),
      system: record.system,
      incident_class: record.incidentClass,
      title: record.title,
      summary: record.summary,
      bundle_id: record.bundleId,
      manifest_id: record.manifestId,
      severity: record.severity,
      package_name: record.packageName,
      package_sha256: record.packageSha256,
      package_size_bytes: Number(record.packageSizeBytes),
    },
    audit: {
      accepted_at: record.acceptedAt.toISOString(),
      source_lane: record.sourceLane,
      contract_version: record.contractVersion,
      service_id: record.serviceId,
    },
  };
}

function hasConnectedDeviceIngestAccess(request: any): boolean {
  const expected = normalizeSecret(process.env.CONNECTED_DEVICE_ACCESS_TOKEN);
  if (!expected) {
    return false;
  }

  const authHeader = normalizeSecret(request.headers.authorization as string | undefined);
  const accessHeader = normalizeSecret(request.headers["x-connected-device-access"] as string | undefined);
  return authHeader === `Bearer ${expected}` && accessHeader === expected;
}

function hasUploadedPackageIngestAccess(request: any): boolean {
  const expected = normalizeSecret(process.env.UPLOADED_PACKAGE_ACCESS_TOKEN);
  if (!expected) {
    return false;
  }

  const authHeader = normalizeSecret(request.headers.authorization as string | undefined);
  const accessHeader = normalizeSecret(request.headers["x-uploaded-package-access"] as string | undefined);
  return authHeader === `Bearer ${expected}` && accessHeader === expected;
}

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: true,
});

fastify.addHook("onSend", async (_request, reply, payload) => {
  attachSecurityHeaders(reply);
  return payload;
});

fastify.setErrorHandler((err, request, reply) => {
  const ip = getClientIp(request as any);
  const route = (request as any).routerPath ?? (request as any).url ?? "unknown";
  fastify.log.error({ err, ip, route }, "unhandled_error");

  if ((reply as any).sent) return;

  const anyErr = err as any;
  if (anyErr?.validation) {
    return reply.code(400).send({ error: "INVALID_REQUEST" });
  }
  if (isDoctrineValidationError(anyErr)) {
    return reply.code(409).send({
      error: "DOCTRINE_RECORDED_DERIVED_SEPARATION_VIOLATION",
      doctrine_source: anyErr.source,
      doctrine_violations: anyErr.violations,
    });
  }
  const statusCode = typeof anyErr?.statusCode === "number" ? anyErr.statusCode : 500;
  if (statusCode >= 400 && statusCode < 500) {
    return reply.code(statusCode).send({ error: "REQUEST_REJECTED" });
  }
  return reply.code(500).send({ error: "INTERNAL_ERROR" });
});

fastify.get("/health", async () => {
  return {
    status: "ok",
    app: APP_NAME,
    build_version: BUILD_VERSION,
    build_commit_sha: BUILD_COMMIT_SHA,
    build_time: BUILD_TIME,
  };
});

fastify.get(
  "/v1/system/diagnostics",
  {
    preHandler: [
      rateLimit({ windowMs: 60_000, max: 30, keyPrefix: "diag" }),
      async (request, reply) => {
        if (!hasBearerAccess(request)) {
          fastify.log.warn(
            { ip: getClientIp(request as any), route: "/v1/system/diagnostics" },
            "access_denied"
          );
          return reply.code(403).send({ error: "ACCESS_REQUIRED" });
        }
      },
    ],
  },
  async () => {
  const [
    recentExports,
    recentVerifications,
    latestVerificationRunRecord,
    latestSmokeRunRecord,
    recentSmokeRunsRecords,
    smokeRunCount,
    smokeCheckCount,
    oldestSmokeRunRecord,
    smokeCheckNames,
    smokeCheckCategories,
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
    prisma.smokeRun.count(),
    prisma.smokeCheck.count(),
    prisma.smokeRun.findFirst({
      orderBy: { startedAt: "asc" },
    }),
    prisma.smokeCheck.findMany({
      distinct: ["checkName"],
      select: { checkName: true },
      orderBy: { checkName: "asc" },
    }),
    prisma.smokeCheck.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
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

  const smoke_history_summary = {
    total_runs: smokeRunCount,
    total_checks: smokeCheckCount,
    oldest_started_at: oldestSmokeRunRecord?.startedAt.toISOString() ?? null,
    latest_started_at: latestSmokeRunRecord?.startedAt.toISOString() ?? null,
    available_check_names: smokeCheckNames.map((entry) => entry.checkName),
    available_check_categories: smokeCheckCategories.map((entry) => entry.category),
    query_route: "/v1/system/smoke-history",
  };

  const tenantPolicy = await prisma.tenantPolicy.findFirst({
    include: { tenant: true },
  });

  return {
    app: APP_NAME,
    environment: ENVIRONMENT,
    dataset_version: DATASET_VERSION,
    schema_version: SCHEMA_VERSION,
    build_version: BUILD_VERSION,
    build_commit_sha: BUILD_COMMIT_SHA,
    build_time: BUILD_TIME,
    supported_export_profiles: ["claims", "legal"],
    recent_exports,
    recent_verifications,
    latest_verification_run,
    latest_smoke_run,
    recent_smoke_runs,
    smoke_history_summary,
    tenant_policy: tenantPolicy
      ? {
          tenant_id: tenantPolicy.tenant.slug,
          enabled_export_profiles: tenantPolicy.enabledExportProfiles,
          enabled_visibility_classes: tenantPolicy.enabledVisibilityClasses,
          redaction_enabled: tenantPolicy.redactionEnabled,
          role_override_keys: Object.keys((tenantPolicy.roleOverrides as any) ?? {}),
          user_override_keys: Object.keys((tenantPolicy.userOverrides as any) ?? {}),
        }
      : null,
  };
});

registerVerifierRoutes(fastify);
registerSmokeRoutes(fastify);

function mapEventToCanonical(e: any): CanonicalEvent {
  const evidence = normalizeDoctrineEvidencePair({
    recordedEvidence: e.recordedEvidence,
    derivedEvidence: e.derivedEvidence,
    source: `event:${e.eventId ?? "unknown"}`,
  });

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
    recordedEvidence: evidence.recordedEvidence,
    derivedEvidence: evidence.derivedEvidence,
  };
}

function resolveExportEvidenceLayers(exp: any, event: any, source: string) {
  return normalizeDoctrineEvidencePair({
    recordedEvidence: exp?.recordedEvidenceSnapshot ?? event?.recordedEvidence,
    derivedEvidence: exp?.derivedEvidenceSnapshot ?? event?.derivedEvidence,
    source,
  });
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
  if (!/^[a-zA-Z0-9_-]{6,80}$/.test(eventId)) {
    return reply.code(400).send({ error: "INVALID_EVENT_ID" });
  }
  const event = await prisma.event.findUnique({
    where: { eventId },
  });
  if (!event) {
    return reply.code(404).send({ error: "EVENT_NOT_FOUND" });
  }
  return { data: mapEventToCanonical(event) };
});

fastify.get("/v1/connected-device-ingest", async () => {
  const latest = await prisma.connectedDevicePilotShell.findUnique({
    where: { singletonKey: PILOT_SHELL_SINGLETON_KEY },
  });

  if (!latest) {
    return {
      state: "waiting",
      event: null,
      audit: null,
    } satisfies PilotIngestReadResponse;
  }

  return mapPilotShellRecordToResponse(latest);
});

fastify.post("/v1/connected-device-ingest", async (request, reply) => {
  const expectedToken = normalizeSecret(process.env.CONNECTED_DEVICE_ACCESS_TOKEN);
  if (!expectedToken) {
    return reply.code(503).send({ error: "pilot_ingest_unconfigured" });
  }

  if (!hasConnectedDeviceIngestAccess(request)) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const validated = validatePilotEnvelope(request.body);
  if (!validated.ok) {
    return reply.code(400).send({ error: "invalid_pilot_envelope", reason: validated.reason });
  }

  const acceptedAt = new Date();
  const persisted = await prisma.connectedDevicePilotShell.upsert({
    where: { singletonKey: PILOT_SHELL_SINGLETON_KEY },
    update: {
      eventId: validated.envelope.event_id,
      occurredAt: new Date(validated.envelope.occurred_at),
      system: validated.envelope.system,
      incidentClass: validated.envelope.incident_class,
      title: validated.envelope.title,
      summary: validated.envelope.summary,
      bundleId: validated.envelope.bundle_id,
      manifestId: validated.envelope.manifest_id,
      severity: validated.envelope.severity ?? "medium",
      acceptedAt,
      sourceLane: PILOT_SOURCE_LANE,
      contractVersion: PILOT_INGEST_CONTRACT_ID,
      serviceId: PILOT_SERVICE_ID,
    },
    create: {
      singletonKey: PILOT_SHELL_SINGLETON_KEY,
      eventId: validated.envelope.event_id,
      occurredAt: new Date(validated.envelope.occurred_at),
      system: validated.envelope.system,
      incidentClass: validated.envelope.incident_class,
      title: validated.envelope.title,
      summary: validated.envelope.summary,
      bundleId: validated.envelope.bundle_id,
      manifestId: validated.envelope.manifest_id,
      severity: validated.envelope.severity ?? "medium",
      acceptedAt,
      sourceLane: PILOT_SOURCE_LANE,
      contractVersion: PILOT_INGEST_CONTRACT_ID,
      serviceId: PILOT_SERVICE_ID,
    },
  });

  const readback = mapPilotShellRecordToResponse(persisted);
  return reply.code(202).send({
    accepted: true,
    service: PILOT_SERVICE_ID,
    contract: PILOT_INGEST_CONTRACT_ID,
    event: readback.event,
    audit: readback.audit,
  });
});

fastify.get("/v1/uploaded-package-ingest", async () => {
  const latest = await prisma.uploadedPackageShell.findUnique({
    where: { singletonKey: UPLOADED_PACKAGE_SHELL_SINGLETON_KEY },
  });

  if (!latest) {
    return {
      state: "waiting",
      event: null,
      audit: null,
    } satisfies UploadedPackageIngestReadResponse;
  }

  return mapUploadedPackageShellRecordToResponse(latest);
});

fastify.post("/v1/uploaded-package-ingest", async (request, reply) => {
  const expectedToken = normalizeSecret(process.env.UPLOADED_PACKAGE_ACCESS_TOKEN);
  if (!expectedToken) {
    return reply.code(503).send({ error: "uploaded_package_ingest_unconfigured" });
  }

  if (!hasUploadedPackageIngestAccess(request)) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const validated = validateUploadedPackageEnvelope(request.body);
  if (!validated.ok) {
    return reply
      .code(400)
      .send({ error: "invalid_uploaded_package_envelope", reason: validated.reason });
  }

  const acceptedAt = new Date();
  const persisted = await prisma.uploadedPackageShell.upsert({
    where: { singletonKey: UPLOADED_PACKAGE_SHELL_SINGLETON_KEY },
    update: {
      packageId: validated.envelope.package_id,
      uploadedAt: new Date(validated.envelope.uploaded_at),
      system: validated.envelope.system,
      incidentClass: validated.envelope.incident_class,
      title: validated.envelope.title,
      summary: validated.envelope.summary,
      bundleId: validated.envelope.bundle_id,
      manifestId: validated.envelope.manifest_id,
      severity: validated.envelope.severity ?? "medium",
      packageName: validated.envelope.package_name,
      packageSha256: validated.envelope.package_sha256,
      packageSizeBytes: BigInt(validated.envelope.package_size_bytes),
      acceptedAt,
      sourceLane: UPLOADED_PACKAGE_SOURCE_LANE,
      contractVersion: UPLOADED_PACKAGE_CONTRACT_ID,
      serviceId: UPLOADED_PACKAGE_SERVICE_ID,
    },
    create: {
      singletonKey: UPLOADED_PACKAGE_SHELL_SINGLETON_KEY,
      packageId: validated.envelope.package_id,
      uploadedAt: new Date(validated.envelope.uploaded_at),
      system: validated.envelope.system,
      incidentClass: validated.envelope.incident_class,
      title: validated.envelope.title,
      summary: validated.envelope.summary,
      bundleId: validated.envelope.bundle_id,
      manifestId: validated.envelope.manifest_id,
      severity: validated.envelope.severity ?? "medium",
      packageName: validated.envelope.package_name,
      packageSha256: validated.envelope.package_sha256,
      packageSizeBytes: BigInt(validated.envelope.package_size_bytes),
      acceptedAt,
      sourceLane: UPLOADED_PACKAGE_SOURCE_LANE,
      contractVersion: UPLOADED_PACKAGE_CONTRACT_ID,
      serviceId: UPLOADED_PACKAGE_SERVICE_ID,
    },
  });

  const readback = mapUploadedPackageShellRecordToResponse(persisted);
  return reply.code(202).send({
    accepted: true,
    service: UPLOADED_PACKAGE_SERVICE_ID,
    contract: UPLOADED_PACKAGE_CONTRACT_ID,
    event: readback.event,
    audit: readback.audit,
  });
});

fastify.post<{
  Params: { eventId: string };
  Body: CreateExportRequest;
}>(
  "/v1/events/:eventId/exports",
  {
    preHandler: [
      rateLimit({ windowMs: 60_000, max: 12, keyPrefix: "export_create" }),
      async (request, reply) => {
        if (!hasBearerAccess(request)) {
          fastify.log.warn(
            { ip: getClientIp(request as any), route: "/v1/events/:eventId/exports" },
            "access_denied"
          );
          return reply.code(403).send({ error: "ACCESS_REQUIRED" });
        }
      },
    ],
  },
  async (request, reply) => {
  const { eventId } = request.params;
  const { profile, format, purpose } = request.body;
  if (!/^[a-zA-Z0-9_-]{6,80}$/.test(eventId)) {
    return reply.code(400).send({ error: "INVALID_EVENT_ID" });
  }
  const normalizedPurpose = normalizeExportPurpose(purpose);

  const event = await prisma.event.findUnique({ where: { eventId } });
  if (!event) {
    return reply.code(404).send({ error: "EVENT_NOT_FOUND" });
  }

  const tenantPolicy = await prisma.tenantPolicy.findUnique({
    where: { tenantId: event.tenantId },
  });

  if (
    !isNonEmptyString(profile) ||
    !API_SUPPORTED_EXPORT_PROFILES.includes(profile as ExportProfileCode)
  ) {
    return reply.code(400).send({
      error: "UNSUPPORTED_EXPORT_REQUEST",
      export_profile: profile ?? null,
      format: format ?? null,
    });
  }
  if (
    !isNonEmptyString(format) ||
    !API_SUPPORTED_EXPORT_FORMATS.includes(format as ExportFormat)
  ) {
    return reply.code(400).send({
      error: "UNSUPPORTED_EXPORT_REQUEST",
      export_profile: profile,
      format: format ?? null,
    });
  }
  if (!normalizedPurpose) {
    return reply.code(400).send({
      error: "INVALID_EXPORT_PURPOSE",
      export_profile: profile,
      format,
      purpose: null,
    });
  }

  const trustedRole = resolveTrustedRoleHeader(request);
  if (!trustedRole) {
    return reply.code(403).send({ error: "ROLE_CONTEXT_REQUIRED" });
  }

  const trustedSubject = resolveTrustedSubjectHeader(request);
  const documentFamilies = getDocumentFamilies(profile as ExportProfileCode, event.eventClass);
  const policyEvaluation = evaluatePolicy({
    tenantPolicy,
    trustedRole,
    trustedSubject,
    requestedExportProfile: profile as ExportProfileCode,
    linkedDocumentFamilies: documentFamilies.linked,
  });

  if (!policyEvaluation.enabledExportProfiles.includes(profile)) {
    return reply.code(403).send({
      error: "POLICY_EXPORT_PROFILE_NOT_ALLOWED",
      trusted_role: trustedRole,
      trusted_subject: trustedSubject,
      export_profile: profile,
      policy_trace: policyEvaluation.policyTrace,
    });
  }

  // Compute visibility-filtered evidence and policy snapshot once at creation time.
  const profileVisibilityDefaults: Record<string, string[]> = {
    claims: ["claims_review"],
    legal: ["claims_review", "legal_review", "technical_review"],
  };

  const evidence = normalizeDoctrineEvidencePair({
    recordedEvidence: (event as any).recordedEvidence,
    derivedEvidence: (event as any).derivedEvidence,
    source: `export_create:${event.eventId}`,
  });

  const tenantAllowed =
    policyEvaluation.actorVisibilityClasses.length > 0
      ? new Set(policyEvaluation.actorVisibilityClasses)
      : null;
  const profileAllowed = new Set(policyEvaluation.effectiveVisibilityClasses);

  const {
    filteredRecorded,
    filteredDerived,
    redactionApplied: redactionAppliedCreation,
    redactedItemCount: redactedCount,
    redactionBasis: redactionBasisCreation,
    redactionRecord,
  } = applyEvidenceRedaction({
    recordedEvidence: evidence.recordedEvidence,
    derivedEvidence: evidence.derivedEvidence,
    exportProfile: profile as ExportProfileCode,
    allowedVisibilityClasses: profileAllowed,
    tenantVisibilityClasses: tenantAllowed,
  });

  const policySnapshot =
    tenantPolicy
      ? {
          enabledExportProfiles: tenantPolicy.enabledExportProfiles,
          enabledVisibilityClasses: tenantPolicy.enabledVisibilityClasses,
          redactionEnabled: tenantPolicy.redactionEnabled,
          roleOverrides: tenantPolicy.roleOverrides,
          userOverrides: tenantPolicy.userOverrides,
          trustedRole,
          trustedSubject,
          policyTrace: policyEvaluation.policyTrace,
          redactionRecord,
        }
      : {
          trustedRole,
          trustedSubject,
          policyTrace: policyEvaluation.policyTrace,
          redactionRecord,
        };

  // If redaction is disabled but exclusions would be required, reject instead of creating a redacted artifact.
  if (!policyEvaluation.redactionEnabled && redactedCount > 0) {
    return reply.code(403).send({
      error: "POLICY_VISIBILITY_VIOLATION",
      trusted_role: trustedRole,
      trusted_subject: trustedSubject,
      export_profile: profile,
      policy_trace: policyEvaluation.policyTrace,
    });
  }

  const [bundle, manifest] = await Promise.all([
    prisma.bundle.findFirst({
      where: {
        eventId: event.id,
        bundleId: event.bundleId,
      },
    }),
    prisma.manifest.findFirst({
      where: {
        eventId: event.id,
        manifestId: event.manifestId,
      },
    }),
  ]);

  if (!bundle || !manifest) {
    return reply.code(500).send({ error: "BUNDLE_OR_MANIFEST_MISSING" });
  }

  const exportId = `QEX-${randomUUID()}`;
  const receiptId = `QRC-${randomUUID()}`;

  const createdExport = await prisma.export.create({
    data: {
      exportId,
      eventId: event.id,
      bundleId: event.bundleId,
      manifestId: event.manifestId,
      profile,
      format,
      purpose: normalizedPurpose,
      verificationState: event.verificationState,
      recordedEvidenceSnapshot: filteredRecorded as any,
      derivedEvidenceSnapshot: filteredDerived as any,
      redactionApplied: redactionAppliedCreation,
      redactedItemCount: redactedCount || null,
      redactionBasis: redactionBasisCreation,
      policySnapshot: policySnapshot as any,
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

  if (request.body.outputTitle) {
    EXPORT_TITLES.set(exportId, request.body.outputTitle);
  }

  const artifactMeta = buildArtifactPackage({
    exportId,
    receiptId,
    schemaVersion: SCHEMA_VERSION,
    buildVersion: BUILD_VERSION,
    profile: profile as ExportProfileCode,
    format: format as ExportFormat,
    eventClass: event.eventClass,
    eventId: event.eventId,
    bundleId: event.bundleId,
    manifestId: event.manifestId,
    issuedAt: createdExport.createdAt.toISOString(),
    summary: event.summary,
    verificationState: event.verificationState,
    purpose: normalizedPurpose,
    recordedEvidence: filteredRecorded,
    derivedEvidence: filteredDerived,
    redactionRecord,
    policyTrace: policyEvaluation.policyTrace,
  });

  const response: ExportArtifactResponse = {
    export_id: exportId,
    receipt_id: receiptId,
    event_id: event.eventId,
    bundle_id: event.bundleId,
    manifest_id: event.manifestId,
    verification_state: event.verificationState as VerificationState,
    export_profile: profile as ExportProfileCode,
    export_purpose: normalizedPurpose,
    schema_version: SCHEMA_VERSION,
    download_url: `/v1/exports/${exportId}/download`,
    document_family: artifactMeta.documentFamily,
    linked_document_families: artifactMeta.linkedDocumentFamilies,
    artifact_package: artifactMeta.artifactPackage,
    policy_trace: policyEvaluation.policyTrace,
  };

  return reply.code(201).send(response);
});

fastify.get<{
  Params: { exportId: string };
}>(
  "/v1/exports/:exportId/download",
  {
    preHandler: [
      rateLimit({ windowMs: 60_000, max: 30, keyPrefix: "export_download" }),
      async (request, reply) => {
        if (!hasBearerAccess(request)) {
          fastify.log.warn(
            { ip: getClientIp(request as any), route: "/v1/exports/:exportId/download" },
            "access_denied"
          );
          return reply.code(403).send({ error: "ACCESS_REQUIRED" });
        }
      },
    ],
  },
  async (request, reply) => {
  const { exportId } = request.params;
  if (!/^QEX-[a-zA-Z0-9-]{10,120}$/.test(exportId)) {
    return reply.code(400).send({ error: "INVALID_EXPORT_ID" });
  }
  const exp = await prisma.export.findUnique({
    where: { exportId },
    include: { event: true, receipt: true },
  }) as any;

  if (!exp) {
    return reply.code(404).send({ error: "EXPORT_NOT_FOUND" });
  }

  const event = exp.event as any;
  const receipt = exp.receipt ?? null;
  if (!receipt?.receiptId) {
    return reply.code(409).send({ error: "RECEIPT_LINKAGE_MISSING" });
  }

  if (!isNonEmptyString(exp.bundleId) || !isNonEmptyString(exp.manifestId)) {
    return reply.code(500).send({ error: "EXPORT_IDENTITY_MISSING" });
  }

  if (exp.profile === "claims" && exp.format === "json") {
    const evidence = resolveExportEvidenceLayers(exp, event, `export_download_json:${exp.exportId}`);
    const redactionApplied =
      (exp as any).redactionApplied ?? false;
    const redactedItemCount =
      (exp as any).redactedItemCount ?? 0;
    const redactionBasis =
      (exp as any).redactionBasis ?? null;
    const redactionRecord =
      (exp as any).policySnapshot?.redactionRecord ?? null;
    const policyTrace =
      (exp as any).policySnapshot?.policyTrace ?? null;

    const payload = {
      event_id: event.eventId,
      bundle_id: exp.bundleId,
      manifest_id: exp.manifestId,
      export_id: exp.exportId,
      receipt_id: receipt.receiptId,
      verification_state: exp.verificationState as VerificationState,
      export_profile: exp.profile,
      export_purpose: exp.purpose,
      generated_at: exp.createdAt.toISOString(),
      tenant_id: event.tenantId,
      schema_version: "v1",
      recorded_evidence: evidence.recordedEvidence,
      derived_evidence: evidence.derivedEvidence,
      redaction_applied: redactionApplied,
      redacted_item_count: redactedItemCount,
      redaction_basis: redactionBasis,
      redaction_record: redactionRecord,
      policy_trace: policyTrace,
      artifact_package: buildArtifactPackage({
        exportId: exp.exportId,
        receiptId: receipt.receiptId,
        schemaVersion: SCHEMA_VERSION,
        buildVersion: BUILD_VERSION,
        profile: exp.profile as ExportProfileCode,
        format: exp.format as ExportFormat,
        eventClass: event.eventClass,
        eventId: event.eventId,
        bundleId: exp.bundleId,
        manifestId: exp.manifestId,
        issuedAt: exp.createdAt.toISOString(),
        summary: event.summary,
        verificationState: exp.verificationState,
        purpose: exp.purpose,
        recordedEvidence: evidence.recordedEvidence,
        derivedEvidence: evidence.derivedEvidence,
        redactionRecord,
        policyTrace,
      }).artifactPackage,
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
    const evidence = resolveExportEvidenceLayers(exp, event, `export_download_pdf:${exp.exportId}`);
    const redactionApplied =
      (exp as any).redactionApplied ?? false;
    const redactedItemCount =
      (exp as any).redactedItemCount ?? 0;
    const redactionBasis =
      (exp as any).redactionBasis ?? null;
    const redactionRecord =
      (exp as any).policySnapshot?.redactionRecord ?? null;
    const policyTrace =
      (exp as any).policySnapshot?.policyTrace ?? null;

    const latestRun = await prisma.verificationRun.findFirst({
      where: { eventId: event.id },
      orderBy: { createdAt: "desc" },
      include: {
        transcript: {
          include: { steps: { orderBy: { stepIndex: "asc" } } },
        },
      },
    });

    const transcriptId = latestRun?.transcript?.transcriptId ?? null;
    const verificationRunId = latestRun?.verificationRunId ?? null;
    const verificationTrace =
      latestRun?.transcript?.steps?.map((s) => ({
        step: s.stepIndex,
        check: s.check,
        result: s.result,
        note: s.note,
      })) ?? [];

    const identity: DocumentIdentity = {
      eventId: event.eventId,
      bundleId: exp.bundleId,
      manifestId: exp.manifestId,
      exportId: exp.exportId,
      receiptId: receipt.receiptId,
      verificationState: exp.verificationState as VerificationState,
      generatedAt: exp.createdAt.toISOString(),
      exportProfile: exp.profile,
      exportPurpose: exp.purpose,
      schemaVersion: "v1",
      tenantId: event.tenantId,
      outputTitle: EXPORT_TITLES.get(exportId) || undefined,
      redactionApplied,
      redactedItemCount,
      redactionBasis,
      redactionRecord,
      policyTrace,
      transcriptId,
      verificationRunId,
    };

    const canonicalEvent: CanonicalEvent = {
      eventId: event.eventId,
      bundleId: exp.bundleId,
      manifestId: exp.manifestId,
      vehicleVin: event.vehicleVin ?? undefined,
      fleetId: event.fleetId ?? undefined,
      policyOrClaimRef: event.policyOrClaimRef ?? undefined,
      incidentLocation: event.incidentLocation ?? undefined,
      eventClass: event.eventClass,
      scenarioKey: event.scenarioKey,
      occurredAt: event.occurredAt.toISOString(),
      summary: event.summary,
      verificationState: exp.verificationState as VerificationState,
      recordedEvidence: evidence.recordedEvidence.map((item) => ({ ...item })),
      derivedEvidence: evidence.derivedEvidence.map((item) => ({
        ...item,
        derivedFrom: [...item.derivedFrom],
        sourceDependencies: [...item.sourceDependencies],
      })),
      verificationTrace,
    };

    let pdf: InstanceType<typeof PDFDocument>;
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
    const evidence = resolveExportEvidenceLayers(exp, event, `export_download_legal_json:${exp.exportId}`);
    const redactionApplied =
      (exp as any).redactionApplied ?? false;
    const redactedItemCount =
      (exp as any).redactedItemCount ?? 0;
    const redactionBasis =
      (exp as any).redactionBasis ?? null;
    const redactionRecord =
      (exp as any).policySnapshot?.redactionRecord ?? null;
    const policyTrace =
      (exp as any).policySnapshot?.policyTrace ?? null;

    const payload = {
      event_id: event.eventId,
      bundle_id: exp.bundleId,
      manifest_id: exp.manifestId,
      export_id: exp.exportId,
      receipt_id: receipt.receiptId,
      verification_state: exp.verificationState as VerificationState,
      export_profile: exp.profile,
      export_purpose: exp.purpose,
      generated_at: exp.createdAt.toISOString(),
      tenant_id: event.tenantId,
      schema_version: "v1",
      recorded_evidence: evidence.recordedEvidence,
      derived_evidence: evidence.derivedEvidence,
      manifest_reference: {
        manifest_id: exp.manifestId,
      },
      redaction_applied: redactionApplied,
      redacted_item_count: redactedItemCount,
      redaction_basis: redactionBasis,
      redaction_record: redactionRecord,
      policy_trace: policyTrace,
      artifact_package: buildArtifactPackage({
        exportId: exp.exportId,
        receiptId: receipt.receiptId,
        schemaVersion: SCHEMA_VERSION,
        buildVersion: BUILD_VERSION,
        profile: exp.profile as ExportProfileCode,
        format: exp.format as ExportFormat,
        eventClass: event.eventClass,
        eventId: event.eventId,
        bundleId: exp.bundleId,
        manifestId: exp.manifestId,
        issuedAt: exp.createdAt.toISOString(),
        summary: event.summary,
        verificationState: exp.verificationState,
        purpose: exp.purpose,
        recordedEvidence: evidence.recordedEvidence,
        derivedEvidence: evidence.derivedEvidence,
        redactionRecord,
        policyTrace,
      }).artifactPackage,
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

fastify.post<{
  Params: { exportId: string };
  Body: ArtifactReverificationRequest;
}>(
  "/v1/exports/:exportId/reverify",
  {
    preHandler: [
      rateLimit({ windowMs: 60_000, max: 30, keyPrefix: "export_reverify" }),
      async (request, reply) => {
        if (!hasBearerAccess(request)) {
          fastify.log.warn(
            { ip: getClientIp(request as any), route: "/v1/exports/:exportId/reverify" },
            "access_denied"
          );
          return reply.code(403).send({ error: "ACCESS_REQUIRED" });
        }
      },
    ],
  },
  async (request, reply) => {
    const { exportId } = request.params;
    if (!/^QEX-[a-zA-Z0-9-]{6,120}$/.test(exportId)) {
      return reply.code(400).send({ error: "INVALID_EXPORT_ID" });
    }

    const submitted = request.body?.artifact_package;
    if (!submitted) {
      return reply.code(400).send({ error: "INVALID_ARTIFACT_PACKAGE" });
    }

    const exp = await prisma.export.findUnique({
      where: { exportId },
      include: { event: true, receipt: true },
    }) as any;
    if (!exp || !exp.receipt?.receiptId) {
      return reply.code(404).send({ error: "EXPORT_NOT_FOUND" });
    }

    const evidence = resolveExportEvidenceLayers(exp, exp.event, `export_reverify:${exp.exportId}`);
    const redactionRecord = (exp as any).policySnapshot?.redactionRecord ?? null;
    const policyTrace = (exp as any).policySnapshot?.policyTrace ?? null;
    const expected = buildArtifactPackage({
      exportId: exp.exportId,
      receiptId: exp.receipt.receiptId,
      schemaVersion: SCHEMA_VERSION,
      buildVersion: BUILD_VERSION,
      profile: exp.profile as ExportProfileCode,
      format: exp.format as ExportFormat,
      eventClass: exp.event.eventClass,
      eventId: exp.event.eventId,
      bundleId: exp.bundleId,
      manifestId: exp.manifestId,
      issuedAt: exp.createdAt.toISOString(),
      summary: exp.event.summary,
      verificationState: exp.verificationState,
      purpose: exp.purpose,
      recordedEvidence: evidence.recordedEvidence,
      derivedEvidence: evidence.derivedEvidence,
      redactionRecord,
      policyTrace,
    }).artifactPackage;

    const response: ArtifactReverificationResponse = reverifyArtifactPackage({
      exportId: exp.exportId,
      expected,
      submitted,
    });

    return reply.code(200).send(response);
  }
);

const port = Number(process.env.PORT) || 4000;

export { fastify };

if (!process.env.VERCEL) {
  fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`API listening at ${address}`);
  });
}

