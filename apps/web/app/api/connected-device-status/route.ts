import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ConnectedDeviceRuntimeState =
  | "unconfigured"
  | "configured_unverified"
  | "ready"
  | "unavailable";

interface ConnectedDeviceStatusResponse {
  state: ConnectedDeviceRuntimeState;
}

interface ConnectedDeviceHandshakePayload {
  service: string;
  contract: string;
  status: string;
}

const PILOT_SERVICE_ID = "connected_device_pilot";
const PILOT_CONTRACT_ID = "qaraqutu.connected_device.health.v1";
const PILOT_READY_STATUS = "ready";

function normalizeSecret(raw: string | undefined): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function normalizeTimeout(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 3000;
  }
  return Math.min(parsed, 15000);
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeHandshakePayload(payload: unknown): ConnectedDeviceHandshakePayload | null {
  if (!isObjectLike(payload)) {
    return null;
  }

  const service = typeof payload.service === "string" ? payload.service.trim() : "";
  const contract = typeof payload.contract === "string" ? payload.contract.trim() : "";
  const status = typeof payload.status === "string" ? payload.status.trim().toLowerCase() : "";

  if (!service || !contract || !status) {
    return null;
  }

  return { service, contract, status };
}

function isTrustedPilotHandshake(payload: ConnectedDeviceHandshakePayload | null): boolean {
  if (!payload) {
    return false;
  }

  return (
    payload.service === PILOT_SERVICE_ID &&
    payload.contract === PILOT_CONTRACT_ID &&
    payload.status === PILOT_READY_STATUS
  );
}

export async function GET() {
  const baseUrl = normalizeSecret(process.env.CONNECTED_DEVICE_BASE_URL);
  const accessToken = normalizeSecret(process.env.CONNECTED_DEVICE_ACCESS_TOKEN);
  const timeoutMs = normalizeTimeout(process.env.CONNECTED_DEVICE_TIMEOUT_MS);

  if (!baseUrl || !accessToken) {
    return NextResponse.json<ConnectedDeviceStatusResponse>({ state: "unconfigured" }, { status: 200 });
  }

  let probeUrl: URL;
  try {
    probeUrl = new URL("/health", baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  } catch {
    return NextResponse.json<ConnectedDeviceStatusResponse>({ state: "configured_unverified" }, { status: 200 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const authRes = await fetch(probeUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-connected-device-access": accessToken,
        Accept: "application/json",
      },
    });

    // Strict contract: only mark as ready when auth succeeds and anonymous access is rejected.
    const anonymousRes = await fetch(probeUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    }).catch(() => null);

    const anonymousRejected = anonymousRes?.status === 401 || anonymousRes?.status === 403;

    const authPayload = authRes.ok
      ? normalizeHandshakePayload(await authRes.json().catch(() => null))
      : null;
    const trustedHandshake = isTrustedPilotHandshake(authPayload);

    if (authRes.ok && anonymousRejected && trustedHandshake) {
      return NextResponse.json<ConnectedDeviceStatusResponse>({ state: "ready" }, { status: 200 });
    }

    if (
      authRes.ok ||
      authRes.status === 401 ||
      authRes.status === 403 ||
      authRes.status === 404
    ) {
      return NextResponse.json<ConnectedDeviceStatusResponse>({ state: "configured_unverified" }, { status: 200 });
    }

    return NextResponse.json<ConnectedDeviceStatusResponse>({ state: "unavailable" }, { status: 200 });
  } catch {
    return NextResponse.json<ConnectedDeviceStatusResponse>({ state: "unavailable" }, { status: 200 });
  } finally {
    clearTimeout(timeout);
  }
}
