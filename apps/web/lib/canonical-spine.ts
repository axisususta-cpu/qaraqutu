/**
 * Canonical Spine v1: single case registry for Vehicle / Drone / Robot.
 * Witness → verification → issuance backbone. Golden-grade demo cases.
 */
import type {
  CanonicalCase,
  CanonicalSystemId,
  RecordedEvidenceItem,
  DerivedEvidenceItem,
  VerificationTraceStep,
  AxisusState,
  ArtifactProfileVisibility,
} from "contracts";

const TRACE_STEP = (
  step: number,
  check: string,
  result: string,
  note: string
): VerificationTraceStep => ({ step, check, result, note });

/** Golden-grade demo cases: 2 Vehicle, 2 Drone, 2 Robot. */
export const CANONICAL_CASES: CanonicalCase[] = [
  // —— Vehicle 1: Near Miss ——
  {
    caseId: "golden-vehicle-nearmiss",
    system: "vehicle",
    incidentClass: "near_miss",
    scenarioFrame: "Near Miss / AEB Activation",
    eventId: "QEV-20260311-DEMO-NEARMISS-01",
    bundleId: "QBN-20260311-DEMO-NEARMISS-01",
    manifestId: "QMF-20260311-DEMO-NEARMISS-01",
    occurredAt: "2026-03-11T08:30:00.000Z",
    summary:
      "Near-miss in urban corridor where vehicle performed abrupt braking to avoid side-entry vehicle.",
    verificationState: "PASS",
    reviewWhyEn:
      "Under review to confirm bundle integrity and manifest linkage for the AEB activation event—timing of system intervention vs driver action must remain traceable.",
    reviewWhyTr:
      "AEB aktivasyon olayı için paket bütünlüğü ve manifest bağlantısının doğrulanması amacıyla incelemeye alındı; sistem müdahalesi ile sürücü aksiyonu zamanlaması izlenebilir kalmalı.",
    nextStepEn: "Review trace summary or start artifact issuance.",
    nextStepTr: "İz özetini inceleyin veya artifact issuance başlatın.",
    recordedEvidence: [
      {
        recordId: "REC-NEARMISS-JSON",
        sourceType: "vehicle_event_payload",
        sourceId: "SRC-NEARMISS-JSON",
        capturedAt: "2026-03-11T08:30:00.000Z",
        contentType: "application/json",
        hash: "hash-json-nearmiss",
        sizeOrLength: 1024,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.98,
        displayLabel: "AEB event payload (raw)",
        machineLabel: "source_event_json",
      },
      {
        recordId: "REC-NEARMISS-TRACE",
        sourceType: "telemetry_trace",
        sourceId: "SRC-NEARMISS-TRACE",
        capturedAt: "2026-03-11T08:30:01.000Z",
        contentType: "application/octet-stream",
        hash: "hash-trace-nearmiss",
        sizeOrLength: 4096,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.95,
        displayLabel: "Pre- and post-brake telemetry snapshot",
        machineLabel: "telemetry_snapshot",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "DER-NEARMISS-TIMELINE",
        derivedType: "timeline_synthesis",
        derivedFrom: ["REC-NEARMISS-JSON", "REC-NEARMISS-TRACE"],
        generatedAt: "2026-03-11T08:31:00.000Z",
        method: "timeline_v1",
        confidence: 0.92,
        recordedFlag: false,
        derivationNote: "Structured assessment from recorded payload and telemetry; not a verdict on causation.",
        displayLabel: "AEB near-miss timeline synthesis",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Reconstructed sequence of approach, brake trigger, and near-miss clearance from source payload and telemetry; timing chain supports review of system vs driver contribution without assigning fault.",
        sourceDependencies: ["REC-NEARMISS-JSON", "REC-NEARMISS-TRACE"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [],
    verificationTrace: [
      TRACE_STEP(1, "Canonical event linkage", "PASS", "Near-miss event linked to bundle and manifest; chain intact."),
      TRACE_STEP(2, "Recorded vs derived separation", "PASS", "Recorded payload and telemetry kept distinct from timeline synthesis."),
      TRACE_STEP(3, "Verification state", "PASS", "Canonical assessment; human review recommended for intervention context."),
    ],
    artifactIssuance: { available: true, apiBacked: true },
    whyInevitable:
      "AEB near-miss disputes turn on timing and chain of evidence. QARAQUTU gives this vehicle case one canonical record, recorded-vs-derived separation, and a verification trace—so claims and compliance reviews have a single reference instead of fragmented logs.",
    titleTr: "Destekli Sürüş Yakın Kaçış İncelemesi",
    titleEn: "Assisted Driving Near-Miss Review",
    demoNoticeTr:
      "Bu vaka, kamuya açık olay sınıflarından türetilmiş anonimize bir demo incelemesidir. Nihai hukukî veya olgusal hüküm değildir.",
    demoNoticeEn:
      "This case is an anonymized demo review derived from publicly known incident classes. It is not a final legal or factual determination.",
    axisusStates: [
      {
        id: "axisus-veh-nearmiss-1",
        labelTr: "İnsan incelemesi gerekli",
        labelEn: "Human review required",
        severity: "review",
        reasonTr: "Sistem müdahalesi, sürücü düzeltmesi ve zamanlama zinciri birlikte değerlendirilmelidir.",
        reasonEn: "System intervention, driver correction, and timing chain should be reviewed together.",
        handoffRequired: true,
      },
    ] as AxisusState[],
    artifactProfiles: [
      { profileCode: "claims", enabled: true, apiBacked: true, reasonTr: "Hasar/claim süreci bu vaka için anlamlı; issuance API bağlı.", reasonEn: "Claims process is meaningful for this case; issuance API is connected." },
      { profileCode: "legal", enabled: true, apiBacked: true, reasonTr: "Hukukî inceleme bu vaka için anlamlı; issuance API bağlı.", reasonEn: "Legal review is meaningful for this case; issuance API is connected." },
      { profileCode: "technical", enabled: true, apiBacked: false, reasonTr: "Teknik rekonstrüksiyon anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Technical reconstruction is meaningful; issuance support is not yet connected." },
      { profileCode: "safety", enabled: true, apiBacked: false, reasonTr: "Güvenlik notu anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Safety note is meaningful; issuance support is not yet connected." },
      { profileCode: "governance", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
      { profileCode: "regulatory", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
      { profileCode: "public_safety", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
    ] as ArtifactProfileVisibility[],
  },
  // —— Vehicle 2: Intersection Collision ——
  {
    caseId: "golden-vehicle-collision",
    system: "vehicle",
    incidentClass: "collision",
    scenarioFrame: "Urban Intersection Collision",
    eventId: "QEV-20260311-DEMO-COLLISION-01",
    bundleId: "QBN-20260311-DEMO-COLLISION-01",
    manifestId: "QMF-20260311-DEMO-COLLISION-01",
    occurredAt: "2026-03-11T09:45:00.000Z",
    summary:
      "Collision at intersection where lane entry and signal interpretation are disputed between parties.",
    verificationState: "UNKNOWN",
    reviewWhyEn:
      "Under review for bundle and manifest integrity; multi-party dispute over lane entry and signal state requires a single canonical record and trace before any role-based export.",
    reviewWhyTr:
      "Paket ve manifest bütünlüğü için incelemeye alındı; şerit girişi ve sinyal durumu konusundaki çok taraflı ihtilaf, rol bazlı export öncesi tek kanonik kayıt ve iz gerektirir.",
    nextStepEn: "Run verification or start controlled artifact once trace and unknowns are reviewed.",
    nextStepTr: "İz ve belirsizlikler incelendikten sonra doğrulamayı çalıştırın veya kontrollü artifact başlatın.",
    recordedEvidence: [
      {
        recordId: "REC-COLLISION-JSON",
        sourceType: "vehicle_event_payload",
        sourceId: "SRC-COLLISION-JSON",
        capturedAt: "2026-03-11T09:45:00.000Z",
        contentType: "application/json",
        hash: "hash-json-collision",
        sizeOrLength: 2048,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.96,
        displayLabel: "Intersection collision event payload (raw)",
        machineLabel: "source_event_json",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "DER-COLLISION-TIMELINE",
        derivedType: "timeline_synthesis",
        derivedFrom: ["REC-COLLISION-JSON"],
        generatedAt: "2026-03-11T09:46:00.000Z",
        method: "timeline_v1",
        confidence: 0.88,
        recordedFlag: false,
        derivationNote: "Structured reading from recorded payload; does not resolve disputed lane or signal interpretation.",
        displayLabel: "Intersection event timeline synthesis",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Reconstructed sequence of approach and impact from source payload; parties disagree on lane entry and signal phase—this assessment presents the recorded-derived chain, not a liability finding.",
        sourceDependencies: ["REC-COLLISION-JSON"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [
      "Lane entry timing and right-of-way at moment of entry.",
      "Signal phase and interpretation by each party; requires human review.",
    ],
    verificationTrace: [
      TRACE_STEP(1, "Canonical event linkage", "PASS", "Intersection event linked to bundle and manifest."),
      TRACE_STEP(2, "Recorded vs derived separation", "PASS", "Recorded payload distinct from timeline synthesis."),
      TRACE_STEP(3, "Verification state", "UNKNOWN", "Disputed facts; verification trace documents steps only; human review required."),
    ],
    artifactIssuance: { available: true, apiBacked: true },
    whyInevitable:
      "Intersection collisions are dispute-grade: parties need one canonical object, a clear recorded-vs-derived split, and a verification trace. QARAQUTU provides that spine so claims and legal review work from the same evidence base—without it, fragmentation persists.",
    titleTr: "Kavşak Çatışması İncelemesi",
    titleEn: "Intersection Conflict Review",
    demoNoticeTr:
      "Bu vaka anonimize demo incelemesidir. Nihai hukukî veya olgusal hüküm değildir.",
    demoNoticeEn:
      "This case is an anonymized demo review. It is not a final legal or factual determination.",
    axisusStates: [
      {
        id: "axisus-veh-collision-1",
        labelTr: "Sorumluluk devri tetiklendi",
        labelEn: "Responsibility transfer triggered",
        severity: "handoff",
        reasonTr: "Çok taraflı olay zinciri nihai yorum için insan incelemesi gerektirir.",
        reasonEn: "The multi-party event chain requires human review for final interpretation.",
        handoffRequired: true,
      },
    ] as AxisusState[],
    artifactProfiles: [
      { profileCode: "claims", enabled: true, apiBacked: true, reasonTr: "Hasar/claim süreci çatışma vakası için anlamlı; issuance API bağlı.", reasonEn: "Claims process is meaningful for collision case; issuance API is connected." },
      { profileCode: "legal", enabled: true, apiBacked: true, reasonTr: "Hukukî inceleme çok taraflı çatışma için anlamlı; issuance API bağlı.", reasonEn: "Legal review is meaningful for multi-party collision; issuance API is connected." },
      { profileCode: "technical", enabled: true, apiBacked: false, reasonTr: "Teknik rekonstrüksiyon anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Technical reconstruction is meaningful; issuance support is not yet connected." },
      { profileCode: "safety", enabled: true, apiBacked: false, reasonTr: "Güvenlik notu anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Safety note is meaningful; issuance support is not yet connected." },
      { profileCode: "governance", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
      { profileCode: "regulatory", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
      { profileCode: "public_safety", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
    ] as ArtifactProfileVisibility[],
  },
  // —— Drone 1: Link Loss ——
  {
    caseId: "golden-drone-linkloss",
    system: "drone",
    incidentClass: "link_loss",
    scenarioFrame: "Link Loss",
    eventId: "drone-linkloss-003",
    bundleId: "bundle-drone-003",
    manifestId: "manifest-drone-003",
    occurredAt: "2025-03-14T10:05:00Z",
    summary:
      "Temporary loss of command link and telemetry downlink during BVLOS segment.",
    verificationState: "UNVERIFIED",
    reviewWhyEn:
      "Under review for mission anomaly and operator handoff record verification; link-loss window and recovery sequence must be traceable for BVLOS accountability.",
    reviewWhyTr:
      "Görev anomalisi ve operatör el değişimi kayıtlarının doğrulanması için incelemeye alındı; BVLOS hesap verebilirliği için bağlantı kaybı penceresi ve kurtarma dizisi izlenebilir olmalı.",
    nextStepEn: "Demo context only in current release.",
    nextStepTr: "Mevcut sürümde yalnızca demo bağlamı desteklenmektedir.",
    recordedEvidence: [
      {
        recordId: "rec-drone-003-1",
        sourceType: "uav_telemetry",
        sourceId: "SRC-DRONE-003",
        capturedAt: "2025-03-14T10:05:00Z",
        contentType: "application/octet-stream",
        hash: "hash-drone-003",
        sizeOrLength: 2048,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.9,
        displayLabel: "BVLOS segment telemetry (pre- and post-link-loss)",
        machineLabel: "telemetry_stream",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "der-drone-003-timeline",
        derivedType: "timeline_synthesis",
        derivedFrom: ["rec-drone-003-1"],
        generatedAt: "2025-03-14T10:06:00Z",
        method: "timeline_v1",
        confidence: 0.85,
        recordedFlag: false,
        derivationNote: "Structured assessment from recorded telemetry; not a determination of operator responsibility.",
        displayLabel: "Link-loss and recovery timeline synthesis",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Reconstructed mission segment and link recovery sequence from recorded telemetry; supports review of command-chain uncertainty and safe next step—human review required for scope of autonomy.",
        sourceDependencies: ["rec-drone-003-1"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [
      "Exact duration of link loss and whether it exceeded operational limits.",
      "Recovery sequence and operator re-acquisition; requires human review.",
    ],
    verificationTrace: [
      TRACE_STEP(1, "Link-loss window", "OK", "Link-loss window is registered against the mission segment bundle and manifest."),
      TRACE_STEP(2, "Telemetry window", "OK", "Telemetry window around the link-loss period is present and intact."),
      TRACE_STEP(3, "Recovery sequence", "OK", "Recovery sequence is documented for human review; this trace does not decide scope of autonomy."),
      TRACE_STEP(4, "BVLOS accountability", "demo", "BVLOS accountability remains a review surface; live verification is not connected for Drone."),
    ],
    artifactIssuance: { available: false },
    whyInevitable:
      "BVLOS and link-loss accountability depend on a single canonical record and a verification trace that keeps recorded telemetry separate from derived timeline. QARAQUTU provides that spine for this drone case—without it, operator and system boundaries stay blurred.",
    titleTr: "Bağlantı Kaybı / Operatör Belirsizliği İncelemesi",
    titleEn: "Link Loss / Operator Uncertainty Review",
    demoNoticeTr:
      "Bu vaka anonimize demo incelemesidir. Nihai sorumluluk veya hukukî hüküm üretmez.",
    demoNoticeEn:
      "This is an anonymized demo review. It does not produce final liability or legal judgment.",
    axisusStates: [
      {
        id: "axisus-drone-linkloss-1",
        labelTr: "Otonom akış sınırlandı",
        labelEn: "Autonomous flow constrained",
        severity: "limit",
        reasonTr: "Komut zinciri belirsizliği nedeniyle güvenli yorum alanı daraltıldı.",
        reasonEn: "Safe interpretive scope has been narrowed due to command-chain uncertainty.",
        handoffRequired: true,
      },
    ] as AxisusState[],
    artifactProfiles: [
      { profileCode: "claims", enabled: true, apiBacked: false, reasonTr: "Bu profil bu vaka için anlamlıdır; issuance desteği henüz bağlı değildir.", reasonEn: "This profile is meaningful for this case; issuance support is not yet connected." },
      { profileCode: "legal", enabled: true, apiBacked: false, reasonTr: "Bu profil bu vaka için anlamlıdır; issuance desteği henüz bağlı değildir.", reasonEn: "This profile is meaningful for this case; issuance support is not yet connected." },
      { profileCode: "technical", enabled: true, apiBacked: false, reasonTr: "Bağlantı kaybı telemetri rekonstrüksiyonu anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Link-loss telemetry reconstruction is meaningful; issuance support is not yet connected." },
      { profileCode: "safety", enabled: true, apiBacked: false, reasonTr: "Güvenli sonraki adım bu vaka için anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Safe next step is meaningful for this case; issuance support is not yet connected." },
      { profileCode: "governance", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
      { profileCode: "regulatory", enabled: true, apiBacked: false, reasonTr: "Kayıt ve trace anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Record and trace are meaningful; issuance support is not yet connected." },
      { profileCode: "public_safety", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
    ] as ArtifactProfileVisibility[],
  },
  // —— Drone 2: Mission Anomaly ——
  {
    caseId: "golden-drone-mission",
    system: "drone",
    incidentClass: "mission_anomaly",
    scenarioFrame: "Mission Anomaly",
    eventId: "drone-mission-001",
    bundleId: "bundle-drone-001",
    manifestId: "manifest-drone-001",
    occurredAt: "2025-03-12T14:22:00Z",
    summary: "UAV deviated from planned altitude band during waypoint transit.",
    verificationState: "UNVERIFIED",
    reviewWhyEn:
      "Under review for mission anomaly and altitude-deviation record verification; waypoint transit and handoff context must be traceable.",
    reviewWhyTr:
      "Görev anomalisi ve irtifa sapması kayıtlarının doğrulanması için incelemeye alındı; waypoint geçişi ve el değişimi bağlamı izlenebilir olmalı.",
    nextStepEn: "Demo context only in current release.",
    nextStepTr: "Mevcut sürümde yalnızca demo bağlamı desteklenmektedir.",
    recordedEvidence: [
      {
        recordId: "rec-drone-001-1",
        sourceType: "uav_telemetry",
        sourceId: "SRC-DRONE-001",
        capturedAt: "2025-03-12T14:22:00Z",
        contentType: "application/octet-stream",
        hash: "hash-drone-001",
        sizeOrLength: 4096,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.92,
        displayLabel: "Waypoint-transit telemetry (altitude and track)",
        machineLabel: "telemetry_stream",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "der-drone-001-timeline",
        derivedType: "timeline_synthesis",
        derivedFrom: ["rec-drone-001-1"],
        generatedAt: "2025-03-12T14:23:00Z",
        method: "timeline_v1",
        confidence: 0.88,
        recordedFlag: false,
        derivationNote: "Structured assessment from recorded telemetry; does not assign cause of deviation.",
        displayLabel: "Altitude-deviation and waypoint timeline synthesis",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Reconstructed mission segment and altitude band deviation from recorded telemetry; supports risk-threshold and handoff review—not a finding on pilot or system fault.",
        sourceDependencies: ["rec-drone-001-1"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [
      "Whether deviation exceeded procedural or regulatory tolerance; requires human review.",
    ],
    verificationTrace: [
      TRACE_STEP(1, "Mission plan linkage", "OK", "Mission plan linkage is present for the waypoint segment under review."),
      TRACE_STEP(2, "Altitude band deviation", "OK", "Altitude band deviation is marked from recorded telemetry; significance is reserved for oversight review."),
      TRACE_STEP(3, "Waypoint / track separation", "OK", "Waypoint / track separation remains distinct from the derived anomaly timeline; no cause or fault is decided here."),
      TRACE_STEP(4, "Oversight review", "demo", "Oversight review remains required; live verification is not connected for Drone."),
    ],
    artifactIssuance: { available: false },
    whyInevitable:
      "Mission anomaly review needs recorded-vs-derived separation and a verification trace so oversight and claims have one canonical spine. QARAQUTU delivers that for this drone case—altitude and waypoint disputes otherwise lack a single reference.",
    titleTr: "Görev Anomalisi İncelemesi",
    titleEn: "Mission Anomaly Review",
    demoNoticeTr:
      "Bu vaka anonimize demo incelemesidir. Nihai hukukî veya olgusal hüküm değildir.",
    demoNoticeEn:
      "This case is an anonymized demo review. It is not a final legal or factual determination.",
    axisusStates: [
      {
        id: "axisus-drone-mission-1",
        labelTr: "Risk eşiği izlendi",
        labelEn: "Risk threshold monitored",
        severity: "review",
        reasonTr: "Görev anomalisi bağlamında ek insan incelemesi değerlidir.",
        reasonEn: "Additional human review is valuable in the context of mission anomaly.",
        handoffRequired: false,
      },
    ] as AxisusState[],
    artifactProfiles: [
      { profileCode: "claims", enabled: true, apiBacked: false, reasonTr: "Bu profil bu vaka için anlamlıdır; issuance desteği henüz bağlı değildir.", reasonEn: "This profile is meaningful for this case; issuance support is not yet connected." },
      { profileCode: "legal", enabled: true, apiBacked: false, reasonTr: "Bu profil bu vaka için anlamlıdır; issuance desteği henüz bağlı değildir.", reasonEn: "This profile is meaningful for this case; issuance support is not yet connected." },
      { profileCode: "technical", enabled: true, apiBacked: false, reasonTr: "Görev anomalisi rekonstrüksiyonu anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Mission anomaly reconstruction is meaningful; issuance support is not yet connected." },
      { profileCode: "safety", enabled: true, apiBacked: false, reasonTr: "Risk eşiği ve güvenli sonraki adım anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Risk threshold and safe next step are meaningful; issuance support is not yet connected." },
      { profileCode: "governance", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
      { profileCode: "regulatory", enabled: true, apiBacked: false, reasonTr: "Kayıt ve gözetim anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Record and oversight are meaningful; issuance support is not yet connected." },
      { profileCode: "public_safety", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
    ] as ArtifactProfileVisibility[],
  },
  // —— Robot 1: Public Interaction ——
  {
    caseId: "golden-robot-public",
    system: "robot",
    incidentClass: "public_interaction",
    scenarioFrame: "Public Interaction",
    eventId: "robot-public-003",
    bundleId: "bundle-robot-003",
    manifestId: "manifest-robot-003",
    occurredAt: "2025-03-13T14:20:00Z",
    summary:
      "Service robot in public space; encounter with pedestrian and recorded handoff to operator.",
    verificationState: "UNVERIFIED",
    reviewWhyEn:
      "Under review for safety stop and compliance record assessment; public-space encounter and operator handoff must be traceable for context and liability clarity.",
    reviewWhyTr:
      "Güvenlik durdurma ve uyumluluk kayıtlarının incelenmesi için incelemeye alındı; kamusal alan karşılaşması ve operatör devri izlenebilir olmalı.",
    nextStepEn: "Demo context only in current release.",
    nextStepTr: "Mevcut sürümde yalnızca demo bağlamı desteklenmektedir.",
    recordedEvidence: [
      {
        recordId: "rec-robot-003-1",
        sourceType: "interaction_log",
        sourceId: "SRC-ROBOT-003",
        capturedAt: "2025-03-13T14:20:00Z",
        contentType: "application/json",
        hash: "hash-robot-003",
        sizeOrLength: 1024,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.9,
        displayLabel: "Pedestrian encounter and handoff log (raw)",
        machineLabel: "interaction_log",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "der-robot-003-summary",
        derivedType: "timeline_synthesis",
        derivedFrom: ["rec-robot-003-1"],
        generatedAt: "2025-03-13T14:21:00Z",
        method: "timeline_v1",
        confidence: 0.86,
        recordedFlag: false,
        derivationNote: "Structured assessment from recorded interaction log; does not determine whether context loss constituted harm.",
        displayLabel: "Encounter and handoff timeline synthesis",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Reconstructed encounter and operator handoff sequence from recorded log; supports context review and safe next step—human review required to assess significance of context loss.",
        sourceDependencies: ["rec-robot-003-1"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [
      "Whether context loss in this encounter warrants escalation; requires human review.",
    ],
    verificationTrace: [
      TRACE_STEP(1, "Encounter registered", "OK", "Encounter is registered against the public-interaction bundle and manifest."),
      TRACE_STEP(2, "Interaction log integrity", "OK", "Interaction log integrity is preserved and remains distinct from the derived encounter timeline."),
      TRACE_STEP(3, "Handoff chain documented", "OK", "Handoff chain documented for context review; significance remains with human review."),
      TRACE_STEP(4, "Context review", "demo", "Context review remains required; live verification is not connected for Robot."),
    ],
    artifactIssuance: { available: false },
    whyInevitable:
      "Public-space robot incidents need a canonical record and verification trace so that encounter, handoff, and context are one reference. QARAQUTU provides that spine for this robot case—without it, public-safety and liability discussions lack a shared evidence base.",
    titleTr: "Kamusal Alan Etkileşim İncelemesi",
    titleEn: "Public-Space Interaction Review",
    demoNoticeTr:
      "Bu vaka, kamusal alanda robot-insan etkileşimlerinden türetilmiş anonimize demo incelemesidir.",
    demoNoticeEn:
      "This case is an anonymized demo review derived from robot-human interactions in public space.",
    axisusStates: [
      {
        id: "axisus-robot-public-1",
        labelTr: "Bağlam incelemesi gerekli",
        labelEn: "Context review required",
        severity: "review",
        reasonTr: "Fiziksel temas olmasa da bağlam kaybı olay niteliği taşıyabilir.",
        reasonEn: "Even without physical contact, context loss may still constitute an event.",
        handoffRequired: true,
      },
    ] as AxisusState[],
    artifactProfiles: [
      { profileCode: "claims", enabled: true, apiBacked: false, reasonTr: "Bu profil bu vaka için anlamlıdır; issuance desteği henüz bağlı değildir.", reasonEn: "This profile is meaningful for this case; issuance support is not yet connected." },
      { profileCode: "legal", enabled: true, apiBacked: false, reasonTr: "Bu profil bu vaka için anlamlıdır; issuance desteği henüz bağlı değildir.", reasonEn: "This profile is meaningful for this case; issuance support is not yet connected." },
      { profileCode: "technical", enabled: true, apiBacked: false, reasonTr: "Etkileşim zinciri rekonstrüksiyonu anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Interaction chain reconstruction is meaningful; issuance support is not yet connected." },
      { profileCode: "safety", enabled: true, apiBacked: false, reasonTr: "Kamusal alan riski ve güvenli sonraki adım anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Public-space risk and safe next step are meaningful; issuance support is not yet connected." },
      { profileCode: "governance", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
      { profileCode: "regulatory", enabled: true, apiBacked: false, reasonTr: "Kayıt ve trace anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Record and trace are meaningful; issuance support is not yet connected." },
      { profileCode: "public_safety", enabled: true, apiBacked: false, reasonTr: "Kamusal güvenlik bağlamı anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Public safety context is meaningful; issuance support is not yet connected." },
    ] as ArtifactProfileVisibility[],
  },
  // —— Robot 2: Safety Stop ——
  {
    caseId: "golden-robot-safety",
    system: "robot",
    incidentClass: "safety_stop",
    scenarioFrame: "Safety Stop Event",
    eventId: "robot-safety-001",
    bundleId: "bundle-robot-001",
    manifestId: "manifest-robot-001",
    occurredAt: "2025-03-13T11:08:00Z",
    summary: "Emergency stop triggered by proximity sensor during cycle.",
    verificationState: "UNVERIFIED",
    reviewWhyEn:
      "Under review for safety stop and compliance record assessment; proximity-trigger and cycle boundary must be traceable for protective-stop accountability.",
    reviewWhyTr:
      "Güvenlik durdurma ve uyumluluk kayıtlarının incelenmesi için incelemeye alındı; yakınlık tetikleyicisi ve döngü sınırı izlenebilir olmalı.",
    nextStepEn: "Demo context only in current release.",
    nextStepTr: "Mevcut sürümde yalnızca demo bağlamı desteklenmektedir.",
    recordedEvidence: [
      {
        recordId: "rec-robot-001-1",
        sourceType: "safety_log",
        sourceId: "SRC-ROBOT-001",
        capturedAt: "2025-03-13T11:08:00Z",
        contentType: "application/json",
        hash: "hash-robot-001",
        sizeOrLength: 512,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.95,
        displayLabel: "Proximity-trigger and stop-cycle log (raw)",
        machineLabel: "safety_log",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "der-robot-001-timeline",
        derivedType: "timeline_synthesis",
        derivedFrom: ["rec-robot-001-1"],
        generatedAt: "2025-03-13T11:09:00Z",
        method: "timeline_v1",
        confidence: 0.9,
        recordedFlag: false,
        derivationNote: "Structured assessment from recorded safety log; protective stop is boundary-preserving, not a fault finding.",
        displayLabel: "Safety stop and cycle trace synthesis",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Reconstructed stop trigger and cycle boundary from recorded safety log; supports oversight and safe next step—protective stopping preserves boundary before risk escalation; not a determination of blame.",
        sourceDependencies: ["rec-robot-001-1"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [
      "Whether this protective stop fully aligns with configured safety policy thresholds; requires human review.",
    ],
    verificationTrace: [
      TRACE_STEP(1, "Workcell cycle bound", "OK", "Workcell cycle bound is registered for this protective stop event."),
      TRACE_STEP(2, "Safety log integrity", "OK", "Safety log integrity is preserved for the proximity-triggered stop event."),
      TRACE_STEP(3, "Proximity trigger and stop boundary", "OK", "Proximity trigger and stop boundary are traced for oversight; this trace does not decide fault or blame."),
      TRACE_STEP(4, "Protective stop review", "demo", "Protective stop review remains required; live verification is not connected for Robot."),
    ],
    artifactIssuance: { available: false },
    whyInevitable:
      "Safety-stop accountability requires a canonical record and verification trace so that proximity trigger and cycle boundary are unambiguous. QARAQUTU provides that spine for this robot case—protective stopping is then evidence-backed, not contested by fragmented logs.",
    titleTr: "Güvenlik Durdurma Olayı İncelemesi",
    titleEn: "Safety Stop Event Review",
    demoNoticeTr:
      "Bu vaka anonimize demo incelemesidir. Nihai hukukî veya olgusal hüküm değildir.",
    demoNoticeEn:
      "This case is an anonymized demo review. It is not a final legal or factual determination.",
    axisusStates: [
      {
        id: "axisus-robot-safety-1",
        labelTr: "Durdurma koruyucu davranıştır",
        labelEn: "Stopping is protective behavior",
        severity: "limit",
        reasonTr: "Güvenli durdurma, risk büyümeden sınır koruması sağlar.",
        reasonEn: "Protective stopping preserves the boundary before risk escalates.",
        handoffRequired: false,
      },
    ] as AxisusState[],
    artifactProfiles: [
      { profileCode: "claims", enabled: true, apiBacked: false, reasonTr: "Bu profil bu vaka için anlamlıdır; issuance desteği henüz bağlı değildir.", reasonEn: "This profile is meaningful for this case; issuance support is not yet connected." },
      { profileCode: "legal", enabled: true, apiBacked: false, reasonTr: "Bu profil bu vaka için anlamlıdır; issuance desteği henüz bağlı değildir.", reasonEn: "This profile is meaningful for this case; issuance support is not yet connected." },
      { profileCode: "technical", enabled: true, apiBacked: false, reasonTr: "Durdurma zinciri rekonstrüksiyonu anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Stop-cycle reconstruction is meaningful; issuance support is not yet connected." },
      { profileCode: "safety", enabled: true, apiBacked: false, reasonTr: "Koruyucu durdurma ve güvenli sonraki adım anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Protective stop and safe next step are meaningful; issuance support is not yet connected." },
      { profileCode: "governance", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
      { profileCode: "regulatory", enabled: true, apiBacked: false, reasonTr: "Kayıt ve gözetim anlamlı; issuance desteği henüz bağlı değildir.", reasonEn: "Record and oversight are meaningful; issuance support is not yet connected." },
      { profileCode: "public_safety", enabled: false, apiBacked: false, reasonTr: "Bu profil seçili vaka bağlamında öncelikli değildir.", reasonEn: "This profile is not a priority in the context of the selected case." },
    ] as ArtifactProfileVisibility[],
  },
];

export function getCanonicalCases(system?: CanonicalSystemId): CanonicalCase[] {
  if (system) return CANONICAL_CASES.filter((c) => c.system === system);
  return CANONICAL_CASES;
}

export function getCanonicalCaseByEventId(eventId: string): CanonicalCase | null {
  return CANONICAL_CASES.find((c) => c.eventId === eventId) ?? null;
}

export function getCanonicalCaseById(caseId: string): CanonicalCase | null {
  return CANONICAL_CASES.find((c) => c.caseId === caseId) ?? null;
}

/** Golden acceptance rubric: quality gate for every case. Doctrine-aligned criteria. */
export interface GoldenRubricCriterion {
  id: string;
  label: string;
  pass: boolean;
}

export interface GoldenAcceptanceResult {
  passed: number;
  total: number;
  criteria: GoldenRubricCriterion[];
}

const GOLDEN_ACCEPTANCE_CRITERIA: Array<{ id: string; label: string; check: (c: CanonicalCase) => boolean }> = [
  { id: "incident_class", label: "Incident Class", check: (c) => !!c.incidentClass?.trim() },
  { id: "scenario_frame", label: "Scenario Frame", check: (c) => !!c.scenarioFrame?.trim() },
  { id: "recorded_evidence", label: "Recorded Evidence", check: (c) => Array.isArray(c.recordedEvidence) && c.recordedEvidence.length > 0 },
  { id: "derived_assessment", label: "Derived Assessment", check: (c) => Array.isArray(c.derivedAssessment) && c.derivedAssessment.length > 0 },
  { id: "unknown_disputed", label: "Unknown / Disputed", check: (c) => Array.isArray(c.unknownDisputed) },
  { id: "verification_trace", label: "Verification Trace", check: (c) => Array.isArray(c.verificationTrace) && c.verificationTrace.length > 0 },
  { id: "artifact_issuance", label: "Artifact Issuance", check: (c) => c.artifactIssuance != null && typeof c.artifactIssuance.available === "boolean" },
  { id: "why_inevitable", label: "Why QARAQUTU is inevitable", check: (c) => !!c.whyInevitable?.trim() },
];

export function evaluateGoldenAcceptance(case_: CanonicalCase): GoldenAcceptanceResult {
  const criteria: GoldenRubricCriterion[] = GOLDEN_ACCEPTANCE_CRITERIA.map(({ id, label, check }) => ({
    id,
    label,
    pass: check(case_),
  }));
  const passed = criteria.filter((c) => c.pass).length;
  return { passed, total: criteria.length, criteria };
}

/** Ordered criterion labels for display (e.g. Golden page). */
export const GOLDEN_ACCEPTANCE_RUBRIC_LABELS = GOLDEN_ACCEPTANCE_CRITERIA.map((c) => c.label);
