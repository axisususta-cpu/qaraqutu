"use client";

import type { CSSProperties } from "react";

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";

/** Minimum stage height: primary forensic workstation surface (scene-first) */
const STAGE_MIN_H = "clamp(360px, 52vh, 620px)";

export type ReconstructionSystem = "vehicle" | "drone" | "robot";

export type ReconstructionViewportProps = {
  language: "en" | "tr";
  system: ReconstructionSystem;
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
  | "idle_vehicle"
  | "idle_drone"
  | "idle_robot"
  | "vehicle_near_miss"
  | "vehicle_collision"
  | "drone_link"
  | "drone_mission"
  | "robot_public"
  | "robot_stop"
  | "unknown_package";

function resolveSceneKind(
  system: ReconstructionSystem,
  incidentClass: string | null,
  eventId: string | null
): SceneKind {
  if (!eventId) {
    if (system === "vehicle") return "idle_vehicle";
    if (system === "drone") return "idle_drone";
    return "idle_robot";
  }
  if (!incidentClass) return "unknown_package";
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
  return "unknown_package";
}

const panel: CSSProperties = {
  border: "2px solid var(--border-strong)",
  borderRadius: 2,
  background: "var(--panel)",
  overflow: "hidden",
  boxShadow: "none",
};

const labelBar: CSSProperties = {
  padding: "0.38rem 0.65rem",
  borderBottom: "1px solid var(--border-strong)",
  background: "var(--panel-raised)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.65rem",
};

const accentOrange = "var(--accent)";
const gridLine = "var(--border-muted)";
const mutedLine = "var(--border-strong)";

const svgBase = {
  display: "block" as const,
  width: "100%",
  height: "100%",
  minHeight: 240,
};

function familyGrammarLabel(system: ReconstructionSystem, language: "en" | "tr") {
  if (system === "vehicle") {
    return language === "tr"
      ? "ŞERİT · DUR ÇİZGİSİ · GEÇİŞ PENCERESİ"
      : "LANE · STOP LINE · CROSSING WINDOW";
  }
  if (system === "drone") {
    return language === "tr"
      ? "KORİDOR · İRTİFA · SINIR İHLAL VEKTÖRÜ"
      : "CORRIDOR · ALTITUDE · BOUNDARY VECTOR";
  }
  return language === "tr"
    ? "HÜCRE · GÜVENLİK ZARFI · YAKINLIK"
    : "WORKCELL · SAFETY ENVELOPE · PROXIMITY";
}

function VehicleIdleScene({ language }: { language: "en" | "tr" }) {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-hidden style={svgBase}>
      <rect width="640" height="360" fill="var(--panel-raised)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={50 + i * 110} y1="40" x2={50 + i * 110} y2="320" stroke={gridLine} strokeWidth="1" opacity={0.55} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`h${i}`} x1="30" y1={70 + i * 60} x2="610" y2={70 + i * 60} stroke={gridLine} strokeWidth="0.9" opacity={0.45} />
      ))}
      <text x="320" y="195" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily={MONO} letterSpacing="0.14em">
        {language === "tr" ? "KORİDOR · BEKLEMEDE" : "CORRIDOR · STANDBY"}
      </text>
      <text x="320" y="218" textAnchor="middle" fill="var(--text-dim)" fontSize="10" fontFamily={MONO}>
        {language === "tr" ? "Olay seçimi sonrası şerit modeli bağlanır" : "Lane model binds after event selection"}
      </text>
    </svg>
  );
}

