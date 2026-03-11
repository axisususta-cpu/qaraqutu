"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CanonicalEvent, VerificationState } from "contracts";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface TranscriptStep {
  step: number;
  check: string;
  result: string;
  note: string;
}

export default function VerifierPage() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<CanonicalEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [verificationState, setVerificationState] =
    useState<VerificationState | null>(null);
  const [transcript, setTranscript] = useState<TranscriptStep[] | null>(null);
  const [identity, setIdentity] = useState<{
    event_id: string;
    bundle_id: string;
    manifest_id: string;
  } | null>(null);
  const [verificationRunId, setVerificationRunId] = useState<string | null>(null);
  const [transcriptId, setTranscriptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_BASE}/v1/events`);
      const json = await res.json();
      const items: CanonicalEvent[] = json.items ?? [];
      setEvents(items);
      if (items.length) {
        const requestedId = searchParams.get("eventId");
        const match =
          requestedId && items.find((ev) => ev.eventId === requestedId);
        setSelectedId(match ? match.eventId : items[0].eventId);
      }
    }
    load();
  }, [searchParams]);

  const selected = events.find((e) => e.eventId === selectedId) ?? null;

  async function runVerification() {
    if (!selectedId) return;
    setLoading(true);
    setVerificationState(null);
    setTranscript(null);
    setIdentity(null);
    setVerificationRunId(null);
    setTranscriptId(null);

    const res = await fetch(`${API_BASE}/v1/events/${selectedId}/verify`, {
      method: "POST",
    });
    const json = await res.json();
    setVerificationState(json.verification_state as VerificationState);
    setTranscript(json.transcript_summary ?? null);
    setIdentity({
      event_id: json.event_id,
      bundle_id: json.bundle_id,
      manifest_id: json.manifest_id,
    });
    if (json.verification_run_id) setVerificationRunId(json.verification_run_id);
    if (json.transcript_id) setTranscriptId(json.transcript_id);
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#E5E7EB",
        padding: "1.5rem 2rem",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.7,
              }}
            >
              Verifier
            </div>
            <h1 style={{ fontSize: "1.4rem", margin: 0 }}>
              Event Package Verification
            </h1>
            <p style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "0.25rem" }}>
              Verification is a bounded assessment of the referenced event
              package. It does not make liability or guilt determinations.
            </p>
          </div>
        </header>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Select Event
          </h2>
          <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
            Choose a seeded event to verify its bundle and manifest linkage.
          </p>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              marginTop: "0.5rem",
              padding: "0.4rem 0.6rem",
              background: "#020617",
              color: "#E5E7EB",
              border: "1px solid #374151",
              borderRadius: 4,
              fontSize: "0.85rem",
            }}
          >
            {events.map((ev) => (
              <option key={ev.eventId} value={ev.eventId}>
                {ev.scenarioKey} — {ev.eventId}
              </option>
            ))}
          </select>
          <div style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              onClick={runVerification}
              disabled={!selectedId || loading}
              style={{
                fontSize: "0.85rem",
                padding: "0.4rem 0.8rem",
                borderRadius: 4,
                border: "1px solid #374151",
                background: "#0B1120",
                color: "#E5E7EB",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Verifying…" : "Verify Event Package"}
            </button>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Verification Result
          </h2>
          {!verificationState && !transcript && (
            <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              No verification has been run yet. Select an event and start
              verification to see its current verification state and a concise
              transcript summary.
            </p>
          )}

          {verificationState && identity && (
            <div
              style={{
                border: "1px solid #1F2937",
                borderRadius: 6,
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.7,
                }}
              >
                Verification State
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                {verificationState}
              </div>
              {(verificationRunId || transcriptId) && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.9 }}>
                  {verificationRunId && <div>Verification run ID: {verificationRunId}</div>}
                  {transcriptId && <div>Transcript ID: {transcriptId}</div>}
                </div>
              )}
              <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
                <div>Event ID: {identity.event_id}</div>
                <div>Bundle ID: {identity.bundle_id}</div>
                <div>Manifest ID: {identity.manifest_id}</div>
              </div>
            </div>
          )}

          {transcript && (
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.7,
                  marginBottom: "0.25rem",
                }}
              >
                Transcript Summary
              </div>
              <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
                {transcript.map((step) => (
                  <li key={step.step}>
                    <strong>{step.check}</strong> — {step.result} — {step.note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

