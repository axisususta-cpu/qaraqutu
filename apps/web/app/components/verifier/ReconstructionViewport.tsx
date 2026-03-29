"use client";

import type { CSSProperties } from "react";

const MONO = "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace";

/** Minimum stage height: constrained to keep evidence band visible in first-screen */
const STAGE_MIN_H = "0";

export type ReconstructionSystem = "vehicle" | "drone" | "robot";

export type ReconstructionViewportProps = {
  language: "en" | "tr";
  system: ReconstructionSystem;
  incidentClass: string | null;
  eventId: string | null;
  title: string | null;
  verificationState: string | null;
  role: string | null;
  incidentPhase?: "t0" | "t1" | "t2" | "t3" | null;
  incidentSpine?: {
    phases?: Array<{
      phase: "t0" | "t1" | "t2" | "t3";
      verification?: {
        posture: "UNVERIFIED" | "SUPPORTED" | "CONTESTED" | "INSUFFICIENT" | "RESTRICTED";
        recordedPosture: "UNVERIFIED" | "SUPPORTED" | "CONTESTED" | "INSUFFICIENT" | "RESTRICTED";
        derivedPosture: "UNVERIFIED" | "SUPPORTED" | "CONTESTED" | "INSUFFICIENT" | "RESTRICTED";
        unknownDisputedPosture: "UNVERIFIED" | "SUPPORTED" | "CONTESTED" | "INSUFFICIENT" | "RESTRICTED";
        tracePosture: "UNVERIFIED" | "SUPPORTED" | "CONTESTED" | "INSUFFICIENT" | "RESTRICTED";
        artifactReadiness: "ready" | "bounded" | "limited" | "not_ready";
        note?: string;
        noteTr?: string;
      };
    }>;
  } | null;
  sensorSummary?: {
    hasLidar: boolean;
    hasCamera: boolean;
    hasTelemetry: boolean;
    cameraSources: string[];
    sourceSummary: string[];
    recordedPackageSummary: string | null;
  };
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
  border: "1px solid var(--border-soft)",
  borderRadius: 0,
  background: "var(--panel-card)",
  overflow: "hidden",
  boxShadow: "none",
};

const labelBar: CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid var(--border)",
  background: "var(--surface)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "6px",
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

function phaseDisplayLabel(phase: "t0" | "t1" | "t2" | "t3", language: "en" | "tr") {
  if (language === "tr") {
    if (phase === "t0") return "T0 / Olay Öncesi";
    if (phase === "t1") return "T1 / Yaklaşım";
    if (phase === "t2") return "T2 / Kritik An";
    return "T3 / Olay Sonrası";
  }
  if (phase === "t0") return "T0 / Pre-Event";
  if (phase === "t1") return "T1 / Approach";
  if (phase === "t2") return "T2 / Critical Moment";
  return "T3 / Post-Event";
}

function postureLabel(value: string, language: "en" | "tr") {
  if (language === "tr") {
    if (value === "UNVERIFIED") return "Doğrulanmadı";
    if (value === "SUPPORTED") return "Destekleniyor";
    if (value === "CONTESTED") return "Çekişmeli";
    if (value === "INSUFFICIENT") return "Yetersiz";
    if (value === "RESTRICTED") return "Kısıtlı";
    if (value === "ready") return "Hazır";
    if (value === "bounded") return "Sınırlı Hazır";
    if (value === "limited") return "Sınırlı";
    if (value === "not_ready") return "Hazır Değil";
  }
  if (value === "ready") return "Ready";
  if (value === "bounded") return "Bounded";
  if (value === "limited") return "Limited";
  if (value === "not_ready") return "Not Ready";
  return value;
}

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

