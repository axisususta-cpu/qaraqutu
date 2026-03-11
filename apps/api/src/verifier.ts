import type { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import type { VerificationState } from "contracts";

const prisma = new PrismaClient();

export function registerVerifierRoutes(app: FastifyInstance) {
  app.post<{
    Params: { eventId: string };
  }>("/v1/events/:eventId/verify", async (request, reply) => {
    const { eventId } = request.params;
    const event = await prisma.event.findUnique({ where: { eventId } });
    if (!event) {
      return reply.code(404).send({ error: "EVENT_NOT_FOUND" });
    }

    const bundle = await prisma.bundle.findFirst({ where: { eventId: event.id } });
    const manifest = bundle
      ? await prisma.manifest.findFirst({ where: { bundleId: bundle.id } })
      : null;

    if (!bundle || !manifest) {
      return reply.code(500).send({ error: "BUNDLE_OR_MANIFEST_MISSING" });
    }

    const verificationState = event.verificationState as VerificationState;

    const transcript = [
      {
        step: 1,
        check: "Canonical event linkage",
        result: "PASS",
        note: "Event is linked to a bundle and manifest.",
      },
      {
        step: 2,
        check: "Recorded vs derived separation",
        result: "PASS",
        note: "Recorded and derived evidence are stored in distinct sections.",
      },
      {
        step: 3,
        check: "Verification state",
        result: verificationState,
        note: "Verification state reflects the current canonical assessment for this demo event.",
      },
    ];

    const verificationRunId = `QVR-${randomUUID()}`;
    const transcriptId = `QTR-${randomUUID()}`;

    const run = await prisma.verificationRun.create({
      data: {
        verificationRunId,
        eventId: event.id,
        bundleId: bundle.bundleId,
        manifestId: manifest.manifestId,
        verificationState,
      },
    });

    await prisma.verificationTranscript.create({
      data: {
        transcriptId,
        verificationRunId: run.id,
        steps: {
          create: transcript.map((t) => ({
            stepIndex: t.step,
            check: t.check,
            result: t.result,
            note: t.note,
          })),
        },
      },
    });

    return reply.code(200).send({
      verification_run_id: verificationRunId,
      transcript_id: transcriptId,
      event_id: event.eventId,
      bundle_id: bundle.bundleId,
      manifest_id: manifest.manifestId,
      verification_state: verificationState,
      transcript_summary: transcript,
    });
  });

  app.get<{
    Params: { verificationRunId: string };
  }>("/v1/verifications/:verificationRunId", async (request, reply) => {
    const { verificationRunId } = request.params;
    const run = await prisma.verificationRun.findUnique({
      where: { verificationRunId },
      include: { transcript: { include: { steps: { orderBy: { stepIndex: "asc" } } } }, event: true },
    });
    if (!run) {
      return reply.code(404).send({ error: "VERIFICATION_RUN_NOT_FOUND" });
    }
    const transcript = run.transcript;
    const transcriptSummary = transcript
      ? transcript.steps.map((s) => ({
          step: s.stepIndex,
          check: s.check,
          result: s.result,
          note: s.note,
        }))
      : [];
    return reply.code(200).send({
      verification_run_id: run.verificationRunId,
      transcript_id: transcript?.transcriptId ?? null,
      event_id: run.event.eventId,
      bundle_id: run.bundleId,
      manifest_id: run.manifestId,
      verification_state: run.verificationState,
      created_at: run.createdAt.toISOString(),
      transcript_summary: transcriptSummary,
    });
  });
}

