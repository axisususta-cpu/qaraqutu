import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import { DEMO_CASE_MATRIX, type CanonicalEvent } from "contracts";

const prisma = new PrismaClient();

const TENANT_SLUG = "demo-fleet";

const demoEvents: CanonicalEvent[] = DEMO_CASE_MATRIX.map((item) => ({
  eventId: item.eventId,
  bundleId: item.bundleId,
  manifestId: item.manifestId,
  vehicleVin: item.vertical === "vehicle" ? `VIN-${item.id.toUpperCase()}` : undefined,
  fleetId: `FLEET-${item.vertical.toUpperCase()}`,
  policyOrClaimRef: `REF-${item.id.toUpperCase()}`,
  incidentLocation:
    item.vertical === "vehicle"
      ? "Istanbul, TR"
      : item.vertical === "drone"
      ? "Demo air corridor"
      : "Demo robotic cell",
  eventClass: item.incidentClass,
  scenarioKey: item.scenarioFrame,
  occurredAt: item.occurredAt,
  summary: item.summary,
  verificationState: item.verificationState,
  recordedEvidence: item.recordedEvidence,
  derivedEvidence: item.derivedAssessment,
}));

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {},
    create: {
      name: "Demo Fleet Tenant",
      slug: TENANT_SLUG,
    },
  });

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

  const firstEvent = await prisma.event.findFirst({
    where: { tenantId: tenant.id },
    include: { bundles: true, manifests: true },
    orderBy: { occurredAt: "asc" },
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
            { stepIndex: 1, check: "Canonical issue record", result: "PASS", note: "Event linked to bundle and manifest." },
            { stepIndex: 2, check: "Recorded vs derived separation", result: "PASS", note: "Recorded substrate and bounded reading remain distinct." },
            { stepIndex: 3, check: "PASS issuance posture", result: "PASS", note: "Main issuance line remains PASS; limitations, if any, stay annexed." },
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