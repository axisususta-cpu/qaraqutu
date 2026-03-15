import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import type { CanonicalEvent } from "contracts";

const prisma = new PrismaClient();

const TENANT_SLUG = "demo-fleet";

const demoEvents: CanonicalEvent[] = [
  {
    eventId: "QEV-20260311-DEMO-NEARMISS-01",
    bundleId: "QBN-20260311-DEMO-NEARMISS-01",
    manifestId: "QMF-20260311-DEMO-NEARMISS-01",
    eventClass: "near_miss",
    scenarioKey: "Urban corridor near-miss with braking",
    occurredAt: "2026-03-11T08:30:00.000Z",
    summary:
      "Near-miss in urban corridor where vehicle performed abrupt braking to avoid side-entry vehicle.",
    verificationState: "PASS",
    vehicleVin: "DEMO-NEAR-MISS-VIN",
    fleetId: "DEMO-FLEET-01",
    policyOrClaimRef: "CLAIM-NEARMISS-001",
    incidentLocation: "Istanbul, TR",
    recordedEvidence: [
      {
        recordId: "REC-NEARMISS-JSON",
        sourceType: "vehicle_event_payload",
        sourceId: "SRC-NEARMISS-JSON",
        capturedAt: "2026-03-11T08:30:00.000Z",
        contentType: "application/json",
        hash: "hash-json-nearmiss",
        sizeOrLength: 1024,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.98,
        displayLabel: "Source event JSON payload",
        machineLabel: "source_event_json",
        visibility_class: "claims_review",
      },
      {
        recordId: "REC-NEARMISS-TRACE",
        sourceType: "telemetry_trace",
        sourceId: "SRC-NEARMISS-TRACE",
        capturedAt: "2026-03-11T08:30:01.000Z",
        contentType: "application/octet-stream",
        hash: "hash-trace-nearmiss",
        sizeOrLength: 4096,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.95,
        displayLabel: "Vehicle telemetry snapshot",
        machineLabel: "telemetry_snapshot",
        visibility_class: "restricted_internal",
      },
    ],
    derivedEvidence: [
      {
        derivedId: "DER-NEARMISS-TIMELINE",
        derivedType: "timeline_synthesis",
        derivedFrom: ["REC-NEARMISS-JSON", "REC-NEARMISS-TRACE"],
        generatedAt: "2026-03-11T08:31:00.000Z",
        method: "timeline_v1",
        confidence: 0.92,
        recordedFlag: false,
        derivationNote: "Timeline synthesized from source payload and telemetry.",
        displayLabel: "Incident timeline synthesis",
        machineLabel: "timeline_synthesis",
        visibility_class: "claims_review",
        humanSummary:
          "Reconstructed timeline of braking and near-miss sequence based on source payload and telemetry trace.",
        sourceDependencies: ["REC-NEARMISS-JSON", "REC-NEARMISS-TRACE"],
      },
    ],
  },
  {
    eventId: "QEV-20260311-DEMO-COLLISION-01",
    bundleId: "QBN-20260311-DEMO-COLLISION-01",
    manifestId: "QMF-20260311-DEMO-COLLISION-01",
    eventClass: "collision",
    scenarioKey: "Intersection collision with disputed lane entry",
    occurredAt: "2026-03-11T09:45:00.000Z",
    summary:
      "Collision at intersection where lane entry and signal interpretation are disputed between parties.",
    verificationState: "UNKNOWN",
    vehicleVin: "DEMO-COLLISION-VIN",
    fleetId: "DEMO-FLEET-01",
    policyOrClaimRef: "CLAIM-COLLISION-001",
    incidentLocation: "Ankara, TR",
    recordedEvidence: [
      {
        recordId: "REC-COLLISION-JSON",
        sourceType: "vehicle_event_payload",
        sourceId: "SRC-COLLISION-JSON",
        capturedAt: "2026-03-11T09:45:00.000Z",
        contentType: "application/json",
        hash: "hash-json-collision",
        sizeOrLength: 2048,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.96,
        displayLabel: "Source event JSON payload",
        machineLabel: "source_event_json",
        visibility_class: "claims_review",
      },
      {
        recordId: "REC-COLLISION-CAMERA",
        sourceType: "front_camera_frame",
        sourceId: "SRC-COLLISION-CAMERA",
        capturedAt: "2026-03-11T09:45:02.000Z",
        contentType: "image/jpeg",
        hash: "hash-camera-collision",
        sizeOrLength: 350000,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.94,
        displayLabel: "Forward camera frame at impact",
        machineLabel: "camera_frame_impact",
        visibility_class: "legal_review",
      },
      {
        recordId: "REC-COLLISION-TRACE",
        sourceType: "telemetry_trace",
        sourceId: "SRC-COLLISION-TRACE",
        capturedAt: "2026-03-11T09:45:01.000Z",
        contentType: "application/octet-stream",
        hash: "hash-trace-collision",
        sizeOrLength: 8192,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.95,
        displayLabel: "Vehicle telemetry trace around impact",
        machineLabel: "telemetry_trace",
        visibility_class: "restricted_internal",
      },
    ],
    derivedEvidence: [
      {
        derivedId: "DER-COLLISION-RECON",
        derivedType: "reconstruction_narrative",
        derivedFrom: [
          "REC-COLLISION-JSON",
          "REC-COLLISION-CAMERA",
          "REC-COLLISION-TRACE",
        ],
        generatedAt: "2026-03-11T09:46:00.000Z",
        method: "reconstruction_v1",
        confidence: 0.88,
        recordedFlag: false,
        derivationNote:
          "Reconstruction narrative synthesised from event payload, camera frame and telemetry trace.",
        displayLabel: "Intersection collision reconstruction",
        machineLabel: "reconstruction_narrative",
        visibility_class: "legal_review",
        humanSummary:
          "Narrative reconstruction of intersection approach, lane entry and impact timing from available sources.",
        sourceDependencies: [
          "REC-COLLISION-JSON",
          "REC-COLLISION-CAMERA",
          "REC-COLLISION-TRACE",
        ],
      },
    ],
  },
  {
    eventId: "QEV-20260311-DEMO-AMBIGUITY-01",
    bundleId: "QBN-20260311-DEMO-AMBIGUITY-01",
    manifestId: "QMF-20260311-DEMO-AMBIGUITY-01",
    eventClass: "sensor_ambiguity",
    scenarioKey: "Sensor ambiguity in low-visibility corridor",
    occurredAt: "2026-03-11T11:10:00.000Z",
    summary:
      "Event with partial sensor visibility and ambiguous readings in a low-visibility corridor segment.",
    verificationState: "UNVERIFIED",
    vehicleVin: "DEMO-AMBIGUITY-VIN",
    fleetId: "DEMO-FLEET-02",
    policyOrClaimRef: "CLAIM-AMBIGUITY-001",
    incidentLocation: "Izmir, TR",
    recordedEvidence: [
      {
        recordId: "REC-AMB-JSON",
        sourceType: "vehicle_event_payload",
        sourceId: "SRC-AMB-JSON",
        capturedAt: "2026-03-11T11:10:00.000Z",
        contentType: "application/json",
        hash: "hash-json-ambiguity",
        sizeOrLength: 1536,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.9,
        displayLabel: "Source event JSON payload",
        machineLabel: "source_event_json",
        visibility_class: "claims_review",
      },
      {
        recordId: "REC-AMB-SENSOR",
        sourceType: "sensor_snapshot",
        sourceId: "SRC-AMB-SENSOR",
        capturedAt: "2026-03-11T11:10:01.000Z",
        contentType: "application/octet-stream",
        hash: "hash-sensor-ambiguity",
        sizeOrLength: 4096,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.82,
        displayLabel: "Sensor snapshot with partial visibility",
        machineLabel: "sensor_snapshot_partial",
        visibility_class: "technical_review",
      },
    ],
    derivedEvidence: [
      {
        derivedId: "DER-AMB-ANALYSIS",
        derivedType: "sensor_ambiguity_analysis",
        derivedFrom: ["REC-AMB-JSON", "REC-AMB-SENSOR"],
        generatedAt: "2026-03-11T11:11:00.000Z",
        method: "ambiguity_analysis_v1",
        confidence: 0.75,
        recordedFlag: false,
        derivationNote:
          "Analysis of sensor ambiguity and visibility gaps under low-visibility conditions.",
        displayLabel: "Sensor ambiguity analysis",
        machineLabel: "sensor_ambiguity_analysis",
        visibility_class: "technical_review",
        humanSummary:
          "Assessment of which sensor channels showed ambiguity or loss and how this impacts interpretation.",
        sourceDependencies: ["REC-AMB-JSON", "REC-AMB-SENSOR"],
      },
    ],
  },
];

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {},
    create: {
      name: "Demo Fleet Tenant",
      slug: TENANT_SLUG,
    },
  });

  // Clear previous demo data (order respects FKs: verification/smoke before event)
  await prisma.verificationTranscriptStep.deleteMany({});
  await prisma.verificationTranscript.deleteMany({});
  await prisma.verificationRun.deleteMany({});
  await prisma.smokeCheck.deleteMany({});
  await prisma.smokeRun.deleteMany({});
  await prisma.receipt.deleteMany({});
  await prisma.export.deleteMany({});
  await prisma.manifest.deleteMany({});
  await prisma.bundle.deleteMany({});
  await prisma.event.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.tenantPolicy.deleteMany({ where: { tenantId: tenant.id } });

  for (const ev of demoEvents) {
    const createdEvent = await prisma.event.create({
      data: {
        eventId: ev.eventId,
        bundleId: ev.bundleId,
        manifestId: ev.manifestId,
        tenantId: tenant.id,
        eventClass: ev.eventClass,
        scenarioKey: ev.scenarioKey,
        occurredAt: new Date(ev.occurredAt),
        summary: ev.summary,
        verificationState: ev.verificationState,
        vehicleVin: ev.vehicleVin,
        fleetId: ev.fleetId,
        policyOrClaimRef: ev.policyOrClaimRef,
        incidentLocation: ev.incidentLocation,
        recordedEvidence: ev.recordedEvidence,
        derivedEvidence: ev.derivedEvidence,
      },
    });

    const bundle = await prisma.bundle.create({
      data: {
        bundleId: ev.bundleId,
        eventId: createdEvent.id,
      },
    });

    await prisma.manifest.create({
      data: {
        manifestId: ev.manifestId,
        eventId: createdEvent.id,
        bundleId: bundle.id,
      },
    });
  }

  await prisma.tenantPolicy.create({
    data: {
      tenantId: tenant.id,
      enabledExportProfiles: ["claims", "legal"],
      enabledVisibilityClasses: [
        "claims_review",
        "legal_review",
        "technical_review",
        "restricted_internal",
      ],
      redactionEnabled: true,
    },
  });

  // Demo path: one verification run, one export, one smoke run so /admin shows activity
  const firstEvent = await prisma.event.findFirst({
    where: { tenantId: tenant.id },
    include: { bundles: true, manifests: true },
  });
  if (firstEvent && firstEvent.bundles[0] && firstEvent.manifests[0]) {
    const bundle = firstEvent.bundles[0];
    const manifest = firstEvent.manifests[0];
    const run = await prisma.verificationRun.create({
      data: {
        verificationRunId: `QVR-DEMO-${randomUUID().slice(0, 8)}`,
        eventId: firstEvent.id,
        bundleId: bundle.bundleId,
        manifestId: manifest.manifestId,
        verificationState: firstEvent.verificationState,
      },
    });
    await prisma.verificationTranscript.create({
      data: {
        transcriptId: `QTR-DEMO-${randomUUID().slice(0, 8)}`,
        verificationRunId: run.id,
        steps: {
          create: [
            { stepIndex: 1, check: "Canonical event linkage", result: "PASS", note: "Event linked to bundle and manifest." },
            { stepIndex: 2, check: "Recorded vs derived separation", result: "PASS", note: "Distinct sections." },
            { stepIndex: 3, check: "Verification state", result: firstEvent.verificationState, note: "Canonical assessment." },
          ],
        },
      },
    });
    const exp = await prisma.export.create({
      data: {
        exportId: `QEX-DEMO-${randomUUID().slice(0, 8)}`,
        eventId: firstEvent.id,
        bundleId: bundle.bundleId,
        manifestId: manifest.manifestId,
        profile: "claims",
        format: "json",
        purpose: "demo_seed",
        verificationState: firstEvent.verificationState,
      },
    });
    await prisma.receipt.create({
      data: {
        receiptId: `QRC-DEMO-${randomUUID().slice(0, 8)}`,
        eventId: firstEvent.id,
        exportId: exp.id,
        actionType: "export_created",
      },
    });
    const smokeRun = await prisma.smokeRun.create({
      data: {
        smokeRunId: `QSM-DEMO-${randomUUID().slice(0, 8)}`,
        overallResult: "PASS",
        startedAt: new Date(),
        finishedAt: new Date(),
        environment: "demo",
        datasetVersion: process.env.DEMO_DATASET_VERSION ?? "demo-v1",
        buildVersion: process.env.BUILD_VERSION ?? "0.1.0",
        schemaVersion: "v1",
      },
    });
    await prisma.smokeCheck.createMany({
      data: [
        { smokeRunId: smokeRun.smokeRunId, checkName: "events_list", category: "verifier", result: "PASS", detail: "OK" },
        { smokeRunId: smokeRun.smokeRunId, checkName: "verify_path", category: "verifier", result: "PASS", detail: "OK" },
      ],
    });
  }

  console.log("Demo dataset seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

