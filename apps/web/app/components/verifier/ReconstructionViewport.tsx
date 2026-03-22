"use client";

import type { CSSProperties } from "react";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

export type ReconstructionSystem = "vehicle" | "drone" | "robot";

export type ReconstructionViewportProps = {
  language: "en" | "tr";
  system: ReconstructionSystem;
  /** Canonical incident class from case registry */
  incidentClass: string | null;
  eventId: string | null;
  title: string | null;
  verificationState: string | null;
};

function stableHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function fmtCoord(seed: number, base: number, decimals: number): string {
  const v = base + (seed % 1000) / 10000;
  return v.toFixed(decimals);
}

type SceneKind =
  | "vehicle_near_miss"
  | "vehicle_collision"
  | "drone_link"
  | "drone_mission"
  | "robot_public"
  | "robot_stop"
  | "empty";

function resolveSceneKind(system: ReconstructionSystem, incidentClass: string | null): SceneKind {
  if (!incidentClass) return "empty";
  if (system === "vehicle") {
    if (incidentClass === "near_miss") return "vehicle_near_miss";
    if (incidentClass === "collision") return "vehicle_collision";
    return "vehicle_near_miss";
  }
  if (system === "drone") {
    if (incidentClass === "link_loss") return "drone_link";
    if (incidentClass === "mission_anomaly") return "drone_mission";
    return "drone_mission";
  }
  if (system === "robot") {
    if (incidentClass === "public_interaction") return "robot_public";
    if (incidentClass === "safety_stop") return "robot_stop";
    return "robot_public";
  }
  return "empty";
}

const panel: CSSProperties = {
  border: "1px solid var(--border-strong)",
  borderRadius: 2,
  background: "var(--panel)",
  overflow: "hidden",
};

const labelBar: CSSProperties = {
  padding: "0.32rem 0.55rem",
  borderBottom: "1px solid var(--border-strong)",
  background: "var(--panel-raised)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
};

const accentOrange = "var(--accent)";
const mutedLine = "var(--border-strong)";
const gridLine = "var(--border-muted)";

function VehicleNearMissScene() {
  return (
    <svg viewBox="0 0 360 200" width="100%" height="200" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ display: "block" }}>
      <rect x="0" y="0" width="360" height="200" fill="var(--bg)" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={40 + i * 90} y1="20" x2={40 + i * 90} y2="180" stroke={gridLine} strokeWidth="0.75" opacity={0.85} />
      ))}
      {[0, 1, 2].map((i) => (
        <line key={`h${i}`} x1="20" y1={50 + i * 55} x2="340" y2={50 + i * 55} stroke={gridLine} strokeWidth="0.75" opacity={0.65} />
      ))}
      <rect x="95" y="78" width="88" height="36" rx="2" fill="var(--panel-card)" stroke={mutedLine} strokeWidth="1.2" />
      <text x="139" y="100" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily={MONO}>
        EGO
      </text>
      <rect x="38" y="72" width="52" height="30" rx="2" fill="var(--accent-soft)" stroke={accentOrange} strokeWidth="1.2" opacity={0.95} />
      <text x="64" y="90" textAnchor="middle" fill="var(--accent)" fontSize="8" fontFamily={MONO} fontWeight={700}>
        OTHER
      </text>
      <line x1="200" y1="128" x2="320" y2="128" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 3" opacity={0.9} />
      <rect x="248" y="118" width="64" height="18" rx="1" fill="none" stroke={accentOrange} strokeWidth="1" opacity={0.85} />
      <text x="280" y="130" textAnchor="middle" fill="var(--text-dim)" fontSize="7" fontFamily={MONO}>
        WINDOW
      </text>
      <text x="180" y="44" textAnchor="middle" fill="var(--text-dim)" fontSize="8" fontFamily={MONO} letterSpacing="0.06em">
        CORRIDOR · LANES
      </text>
    </svg>
  );
}

