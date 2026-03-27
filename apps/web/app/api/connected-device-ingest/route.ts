import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000");

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

interface PilotIngestRequest {
  service: string;
  contract: string;
  envelope: PilotIngestEnvelope;
}

interface PilotIngestAuditMetadata {
  accepted_at: string;
  source_lane: "connected_device";
  contract_version: string;
  service_id: string;
}

interface PilotShellRecord {
  event: PilotIngestEnvelope;
  audit: PilotIngestAuditMetadata;
}

interface PilotIngestReadResponse {
  state: "waiting" | "available";
  event: PilotIngestEnvelope | null;
  audit: PilotIngestAuditMetadata | null;
}

const PILOT_SERVICE_ID = "connected_device_pilot";
const PILOT_INGEST_CONTRACT_ID = "qaraqutu.connected_device.ingest.v1";

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

function isAuthenticatedIngestRequest(request: Request, expectedToken: string): boolean {
  const authHeader = request.headers.get("authorization")?.trim() ?? "";
  const accessHeader = request.headers.get("x-connected-device-access")?.trim() ?? "";

  return authHeader === `Bearer ${expectedToken}` && accessHeader === expectedToken;
}

export async function GET() {
  try {
    const upstream = await fetch(`${API_BASE}/v1/connected-device-ingest`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const json = (await upstream.json().catch(() => null)) as PilotIngestReadResponse | null;
    if (!upstream.ok || !json?.state) {
      return NextResponse.json<PilotIngestReadResponse>({ state: "waiting", event: null, audit: null }, { status: 200 });
    }

    return NextResponse.json<PilotIngestReadResponse>(json, { status: 200 });
  } catch {
    return NextResponse.json<PilotIngestReadResponse>({ state: "waiting", event: null, audit: null }, { status: 200 });
  }
}

export async function POST(request: Request) {
  const accessToken = normalizeSecret(process.env.CONNECTED_DEVICE_ACCESS_TOKEN);
  if (!accessToken) {
    return NextResponse.json({ error: "pilot_ingest_unconfigured" }, { status: 503 });
  }

  if (!isAuthenticatedIngestRequest(request, accessToken)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = validatePilotEnvelope(body);

  if (!validated.ok) {
    return NextResponse.json({ error: "invalid_pilot_envelope", reason: validated.reason }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${API_BASE}/v1/connected-device-ingest`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "x-connected-device-access": accessToken,
      },
      body: JSON.stringify({
        service: PILOT_SERVICE_ID,
        contract: PILOT_INGEST_CONTRACT_ID,
        envelope: validated.envelope,
      } satisfies PilotIngestRequest),
    });

    const json = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      const errorPayload = isObjectLike(json) ? json : { error: "pilot_ingest_upstream_unavailable" };
      return NextResponse.json(errorPayload, { status: upstream.status });
    }

    return NextResponse.json(json, { status: 202 });
  } catch {
    return NextResponse.json({ error: "pilot_ingest_upstream_unavailable" }, { status: 503 });
  }
}