function DroneIdleScene({ language }: { language: "en" | "tr" }) {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-hidden style={svgBase}>
      <rect width="640" height="360" fill="var(--panel-raised)" />
      <rect x="80" y="60" width="480" height="240" fill="none" stroke={gridLine} strokeWidth="1.2" strokeDasharray="8 6" />
      <circle cx="320" cy="180" r="8" fill="var(--text-muted)" opacity={0.35} />
      <path d="M 320 188 L 320 260" stroke={gridLine} strokeWidth="1" strokeDasharray="4 4" />
      <text x="320" y="150" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily={MONO} letterSpacing="0.12em">
        {language === "tr" ? "HAVA SAHASI · BEKLEMEDE" : "AIRSPACE · STANDBY"}
      </text>
      <text x="320" y="300" textAnchor="middle" fill="var(--text-dim)" fontSize="10" fontFamily={MONO}>
        {language === "tr" ? "Görev koridoru olay paketine göre yüklenir" : "Mission corridor loads from event package"}
      </text>
    </svg>
  );
}

function RobotIdleScene({ language }: { language: "en" | "tr" }) {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-hidden style={svgBase}>
      <rect width="640" height="360" fill="var(--panel-raised)" />
      <rect x="140" y="80" width="360" height="200" fill="none" stroke={gridLine} strokeWidth="1.4" />
      <rect x="260" y="140" width="120" height="80" rx="3" fill="var(--panel-card)" stroke={mutedLine} strokeWidth="1" opacity={0.7} />
      <text x="320" y="125" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily={MONO} letterSpacing="0.12em">
        {language === "tr" ? "HÜCRE · BEKLEMEDE" : "CELL · STANDBY"}
      </text>
      <text x="320" y="310" textAnchor="middle" fill="var(--text-dim)" fontSize="10" fontFamily={MONO}>
        {language === "tr" ? "Çalışma alanı ve güvenlik sınırı pakete bağlanır" : "Workcell & safety bounds bind to package"}
      </text>
    </svg>
  );
}

function UnknownPackageScene({ language }: { language: "en" | "tr" }) {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-hidden style={svgBase}>
      <rect width="640" height="360" fill="var(--panel-raised)" />
      <rect x="120" y="100" width="400" height="160" fill="var(--panel-card)" stroke={mutedLine} strokeWidth="1.2" strokeDasharray="6 4" />
      <text x="320" y="175" textAnchor="middle" fill="var(--text-muted)" fontSize="12" fontFamily={MONO} fontWeight={700}>
        {language === "tr" ? "PAKET META EKSİK" : "PACKAGE META INCOMPLETE"}
      </text>
      <text x="320" y="200" textAnchor="middle" fill="var(--text-dim)" fontSize="10" fontFamily={MONO}>
        {language === "tr" ? "Kanonik olay sınıfı bağlanamadı — genel düzlem" : "No canonical incident class — neutral plane"}
      </text>
    </svg>
  );
}

function VehicleNearMissScene() {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-hidden style={svgBase}>
      <rect width="640" height="360" fill="var(--panel-raised)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={45 + i * 115} y1="35" x2={45 + i * 115} y2="325" stroke={gridLine} strokeWidth="1" opacity={0.75} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`h${i}`} x1="25" y1={65 + i * 62} x2="615" y2={65 + i * 62} stroke={gridLine} strokeWidth="0.85" opacity={0.55} />
      ))}
      <text x="320" y="52" textAnchor="middle" fill="var(--text-dim)" fontSize="11" fontFamily={MONO} letterSpacing="0.1em">
        CORRIDOR · LANES · NEAR-MISS LOCUS
      </text>
      <rect x="270" y="155" width="120" height="52" rx="3" fill="var(--panel-card)" stroke={mutedLine} strokeWidth="1.4" />
      <text x="330" y="186" textAnchor="middle" fill="var(--text-muted)" fontSize="12" fontFamily={MONO} fontWeight={700}>
        EGO
      </text>
      <rect x="95" y="142" width="72" height="42" rx="3" fill="var(--accent-soft)" stroke={accentOrange} strokeWidth="1.5" />
      <text x="131" y="168" textAnchor="middle" fill="var(--accent)" fontSize="11" fontFamily={MONO} fontWeight={700}>
        OTHER
      </text>
      <line x1="380" y1="248" x2="580" y2="248" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6 4" opacity={0.95} />
      <rect x="420" y="228" width="120" height="32" rx="2" fill="none" stroke={accentOrange} strokeWidth="1.3" />
      <text x="480" y="248" textAnchor="middle" fill="var(--text-dim)" fontSize="10" fontFamily={MONO} fontWeight={700}>
        EVENT WINDOW
      </text>
    </svg>
  );
}