function VehicleCollisionScene() {
  return (
    <svg viewBox="0 0 360 200" width="100%" height="200" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ display: "block" }}>
      <rect x="0" y="0" width="360" height="200" fill="var(--bg)" />
      <path d="M 40 160 L 200 40 L 320 40 L 320 160 Z" fill="none" stroke={gridLine} strokeWidth="1" />
      <line x1="200" y1="40" x2="200" y2="160" stroke={gridLine} strokeWidth="0.8" strokeDasharray="3 3" />
      <rect x="120" y="95" width="70" height="32" rx="2" fill="var(--panel-card)" stroke={mutedLine} strokeWidth="1.2" />
      <text x="155" y="114" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily={MONO}>
        EGO
      </text>
      <rect x="210" y="88" width="56" height="28" rx="2" fill="var(--accent-soft)" stroke={accentOrange} strokeWidth="1.2" />
      <text x="238" y="105" textAnchor="middle" fill="var(--accent)" fontSize="8" fontFamily={MONO} fontWeight={700}>
        CONTACT
      </text>
      <circle cx="238" cy="118" r="14" fill="none" stroke={accentOrange} strokeWidth="1.2" opacity={0.75} />
      <text x="180" y="28" textAnchor="middle" fill="var(--text-dim)" fontSize="8" fontFamily={MONO}>
        INTERSECTION · LOCUS
      </text>
    </svg>
  );
}

function DroneLinkScene() {
  return (
    <svg viewBox="0 0 360 200" width="100%" height="200" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ display: "block" }}>
      <rect x="0" y="0" width="360" height="200" fill="var(--bg)" />
      <rect x="60" y="40" width="240" height="120" fill="none" stroke={gridLine} strokeWidth="1" />
      <path d="M 80 130 Q 180 60 280 100" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="5 4" />
      <path d="M 200 95 L 240 75" fill="none" stroke={accentOrange} strokeWidth="1.8" strokeLinecap="square" />
      <polygon points="240,75 232,78 235,70" fill={accentOrange} />
      <rect x="248" y="58" width="72" height="22" rx="1" fill="var(--panel-card)" stroke={mutedLine} strokeWidth="1" />
      <text x="284" y="73" textAnchor="middle" fill="var(--text-dim)" fontSize="7.5" fontFamily={MONO}>
        RTH / FAILSAFE
      </text>
      <text x="180" y="28" textAnchor="middle" fill="var(--text-dim)" fontSize="8" fontFamily={MONO}>
        PATH · LINK STATE
      </text>
    </svg>
  );
}

function DroneMissionScene() {
  return (
    <svg viewBox="0 0 360 200" width="100%" height="200" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ display: "block" }}>
      <rect x="0" y="0" width="360" height="200" fill="var(--bg)" />
      <rect x="70" y="50" width="220" height="100" fill="var(--panel-raised)" stroke={gridLine} strokeWidth="1" />
      <line x1="70" y1="100" x2="290" y2="100" stroke={gridLine} strokeWidth="0.6" strokeDasharray="4 4" />
      <path d="M 100 120 L 160 75 L 220 110 L 260 85" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" />
      <polygon points="260,85 252,88 255,80" fill="var(--text-muted)" />
      <rect x="95" y="125" width="48" height="16" rx="1" fill="var(--accent-soft)" stroke={accentOrange} strokeWidth="1" />
      <text x="119" y="136" textAnchor="middle" fill="var(--accent)" fontSize="7" fontFamily={MONO}>
        DEV
      </text>
      <text x="180" y="38" textAnchor="middle" fill="var(--text-dim)" fontSize="8" fontFamily={MONO}>
        CORRIDOR · MISSION
      </text>
    </svg>
  );
}

function RobotPublicScene() {
  return (
    <svg viewBox="0 0 360 200" width="100%" height="200" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ display: "block" }}>
      <rect x="0" y="0" width="360" height="200" fill="var(--bg)" />
      <rect x="80" y="45" width="200" height="110" fill="none" stroke={gridLine} strokeWidth="1.2" />
      <rect x="120" y="70" width="72" height="48" rx="2" fill="var(--panel-card)" stroke={mutedLine} strokeWidth="1" />
      <text x="156" y="96" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily={MONO}>
        CELL
      </text>
      <path d="M 240 130 A 35 35 0 0 1 205 115" fill="none" stroke={accentOrange} strokeWidth="1.2" opacity={0.9} />
      <text x="252" y="128" textAnchor="start" fill="var(--text-dim)" fontSize="7" fontFamily={MONO}>
        PROX
      </text>
      <text x="180" y="32" textAnchor="middle" fill="var(--text-dim)" fontSize="8" fontFamily={MONO}>
        WORKCELL · HUMAN FIELD
      </text>
    </svg>
  );
}

