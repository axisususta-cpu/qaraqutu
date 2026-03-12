"use client";

export default function ConsolePage() {
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
        <section style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
            Canonical Event Console
          </h1>
          <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
            This surface is reserved for canonical event review with a clear
            recorded vs derived separation. It is distinct from the landing
            page and will host the event console in this acceptance slice.
          </p>
        </section>
      </div>
    </div>
  );
}

