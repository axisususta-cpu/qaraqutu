"use client";

import type { Lang } from "../../../lib/i18n/messages";
import { MSG } from "../../../lib/i18n/messages";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function Tile({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--panel-card)",
        padding: "0.75rem 0.85rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.68rem",
          fontWeight: 700,
          color: "var(--accent)",
          letterSpacing: "0.04em",
        }}
      >
        {title}
      </div>
      <p style={{ margin: 0, fontSize: "0.78rem", lineHeight: 1.5, color: "var(--text-soft)", fontFamily: SANS }}>{body}</p>
    </div>
  );
}

export function HomeRoleInstitutionGrid({ lang }: { lang: Lang }) {
  const m = MSG[lang];
  const produce = [
    { title: m.homeRoleFieldTitle, body: m.homeRoleFieldBody },
    { title: m.homeRoleTechnicalTitle, body: m.homeRoleTechnicalBody },
    { title: m.homeRoleOversightTitle, body: m.homeRoleOversightBody },
  ];
  const consume = [
    { title: m.homeRoleInsuranceTitle, body: m.homeRoleInsuranceBody },
    { title: m.homeRoleLegalTitle, body: m.homeRoleLegalBody },
    { title: m.homeRoleMuniTitle, body: m.homeRoleMuniBody },
  ];
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "0.75rem",
  } as const;

  return (
    <div>
      <p
        style={{
          margin: "0 0 1.1rem",
          fontSize: "0.84rem",
          lineHeight: 1.55,
          color: "var(--text-soft)",
          maxWidth: 820,
        }}
      >
        {m.homeRoleGridSubtitle}
      </p>

      <div style={{ marginBottom: "1.35rem" }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "0.4rem",
          }}
        >
          {m.homeRoleProduceTitle}
        </div>
        <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", lineHeight: 1.55, color: "var(--text-muted)", maxWidth: 860 }}>
          {m.homeRoleProduceLead}
        </p>
        <div className="home-role-institution-grid" style={gridStyle}>
          {produce.map((t) => (
            <Tile key={t.title} title={t.title} body={t.body} />
          ))}
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "0.4rem",
          }}
        >
          {m.homeRoleConsumeTitle}
        </div>
        <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", lineHeight: 1.55, color: "var(--text-muted)", maxWidth: 860 }}>
          {m.homeRoleConsumeLead}
        </p>
        <div className="home-role-institution-grid" style={gridStyle}>
          {consume.map((t) => (
            <Tile key={t.title} title={t.title} body={t.body} />
          ))}
        </div>
      </div>
    </div>
  );
}
