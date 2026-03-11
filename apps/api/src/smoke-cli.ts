import { PrismaClient } from "@prisma/client";
import { VerificationState } from "contracts";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const BASE_URL = process.env.SMOKE_BASE_URL ?? "http://localhost:4000";

type SmokeCategory = "passing_path" | "failing_path";

async function check(
  name: string,
  category: SmokeCategory,
  smokeRunId: string,
  fn: () => Promise<void>
): Promise<boolean> {
  try {
    await fn();
    console.log(`CHECK ${name} PASS`);
    await prisma.smokeCheck.create({
      data: {
        smokeRunId,
        checkName: name,
        category,
        result: "PASS",
        detail: "",
      },
    });
    return true;
  } catch (err: any) {
    console.error(`CHECK ${name} FAIL: ${err?.message ?? String(err)}`);
    await prisma.smokeCheck.create({
      data: {
        smokeRunId,
        checkName: name,
        category,
        result: "FAIL",
        detail: err?.message ?? String(err),
      },
    });
    return false;
  }
}

async function main() {
  const smokeRunId = `QSR-${randomUUID()}`;
  const diagnosticsRes = await fetch(`${BASE_URL}/v1/system/diagnostics`).catch(
    () => null
  );
  let env = process.env.NODE_ENV ?? "development";
  let datasetVersion = process.env.DEMO_DATASET_VERSION ?? "demo-v1";
  let schemaVersion = "v1";
  let buildVersion = process.env.BUILD_VERSION ?? "0.1.0";

  if (diagnosticsRes && diagnosticsRes.ok) {
    try {
      const diag = await diagnosticsRes.json();
      env = diag.environment ?? env;
      datasetVersion = diag.dataset_version ?? datasetVersion;
      schemaVersion = diag.schema_version ?? schemaVersion;
      buildVersion = diag.build_version ?? buildVersion;
    } catch {
      // ignore diagnostics parse failures and fall back to defaults
    }
  }

  const smokeRun = await prisma.smokeRun.create({
    data: {
      smokeRunId,
      overallResult: "PENDING",
      startedAt: new Date(),
      environment: env,
      datasetVersion,
      buildVersion,
      schemaVersion,
    },
  });

  const results: boolean[] = [];

  console.log("PASSING PATH TESTS");

  // Availability
  results.push(
    await check("availability", "passing_path", smokeRun.smokeRunId, async () => {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) {
        throw new Error(`health status ${res.status}`);
      }
      const json = await res.json();
      if (!json || json.status !== "ok") {
        throw new Error("unexpected health payload");
      }
    })
  );

  // Diagnostics
  results.push(
    await check("diagnostics", "passing_path", smokeRun.smokeRunId, async () => {
      const res = await fetch(`${BASE_URL}/v1/system/diagnostics`);
      if (!res.ok) {
        throw new Error(`diagnostics status ${res.status}`);
      }
      const json = await res.json();
      const required = [
        "environment",
        "dataset_version",
        "schema_version",
        "build_version",
      ];
      for (const key of required) {
        if (!json[key]) throw new Error(`missing diagnostics field: ${key}`);
      }
    })
  );

  // Dataset
  let sampleEventId: string | null = null;
  results.push(
    await check("dataset", "passing_path", smokeRun.smokeRunId, async () => {
      const res = await fetch(`${BASE_URL}/v1/events`);
      if (!res.ok) throw new Error(`events status ${res.status}`);
      const json = await res.json();
      if (!json.items || json.items.length === 0) {
        throw new Error("no events returned");
      }
      sampleEventId = json.items[0].eventId;
    })
  );

  if (!sampleEventId) {
    console.error("No sample event id; aborting further checks.");
    console.log("OVERALL: FAIL");
    process.exit(1);
  }

  // Verifier
  results.push(
    await check("verifier", "passing_path", smokeRun.smokeRunId, async () => {
      const res = await fetch(
        `${BASE_URL}/v1/events/${encodeURIComponent(
          sampleEventId as string
        )}/verify`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(`verify status ${res.status}`);
      const json = await res.json();
      if (!json.verification_state) {
        throw new Error("missing verification_state");
      }
      if (!json.verification_run_id) {
        throw new Error("missing verification_run_id");
      }
      if (!json.transcript_id) {
        throw new Error("missing transcript_id");
      }
    })
  );

  // Verification run read (passing path)
  let sampleVerificationRunId: string | null = null;
  results.push(
    await check(
      "verification_run_read",
      "passing_path",
      smokeRun.smokeRunId,
      async () => {
      const res = await fetch(
        `${BASE_URL}/v1/events/${encodeURIComponent(
          sampleEventId as string
        )}/verify`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(`verify status ${res.status}`);
      const json = await res.json();
      sampleVerificationRunId = json.verification_run_id;
      if (!sampleVerificationRunId) throw new Error("missing verification_run_id");

      const getRes = await fetch(
        `${BASE_URL}/v1/verifications/${encodeURIComponent(sampleVerificationRunId)}`
      );
      if (!getRes.ok) throw new Error(`verification run get status ${getRes.status}`);
      const getJson = await getRes.json();
      if (getJson.verification_run_id !== sampleVerificationRunId) {
        throw new Error("verification_run_id mismatch");
      }
      if (!getJson.transcript_id) throw new Error("missing transcript_id on read");
      if (!Array.isArray(getJson.transcript_summary) || getJson.transcript_summary.length === 0) {
        throw new Error("transcript_summary missing or empty");
      }
      }
    )
  );

  // Claims export chain (JSON)
  results.push(
    await check(
      "claims_export_chain",
      "passing_path",
      smokeRun.smokeRunId,
      async () => {
      const event = await prisma.event.findUnique({
        where: { eventId: sampleEventId as string },
      });
      if (!event) throw new Error("event not found in DB");

      const res = await fetch(
        `${BASE_URL}/v1/events/${encodeURIComponent(
          sampleEventId as string
        )}/exports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: "claims",
            format: "json",
            purpose: "smoke_claims_chain",
          }),
        }
      );
      if (!res.ok) throw new Error(`claims export create status ${res.status}`);
      const meta = await res.json();
      const exportId: string = meta.export_id;
      const receiptId: string = meta.receipt_id;
      if (!exportId || !receiptId) {
        throw new Error("missing export_id or receipt_id in response");
      }

      const dl = await fetch(`${BASE_URL}/v1/exports/${exportId}/download`);
      if (!dl.ok) throw new Error(`claims download status ${dl.status}`);
      const contentType = dl.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(`unexpected content-type: ${contentType}`);
      }
      const payload = await dl.json();
      if (payload.export_id !== exportId) {
        throw new Error("export_id mismatch in downloaded payload");
      }
      if (payload.receipt_id !== receiptId) {
        throw new Error("receipt_id mismatch in downloaded payload");
      }

      const dbExport = await prisma.export.findUnique({
        where: { exportId },
      });
      if (!dbExport) throw new Error("export record not found in DB");
      if (dbExport.eventId !== event.id) {
        throw new Error("export.eventId does not match requested event");
      }

      const dbReceipt = await prisma.receipt.findUnique({
        where: { receiptId },
      });
      if (!dbReceipt) throw new Error("receipt record not found in DB");
      if (dbReceipt.exportId !== dbExport.id) {
        throw new Error("receipt.exportId does not reference created export");
      }
      }
    )
  );

  // Legal export chain (PDF)
  results.push(
    await check(
      "legal_export_chain",
      "passing_path",
      smokeRun.smokeRunId,
      async () => {
      const event = await prisma.event.findUnique({
        where: { eventId: sampleEventId as string },
      });
      if (!event) throw new Error("event not found in DB");

      const res = await fetch(
        `${BASE_URL}/v1/events/${encodeURIComponent(
          sampleEventId as string
        )}/exports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: "legal",
            format: "pdf",
            purpose: "smoke_legal_chain",
          }),
        }
      );
      if (!res.ok) throw new Error(`legal export create status ${res.status}`);
      const meta = await res.json();
      const exportId: string = meta.export_id;
      const receiptId: string = meta.receipt_id;
      if (!exportId || !receiptId) {
        throw new Error("missing export_id or receipt_id in response");
      }

      const dl = await fetch(`${BASE_URL}/v1/exports/${exportId}/download`);
      if (!dl.ok) throw new Error(`legal download status ${dl.status}`);
      const contentType = dl.headers.get("content-type") ?? "";
      if (!contentType.includes("application/pdf")) {
        throw new Error(`unexpected content-type: ${contentType}`);
      }

      const dbExport = await prisma.export.findUnique({
        where: { exportId },
      });
      if (!dbExport) throw new Error("export record not found in DB");
      if (dbExport.eventId !== event.id) {
        throw new Error("export.eventId does not match requested event");
      }

      const dbReceipt = await prisma.receipt.findUnique({
        where: { receiptId },
      });
      if (!dbReceipt) throw new Error("receipt record not found in DB");
      if (dbReceipt.exportId !== dbExport.id) {
        throw new Error("receipt.exportId does not reference created export");
      }
      }
    )
  );

  // PDF multi-page validation via internal fixture
  results.push(
    await check(
      "pdf_multipage_fixture",
      "passing_path",
      smokeRun.smokeRunId,
      async () => {
      const res = await fetch(
        `${BASE_URL}/v1/system/pdf-fixture/claims-long`
      );
      if (!res.ok) throw new Error(`pdf fixture status ${res.status}`);
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/pdf")) {
        throw new Error(`unexpected content-type: ${contentType}`);
      }
      const pagesHeader = res.headers.get("x-qaraqutu-pages");
      const pages = pagesHeader ? parseInt(pagesHeader, 10) : NaN;
      if (!pagesHeader || !Number.isFinite(pages) || pages < 2) {
        throw new Error(
          `expected multi-page PDF, got pages header: ${pagesHeader}`
        );
      }
      // Drain body to completion
      await res.arrayBuffer();
    }
    )
  );

  console.log("FAILING PATH TESTS");

  // invalid eventId on verify
  results.push(
    await check(
      "invalid_verify_eventId",
      "failing_path",
      smokeRun.smokeRunId,
      async () => {
      const beforeRuns = await prisma.verificationRun.count();
      const res = await fetch(
        `${BASE_URL}/v1/events/INVALID-EVENT-ID/verify`,
        { method: "POST" }
      );
      if (res.status !== 404) {
        throw new Error(`expected 404, got ${res.status}`);
      }
      const json = await res.json();
      if (!json || json.error !== "EVENT_NOT_FOUND") {
        throw new Error(`unexpected error payload: ${JSON.stringify(json)}`);
      }
      const afterRuns = await prisma.verificationRun.count();
      if (beforeRuns !== afterRuns) {
        throw new Error("verification run created for invalid eventId");
      }
    }
    )
  );

  // invalid verification run lookup
  results.push(
    await check(
      "invalid_verification_run_lookup",
      "failing_path",
      smokeRun.smokeRunId,
      async () => {
      const res = await fetch(
        `${BASE_URL}/v1/verifications/INVALID-VERIFICATION-RUN-ID`
      );
      if (res.status !== 404) {
        throw new Error(`expected 404, got ${res.status}`);
      }
      const json = await res.json();
      if (!json || json.error !== "VERIFICATION_RUN_NOT_FOUND") {
        throw new Error(`unexpected error payload: ${JSON.stringify(json)}`);
      }
    }
    )
  );

  // invalid exportId on download
  results.push(
    await check(
      "invalid_exportId_download",
      "failing_path",
      smokeRun.smokeRunId,
      async () => {
      const beforeExports = await prisma.export.count();
      const beforeReceipts = await prisma.receipt.count();

      const res = await fetch(`${BASE_URL}/v1/exports/INVALID-EXPORT-ID/download`);
      if (res.status !== 404) {
        throw new Error(`expected 404, got ${res.status}`);
      }
      const json = await res.json();
      if (!json || json.error !== "EXPORT_NOT_FOUND") {
        throw new Error(`unexpected error payload: ${JSON.stringify(json)}`);
      }

      const afterExports = await prisma.export.count();
      const afterReceipts = await prisma.receipt.count();
      if (beforeExports !== afterExports || beforeReceipts !== afterReceipts) {
        throw new Error("unexpected export/receipt mutation on invalid exportId");
      }
    }
    )
  );

  // unsupported export profile
  results.push(
    await check(
      "unsupported_export_profile",
      "failing_path",
      smokeRun.smokeRunId,
      async () => {
      const res = await fetch(
        `${BASE_URL}/v1/events/${encodeURIComponent(
          sampleEventId as string
        )}/exports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: "unsupported_profile",
            format: "json",
            purpose: "smoke_unsupported_profile",
          }),
        }
      );
      if (res.status !== 400) {
        throw new Error(`expected 400, got ${res.status}`);
      }
      const json = await res.json();
      if (!json || json.error !== "UNSUPPORTED_EXPORT_REQUEST") {
        throw new Error(`unexpected error payload: ${JSON.stringify(json)}`);
      }
    }
    )
  );

  // unsupported export format
  results.push(
    await check(
      "unsupported_export_format",
      "failing_path",
      smokeRun.smokeRunId,
      async () => {
      const res = await fetch(
        `${BASE_URL}/v1/events/${encodeURIComponent(
          sampleEventId as string
        )}/exports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: "claims",
            format: "txt",
            purpose: "smoke_unsupported_format",
          }),
        }
      );
      if (res.status !== 400) {
        throw new Error(`expected 400, got ${res.status}`);
      }
      const json = await res.json();
      if (!json || json.error !== "UNSUPPORTED_EXPORT_REQUEST") {
        throw new Error(`unexpected error payload: ${JSON.stringify(json)}`);
      }
    }
    )
  );

  // tenant policy: profile not allowed
  results.push(
    await check(
      "policy_profile_not_allowed",
      "failing_path",
      smokeRun.smokeRunId,
      async () => {
        const tenant = await prisma.tenant.findFirst();
        if (!tenant) throw new Error("no tenant for policy test");

        const existingPolicy = await prisma.tenantPolicy.findUnique({
          where: { tenantId: tenant.id },
        });

        const originalProfiles =
          existingPolicy?.enabledExportProfiles ?? ["claims", "legal"];

        const updatedProfiles =
          originalProfiles.includes("claims") && originalProfiles.length > 1
            ? originalProfiles.filter((p) => p !== "claims")
            : ["legal"];

        await prisma.tenantPolicy.upsert({
          where: { tenantId: tenant.id },
          update: { enabledExportProfiles: updatedProfiles },
          create: {
            tenantId: tenant.id,
            enabledExportProfiles: updatedProfiles,
            enabledVisibilityClasses: [
              "claims_review",
              "legal_review",
              "technical_review",
              "restricted_internal",
            ],
            redactionEnabled: true,
          },
        });

        const beforeExports = await prisma.export.count();
        const beforeReceipts = await prisma.receipt.count();

        const res = await fetch(
          `${BASE_URL}/v1/events/${encodeURIComponent(
            sampleEventId as string
          )}/exports`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profile: "claims",
              format: "json",
              purpose: "smoke_policy_profile_not_allowed",
            }),
          }
        );
        if (res.status !== 403) {
          throw new Error(`expected 403, got ${res.status}`);
        }
        const json = await res.json();
        if (!json || json.error !== "POLICY_EXPORT_PROFILE_NOT_ALLOWED") {
          throw new Error(
            `unexpected error payload: ${JSON.stringify(json)}`
          );
        }

        const afterExports = await prisma.export.count();
        const afterReceipts = await prisma.receipt.count();
        if (beforeExports !== afterExports || beforeReceipts !== afterReceipts) {
          throw new Error(
            "unexpected export/receipt mutation on policy profile rejection"
          );
        }

        // restore original policy
        if (existingPolicy) {
          await prisma.tenantPolicy.update({
            where: { id: existingPolicy.id },
            data: {
              enabledExportProfiles: originalProfiles,
            },
          });
        }
      }
    )
  );

  // invalid eventId on export creation
  results.push(
    await check(
      "invalid_event_on_export_creation",
      "failing_path",
      smokeRun.smokeRunId,
      async () => {
      const res = await fetch(
        `${BASE_URL}/v1/events/INVALID-EVENT-ID/exports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: "claims",
            format: "json",
            purpose: "smoke_invalid_event",
          }),
        }
      );
      if (res.status !== 404) {
        throw new Error(`expected 404, got ${res.status}`);
      }
      const json = await res.json();
      if (!json || json.error !== "EVENT_NOT_FOUND") {
        throw new Error(`unexpected error payload: ${JSON.stringify(json)}`);
      }
    }
    )
  );

  // claims redaction enforced
  results.push(
    await check(
      "claims_redaction_enforced",
      "failing_path",
      smokeRun.smokeRunId,
      async () => {
        const res = await fetch(
          `${BASE_URL}/v1/events/${encodeURIComponent(
            sampleEventId as string
          )}/exports`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profile: "claims",
              format: "json",
              purpose: "smoke_claims_redaction",
            }),
          }
        );
        if (!res.ok) {
          throw new Error(`claims export create status ${res.status}`);
        }
        const meta = await res.json();
        const exportId: string = meta.export_id;

        const dl = await fetch(`${BASE_URL}/v1/exports/${exportId}/download`);
        if (!dl.ok) throw new Error(`claims download status ${dl.status}`);
        const payload = await dl.json();

        const rec = payload.recorded_evidence ?? [];
        const der = payload.derived_evidence ?? [];

        const hasRestricted =
          [...rec, ...der].some(
            (item: any) => item.visibility_class === "restricted_internal"
          );
        if (hasRestricted) {
          throw new Error(
            "restricted_internal evidence leaked into claims export"
          );
        }

        if (!payload.redaction_applied) {
          throw new Error("expected redaction_applied === true");
        }
        if (
          typeof payload.redacted_item_count !== "number" ||
          payload.redacted_item_count <= 0
        ) {
          throw new Error("expected redacted_item_count > 0");
        }
        if (!payload.redaction_basis) {
          throw new Error("expected redaction_basis to be present");
        }
      }
    )
  );

  // legal redaction enforced
  results.push(
    await check(
      "legal_redaction_enforced",
      "failing_path",
      smokeRun.smokeRunId,
      async () => {
        const res = await fetch(
          `${BASE_URL}/v1/events/${encodeURIComponent(
            sampleEventId as string
          )}/exports`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profile: "legal",
              format: "json",
              purpose: "smoke_legal_redaction",
            }),
          }
        );
        if (!res.ok) {
          throw new Error(`legal export create status ${res.status}`);
        }
        const meta = await res.json();
        const exportId: string = meta.export_id;

        const dl = await fetch(`${BASE_URL}/v1/exports/${exportId}/download`);
        if (!dl.ok) throw new Error(`legal download status ${dl.status}`);
        const payload = await dl.json();

        const rec = payload.recorded_evidence ?? [];
        const der = payload.derived_evidence ?? [];
        const all = [...rec, ...der];

        const leaksRestricted = all.some(
          (item: any) => item.visibility_class === "restricted_internal"
        );
        if (leaksRestricted) {
          throw new Error(
            "restricted_internal evidence leaked into legal export"
          );
        }

        const hasLegalOrTechnical = all.some(
          (item: any) =>
            item.visibility_class === "legal_review" ||
            item.visibility_class === "technical_review"
        );
        if (!hasLegalOrTechnical) {
          throw new Error(
            "expected legal or technical review items to remain in legal export"
          );
        }

        if (!payload.redaction_applied) {
          throw new Error("expected redaction_applied === true");
        }
        if (
          typeof payload.redacted_item_count !== "number" ||
          payload.redacted_item_count <= 0
        ) {
          throw new Error("expected redacted_item_count > 0");
        }
        if (!payload.redaction_basis) {
          throw new Error("expected redaction_basis to be present");
        }
      }
    )
  );

  // policy visibility violation (redaction disabled)
  results.push(
    await check(
      "policy_visibility_violation",
      "failing_path",
      smokeRun.smokeRunId,
      async () => {
        const tenant = await prisma.tenant.findFirst();
        if (!tenant) throw new Error("no tenant for policy visibility test");

        const existingPolicy = await prisma.tenantPolicy.findUnique({
          where: { tenantId: tenant.id },
        });

        const enabledExportProfiles =
          existingPolicy?.enabledExportProfiles ?? ["claims", "legal"];
        const enabledVisibilityClasses =
          existingPolicy?.enabledVisibilityClasses ?? [
            "claims_review",
            "legal_review",
            "technical_review",
            "restricted_internal",
          ];

        // Force redaction off while keeping classes so exclusions will be required.
        const updated = await prisma.tenantPolicy.upsert({
          where: { tenantId: tenant.id },
          update: {
            enabledExportProfiles,
            enabledVisibilityClasses,
            redactionEnabled: false,
          },
          create: {
            tenantId: tenant.id,
            enabledExportProfiles,
            enabledVisibilityClasses,
            redactionEnabled: false,
          },
        });

        const beforeExports = await prisma.export.count();
        const beforeReceipts = await prisma.receipt.count();

        const res = await fetch(
          `${BASE_URL}/v1/events/${encodeURIComponent(
            sampleEventId as string
          )}/exports`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profile: "claims",
              format: "json",
              purpose: "smoke_policy_visibility_violation",
            }),
          }
        );
        if (res.status !== 403) {
          throw new Error(`expected 403, got ${res.status}`);
        }
        const json = await res.json();
        if (!json || json.error !== "POLICY_VISIBILITY_VIOLATION") {
          throw new Error(
            `unexpected error payload: ${JSON.stringify(json)}`
          );
        }

        const afterExports = await prisma.export.count();
        const afterReceipts = await prisma.receipt.count();
        if (beforeExports !== afterExports || beforeReceipts !== afterReceipts) {
          throw new Error(
            "unexpected export/receipt mutation on policy visibility violation"
          );
        }

        // restore original redactionEnabled if policy existed
        if (existingPolicy) {
          await prisma.tenantPolicy.update({
            where: { id: updated.id },
            data: {
              redactionEnabled: existingPolicy.redactionEnabled,
            },
          });
        }
      }
    )
  );

  // missing receipt/export linkage (synthetic)
  results.push(
    await check(
      "missing_receipt_linkage_synthetic",
      "failing_path",
      smokeRun.smokeRunId,
      async () => {
      const event = await prisma.event.findFirst();
      if (!event) throw new Error("no event for synthetic linkage test");

      const bundle = await prisma.bundle.findFirst({ where: { eventId: event.id } });
      const manifest = bundle
        ? await prisma.manifest.findFirst({ where: { bundleId: bundle.id } })
        : null;
      if (!bundle || !manifest) {
        throw new Error("no bundle/manifest for synthetic linkage test");
      }

      // Create an export without a receipt
      const syntheticExport = await prisma.export.create({
        data: {
          exportId: `QEX-SYNTHETIC-${Date.now()}`,
          eventId: event.id,
          bundleId: bundle.id,
          manifestId: manifest.id,
          profile: "claims",
          format: "json",
          purpose: "smoke_synthetic_missing_receipt",
          verificationState: event.verificationState as VerificationState,
        },
      });

      try {
        const receipt = await prisma.receipt.findFirst({
          where: { exportId: syntheticExport.id },
        });
        if (receipt) {
          throw new Error("expected no receipt linked to synthetic export");
        }
      } finally {
        // cleanup synthetic export
        await prisma.export.delete({ where: { id: syntheticExport.id } });
      }
    }
    )
  );

  // transcript missing for verification run (run exists, transcript deleted)
  results.push(
    await check(
      "transcript_missing_for_run",
      "failing_path",
      smokeRun.smokeRunId,
      async () => {
      const res = await fetch(
        `${BASE_URL}/v1/events/${encodeURIComponent(
          sampleEventId as string
        )}/verify`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(`verify status ${res.status}`);
      const json = await res.json();
      const runId = json.verification_run_id;
      const transcriptId = json.transcript_id;
      if (!runId || !transcriptId) throw new Error("missing run or transcript id");

      const run = await prisma.verificationRun.findUnique({
        where: { verificationRunId: runId },
        include: { transcript: { include: { steps: true } } },
      });
      if (!run?.transcript) throw new Error("run or transcript not found in DB");
      await prisma.verificationTranscriptStep.deleteMany({
        where: { transcriptId: run.transcript.id },
      });
      await prisma.verificationTranscript.delete({
        where: { id: run.transcript.id },
      });

      const getRes = await fetch(`${BASE_URL}/v1/verifications/${encodeURIComponent(runId)}`);
      if (!getRes.ok) throw new Error(`get verification run status ${getRes.status}`);
      const getJson = await getRes.json();
      if (getJson.transcript_id != null) {
        throw new Error("expected transcript_id null when transcript missing");
      }
      if (
        !Array.isArray(getJson.transcript_summary) ||
        getJson.transcript_summary.length !== 0
      ) {
        throw new Error("expected transcript_summary [] when transcript missing");
      }
    }
    )
  );

  const overall = results.every(Boolean);
  console.log(`OVERALL: ${overall ? "PASS" : "FAIL"}`);
  await prisma.smokeRun.update({
    where: { smokeRunId: smokeRun.smokeRunId },
    data: {
      overallResult: overall ? "PASS" : "FAIL",
      finishedAt: new Date(),
    },
  });
  await prisma.$disconnect();

  if (!overall) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Smoke execution failed: ${err?.message ?? String(err)}`);
  prisma
    .smokeRun.create({
      data: {
        smokeRunId: `QSR-${randomUUID()}`,
        overallResult: "FAIL",
        startedAt: new Date(),
        finishedAt: new Date(),
        environment: process.env.NODE_ENV ?? "development",
        datasetVersion: process.env.DEMO_DATASET_VERSION ?? "demo-v1",
        buildVersion: process.env.BUILD_VERSION ?? "0.1.0",
        schemaVersion: "v1",
      },
    })
    .catch(() => undefined)
    .finally(() => {
      prisma
        .$disconnect()
        .catch(() => undefined)
        .finally(() => {
          console.log("OVERALL: FAIL");
          process.exit(1);
        });
    });
});

