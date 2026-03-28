"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

type AccessRequestItem = {
  id: string;
  email: string;
  name_or_org: string;
  requested_surface: string;
  optional_reason: string | null;
  requested_role: string;
  status: string;
  requested_at: string;
  approved_at: string | null;
  approved_by: string | null;
  denied_at: string | null;
  denied_by: string | null;
};

type IssuedCredentialItem = {
  id: string;
  email: string;
  name_or_org: string | null;
  role: string;
  requested_surface: string;
  issued_by: string;
  issued_at: string;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
};

type AccessIssuancePayload = {
  actor: string;
  pending: AccessRequestItem[];
  approved: AccessRequestItem[];
  denied: AccessRequestItem[];
  recent_issued: IssuedCredentialItem[];
};

type IssuanceResult = {
  email: string;
  requested_surface: string;
  role: string;
  temporary_password: string;
  issued_at: string;
  expires_at: string;
  issued_by: string;
};

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("tr-TR");
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return email;
  }

  if (local.length <= 2) {
    return `**@${domain}`;
  }

  return `${local.slice(0, 2)}***@${domain}`;
}

function PanelList({
  title,
  items,
  emptyLabel = "Kayıt yok.",
  children,
}: {
  title: string;
  items: AccessRequestItem[];
  emptyLabel?: string;
  children?: (item: AccessRequestItem) => ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--panel-card)",
        padding: "0.85rem 0.95rem",
      }}
    >
      <h3 style={{ margin: 0, marginBottom: "0.55rem", fontSize: "0.88rem" }}>{title}</h3>
      {items.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                borderRadius: 8,
                border: "1px solid var(--border)",
                padding: "0.7rem",
                background: "var(--panel)",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", fontSize: "0.79rem" }}>
                <strong>{item.email}</strong>
                <span>{item.name_or_org}</span>
                <span style={{ color: "var(--text-muted)" }}>{item.requested_surface}</span>
              </div>
              {item.optional_reason ? (
                <p style={{ fontSize: "0.78rem", color: "var(--text-soft)", margin: "0.45rem 0 0" }}>
                  {item.optional_reason}
                </p>
              ) : null}
              <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: "0.45rem 0 0" }}>
                talep: {formatDate(item.requested_at)}
                {item.approved_at ? ` · onay: ${formatDate(item.approved_at)} · ${item.approved_by ?? "-"}` : ""}
                {item.denied_at ? ` · ret: ${formatDate(item.denied_at)} · ${item.denied_by ?? "-"}` : ""}
              </p>
              {children ? <div style={{ marginTop: "0.65rem" }}>{children(item)}</div> : null}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>{emptyLabel}</p>
      )}
    </div>
  );
}

