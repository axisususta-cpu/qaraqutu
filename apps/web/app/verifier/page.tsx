import { Suspense } from "react";
import { VerifierContent } from "./VerifierContent";

function LoadingFallback() {
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
        <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>Loading…</p>
      </div>
    </div>
  );
}

export default async function VerifierPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const p = await searchParams;
  const initialEventId = p?.eventId ?? undefined;
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifierContent initialEventId={initialEventId} />
    </Suspense>
  );
}
