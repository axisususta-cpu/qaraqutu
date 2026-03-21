import { Suspense } from "react";
import { VerifierContent } from "./VerifierContent";
import { THEME } from "../../lib/theme";

/** Verifier-shaped shell so initial load does not present as a broken or stuck page. */
function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        padding: "1.5rem 2rem",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: THEME.textMuted }}>
            Verifier
          </div>
          <h1 style={{ fontSize: "1.4rem", margin: 0 }}>Event Package Verification</h1>
          <p style={{ fontSize: "0.8rem", color: THEME.textSoft, marginTop: "0.25rem" }}>
            A bounded assessment of the referenced event package.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem" }}>
          <aside style={{ width: 280, borderRight: `1px solid ${THEME.border}`, paddingRight: "1rem" }}>
            <div style={{ fontSize: "0.75rem", color: THEME.textMuted, marginBottom: "0.5rem" }}>Command Spine</div>
            <div style={{ padding: "0.5rem 0", fontSize: "0.8rem", color: THEME.textSoft }}>System → Scenario → Event</div>
          </aside>
          <main style={{ flex: 1 }}>
            <div style={{ border: `1px solid ${THEME.border}`, borderRadius: 6, padding: "0.75rem 1rem", fontSize: "0.8rem", color: THEME.textMuted, minHeight: 120 }} aria-hidden="true" />
          </main>
        </div>
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