export function AccessIssuancePanel() {
  const [data, setData] = useState<AccessIssuancePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [issuing, startIssuing] = useTransition();
  const [issuanceResult, setIssuanceResult] = useState<IssuanceResult | null>(null);

  async function load() {
    const res = await fetch("/api/admin/access-issuance", { cache: "no-store" });
    const json = (await res.json().catch(() => ({}))) as AccessIssuancePayload & { error?: string };
    if (!res.ok) {
      throw new Error(json.error ?? `HTTP ${res.status}`);
    }
    setData(json);
  }

  useEffect(() => {
    load().catch((cause) => {
      setError(cause instanceof Error ? cause.message : "Erişim yetkilendirme durumu yüklenemedi");
    });
  }, []);

  function resolveRequest(requestId: string, action: "approve" | "deny") {
    setError(null);
    startIssuing(async () => {
      try {
        const res = await fetch("/api/admin/access-issuance", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId, action }),
        });
        const json = (await res.json().catch(() => ({}))) as
          | ({ error?: string } & Partial<IssuanceResult>)
          | undefined;
        if (!res.ok) {
          throw new Error(json?.error ?? `HTTP ${res.status}`);
        }

        if (action === "approve" && json?.temporary_password && json.email && json.requested_surface && json.role && json.issued_at && json.expires_at && json.issued_by) {
          setIssuanceResult({
            email: json.email,
            requested_surface: json.requested_surface,
            role: json.role,
            temporary_password: json.temporary_password,
            issued_at: json.issued_at,
            expires_at: json.expires_at,
            issued_by: json.issued_by,
          });
        } else {
          setIssuanceResult(null);
        }

        await load();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Erişim yetkilendirme işlemi başarısız oldu");
      }
    });
  }

  return (
    <section
      style={{
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--panel)",
        padding: "0.95rem 1.05rem 1.05rem",
        fontFamily: SANS,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: "1rem", margin: 0, marginBottom: "0.45rem" }}>Erişim yetkilendirme akışı</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-soft)", margin: 0, lineHeight: 1.55 }}>
            Owner onayına bağlı geçici erişim hattı. Öncelik sırası: bekleyen talepler, onaylanan talepler ve son verilen geçici erişimler.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIssuanceResult(null);
            load().catch((cause) => {
              setError(cause instanceof Error ? cause.message : "Erişim yetkilendirme durumu yenilenemedi");
            });
          }}
          style={{
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--panel-card)",
            color: "var(--text)",
            padding: "0.45rem 0.7rem",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          Yenile
        </button>
      </div>

      {error ? (
        <div
          style={{
            marginTop: "0.8rem",
            borderRadius: 10,
            border: "1px solid var(--error)",
            background: "var(--error-soft)",
            padding: "0.65rem 0.75rem",
            fontSize: "0.8rem",
          }}
        >
          {error}
        </div>
      ) : null}

      {issuanceResult ? (
        <div
          style={{
            marginTop: "0.8rem",
            borderRadius: 10,
            border: "1px solid var(--accent)",
            background: "var(--accent-soft)",
            padding: "0.75rem 0.85rem",
          }}
        >
          <div style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>
            Geçici erişim verildi. Düz metin parola yalnız bu yetkilendirme anında görünür.
          </div>
          <div style={{ fontFamily: MONO, fontSize: "0.8rem", lineHeight: 1.7 }}>
            <div>e-posta: {issuanceResult.email}</div>
            <div>yüzey: {issuanceResult.requested_surface}</div>
            <div>rol: {issuanceResult.role}</div>
            <div>geçici parola: {issuanceResult.temporary_password}</div>
            <div>yetkilendiren: {issuanceResult.issued_by}</div>
            <div>verildi: {formatDate(issuanceResult.issued_at)}</div>
            <div>süresi dolar: {formatDate(issuanceResult.expires_at)}</div>
          </div>
        </div>
      ) : null}

      {!data ? (
        <p style={{ margin: "0.9rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>Yetkilendirme durumu yükleniyor...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
            {[
              `Bekleyen: ${data.pending.length}`,
              `Onaylanan: ${data.approved.length}`,
              `Son verilen: ${data.recent_issued.length}`,
              `Reddedilen: ${data.denied.length}`,
            ].map((chip) => (
              <span
                key={chip}
                style={{
                  borderRadius: 999,
                  border: "1px solid var(--border)",
                  background: "var(--panel-card)",
                  padding: "0.15rem 0.55rem",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                {chip}
              </span>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.8fr) minmax(0, 1fr)",
              gap: "1rem",
              marginTop: "0.85rem",
            }}
          >
            <div
              style={{
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--panel-card)",
                padding: "0.9rem 0.95rem",
              }}
            >
              <h3 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "0.95rem" }}>
                Bekleyen talepler ({data.pending.length})
              </h3>
              {data.pending.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                  {data.pending.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "var(--panel)",
                        padding: "0.7rem",
                      }}
                    >
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", fontSize: "0.8rem" }}>
                        <strong>{item.email}</strong>
                        <span>{item.name_or_org}</span>
                        <span style={{ color: "var(--text-muted)" }}>{item.requested_surface}</span>
                      </div>
                      {item.optional_reason ? (
                        <p style={{ fontSize: "0.78rem", color: "var(--text-soft)", margin: "0.4rem 0 0" }}>
                          {item.optional_reason}
                        </p>
                      ) : null}
                      <p style={{ margin: "0.4rem 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                        talep: {formatDate(item.requested_at)}
                      </p>
                      <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
                        <button
                          type="button"
                          disabled={issuing}
                          onClick={() => resolveRequest(item.id, "approve")}
                          style={{
                            borderRadius: 10,
                            border: "1px solid var(--accent)",
                            background: "var(--accent-soft)",
                            color: "var(--text)",
                            padding: "0.45rem 0.72rem",
                            cursor: issuing ? "not-allowed" : "pointer",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                          }}
                        >
                          Onayla
                        </button>
                        <button
                          type="button"
                          disabled={issuing}
                          onClick={() => resolveRequest(item.id, "deny")}
                          style={{
                            borderRadius: 10,
                            border: "1px solid var(--border)",
                            background: "var(--panel-card)",
                            color: "var(--text)",
                            padding: "0.45rem 0.72rem",
                            cursor: issuing ? "not-allowed" : "pointer",
                            fontSize: "0.78rem",
                          }}
                        >
                          Reddet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Bekleyen talep yok.
                </p>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <PanelList
                title={`Onaylanan talepler (${data.approved.length})`}
                items={data.approved.slice(0, 8)}
                emptyLabel="Onaylanan talep yok."
              />

              <div
                style={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--panel-card)",
                  padding: "0.85rem 0.95rem",
                }}
              >
                <h3 style={{ margin: 0, marginBottom: "0.55rem", fontSize: "0.88rem" }}>
                  Son verilen geçici erişimler ({data.recent_issued.length})
                </h3>
                {data.recent_issued.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                    {data.recent_issued.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        style={{
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          background: "var(--panel)",
                          padding: "0.65rem",
                          fontSize: "0.78rem",
                        }}
                      >
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                          <strong>{maskEmail(item.email)}</strong>
                          <span>{item.name_or_org ?? "-"}</span>
                        </div>
                        <div style={{ marginTop: "0.35rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
                          <div>yüzey: {item.requested_surface}</div>
                          <div>rol: {item.role}</div>
                          <div>yetkilendiren: {item.issued_by}</div>
                          <div>verildi: {formatDate(item.issued_at)}</div>
                          <div>süresi: {formatDate(item.expires_at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Henüz verilmiş geçici erişim yok.
                  </p>
                )}
              </div>

              <PanelList
                title={`Reddedilen talepler (${data.denied.length})`}
                items={data.denied.slice(0, 6)}
                emptyLabel="Reddedilen talep yok."
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