function VehicleCollisionScene() {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-hidden style={svgBase}>
      <rect width="640" height="360" fill="var(--panel-raised)" />
      <path d="M 60 300 L 320 50 L 580 50 L 580 300 Z" fill="none" stroke={gridLine} strokeWidth="1.2" />
      <line x1="320" y1="50" x2="320" y2="300" stroke={gridLine} strokeWidth="1" strokeDasharray="5 5" />
      <text x="320" y="38" textAnchor="middle" fill="var(--text-dim)" fontSize="11" fontFamily={MONO}>
        INTERSECTION · IMPACT LOCUS
      </text>
      <rect x="230" y="175" width="100" height="48" rx="3" fill="var(--panel-card)" stroke={mutedLine} strokeWidth="1.4" />
      <text x="280" y="204" textAnchor="middle" fill="var(--text-muted)" fontSize="12" fontFamily={MONO} fontWeight={700}>
        EGO
      </text>
      <rect x="360" y="162" width="88" height="44" rx="3" fill="var(--accent-soft)" stroke={accentOrange} strokeWidth="1.5" />
      <text x="404" y="188" textAnchor="middle" fill="var(--accent)" fontSize="11" fontFamily={MONO} fontWeight={700}>
        CONTACT
      </text>
      <circle cx="404" cy="218" r="36" fill="none" stroke={accentOrange} strokeWidth="1.5" opacity={0.8} />
    </svg>
  );
}

function DroneLinkScene() {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-hidden style={svgBase}>
      <rect width="640" height="360" fill="var(--panel-raised)" />
      <rect x="100" y="70" width="440" height="220" fill="none" stroke={gridLine} strokeWidth="1.2" />
      <path d="M 130 250 Q 320 80 510 200" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="8 5" />
      <path d="M 360 175 L 430 130" fill="none" stroke={accentOrange} strokeWidth="2.5" strokeLinecap="square" />
      <polygon points="430,130 418,135 422,122" fill={accentOrange} />
      <rect x="450" y="95" width="140" height="36" rx="2" fill="var(--panel-card)" stroke={mutedLine} strokeWidth="1.2" />
      <text x="520" y="118" textAnchor="middle" fill="var(--text-dim)" fontSize="10" fontFamily={MONO} fontWeight={700}>
        RTH / FAILSAFE
      </text>
      <text x="320" y="48" textAnchor="middle" fill="var(--text-dim)" fontSize="11" fontFamily={MONO}>
        PATH · LINK DEGRADATION
      </text>
    </svg>
  );
}

function DroneMissionScene() {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-hidden style={svgBase}>
      <rect width="640" height="360" fill="var(--panel-raised)" />
      <rect x="120" y="85" width="400" height="190" fill="var(--panel-card)" stroke={gridLine} strokeWidth="1.1" opacity={0.85} />
      <line x1="120" y1="180" x2="520" y2="180" stroke={gridLine} strokeWidth="0.8" strokeDasharray="6 5" />
      <path d="M 160 240 L 260 120 L 360 210 L 480 150" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" />
      <polygon points="480,150 468,155 472,142" fill="var(--text-muted)" />
      <rect x="195" y="255" width="70" height="28" rx="2" fill="var(--accent-soft)" stroke={accentOrange} strokeWidth="1.3" />
      <text x="230" y="273" textAnchor="middle" fill="var(--accent)" fontSize="10" fontFamily={MONO} fontWeight={700}>
        DEV
      </text>
      <text x="320" y="68" textAnchor="middle" fill="var(--text-dim)" fontSize="11" fontFamily={MONO}>
        CORRIDOR · MISSION DEVIATION
      </text>
    </svg>
  );
}

