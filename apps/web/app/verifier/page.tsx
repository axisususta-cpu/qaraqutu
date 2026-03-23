import { Suspense } from "react";
import { VerifierContent } from "./VerifierContent";

/** Verifier-shaped shell so initial load does not present as a broken or stuck page. */
function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        padding: "1.5rem 2rem",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Doğrulayıcı
          </div>
          <h1 style={{ fontSize: "1.4rem", margin: 0 }}>Olay Paketi Doğrulaması</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-soft)", marginTop: "0.25rem" }}>
            Referans verilen olay paketi için sınırlı inceleme yüzeyi.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem" }}>
          <aside style={{ width: 280, borderRight: "1px solid var(--border)", paddingRight: "1rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Komut omurgası</div>
            <div style={{ padding: "0.5rem 0", fontSize: "0.8rem", color: "var(--text-soft)" }}>
              Kaynak → Cihaz ailesi → Olay sınıfı → Olay paketi
            </div>
          </aside>
          <main style={{ flex: 1 }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--text-muted)", minHeight: 120 }} aria-hidden="true" />
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
