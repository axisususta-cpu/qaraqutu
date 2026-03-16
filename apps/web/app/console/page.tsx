"use client";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const UI = {
  bg: "#060d1a",
  panel: "#0a1628",
  border: "#1a2d4a",
  text: "#e8eef8",
  textSoft: "#b8cce0",
  textMuted: "#7a95b8",
} as const;

export default function ConsolePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: UI.bg,
        color: UI.text,
        padding: "1.75rem 2rem",
        fontFamily: SANS,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <section style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>
            Canonical event console — reserved shell
          </h1>
          <p style={{ fontSize: "0.84rem", color: UI.textSoft, maxWidth: 680, lineHeight: 1.6 }}>
            This surface is reserved for canonical event review with a clear recorded vs derived separation.
            It is distinct from the landing page and Verifier and will host the event console in this acceptance slice.
          </p>
        </section>
        <section>
          <div
            style={{
              borderRadius: 12,
              border: `1px dashed ${UI.border}`,
              background: UI.panel,
              padding: "1.1rem 1.15rem 1.25rem",
              maxWidth: 740,
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: UI.textMuted,
                marginBottom: "0.45rem",
                fontFamily: MONO,
              }}
            >
              Reserved protocol shell
            </div>
            <p
              style={{
                fontSize: "0.84rem",
                color: UI.textSoft,
                margin: 0,
                marginBottom: "0.45rem",
                lineHeight: 1.6,
              }}
            >
              In this version, the console does not yet expose full canonical event navigation. It holds a future
              position for deeper recorded vs derived exploration without changing the verifier-first product shape.
            </p>
            <p
              style={{
                fontSize: "0.78rem",
                color: UI.textMuted,
                margin: 0,
              }}
            >
              No external integrations, partner logos, or endorsements are implied here. This is a protocol surface,
              not a marketing surface.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