function RobotPublicScene() {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-hidden style={svgBase}>
      <rect width="640" height="360" fill="var(--panel-raised)" />
      <rect x="150" y="75" width="340" height="210" fill="none" stroke={gridLine} strokeWidth="1.4" />
      <rect x="250" y="130" width="140" height="95" rx="3" fill="var(--panel-card)" stroke={mutedLine} strokeWidth="1.3" />
      <text x="320" y="182" textAnchor="middle" fill="var(--text-muted)" fontSize="12" fontFamily={MONO} fontWeight={700}>
        CELL
      </text>
      <path d="M 430 245 A 55 55 0 0 1 375 215" fill="none" stroke={accentOrange} strokeWidth="1.6" />
      <text x="455" y="238" fill="var(--text-dim)" fontSize="10" fontFamily={MONO} fontWeight={700}>
        PROX
      </text>
      <text x="320" y="58" textAnchor="middle" fill="var(--text-dim)" fontSize="11" fontFamily={MONO}>
        WORKCELL · HUMAN PROXIMITY
      </text>
    </svg>
  );
}

function RobotStopScene() {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-hidden style={svgBase}>
      <rect width="640" height="360" fill="var(--panel-raised)" />
      <rect x="110" y="95" width="420" height="170" fill="var(--panel-card)" stroke={gridLine} strokeWidth="1.2" strokeDasharray="10 6" />
      <rect x="255" y="155" width="130" height="58" rx="3" fill="var(--panel-raised)" stroke={mutedLine} strokeWidth="1.5" />
      <text x="320" y="190" textAnchor="middle" fill="var(--text-muted)" fontSize="14" fontFamily={MONO} fontWeight={700}>
        STOP
      </text>
      <line x1="55" y1="180" x2="95" y2="180" stroke={accentOrange} strokeWidth="3" />
      <text x="48" y="186" textAnchor="end" fill="var(--text-dim)" fontSize="10" fontFamily={MONO} fontWeight={700}>
        PLC
      </text>
      <text x="320" y="62" textAnchor="middle" fill="var(--text-dim)" fontSize="11" fontFamily={MONO}>
        SAFETY · EXCLUSION · HALT
      </text>
    </svg>
  );
}

function SceneRenderer({ kind, language }: { kind: SceneKind; language: "en" | "tr" }) {
  switch (kind) {
    case "idle_vehicle":
      return <VehicleIdleScene language={language} />;
    case "idle_drone":
      return <DroneIdleScene language={language} />;
    case "idle_robot":
      return <RobotIdleScene language={language} />;
    case "unknown_package":
      return <UnknownPackageScene language={language} />;
    case "vehicle_near_miss":
      return <VehicleNearMissScene />;
    case "vehicle_collision":
      return <VehicleCollisionScene />;
    case "drone_link":
      return <DroneLinkScene />;
    case "drone_mission":
      return <DroneMissionScene />;
    case "robot_public":
      return <RobotPublicScene />;
    case "robot_stop":
      return <RobotStopScene />;
    default:
      return <VehicleIdleScene language={language} />;
  }
}