function RobotStopScene() {
  return (
    <svg viewBox="0 0 360 200" width="100%" height="200" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ display: "block" }}>
      <rect x="0" y="0" width="360" height="200" fill="var(--bg)" />
      <rect x="70" y="55" width="220" height="90" fill="var(--panel-raised)" stroke={gridLine} strokeWidth="1" strokeDasharray="6 4" />
      <rect x="145" y="85" width="70" height="36" rx="2" fill="var(--panel-card)" stroke={mutedLine} strokeWidth="1.2" />
      <text x="180" y="107" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily={MONO}>
        STOP
      </text>
      <line x1="40" y1="100" x2="65" y2="100" stroke={accentOrange} strokeWidth="2" />
      <text x="32" y="104" textAnchor="end" fill="var(--text-dim)" fontSize="7" fontFamily={MONO}>
        PLC
      </text>
      <text x="180" y="38" textAnchor="middle" fill="var(--text-dim)" fontSize="8" fontFamily={MONO}>
        SAFETY · EXCLUSION
      </text>
    </svg>
  );
}

function EmptyScene({ language }: { language: "en" | "tr" }) {
  return (
    <div
      style={{
        minHeight: 168,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        borderTop: `1px solid var(--border-muted)`,
      }}
    >
      <p style={{ margin: 0, fontFamily: MONO, fontSize: "0.78rem", color: "var(--text-dim)", letterSpacing: "0.06em", textAlign: "center", padding: "0 1rem" }}>
        {language === "tr" ? "Olay seçildiğinde mekânsal bağlam burada çözülür." : "Spatial context resolves when an event is selected."}
      </p>
    </div>
  );
}