function VehicleCollisionScene({ role }: { role: string | null }) {
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
      <rect x="360" y="162" width="88" height="44" rx="3" fill={role === "police" ? "var(--accent-soft)" : "var(--accent-soft)"} stroke={role === "police" ? "var(--error)" : accentOrange} strokeWidth={role === "police" ? 2 : 1.5} />
      <text x="404" y="188" textAnchor="middle" fill={role === "police" ? "var(--error)" : "var(--accent)"} fontSize="11" fontFamily={MONO} fontWeight={700}>
        CONTACT
      </text>
      <circle cx="404" cy="218" r="36" fill="none" stroke={role === "police" ? "var(--error)" : accentOrange} strokeWidth={role === "police" ? 2 : 1.5} opacity={0.8} />
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

function SceneRenderer({ kind, language, role }: { kind: SceneKind; language: "en" | "tr"; role: string | null }) {
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
      return <VehicleCollisionScene role={role} />;
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

function SpatialReadinessLayer({
  seed,
  active,
  language,
  phase,
}: {
  seed: number;
  active: boolean;
  language: "en" | "tr";
  phase?: "t0" | "t1" | "t2" | "t3" | null;
}) {
  const phaseAccent =
    phase === "t0"
      ? "rgba(116, 185, 255, 0.22)"
      : phase === "t1"
        ? "rgba(253, 203, 110, 0.22)"
        : phase === "t2"
          ? "rgba(225, 112, 85, 0.22)"
          : phase === "t3"
            ? "rgba(0, 184, 148, 0.22)"
            : "rgba(149, 165, 166, 0.16)";
  const traceThickness =
    phase === "t2" ? 0.8 : phase === "t1" ? 0.6 : phase === "t3" ? 0.5 : 0.4;
  const points = Array.from({ length: 140 }, (_, i) => {
    const x = 6 + ((seed + i * 37) % 88);
    const y = 6 + ((seed + i * 53) % 88);
    const o = 0.18 + (((seed + i * 97) % 60) / 100);
    const r = 0.28 + (((seed + i * 19) % 40) / 100);
    return { x, y, o, r };
  });

  const eventGeometryPoints = [
    { x: 26, y: 48 },
    { x: 44, y: 34 },
    { x: 72, y: 38 },
    { x: 68, y: 60 },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        border: active ? "1px solid var(--accent-border)" : "1px solid var(--border)",
        background:
          `linear-gradient(180deg, rgba(10,25,40,0.24) 0%, rgba(16,36,58,0.14) 40%, rgba(20,42,72,0.0) 100%), ${phaseAccent}`,
      }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={active ? p.r : p.r * 0.7}
            fill={active ? "rgba(255,174,88,0.92)" : "rgba(204,133,66,0.64)"}
            opacity={active ? Math.min(1, p.o + 0.2) : p.o * 0.65}
          />
        ))}

        {eventGeometryPoints.map((p, idx) => (
          <g key={`geom-${idx}`}>
            <circle cx={p.x} cy={p.y} r={active ? 1.4 : 1.0} fill="rgba(255,180,80,0.85)" />
            <circle cx={p.x} cy={p.y} r={active ? 2.8 : 2.2} stroke="rgba(255,180,80,0.5)" strokeWidth={0.16} fill="none" />
          </g>
        ))}

        <polyline
          points="8,80 24,65 42,72 57,50 74,58 90,36"
          fill="none"
          stroke="rgba(255,173,92,0.95)"
          strokeWidth={0.45 + traceThickness * 0.3}
          strokeDasharray="1.2 1.0"
          opacity={active ? 0.94 : 0.66}
        />
        <polyline
          points="12,22 30,26 47,18 60,24 79,14"
          fill="none"
          stroke="rgba(164,216,255,0.8)"
          strokeWidth={0.42 + traceThickness * 0.26}
          strokeDasharray="1 1.1"
          opacity={active ? 0.85 : 0.58}
        />
        <polyline
          points="10,68 28,60 45,62 63,44 84,47"
          fill="none"
          stroke="rgba(162,212,255,0.8)"
          strokeWidth={0.36 + traceThickness * 0.22}
          strokeDasharray="0.8 1.2"
          opacity={active ? 0.78 : 0.56}
        />

        {eventGeometryPoints.map((p, idx) => {
          const center = eventGeometryPoints[0];
          const target = p;
          return (
            <line
              key={`link-${idx}`}
              x1={center.x}
              y1={center.y}
              x2={target.x}
              y2={target.y}
              stroke="rgba(255,200,120,0.55)"
              strokeWidth={0.24 + traceThickness * 0.4}
              strokeDasharray="2 1"
              opacity={active ? 0.85 : 0.6}
            />
          );
        })}

        <line x1="20" y1="84" x2="36" y2="66" stroke="rgba(255,175,106,0.72)" strokeWidth="0.42" opacity={active ? 0.89 : 0.62} />
        <line x1="60" y1="55" x2="82" y2="44" stroke="rgba(255,175,106,0.72)" strokeWidth="0.42" opacity={active ? 0.89 : 0.62} />
        <line x1="24" y1="64" x2="24" y2="84" stroke="var(--border)" strokeWidth="0.32" opacity={0.68} />
        <line x1="58" y1="50" x2="58" y2="72" stroke="var(--border)" strokeWidth="0.32" opacity={0.68} />
        <rect x="6" y="6" width="88" height="88" fill="none" stroke="var(--border-muted)" strokeWidth="0.35" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 10,
          bottom: 8,
          fontFamily: MONO,
          fontSize: "0.62rem",
          letterSpacing: "0.1em",
          color: "var(--text-dim)",
          textTransform: "uppercase",
        }}
      >
        NOKTA BULUTU / VEKTÖR HAZIRLIK KATI
      </div>
    </div>
  );
}