function TelemetryStrip({
  language,
  system,
  seed,
  idle,
}: {
  language: "en" | "tr";
  system: ReconstructionSystem;
  seed: number;
  idle: boolean;
}) {
  const t0 = 8 + (seed % 5);
  const marks = [0, 1, 2, 3, 4].map((i) => `${t0 + i * 2}s`);

  const rows = idle
    ? language === "tr"
      ? [
          { k: "MOD", v: "STBY" },
          { k: "CLK", v: "SYNC" },
          { k: "BUF", v: "SEALED" },
        ]
      : [
          { k: "MOD", v: "STBY" },
          { k: "CLK", v: "SYNC" },
          { k: "BUF", v: "SEALED" },
        ]
    : system === "vehicle"
      ? [
          { k: "SPD", v: `${38 + (seed % 12)}→${12 + (seed % 8)} km/h` },
          { k: "BRK", v: seed % 2 ? "REQ · ON" : "REQ · RAMP" },
          { k: "STR", v: `${(seed % 7) - 3} N·m` },
          { k: "CTL", v: "ADS / DRV" },
        ]
      : system === "drone"
        ? [
            { k: "ALT", v: `${42 + (seed % 20)} m` },
            { k: "LNK", v: seed % 3 ? "DEG" : "NOM" },
            { k: "CMD", v: "OP / AUTO" },
          ]
        : [
            { k: "SPD", v: `${0.3 + (seed % 5) / 10} m/s` },
            { k: "ZONE", v: `Z${(seed % 4) + 1}` },
            { k: "STP", v: "ARM" },
          ];

  return (
    <div
      style={{
        borderTop: "2px solid var(--border-strong)",
        background: "var(--panel)",
        padding: "0.45rem 0.6rem 0.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.38rem", flexWrap: "wrap" }}>
        <span style={{ fontFamily: MONO, fontSize: "0.66rem", letterSpacing: "0.14em", color: "var(--text-dim)", fontWeight: 700 }}>
          {language === "tr" ? "ZAMAN ŞERİDİ" : "TIME BAND"}
        </span>
        <div style={{ flex: 1, minWidth: 140, display: "flex", gap: "0.2rem", alignItems: "center" }}>
          {marks.map((m, i) => (
            <span
              key={m}
              style={{
                flex: 1,
                textAlign: "center",
                fontFamily: MONO,
                fontSize: "0.68rem",
                color: i === 2 ? "var(--accent)" : "var(--text-muted)",
                borderBottom: i === 2 ? "2px solid var(--accent)" : "1px solid var(--border)",
                background: i === 2 ? "var(--accent-soft)" : "transparent",
                paddingBottom: "0.14rem",
              }}
            >
              {m}
            </span>
          ))}
        </div>
        <span style={{ fontFamily: MONO, fontSize: "0.64rem", color: "var(--text-dim)" }}>
          {language === "tr" ? "KRİTİK @t2" : "CRITICAL @t2"}
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "0.3rem",
          marginBottom: "0.45rem",
        }}
      >
        {[
          language === "tr" ? "ÖN-EVRE" : "PRE-EVENT",
          language === "tr" ? "KRİTİK MOMENT" : "EVENT MOMENT",
          language === "tr" ? "SONRASI" : "POST-EVENT",
        ].map((label, idx) => (
          <div
            key={label}
            style={{
              border: idx === 1 ? "1px solid var(--accent-border)" : "1px solid var(--border)",
              background: idx === 1 ? "var(--accent-soft)" : "var(--panel-raised)",
              borderRadius: 2,
              padding: "0.2rem 0.35rem",
              fontFamily: MONO,
              fontSize: "0.62rem",
              letterSpacing: "0.1em",
              color: idx === 1 ? "var(--accent)" : "var(--text-dim)",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`, gap: "0.4rem" }}>
        {rows.map((row) => (
          <div key={row.k} style={{ border: "1px solid var(--border-strong)", borderRadius: 2, padding: "0.32rem 0.4rem", background: "var(--panel-raised)" }}>
            <div style={{ fontFamily: MONO, fontSize: "0.64rem", letterSpacing: "0.1em", color: "var(--text-dim)", marginBottom: "0.1rem" }}>{row.k}</div>
            <div style={{ fontFamily: MONO, fontSize: "0.78rem", color: "var(--text-soft)", fontWeight: 600 }}>{row.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetaCluster({
  lat,
  lon,
  zone,
  conf,
}: {
  lat: string;
  lon: string;
  zone: string;
  conf: string;
}) {
  const rows = [
    { k: "LAT", v: lat },
    { k: "LON", v: lon },
    { k: "ZONE", v: zone },
    { k: "CONF", v: conf },
  ] as const;
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 2,
        minWidth: 118,
        maxWidth: 148,
        padding: "0.4rem 0.45rem",
        background: "var(--panel)",
        border: "1px solid var(--border-strong)",
        borderRadius: 2,
        boxShadow: "none",
      }}
    >
      {rows.map((row) => (
        <div key={row.k} style={{ marginBottom: row.k === "CONF" ? 0 : "0.32rem" }}>
          <div style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.12em", color: "var(--text-dim)" }}>{row.k}</div>
          <div style={{ fontFamily: MONO, fontSize: "0.74rem", color: "var(--text-soft)", fontWeight: 600, wordBreak: "break-all" }}>{row.v}</div>
        </div>
      ))}
    </div>
  );
}

export function ReconstructionViewport(props: ReconstructionViewportProps) {
  const { language, system, incidentClass, eventId, title, verificationState } = props;
  const scene = resolveSceneKind(system, incidentClass, eventId);
  const seed = eventId ? stableHash(eventId) : stableHash(system + (title ?? ""));
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
                : eventId
                  ? "PKG"
                  : "—";
  const conf =
    verificationState === "PASS" ? "0.94" : verificationState === "FAIL" ? "0.61" : verificationState === "UNKNOWN" ? "0.72" : eventId ? "0.82" : "—";

  const titleBar = language === "tr" ? "Mühürlü yeniden oluşturma görünümü" : "Sealed reconstruction view";
  const idle = !eventId;
  const familyGrammar = familyGrammarLabel(system, language);
  const riskTag =
    verificationState === "FAIL"
      ? language === "tr"
        ? "YÜKSEK GÖZLEM"
        : "HIGH WATCH"
      : verificationState === "UNKNOWN"
        ? language === "tr"
          ? "BELİRSİZLİK AÇIK"
          : "UNCERTAINTY OPEN"
        : language === "tr"
          ? "KONTROLLÜ İNCELEME"
          : "CONTROLLED REVIEW";

  return (
    <section
      style={{ ...panel, marginBottom: "0.5rem" }}
      aria-label={language === "tr" ? "Olay mekânı yeniden oluşturma" : "Event spatial reconstruction"}
    >
      <div style={labelBar}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", minWidth: 0 }}>
          <span style={{ fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700 }}>
            {titleBar}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: "0.62rem",
              color: "var(--text-muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {familyGrammar}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", maxWidth: "60%" }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: "0.62rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0.14rem 0.35rem",
              border: "1px solid var(--accent-border)",
              color: "var(--accent)",
              background: "var(--accent-soft)",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {riskTag}
          </span>
          <span
            style={{ fontFamily: MONO, fontSize: "0.66rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}
            title={title ?? ""}
          >
            {eventId ? `${system.toUpperCase()} · ${title ?? incidentClass ?? ""}` : `${system.toUpperCase()} · ${language === "tr" ? "beklemede" : "standby"}`}
          </span>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          minHeight: STAGE_MIN_H,
          background:
            system === "vehicle"
              ? "linear-gradient(180deg, rgba(212,86,26,0.05), transparent 26%), var(--panel-raised)"
              : system === "drone"
                ? "linear-gradient(180deg, rgba(102,148,255,0.08), transparent 26%), var(--panel-raised)"
                : "linear-gradient(180deg, rgba(110,210,170,0.06), transparent 26%), var(--panel-raised)",
          borderBottom: "1px solid var(--border-strong)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0, padding: "0.35rem 0.55rem" }}>
          <div style={{ width: "100%", height: "100%", minHeight: STAGE_MIN_H }}>
            <SceneRenderer kind={scene} language={language} />
          </div>
        </div>
        <MetaCluster lat={lat} lon={lon} zone={zone} conf={conf} />
      </div>

      <TelemetryStrip language={language} system={system} seed={seed} idle={idle} />
    </section>
  );
}
