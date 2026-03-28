import { NextRequest, NextResponse } from "next/server";
import { accessPrisma } from "../../../../lib/access-db";
import { writeAccessAudit } from "../../../../lib/access-audit";
import { authenticateAccessAdmin } from "../../../../lib/access-admin";
import {
  TEMPORARY_ACCESS_TTL_MINUTES,
  createPasswordSalt,
  createTemporaryPassword,
  hashTemporaryPassword,
} from "../../../../lib/access-temporary";
import { getRequestIp, getUserAgent } from "../../../../lib/access-auth";

export const runtime = "nodejs";

function toRequestSummary(record: {
  id: string;
  email: string;
  nameOrOrg: string;
  requestedSurface: string;
  optionalReason: string | null;
  requestedRole: string;
  status: string;
  requestedAt: Date;
  approvedAt: Date | null;
  approvedBy: string | null;
  deniedAt: Date | null;
  deniedBy: string | null;
}) {
  return {
    id: record.id,
    email: record.email,
    name_or_org: record.nameOrOrg,
    requested_surface: record.requestedSurface,
    optional_reason: record.optionalReason,
    requested_role: record.requestedRole,
    status: record.status,
    requested_at: record.requestedAt.toISOString(),
    approved_at: record.approvedAt?.toISOString() ?? null,
    approved_by: record.approvedBy,
    denied_at: record.deniedAt?.toISOString() ?? null,
    denied_by: record.deniedBy,
  };
}

export async function GET(req: NextRequest) {
  const actor = await authenticateAccessAdmin(req);
  if (!actor) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const [pending, approved, denied, recentIssued] = await Promise.all([
    accessPrisma.accessRequest.findMany({
      where: { status: "pending" },
      orderBy: { requestedAt: "desc" },
      take: 20,
    }),
    accessPrisma.accessRequest.findMany({
      where: { status: "approved" },
      orderBy: { approvedAt: "desc" },
      take: 20,
    }),
    accessPrisma.accessRequest.findMany({
      where: { status: "denied" },
      orderBy: { deniedAt: "desc" },
      take: 20,
    }),
    accessPrisma.temporaryAccessCredential.findMany({
      orderBy: { issuedAt: "desc" },
      take: 20,
      select: {
        id: true,
        email: true,
        nameOrOrg: true,
        role: true,
        requestedSurface: true,
        issuedBy: true,
        issuedAt: true,
        expiresAt: true,
        usedAt: true,
        revokedAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    actor: actor.actorId,
    pending: pending.map(toRequestSummary),
    approved: approved.map(toRequestSummary),
    denied: denied.map(toRequestSummary),
    recent_issued: recentIssued.map((item) => ({
      id: item.id,
      email: item.email,
      name_or_org: item.nameOrOrg,
      role: item.role,
      requested_surface: item.requestedSurface,
      issued_by: item.issuedBy,
      issued_at: item.issuedAt.toISOString(),
      expires_at: item.expiresAt.toISOString(),
      used_at: item.usedAt?.toISOString() ?? null,
      revoked_at: item.revokedAt?.toISOString() ?? null,
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const actor = await authenticateAccessAdmin(req);
  if (!actor) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { requestId?: unknown; action?: unknown; deniedReason?: unknown }
    | null;

  const requestId = typeof body?.requestId === "string" ? body.requestId : "";
  const action = typeof body?.action === "string" ? body.action : "";
  const deniedReason = typeof body?.deniedReason === "string" ? body.deniedReason.trim() : "";
  const ip = getRequestIp(req);
  const userAgent = getUserAgent(req);

  if (!requestId || (action !== "approve" && action !== "deny")) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const accessRequest = await accessPrisma.accessRequest.findUnique({ where: { id: requestId } });
  if (!accessRequest) {
    return NextResponse.json({ error: "REQUEST_NOT_FOUND" }, { status: 404 });
  }

  if (accessRequest.status !== "pending") {
    return NextResponse.json({ error: "REQUEST_ALREADY_RESOLVED" }, { status: 409 });
  }

  if (action === "deny") {
    const deniedAt = new Date();
    await accessPrisma.accessRequest.update({
      where: { id: accessRequest.id },
      data: {
        status: "denied",
        deniedAt,
        deniedBy: actor.actorId,
        deniedReason: deniedReason || null,
      },
    });

    await writeAccessAudit({
      email: accessRequest.email,
      role: accessRequest.requestedRole,
      requestedNext: accessRequest.requestedSurface,
      result: "denied",
      reason: "manual_request_denied",
      ip,
      userAgent,
    });

    return NextResponse.json({ ok: true, status: "denied", denied_at: deniedAt.toISOString() });
  }

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + TEMPORARY_ACCESS_TTL_MINUTES * 60_000);
  const temporaryPassword = createTemporaryPassword();
  const passwordSalt = createPasswordSalt();
  const passwordHash = hashTemporaryPassword(temporaryPassword, passwordSalt);

  await accessPrisma.$transaction(async (tx) => {
    await tx.temporaryAccessCredential.updateMany({
      where: {
        email: accessRequest.email,
        revokedAt: null,
        usedAt: null,
      },
      data: {
        revokedAt: issuedAt,
        revokedBy: actor.actorId,
      },
    });

    await tx.temporaryAccessCredential.create({
      data: {
        requestId: accessRequest.id,
        email: accessRequest.email,
        nameOrOrg: accessRequest.nameOrOrg,
        role: accessRequest.requestedRole,
        requestedSurface: accessRequest.requestedSurface,
        passwordHash,
        passwordSalt,
        issuedBy: actor.actorId,
        issuedAt,
        expiresAt,
      },
    });

    await tx.accessRequest.update({
      where: { id: accessRequest.id },
      data: {
        status: "approved",
        approvedAt: issuedAt,
        approvedBy: actor.actorId,
      },
    });
  });

  await writeAccessAudit({
    email: accessRequest.email,
    role: accessRequest.requestedRole,
    requestedNext: accessRequest.requestedSurface,
    result: "approved",
    reason: "manual_temporary_credential_issued",
    ip,
    userAgent,
    expiresAt,
  });

  return NextResponse.json({
    ok: true,
    status: "approved",
    email: accessRequest.email,
    name_or_org: accessRequest.nameOrOrg,
    requested_surface: accessRequest.requestedSurface,
    role: accessRequest.requestedRole,
    temporary_password: temporaryPassword,
    issued_by: actor.actorId,
    issued_at: issuedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  });
}