function TelemetryStrip({
  language,
  system,
  seed,
  idle,
  phase,
}: {
  language: "en" | "tr";
  system: ReconstructionSystem;
  seed: number;
  idle: boolean;
  phase?: "t0" | "t1" | "t2" | "t3" | null;
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
        borderTop: idle ? "1px solid var(--border)" : "2px solid var(--accent-border)",
        background: idle
          ? "linear-gradient(180deg, var(--panel), var(--panel-raised))"
          : "linear-gradient(180deg, rgba(255,102,0,0.1), rgba(255,102,0,0.03) 38%, var(--panel) 100%)",
        padding: "0.5rem 0.64rem 0.58rem",
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
                borderBottom: i === 2 ? "2px solid var(--accent)" : "1px solid var(--border-soft)",
                background: i === 2 ? "var(--accent-soft)" : "rgba(255,255,255,0.02)",
                paddingBottom: "0.18rem",
              }}
            >
              {m}
            </span>
          ))}
        </div>
        <span style={{ fontFamily: MONO, fontSize: "0.64rem", color: "var(--text-dim)" }}>
          {phase ? phaseDisplayLabel(phase, language) : phaseDisplayLabel("t2", language)}
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
          phaseDisplayLabel("t0", language),
          phaseDisplayLabel("t1", language),
          phaseDisplayLabel("t2", language),
          phaseDisplayLabel("t3", language),
        ].map((label, idx) => (
          <div
            key={label}
            style={{
              border: phase === `t${idx}` ? "1px solid var(--accent-border)" : "1px solid var(--border)",
              background: phase === `t${idx}` ? "var(--accent-soft)" : "var(--panel-raised)",
              borderRadius: 0,
              padding: "0.2rem 0.32rem",
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
          <div
            key={row.k}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 0,
              padding: "0.28rem 0.36rem",
              background: "var(--panel-raised)",
              boxShadow: idle ? "none" : "inset 0 0 0 1px rgba(255,102,0,0.06)",
            }}
          >
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
        pointerEvents: "none",
        minWidth: 118,
        maxWidth: 148,
        padding: "0.4rem 0.45rem",
        background: "var(--panel)",
        border: "1px solid var(--border-strong)",
        borderRadius: 0,
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
  const { language, system, incidentClass, eventId, title, verificationState, role, incidentPhase, incidentSpine, sensorSummary } = props;
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
  const conf = verificationState === "PASS" ? "0.94" : verificationState === "FAIL" ? "0.61" : eventId ? "0.82" : "—";

  const titleBar = language === "tr" ? "Mühürlü yeniden oluşturma görünümü" : "Sealed reconstruction view";
  const idle = !eventId;
  const sceneActive = Boolean(eventId);
  const familyGrammar = familyGrammarLabel(system, language);
  const phaseLabel = incidentPhase
    ? phaseDisplayLabel(incidentPhase, language)
    : language === "tr"
      ? "Aşama: bilinmiyor"
      : "Phase: unknown";
  const riskTag =
    verificationState === "FAIL"
      ? language === "tr"
        ? "YÜKSEK GÖZLEM"
        : "HIGH WATCH"
      : language === "tr"
        ? "KONTROLLÜ İNCELEME"
        : "CONTROLLED REVIEW";

  type PhaseVisual = { color: string; label: string; detail: string; zone: string };
  const phaseVisual: PhaseVisual = incidentPhase
    ? incidentPhase === "t0"
      ? { color: "#74b9ff", label: language === "tr" ? "Hafif mavi" : "Pre-flight", detail: language === "tr" ? "Sensör ön ısıtması ve veri kaydı" : "Sensor warmup and baseline capture", zone: language === "tr" ? "Ön uçuş koridoru" : "Pre-flight corridor" }
      : incidentPhase === "t1"
        ? { color: "#fdcb6e", label: language === "tr" ? "Sarı yaklaşım" : "Approach", detail: language === "tr" ? "Çizgi koridoru ve link durumda yoğunluk" : "Corridor and link intensity", zone: language === "tr" ? "Yaklaşım penceresi" : "Approach window" }
        : incidentPhase === "t2"
          ? { color: "#e17055", label: language === "tr" ? "Kırmızı kritik" : "Critical", detail: language === "tr" ? "Aktif olay penceresi; çekirdek risk" : "Active event window; core risk", zone: language === "tr" ? "Kritik olay bölgesi" : "Critical incident locus" }
          : { color: "#00b894", label: language === "tr" ? "Yeşil sonrası" : "Post-Event", detail: language === "tr" ? "İz ve doğrulama sonlandırma" : "Trace review and closure", zone: language === "tr" ? "Olay sonrası inceleme" : "Post-event review" }
    : { color: "#95a5a6", label: language === "tr" ? "Standby" : "Standby", detail: language === "tr" ? "Olay seçilmedi" : "No event selected", zone: language === "tr" ? "Bekleme" : "Standby" };

  const phaseVerification = incidentPhase
    ? incidentSpine?.phases?.find((p) => p.phase === incidentPhase)?.verification
    : undefined;
  const phaseVerificationPosture = phaseVerification?.posture ?? "UNVERIFIED";
  const phaseArtifactReadiness = phaseVerification?.artifactReadiness ?? "not_ready";

  const statusColor = (status: string): string => {
    switch (status) {
      case "SUPPORTED":
        return "#f39c12";
      case "CONTESTED":
        return "#e17055";
      case "INSUFFICIENT":
        return "#fdcb6e";
      case "RESTRICTED":
        return "#d63031";
      case "UNVERIFIED":
      default:
        return "#95a5a6";
    }
  };

  const statusChip = (label: string, value: string) => (
    <span
      style={{
        fontFamily: MONO,
        fontSize: "0.56rem",
        letterSpacing: "0.06em",
        fontWeight: 700,
        padding: "0.12rem 0.28rem",
        borderRadius: 0,
        border: `1px solid ${statusColor(value)}`,
        color: statusColor(value),
        background: "rgba(0,0,0,0.28)",
        marginRight: "0.22rem",
        marginBottom: "0.18rem",
        display: "inline-block",
      }}
    >
      {label}: {postureLabel(value, language)}
    </span>
  );

  const readinessContext =
    system === "vehicle"
      ? language === "tr"
        ? phaseArtifactReadiness === "bounded"
          ? "Araç düzenleme hattı iz ve açık hususlarla sınırlı hazır tutulur."
          : "Araç düzenleme hattı belirsizlik açılmadan serbest bırakılmaz."
        : phaseArtifactReadiness === "bounded"
          ? "Vehicle issuance lane stays ready only within trace and open-item bounds."
          : "Vehicle issuance lane does not open beyond uncertainty limits."
      : system === "drone"
        ? language === "tr"
          ? phaseArtifactReadiness === "bounded"
            ? "Drone görev hattı görünür ve sınırlı issuance duruşuna bağlıdır."
            : "Drone görev hattı, bağlantı ve el değişimi belirsizliklerine koşulludur."
          : phaseArtifactReadiness === "bounded"
            ? "Drone mission lane is visible and held to bounded issuance posture."
            : "Drone mission lane remains conditioned by link and handoff uncertainty."
        : language === "tr"
          ? phaseArtifactReadiness === "bounded"
            ? "Robot etkileşim hattı görünür, fakat kamusal bağlam sorularını aşmaz."
            : "Robot etkileşim hattı, saha bağlamı kapanmadan tam hazır sayılmaz."
          : phaseArtifactReadiness === "bounded"
            ? "Robot interaction lane is visible, but does not outrank public-context questions."
            : "Robot interaction lane stays short of full readiness until field context closes.";

    const hasLidar = sensorSummary?.hasLidar ?? false;
    const hasCamera = sensorSummary?.hasCamera ?? false;
    const hasTelemetry = sensorSummary?.hasTelemetry ?? false;
    const cameraSources = sensorSummary?.cameraSources ?? [];
    const sourceSummary = sensorSummary?.sourceSummary ?? [];
    const recordedPackageSummary = sensorSummary?.recordedPackageSummary ?? null;

    const lidarLine1 = hasLidar
      ? language === "tr"
        ? "Bu vakada LiDAR/3D tarama kaydı bağlı görünüyor."
        : "LiDAR/3D scan record is linked for this case."
      : language === "tr"
        ? "Bu vakada LiDAR kaydı mevcut değil."
        : "No LiDAR record is available in this case.";
    const lidarLine2 = language === "tr"
      ? "İnceleme kamera kayıtları ve diğer recorded evidence üzerinden sürdürülüyor."
      : "Review continues over camera records and other recorded evidence.";

    const cameraTitle =
      system === "vehicle"
        ? language === "tr"
          ? "Araç kamerası / frame strip"
          : "Vehicle camera / frame strip"
        : system === "drone"
          ? language === "tr"
            ? "Drone görüntüsü / multi-view"
            : "Drone view / multi-view"
          : language === "tr"
            ? "Robot görüş akışı / güvenlik kamerası"
            : "Robot vision feed / security camera";

    const cameraPanelLabel = hasCamera
      ? language === "tr"
        ? "Kamera recorded layer görünür"
        : "Camera recorded layer visible"
      : language === "tr"
        ? "Kamera kaydı görünmüyor"
        : "Camera record not visible";

    const sourceTypeLabel =
      sourceSummary.length > 0
        ? sourceSummary.join(" · ")
        : language === "tr"
          ? "Kayıtlı kaynak türü bağlanmadı"
          : "Recorded source type not linked";


  return (
    <section
      style={{
        ...panel,
        marginBottom: 0,
        border: "none",
        borderRadius: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column" as const,
        borderColor: sceneActive ? "var(--accent-border)" : "var(--border)",
        boxShadow: "none",
      }}
      aria-label={language === "tr" ? "Olay mekânı yeniden oluşturma" : "Event spatial reconstruction"}
    >
      <div style={{ ...labelBar, display: "none" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", minWidth: 0 }}>
          <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 600 }}>
            {titleBar}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: "9px",
              color: "var(--text-muted)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {familyGrammar}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", maxWidth: "60%" }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: "9px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "2px 8px",
              border: "1px solid var(--accent-border)",
              color: "var(--accent)",
              background: "var(--accent-soft)",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {riskTag}
          </span>
          {incidentPhase ? (
            <span
              style={{
                fontFamily: MONO,
                fontSize: "9px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "2px 6px",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                background: "var(--panel)",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {language === "tr" ? "Aşama" : "Phase"}: {phaseLabel}
            </span>
          ) : null}
          <span
            style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}
            title={title ?? ""}
          >
            {eventId ? `${system.toUpperCase()} · ${title ?? incidentClass ?? ""}` : `${system.toUpperCase()} · ${language === "tr" ? "beklemede" : "standby"}`}
          </span>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          flex: "1 1 0",
          minHeight: 0,
          background: "var(--panel-raised)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            padding: 0,
            pointerEvents: "none",
          }}
        >
          <div style={{ width: "100%", height: "100%" }}>
            <SceneRenderer kind={scene} language={language} role={role} />
          </div>
        </div>
        <MetaCluster lat={lat} lon={lon} zone={zone} conf={conf} />
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 3,
            border: "1px solid var(--border-strong)",
            background: "rgba(0,0,0,0.55)",
            padding: "8px 10px",
            minWidth: 250,
            maxWidth: 340,
            pointerEvents: "none",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "5px" }}>
            {language === "tr" ? "LIDAR / 3D TARAMA ALANI" : "LIDAR / 3D SCAN LANE"}
          </div>
          <div style={{ fontSize: "10px", color: hasLidar ? "#7fd2ff" : "var(--text-secondary)", lineHeight: 1.45, marginBottom: "3px" }}>
            {lidarLine1}
          </div>
          <div style={{ fontSize: "9px", color: "var(--text-dim)", lineHeight: 1.4 }}>{lidarLine2}</div>
          {!hasLidar ? (
            <div style={{ marginTop: "6px", fontFamily: MONO, fontSize: "8px", color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {language === "tr" ? "Temsilî boş slot · gelecekte sensör omurgasına uyumlu" : "Representational empty slot · compatible with future sensor spine"}
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            zIndex: 2,
            pointerEvents: "none",
            border: "1px solid var(--border-strong)",
            background: "rgba(0,0,0,0.45)",
            borderRadius: 0,
            padding: "8px 10px",
            color: "var(--text-soft)",
            fontFamily: MONO,
            fontSize: "9px",
            minWidth: 220,
            maxWidth: 280,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.12em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "4px" }}>
            {language === "tr" ? "LEJANT" : "LEGEND"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#5ea4ff", flexShrink: 0 }} />
            <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-secondary)" }}>{language === "tr" ? "Kayıtlı iz" : "Recorded trace"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
            <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-secondary)" }}>{language === "tr" ? "Türetilmiş hipotez" : "Derived hypothesis"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: 16, height: 1, background: phaseVisual.color, flexShrink: 0 }} />
            <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--text-secondary)" }}>{phaseVisual.label}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
          gap: "0px",
          borderTop: "1px solid var(--border)",
          background: "#12141b",
        }}
      >
        <section style={{ padding: "9px 10px", borderRight: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--text-dim)" }}>
              {language === "tr" ? "KAMERA KAYIT ALANI" : "CAMERA RECORDING LANE"}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: "8px",
                color: hasCamera ? "var(--accent)" : "var(--text-dim)",
                border: "1px solid var(--border-strong)",
                padding: "1px 6px",
              }}
            >
              {cameraPanelLabel}
            </span>
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-secondary)", lineHeight: 1.45, marginBottom: "6px" }}>
            {cameraTitle}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "6px", marginBottom: "6px" }}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid var(--border)",
                  background: hasCamera ? "linear-gradient(135deg, rgba(232,101,10,0.08), rgba(94,164,255,0.05))" : "var(--panel-raised)",
                  minHeight: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: MONO,
                  fontSize: "8px",
                  color: "var(--text-dim)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {language === "tr" ? `FRAME ${idx + 1}` : `FRAME ${idx + 1}`}
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: "8px", color: "var(--text-dim)", lineHeight: 1.45 }}>
            {cameraSources.length > 0
              ? cameraSources.join(" · ")
              : language === "tr"
                ? "Araç / drone / robot / güvenlik kamera akışı bu vakada bağlı görünmüyor."
                : "Vehicle / drone / robot / security camera stream is not linked in this case."}
          </div>
          <div style={{ marginTop: "6px", fontFamily: MONO, fontSize: "8px", color: "var(--text-dim)", lineHeight: 1.45 }}>
            {language === "tr"
              ? "Recorded: video/raw frame. Derived: overlay/annotation/highlight/model reading ayrı işaretlenir."
              : "Recorded: video/raw frame. Derived: overlay/annotation/highlight/model reading are marked separately."}
          </div>
        </section>

        <section style={{ padding: "9px 10px" }}>
          <div style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "7px" }}>
            {language === "tr" ? "SENSÖR DURUMU / KAYNAK ÖZETİ" : "SENSOR STATUS / SOURCE SUMMARY"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "5px", marginBottom: "7px" }}>
            {[
              { label: "LiDAR", ok: hasLidar },
              { label: language === "tr" ? "Kamera" : "Camera", ok: hasCamera },
              { label: language === "tr" ? "Telemetri" : "Telemetry", ok: hasTelemetry },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--panel-raised)",
                  padding: "4px 6px",
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: "8px", color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: MONO, fontSize: "9px", color: item.ok ? "var(--accent)" : "var(--text-secondary)", marginTop: 1 }}>
                  {item.ok ? (language === "tr" ? "var" : "present") : (language === "tr" ? "yok" : "absent")}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "9px", color: "var(--text-secondary)", lineHeight: 1.45, marginBottom: "5px" }}>
            <strong style={{ color: "var(--text-muted)", fontWeight: 700 }}>{language === "tr" ? "Kaynak türleri:" : "Source types:"}</strong>{" "}
            {sourceTypeLabel}
          </div>
          <div style={{ fontSize: "9px", color: "var(--text-secondary)", lineHeight: 1.45, marginBottom: "5px" }}>
            <strong style={{ color: "var(--text-muted)", fontWeight: 700 }}>{language === "tr" ? "Recorded paket:" : "Recorded package:"}</strong>{" "}
            {recordedPackageSummary ?? (language === "tr" ? "Özet bağlı değil" : "Summary not linked")}
          </div>
          <div style={{ fontFamily: MONO, fontSize: "8px", color: "var(--text-dim)", lineHeight: 1.45 }}>
            {language === "tr"
              ? "Gelecek uyumu: fabrika sensör konfigürasyonu, paket/trim donanımı, aftermarket eklemeler, sensör çıkarımı ve olay anı erişilebilirlik bilgisi için uyumlu slot yapısı korunur."
              : "Future-compatible framing: slot structure remains compatible with factory config, trim hardware presence, aftermarket additions, sensor removal history, and incident-time availability."}
          </div>
        </section>
      </div>

      <div style={{ display: "none" }}>
        <TelemetryStrip language={language} system={system} seed={seed} idle={idle} phase={incidentPhase} />
      </div>
    </section>
  );
}
