import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://qaraqutu-api.vercel.app"
    : "http://localhost:4000");

type UploadedSystem = "vehicle" | "drone" | "robot";
type UploadedSeverity = "low" | "medium" | "high";

interface UploadedPackageEnvelope {
  package_id: string;
  uploaded_at: string;
  system: UploadedSystem;
  incident_class: string;
  title: string;
  summary: string;
  bundle_id: string;
  manifest_id: string;
  severity?: UploadedSeverity;
  package_name: string;
  package_sha256: string;
  package_size_bytes: number;
}

interface UploadedPackageRequest {
  service: string;
  contract: string;
  envelope: UploadedPackageEnvelope;
}

interface UploadedPackageAuditMetadata {
  accepted_at: string;
  source_lane: "uploaded_package";
  contract_version: string;
  service_id: string;
}

interface UploadedPackageReadResponse {
  state: "waiting" | "available";
  event: UploadedPackageEnvelope | null;
  audit: UploadedPackageAuditMetadata | null;
}

const UPLOADED_SERVICE_ID = "uploaded_package_shell";
const UPLOADED_CONTRACT_ID = "qaraqutu.uploaded_package.ingest.v1";
const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/i;

function normalizeSecret(raw: string | undefined): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUploadedSystem(value: unknown): value is UploadedSystem {
  return value === "vehicle" || value === "drone" || value === "robot";
}

function isUploadedSeverity(value: unknown): value is UploadedSeverity {
  return value === "low" || value === "medium" || value === "high";
}

function validateUploadedEnvelope(payload: unknown): { ok: true; envelope: UploadedPackageEnvelope } | { ok: false; reason: string } {
  if (!isObjectLike(payload)) {
    return { ok: false, reason: "payload_object_required" };
  }

  const service = typeof payload.service === "string" ? payload.service.trim() : "";
  const contract = typeof payload.contract === "string" ? payload.contract.trim() : "";

  if (service !== UPLOADED_SERVICE_ID) {
    return { ok: false, reason: "invalid_service" };
  }

  if (contract !== UPLOADED_CONTRACT_ID) {
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

  if (!isUploadedSystem(system)) {
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

  if (typeof severityRaw !== "undefined" && !isUploadedSeverity(severityRaw)) {
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
      severity: isUploadedSeverity(severityRaw) ? severityRaw : "medium",
      package_name: packageName,
      package_sha256: packageSha256.toLowerCase(),
      package_size_bytes: packageSize,
    },
  };
}

function isAuthenticatedIngestRequest(request: Request, expectedToken: string): boolean {
  const authHeader = request.headers.get("authorization")?.trim() ?? "";
  const accessHeader = request.headers.get("x-uploaded-package-access")?.trim() ?? "";

  return authHeader === `Bearer ${expectedToken}` && accessHeader === expectedToken;
}

export async function GET() {
  try {
    const upstream = await fetch(`${API_BASE}/v1/uploaded-package-ingest`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const json = (await upstream.json().catch(() => null)) as UploadedPackageReadResponse | null;
    if (!upstream.ok || !json?.state) {
      return NextResponse.json<UploadedPackageReadResponse>({ state: "waiting", event: null, audit: null }, { status: 200 });
    }

    return NextResponse.json<UploadedPackageReadResponse>(json, { status: 200 });
  } catch {
    return NextResponse.json<UploadedPackageReadResponse>({ state: "waiting", event: null, audit: null }, { status: 200 });
  }
}

export async function POST(request: Request) {
  const accessToken = normalizeSecret(process.env.UPLOADED_PACKAGE_ACCESS_TOKEN);
  if (!accessToken) {
    return NextResponse.json({ error: "uploaded_package_ingest_unconfigured" }, { status: 503 });
  }

  if (!isAuthenticatedIngestRequest(request, accessToken)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = validateUploadedEnvelope(body);

  if (!validated.ok) {
    return NextResponse.json({ error: "invalid_uploaded_package_envelope", reason: validated.reason }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${API_BASE}/v1/uploaded-package-ingest`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "x-uploaded-package-access": accessToken,
      },
      body: JSON.stringify({
        service: UPLOADED_SERVICE_ID,
        contract: UPLOADED_CONTRACT_ID,
        envelope: validated.envelope,
      } satisfies UploadedPackageRequest),
    });

    const json = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      const errorPayload = isObjectLike(json) ? json : { error: "uploaded_package_ingest_upstream_unavailable" };
      return NextResponse.json(errorPayload, { status: upstream.status });
    }

    return NextResponse.json(json, { status: 202 });
  } catch {
    return NextResponse.json({ error: "uploaded_package_ingest_upstream_unavailable" }, { status: 503 });
  }
}