function TelemetryStrip({
  language,
  system,
  seed,
}: {
  language: "en" | "tr";
  system: ReconstructionSystem;
  seed: number;
}) {
  const t0 = 8 + (seed % 5);
  const marks = [0, 1, 2, 3, 4].map((i) => `${t0 + i * 2}s`);

  const rows =
    system === "vehicle"
      ? language === "tr"
        ? [
            { k: "SPD", v: `${38 + (seed % 12)}→${12 + (seed % 8)} km/h` },
            { k: "BRK", v: seed % 2 ? "REQ · ON" : "REQ · RAMP" },
            { k: "STR", v: `${(seed % 7) - 3} N·m` },
            { k: "CTL", v: "ADS / DRV" },
          ]
        : [
            { k: "SPD", v: `${38 + (seed % 12)}→${12 + (seed % 8)} km/h` },
            { k: "BRK", v: seed % 2 ? "REQ · ON" : "REQ · RAMP" },
            { k: "STR", v: `${(seed % 7) - 3} N·m` },
            { k: "CTL", v: "ADS / DRV" },
          ]
      : system === "drone"
        ? language === "tr"
          ? [
              { k: "ALT", v: `${42 + (seed % 20)} m` },
              { k: "LNK", v: seed % 3 ? "DEG" : "NOM" },
              { k: "CMD", v: "OP / AUTO" },
            ]
          : [
              { k: "ALT", v: `${42 + (seed % 20)} m` },
              { k: "LNK", v: seed % 3 ? "DEG" : "NOM" },
              { k: "CMD", v: "OP / AUTO" },
            ]
        : language === "tr"
          ? [
              { k: "SPD", v: `${0.3 + (seed % 5) / 10} m/s` },
              { k: "ZONE", v: `Z${(seed % 4) + 1}` },
              { k: "STP", v: "SAFE" },
            ]
          : [
              { k: "SPD", v: `${0.3 + (seed % 5) / 10} m/s` },
              { k: "ZONE", v: `Z${(seed % 4) + 1}` },
              { k: "STP", v: "SAFE" },
            ];

  return (
    <div
      style={{
        borderTop: "1px solid var(--border-strong)",
        background: "var(--panel-raised)",
        padding: "0.4rem 0.5rem 0.45rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
        <span style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.14em", color: "var(--text-dim)", fontWeight: 700 }}>
          {language === "tr" ? "ZAMAN ŞERİDİ" : "TIME BAND"}
        </span>
        <div style={{ flex: 1, minWidth: 120, display: "flex", gap: "0.15rem", alignItems: "center" }}>
          {marks.map((m, i) => (
            <span
              key={m}
              style={{
                flex: 1,
                textAlign: "center",
                fontFamily: MONO,
                fontSize: "0.65rem",
                color: i === 2 ? "var(--accent)" : "var(--text-muted)",
                borderBottom: i === 2 ? "2px solid var(--accent)" : "1px solid var(--border)",
                paddingBottom: "0.12rem",
              }}
            >
              {m}
            </span>
          ))}
        </div>
        <span style={{ fontFamily: MONO, fontSize: "0.62rem", color: "var(--text-dim)" }}>±WIN</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`, gap: "0.35rem" }}>
        {rows.map((row) => (
          <div key={row.k} style={{ border: "1px solid var(--border)", borderRadius: 2, padding: "0.28rem 0.35rem", background: "var(--panel)" }}>
            <div style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.1em", color: "var(--text-dim)", marginBottom: "0.12rem" }}>{row.k}</div>
            <div style={{ fontFamily: MONO, fontSize: "0.74rem", color: "var(--text-soft)", fontWeight: 600 }}>{row.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReconstructionViewport(props: ReconstructionViewportProps) {
  const { language, system, incidentClass, eventId, title, verificationState } = props;
  const scene = resolveSceneKind(system, incidentClass);
  const seed = eventId ? stableHash(eventId) : 0;
  const lat = eventId ? fmtCoord(seed, 41.0, 4) : "—";
  const lon = eventId ? fmtCoord(seed + 7, 28.9, 4) : "—";
  const zone =
    incidentClass === "near_miss"
      ? "URB-COR"
      : incidentClass === "collision"
        ? "IXN"
        : incidentClass === "link_loss"
          ? "RF-LINK"
          : incidentClass === "mission_anomaly"
            ? "OPS-COR"
            : incidentClass === "public_interaction"
              ? "CELL-A"
              : incidentClass === "safety_stop"
                ? "SAFE-Z"
                : "—";
  const conf =
    verificationState === "PASS" ? "0.94" : verificationState === "FAIL" ? "0.61" : verificationState === "UNKNOWN" ? "0.72" : "—";

  const titleBar =
    language === "tr" ? "Mühürlü yeniden oluşturma görünümü" : "Sealed reconstruction view";

  return (
    <section
      style={{ ...panel, marginBottom: "0.85rem" }}
      aria-label={language === "tr" ? "Olay mekânı yeniden oluşturma" : "Event spatial reconstruction"}
    >
      <div style={labelBar}>
        <span style={{ fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
          {titleBar}
        </span>
        <span style={{ fontFamily: MONO, fontSize: "0.62rem", color: "var(--text-muted)", maxWidth: "42%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={title ?? ""}>
          {eventId ? `${system.toUpperCase()} · ${title ?? incidentClass ?? ""}` : "—"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 148px", gap: 0, alignItems: "stretch" }}>
        <div style={{ borderRight: "1px solid var(--border-strong)", minWidth: 0 }}>
          {scene === "empty" && <EmptyScene language={language} />}
          {scene === "vehicle_near_miss" && <VehicleNearMissScene />}
          {scene === "vehicle_collision" && <VehicleCollisionScene />}
          {scene === "drone_link" && <DroneLinkScene />}
          {scene === "drone_mission" && <DroneMissionScene />}
          {scene === "robot_public" && <RobotPublicScene />}
          {scene === "robot_stop" && <RobotStopScene />}
        </div>
        <aside
          style={{
            padding: "0.45rem 0.5rem",
            background: "var(--panel-raised)",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            justifyContent: "flex-start",
          }}
          aria-label={language === "tr" ? "Sahne meta" : "Scene meta"}
        >
          {(
            [
              { k: "LAT", v: lat },
              { k: "LON", v: lon },
              { k: "ZONE", v: zone },
              { k: "CONF", v: conf },
            ] as const
          ).map((row) => (
            <div key={row.k}>
              <div style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.12em", color: "var(--text-dim)", marginBottom: "0.08rem" }}>{row.k}</div>
              <div style={{ fontFamily: MONO, fontSize: "0.76rem", color: "var(--text-soft)", fontWeight: 600, wordBreak: "break-all" }}>{row.v}</div>
            </div>
          ))}
        </aside>
      </div>

      {eventId ? <TelemetryStrip language={language} system={system} seed={seed} /> : null}
    </section>
  );
}
