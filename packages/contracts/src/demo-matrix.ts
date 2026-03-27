import type {
  ArtifactDocumentFamily,
  ArtifactProfileVisibility,
  CanonicalCase,
  CanonicalSystemId,
  DerivedEvidenceItem,
  IncidentSpine,
  RecordedEvidenceItem,
  VerificationTraceStep,
} from "./index";

function recorded(
  recordId: string,
  sourceType: string,
  capturedAt: string,
  displayLabel: string,
  displayLabelTr: string,
  hash: string,
  visibilityClass = "claims_review"
): RecordedEvidenceItem {
  return {
    recordId,
    sourceType,
    sourceId: `${recordId}-SRC`,
    capturedAt,
    contentType: sourceType.includes("image") ? "image/jpeg" : "application/json",
    hash,
    sizeOrLength: 1024,
    recordedFlag: true,
    derivationNote: null,
    originConfidence: 0.96,
    displayLabel,
    displayLabelTr,
    machineLabel: sourceType,
    visibility_class: visibilityClass,
  };
}

function derived(
  derivedId: string,
  derivedType: string,
  generatedAt: string,
  derivedFrom: string[],
  displayLabel: string,
  displayLabelTr: string,
  humanSummary: string,
  humanSummaryTr: string,
  visibilityClass = "legal_review"
): DerivedEvidenceItem {
  return {
    derivedId,
    derivedType,
    derivedFrom,
    generatedAt,
    method: `${derivedType}_v1`,
    confidence: 0.89,
    recordedFlag: false,
    derivationNote: "Derived reading stays separate from recorded substrate.",
    displayLabel,
    displayLabelTr,
    machineLabel: derivedType,
    humanSummary,
    humanSummaryTr,
    sourceDependencies: derivedFrom,
    visibility_class: visibilityClass,
  };
}

function trace(
  step: number,
  check: string,
  result: string,
  note: string,
  checkTr: string,
  noteTr: string
): VerificationTraceStep {
  return { step, check, result, note, checkTr, noteTr };
}

function documentFamilies(
  system: CanonicalSystemId,
  hasLimitations: boolean,
  integrityOnly = false
): ArtifactDocumentFamily[] {
  if (integrityOnly) {
    return ["tamper_detected_notice", "integrity_failure_notice", "chain_breach_notice", "artifact_invalidity_notice"];
  }

  const families: ArtifactDocumentFamily[] = [
    "pass_witness_summary",
    "pass_verification_summary",
    "pass_incident_review_summary",
  ];
  if (hasLimitations) {
    families.push("pass_limitation_annex");
  }
  if (system === "vehicle") {
    families.push("pass_vehicle_incident_report");
  }
  return families;
}

function artifactProfiles(apiBacked: boolean): ArtifactProfileVisibility[] {
  return [
    {
      profileCode: "claims",
      enabled: true,
      apiBacked,
      reasonTr: "PASS çizgisi için tanık özeti ve bağlı doğrulama özeti üretilebilir.",
      reasonEn: "PASS issuance can produce witness and verification summaries on the main line.",
    },
    {
      profileCode: "legal",
      enabled: true,
      apiBacked,
      reasonTr: "Kurumsal inceleme için bounded review özeti üretilebilir.",
      reasonEn: "A bounded review summary can be issued for institutional review.",
    },
  ];
}

function makeSpine(
  system: CanonicalSystemId,
  incidentId: string,
  scenarioTitle: string,
  incidentSummary: string,
  hasLimitations: boolean,
  tamperLane: boolean
): IncidentSpine {
  const readiness = tamperLane ? "bounded" : hasLimitations ? "limited" : "ready";
  const uncertaintyState = tamperLane || hasLimitations ? "medium" : "low";
  return {
    systemType: system,
    incidentId,
    scenarioTitle,
    incidentSummary,
    riskLabel: tamperLane ? "ORTA" : hasLimitations ? "ORTA" : "DUSUK",
    uncertaintyState,
    spatialVocabulary: {
      generic: system === "vehicle" ? "Lane / curb / impact window" : system === "drone" ? "Corridor / altitude / geo-fence" : "Cell / route / safe-stop window",
      vehicle: "Lane, curb, stop line",
      drone: "Flight corridor, altitude band, recovery path",
      robot: "Operating cell, route corridor, stop perimeter",
    },
    phases: [
      {
        phase: "t0",
        labelTr: "Ön Hazırlık",
        labelEn: "Pre-Event",
        descriptionTr: "Kaynak kayıtları kanonik pakete bağlandı.",
        descriptionEn: "Recorded sources are bound to the canonical package.",
        recordedLayerHint: "Recorded substrate anchored.",
        derivedLayerHint: "No derived collapse.",
        traceMarker: "pre_event",
        verification: {
          posture: "SUPPORTED",
          recordedPosture: "SUPPORTED",
          derivedPosture: "UNVERIFIED",
          unknownDisputedPosture: hasLimitations ? "CONTESTED" : "UNVERIFIED",
          tracePosture: "SUPPORTED",
          artifactReadiness: "not_ready",
        },
      },
      {
        phase: "t1",
        labelTr: "Yaklaşım",
        labelEn: "Approach",
        descriptionTr: "Kayıtlı delil ile türetilmiş okuma yan yana tutulur.",
        descriptionEn: "Recorded evidence and derived readings remain side by side.",
        recordedLayerHint: "Source chain visible.",
        derivedLayerHint: "Derived reading still bounded.",
        traceMarker: "approach",
        verification: {
          posture: hasLimitations ? "CONTESTED" : "SUPPORTED",
          recordedPosture: "SUPPORTED",
          derivedPosture: "SUPPORTED",
          unknownDisputedPosture: hasLimitations ? "CONTESTED" : "UNVERIFIED",
          tracePosture: "SUPPORTED",
          artifactReadiness: hasLimitations ? "limited" : "bounded",
        },
      },
      {
        phase: "t2",
        labelTr: "Çekirdek An",
        labelEn: "Core Moment",
        descriptionTr: tamperLane ? "PASS issuance çekirdeği burada sabitlenir." : "PASS witness line burada kurulur.",
        descriptionEn: tamperLane ? "The PASS issuance core is anchored here." : "The PASS witness line is established here.",
        recordedLayerHint: "Canonical recorded markers held constant.",
        derivedLayerHint: "Derived summary remains separate.",
        traceMarker: "core_moment",
        verification: {
          posture: "SUPPORTED",
          recordedPosture: "SUPPORTED",
          derivedPosture: "SUPPORTED",
          unknownDisputedPosture: hasLimitations ? "CONTESTED" : "UNVERIFIED",
          tracePosture: "SUPPORTED",
          artifactReadiness: readiness,
        },
      },
      {
        phase: "t3",
        labelTr: tamperLane ? "Yeniden Doğrulama" : "Olay Sonrası",
        labelEn: tamperLane ? "Re-Verification" : "Post-Event",
        descriptionTr: tamperLane
          ? "Aynı PASS artefaktın oynanmış kopyası geri dönerse integrity hattı ayrı çalışır."
          : "Belge ailesi PASS çizgisinde kapanır; açık sınırlamalar annex içinde tutulur.",
        descriptionEn: tamperLane
          ? "If a tampered copy of the same PASS artifact returns, the integrity lane runs separately."
          : "The document family closes on the PASS line while open limitations stay in the annex.",
        recordedLayerHint: "Issue record retained.",
        derivedLayerHint: tamperLane ? "Tamper comparison remains technical, not causal." : "Bounded assessment preserved.",
        traceMarker: tamperLane ? "reverify" : "post_event",
        verification: {
          posture: tamperLane ? "SUPPORTED" : hasLimitations ? "CONTESTED" : "SUPPORTED",
          recordedPosture: "SUPPORTED",
          derivedPosture: "SUPPORTED",
          unknownDisputedPosture: hasLimitations ? "CONTESTED" : "UNVERIFIED",
          tracePosture: "SUPPORTED",
          artifactReadiness: readiness,
        },
      },
    ],
  };
}

function makeCase(input: {
  id: string;
  vertical: CanonicalSystemId;
  title: string;
  titleTr: string;
  incidentClass: string;
  scenarioFrame: string;
  eventId: string;
  occurredAt: string;
  summary: string;
  summaryTr: string;
  recordedEvidenceSummary: string;
  derivedAssessmentSummary: string;
  limitations: string[];
  limitationsTr: string[];
  recordedEvidence: RecordedEvidenceItem[];
  derivedAssessment: DerivedEvidenceItem[];
  whyInevitable: string;
  reviewWhyEn: string;
  reviewWhyTr: string;
  nextStepEn: string;
  nextStepTr: string;
  apiBacked: boolean;
  tamperLane?: boolean;
}): CanonicalCase {
  const hasLimitations = input.limitations.length > 0;
  const integrityCase = input.tamperLane === true;
  const bundleId = `QBN-${input.id.toUpperCase()}`;
  const manifestId = `QMF-${input.id.toUpperCase()}`;
  const documentFamilySource = integrityCase
    ? "pass_witness_summary"
    : input.vertical === "vehicle"
    ? "pass_vehicle_incident_report"
    : "pass_witness_summary";
  return {
    id: input.id,
    caseId: input.id,
    vertical: input.vertical,
    system: input.vertical,
    title: input.title,
    titleTr: input.titleTr,
    titleEn: input.title,
    incidentClass: input.incidentClass,
    scenarioFrame: input.scenarioFrame,
    eventId: input.eventId,
    bundleId,
    manifestId,
    occurredAt: input.occurredAt,
    summary: input.summary,
    summaryTr: input.summaryTr,
    verificationState: "PASS",
    recordedEvidenceSummary: input.recordedEvidenceSummary,
    derivedAssessmentSummary: input.derivedAssessmentSummary,
    limitations: input.limitations,
    limitationsTr: input.limitationsTr,
    recordedEvidence: input.recordedEvidence,
    derivedAssessment: input.derivedAssessment,
    unknownDisputed: [...input.limitations],
    unknownDisputedTr: [...input.limitationsTr],
    verificationTrace: [
      trace(1, "Canonical issue record", "PASS", "Event, bundle, and manifest remain bound before issuance.", "Kanonik düzenleme kaydı", "Olay, paket ve manifest düzenleme öncesi bağlı kalır."),
      trace(2, "Recorded vs derived separation", "PASS", "Recorded substrate and derived summary remain separated.", "Kayıtlı ve türetilmiş ayrımı", "Kayıtlı altlık ile türetilmiş özet ayrı kalır."),
      trace(3, "PASS issuance readiness", "PASS", hasLimitations ? "PASS issuance is available with explicit limitation annex linkage." : "PASS issuance is available on the main witness line.", "PASS issuance hazırlığı", hasLimitations ? "Açık limitation annex bağlantısıyla PASS issuance kullanılabilir." : "Ana tanıklık çizgisinde PASS issuance kullanılabilir."),
      trace(4, integrityCase ? "Re-verification guardrail" : "Open limitation handling", integrityCase ? "PASS" : hasLimitations ? "OPEN" : "PASS", integrityCase ? "Any later integrity breach is evaluated in re-verification, not as event blame." : hasLimitations ? "Limitations remain bounded and do not demote the main PASS issuance line." : "No additional limitation annex is required for this issuance path.", integrityCase ? "Yeniden doğrulama koruma hattı" : "Açık limitation yönetimi", integrityCase ? "Sonraki bütünlük ihlali olay suçu olarak değil, yeniden doğrulama hattında değerlendirilir." : hasLimitations ? "Sınırlamalar bounded kalır ve ana PASS issuance çizgisini düşürmez." : "Bu issuance yolu için ek limitation annex gerekmez."),
    ],
    artifactIssuance: {
      available: true,
      apiBacked: input.apiBacked,
      documentFamilies: documentFamilies(input.vertical, hasLimitations),
    },
    reverification: integrityCase
      ? {
          enabled: true,
          mode: "tampered_copy",
          source_artifact_state: "PASS",
          target_failure: "TAMPER_DETECTED",
          tamper_targets: ["file_hash", "page_count", "visible_text", "seal_metadata"],
          source_document_family: documentFamilySource,
        }
      : undefined,
    whyInevitable: input.whyInevitable,
    demoNoticeTr: "Bu demo vaka hüküm vermez; yalnızca kanonik kayıt, bounded assessment ve issuance zincirini gösterir.",
    demoNoticeEn: "This demo case does not issue verdicts; it only shows canonical record, bounded assessment, and issuance chain.",
    reviewWhyEn: input.reviewWhyEn,
    reviewWhyTr: input.reviewWhyTr,
    nextStepEn: input.nextStepEn,
    nextStepTr: input.nextStepTr,
    artifactProfiles: artifactProfiles(input.apiBacked),
    incidentSpine: makeSpine(
      input.vertical,
      input.id,
      input.scenarioFrame,
      input.summary,
      hasLimitations,
      integrityCase
    ),
  };
}

export const DEMO_CASE_MATRIX: CanonicalCase[] = [
  makeCase({
    id: "vehicle-pass-clean",
    vertical: "vehicle",
    title: "Vehicle PASS Clean",
    titleTr: "Araç PASS Temiz",
    incidentClass: "vehicle_clean_witness",
    scenarioFrame: "Vehicle PASS Clean",
    eventId: "QEV-VEH-PASS-CLEAN-01",
    occurredAt: "2026-03-21T08:30:00.000Z",
    summary: "Urban fleet vehicle package with complete telemetry, camera index, and driver acknowledgement record. PASS issuance can close without a limitation annex.",
    summaryTr: "Şehir içi filo aracı paketi; tam telemetri, kamera indeksi ve sürücü onay kaydı içerir. PASS issuance limitation annex olmadan kapanabilir.",
    recordedEvidenceSummary: "Telemetry, camera index, and operator acknowledgement are recorded and hash-bound.",
    derivedAssessmentSummary: "Timeline synthesis confirms the bounded witness line without escalating to verdict.",
    limitations: [],
    limitationsTr: [],
    recordedEvidence: [
      recorded("REC-VEH-CLEAN-1", "vehicle_telemetry", "2026-03-21T08:30:00.000Z", "Vehicle telemetry spine", "Araç telemetri omurgası", "veh-clean-telemetry"),
      recorded("REC-VEH-CLEAN-2", "camera_index", "2026-03-21T08:30:01.000Z", "Forward camera frame index", "Ön kamera kare indeksi", "veh-clean-camera"),
    ],
    derivedAssessment: [
      derived("DER-VEH-CLEAN-1", "timeline_synthesis", "2026-03-21T08:31:00.000Z", ["REC-VEH-CLEAN-1", "REC-VEH-CLEAN-2"], "Clean witness timeline", "Temiz tanıklık zaman çizgisi", "Orders the recorded signals for a PASS witness summary.", "Kaydedilmiş sinyalleri PASS witness summary için sıralar."),
    ],
    whyInevitable: "Vehicle review needs one PASS line where recorded substrate and derived reading stay distinct.",
    reviewWhyEn: "Review anchors the clean issuance path with no missing canonical inputs.",
    reviewWhyTr: "İnceleme, eksik kanonik girdi olmadan temiz issuance yolunu sabitler.",
    nextStepEn: "Issue PASS Witness Summary and PASS Vehicle Incident Report.",
    nextStepTr: "PASS Witness Summary ve PASS Vehicle Incident Report üret.",
    apiBacked: true,
  }),
  makeCase({
    id: "vehicle-pass-limited",
    vertical: "vehicle",
    title: "Vehicle PASS With Limitations",
    titleTr: "Araç PASS Sınırlamalı",
    incidentClass: "vehicle_limited_witness",
    scenarioFrame: "Vehicle PASS With Limitations",
    eventId: "QEV-VEH-PASS-LIMIT-01",
    occurredAt: "2026-03-21T09:10:00.000Z",
    summary: "Vehicle event package is structurally PASS, but one roadside angle and one maintenance-side calibration note remain absent. Issuance stays PASS and limitations move to the annex.",
    summaryTr: "Araç olay paketi yapısal olarak PASS’tir; ancak bir yol kenarı açısı ve bir bakım tarafı kalibrasyon notu eksiktir. Issuance PASS kalır, sınırlamalar annex’e taşınır.",
    recordedEvidenceSummary: "Telemetry and cabin acknowledgement are recorded; roadside supporting view is missing.",
    derivedAssessmentSummary: "Derived reading stays bounded and explicitly defers the missing supporting angle.",
    limitations: [
      "A roadside support angle was not captured in the canonical package.",
      "Calibration worksheet is referenced but not embedded in the issued bundle.",
    ],
    limitationsTr: [
      "Yol kenarı destek açısı kanonik pakette yakalanmadı.",
      "Kalibrasyon çalışma kağıdı referanslı fakat issued bundle içine gömülü değil.",
    ],
    recordedEvidence: [
      recorded("REC-VEH-LIMIT-1", "vehicle_telemetry", "2026-03-21T09:10:00.000Z", "Vehicle telemetry spine", "Araç telemetri omurgası", "veh-limit-telemetry"),
      recorded("REC-VEH-LIMIT-2", "driver_ack", "2026-03-21T09:10:03.000Z", "Driver acknowledgement log", "Sürücü onay günlüğü", "veh-limit-ack"),
    ],
    derivedAssessment: [
      derived("DER-VEH-LIMIT-1", "bounded_review", "2026-03-21T09:11:00.000Z", ["REC-VEH-LIMIT-1", "REC-VEH-LIMIT-2"], "PASS with limitation synthesis", "Sınırlamalı PASS sentezi", "Preserves PASS issuance while exposing limitations in a dedicated annex.", "PASS issuance çizgisini korurken sınırlamaları ayrı annex içinde gösterir."),
    ],
    whyInevitable: "Vehicle institutions need PASS issuance that can stay open about missing support material without collapsing into FAIL.",
    reviewWhyEn: "Review keeps the main witness line PASS while isolating limitations.",
    reviewWhyTr: "İnceleme, ana tanıklık çizgisini PASS tutarken sınırlamaları izole eder.",
    nextStepEn: "Issue PASS Witness Summary, PASS Limitation Annex, and PASS Vehicle Incident Report.",
    nextStepTr: "PASS Witness Summary, PASS Limitation Annex ve PASS Vehicle Incident Report üret.",
    apiBacked: true,
  }),
  makeCase({
    id: "vehicle-pass-reverify",
    vertical: "vehicle",
    title: "Vehicle Re-Verification FAIL",
    titleTr: "Araç Yeniden Doğrulama FAIL",
    incidentClass: "vehicle_integrity_reverify",
    scenarioFrame: "Vehicle PASS Artifact / Tampered Copy",
    eventId: "QEV-VEH-REVERIFY-FAIL-01",
    occurredAt: "2026-03-21T09:40:00.000Z",
    summary: "The canonical event remains PASS. FAIL appears only if a previously issued PASS artifact returns as a tampered copy in the re-verification lane.",
    summaryTr: "Kanonik olay PASS kalır. FAIL yalnızca önceden issued PASS artefaktın oynanmış kopyası yeniden doğrulama hattına dönerse görünür.",
    recordedEvidenceSummary: "Canonical issue record, manifest, and receipt lineage remain recorded.",
    derivedAssessmentSummary: "Derived assessment explains integrity comparison only; it does not blame the event.",
    limitations: [],
    limitationsTr: [],
    recordedEvidence: [
      recorded("REC-VEH-REVERIFY-1", "issue_record", "2026-03-21T09:40:00.000Z", "Canonical issue record", "Kanonik issuance kaydı", "veh-reverify-issue"),
      recorded("REC-VEH-REVERIFY-2", "manifest_snapshot", "2026-03-21T09:40:02.000Z", "Manifest snapshot", "Manifest anlık görüntüsü", "veh-reverify-manifest"),
    ],
    derivedAssessment: [
      derived("DER-VEH-REVERIFY-1", "integrity_comparison", "2026-03-21T09:41:00.000Z", ["REC-VEH-REVERIFY-1", "REC-VEH-REVERIFY-2"], "Integrity comparison summary", "Bütünlük karşılaştırma özeti", "Compares a returning copy against the original PASS issue record.", "Geri dönen kopyayı özgün PASS issuance kaydıyla karşılaştırır."),
    ],
    whyInevitable: "Vehicle artifact integrity must fail on tamper without turning the originating event into a FAIL verdict.",
    reviewWhyEn: "Review preserves PASS issuance and shifts any breach to re-verification only.",
    reviewWhyTr: "İnceleme PASS issuance’ı korur ve ihlali yalnızca yeniden doğrulamaya taşır.",
    nextStepEn: "Issue PASS artifact, submit tampered copy, and expect TAMPER_DETECTED on re-verification.",
    nextStepTr: "PASS artefakt üret, oynanmış kopyayı geri ver ve yeniden doğrulamada TAMPER_DETECTED bekle.",
    apiBacked: true,
    tamperLane: true,
  }),
  makeCase({
    id: "drone-pass-clean",
    vertical: "drone",
    title: "Drone PASS Clean",
    titleTr: "Drone PASS Temiz",
    incidentClass: "drone_clean_witness",
    scenarioFrame: "Drone PASS Clean",
    eventId: "QEV-DRN-PASS-CLEAN-01",
    occurredAt: "2026-03-21T10:15:00.000Z",
    summary: "Drone mission corridor package includes mission log, link health, and recovery markers. PASS witness line is available without limitations.",
    summaryTr: "Drone görev koridoru paketi; görev günlüğü, link sağlığı ve toparlanma işaretlerini içerir. PASS tanıklık çizgisi sınırlama olmadan kullanılabilir.",
    recordedEvidenceSummary: "Mission log and link health are recorded in one canonical package.",
    derivedAssessmentSummary: "Derived corridor summary remains bounded to trace and mission chronology.",
    limitations: [],
    limitationsTr: [],
    recordedEvidence: [
      recorded("REC-DRN-CLEAN-1", "mission_log", "2026-03-21T10:15:00.000Z", "Mission event log", "Görev olay günlüğü", "drn-clean-log"),
      recorded("REC-DRN-CLEAN-2", "link_health", "2026-03-21T10:15:01.000Z", "Command link health", "Komut link sağlığı", "drn-clean-link"),
    ],
    derivedAssessment: [
      derived("DER-DRN-CLEAN-1", "mission_summary", "2026-03-21T10:16:00.000Z", ["REC-DRN-CLEAN-1", "REC-DRN-CLEAN-2"], "Clean drone witness summary", "Temiz drone tanıklık özeti", "Summarizes the mission without turning it into pilot blame.", "Görevi pilot suçu anlatısına dönüştürmeden özetler."),
    ],
    whyInevitable: "Drone operations need a PASS witness protocol that stays separate from operator negligence narratives.",
    reviewWhyEn: "Review confirms a clean mission package with intact command-link chronology.",
    reviewWhyTr: "İnceleme, sağlam komut-link kronolojisiyle temiz görev paketini doğrular.",
    nextStepEn: "Bind PASS Witness Summary and PASS Verification Summary.",
    nextStepTr: "PASS Witness Summary ve PASS Verification Summary bağla.",
    apiBacked: false,
  }),
  makeCase({
    id: "drone-pass-limited",
    vertical: "drone",
    title: "Drone PASS With Limitations",
    titleTr: "Drone PASS Sınırlamalı",
    incidentClass: "drone_limited_witness",
    scenarioFrame: "Drone PASS With Limitations",
    eventId: "QEV-DRN-PASS-LIMIT-01",
    occurredAt: "2026-03-21T10:45:00.000Z",
    summary: "Drone package remains PASS, but one secondary observer log and one wind station note remain out of band. The limitation annex carries those gaps.",
    summaryTr: "Drone paketi PASS kalır; ancak bir ikincil gözlemci günlüğü ve bir rüzgar istasyonu notu bant dışındadır. Bu boşluklar limitation annex’e taşınır.",
    recordedEvidenceSummary: "Flight path and recovery markers are recorded; secondary observer context is absent.",
    derivedAssessmentSummary: "Derived mission reading stays PASS and points to the missing observer context as a limitation.",
    limitations: [
      "Secondary observer handoff log is not present in the canonical package.",
      "Wind-station corroboration remains external to the issued bundle.",
    ],
    limitationsTr: [
      "İkincil gözlemci devir günlüğü kanonik pakette yok.",
      "Rüzgar istasyonu teyidi issued bundle dışında kalıyor.",
    ],
    recordedEvidence: [
      recorded("REC-DRN-LIMIT-1", "flight_path", "2026-03-21T10:45:00.000Z", "Flight path record", "Uçuş yolu kaydı", "drn-limit-path"),
      recorded("REC-DRN-LIMIT-2", "recovery_marker", "2026-03-21T10:45:02.000Z", "Recovery marker log", "Toparlanma işaret günlüğü", "drn-limit-recovery"),
    ],
    derivedAssessment: [
      derived("DER-DRN-LIMIT-1", "bounded_review", "2026-03-21T10:46:00.000Z", ["REC-DRN-LIMIT-1", "REC-DRN-LIMIT-2"], "Drone limitation synthesis", "Drone sınırlama sentezi", "Keeps the main PASS issuance line while exposing missing support context.", "Eksik destek bağlamını gösterirken ana PASS issuance çizgisini korur."),
    ],
    whyInevitable: "Drone review needs a limitation annex instead of silently degrading PASS into FAIL when support material is incomplete.",
    reviewWhyEn: "Review isolates missing support context without demoting the canonical issue line.",
    reviewWhyTr: "İnceleme, eksik destek bağlamını kanonik issuance çizgisini düşürmeden ayırır.",
    nextStepEn: "Bind PASS Witness Summary and PASS Limitation Annex.",
    nextStepTr: "PASS Witness Summary ve PASS Limitation Annex bağla.",
    apiBacked: false,
  }),
  makeCase({
    id: "drone-pass-reverify",
    vertical: "drone",
    title: "Drone Re-Verification FAIL",
    titleTr: "Drone Yeniden Doğrulama FAIL",
    incidentClass: "drone_integrity_reverify",
    scenarioFrame: "Drone PASS Artifact / Tampered Copy",
    eventId: "QEV-DRN-REVERIFY-FAIL-01",
    occurredAt: "2026-03-21T11:05:00.000Z",
    summary: "Drone event remains PASS. FAIL is reserved for a tampered copy that breaks the manifest or seal when re-verified.",
    summaryTr: "Drone olayı PASS kalır. FAIL, yalnızca oynanmış kopya manifesti veya mührü bozup yeniden doğrulamaya döndüğünde kullanılır.",
    recordedEvidenceSummary: "Original issue record and seal metadata remain recorded.",
    derivedAssessmentSummary: "Integrity comparison examines the returning artifact, not the mission truth.",
    limitations: [],
    limitationsTr: [],
    recordedEvidence: [
      recorded("REC-DRN-REVERIFY-1", "issue_record", "2026-03-21T11:05:00.000Z", "Original issue record", "Özgün issuance kaydı", "drn-reverify-issue"),
      recorded("REC-DRN-REVERIFY-2", "seal_metadata", "2026-03-21T11:05:02.000Z", "Seal metadata record", "Mühür metadata kaydı", "drn-reverify-seal"),
    ],
    derivedAssessment: [
      derived("DER-DRN-REVERIFY-1", "integrity_comparison", "2026-03-21T11:06:00.000Z", ["REC-DRN-REVERIFY-1", "REC-DRN-REVERIFY-2"], "Drone integrity comparison", "Drone bütünlük karşılaştırması", "Compares the returning copy against the original PASS issue state.", "Geri dönen kopyayı özgün PASS issuance durumu ile karşılaştırır."),
    ],
    whyInevitable: "Drone artifact integrity must be able to fail without rewriting the originating event as a failed mission verdict.",
    reviewWhyEn: "Review keeps PASS on the event and FAIL on the tampered copy only.",
    reviewWhyTr: "İnceleme PASS’i olayda, FAIL’i yalnızca oynanmış kopyada tutar.",
    nextStepEn: "Return a tampered copy and expect integrity notices in re-verification.",
    nextStepTr: "Oynanmış kopyayı geri ver ve yeniden doğrulamada integrity notice bekle.",
    apiBacked: false,
    tamperLane: true,
  }),
  makeCase({
    id: "robot-pass-clean",
    vertical: "robot",
    title: "Robot PASS Clean",
    titleTr: "Robot PASS Temiz",
    incidentClass: "robot_clean_witness",
    scenarioFrame: "Robot PASS Clean",
    eventId: "QEV-RBT-PASS-CLEAN-01",
    occurredAt: "2026-03-21T11:30:00.000Z",
    summary: "Robot operating-cell package includes route trace, stop perimeter, and operator acknowledgement. PASS witness line is intact.",
    summaryTr: "Robot operasyon hücresi paketi; rota izi, durma çevresi ve operatör onayını içerir. PASS tanıklık çizgisi sağlamdır.",
    recordedEvidenceSummary: "Route trace and safe-stop markers are recorded in the canonical cell package.",
    derivedAssessmentSummary: "Derived route reading stays inside bounded review without attributing fault.",
    limitations: [],
    limitationsTr: [],
    recordedEvidence: [
      recorded("REC-RBT-CLEAN-1", "route_trace", "2026-03-21T11:30:00.000Z", "Route trace", "Rota izi", "rbt-clean-route"),
      recorded("REC-RBT-CLEAN-2", "safe_stop", "2026-03-21T11:30:01.000Z", "Safe-stop perimeter record", "Güvenli durma çevre kaydı", "rbt-clean-stop"),
    ],
    derivedAssessment: [
      derived("DER-RBT-CLEAN-1", "route_summary", "2026-03-21T11:31:00.000Z", ["REC-RBT-CLEAN-1", "REC-RBT-CLEAN-2"], "Robot witness summary", "Robot tanıklık özeti", "Summarizes the cell event while preserving recorded and derived separation.", "Hücre olayını kayıtlı ve türetilmiş ayrımını koruyarak özetler."),
    ],
    whyInevitable: "Robot operations need a PASS witness spine that preserves safe-stop evidence without forcing a blame narrative.",
    reviewWhyEn: "Review confirms clean cell telemetry and stop-perimeter linkage.",
    reviewWhyTr: "İnceleme, temiz hücre telemetrisi ve durma çevresi bağlantısını doğrular.",
    nextStepEn: "Bind PASS Witness Summary and PASS Verification Summary.",
    nextStepTr: "PASS Witness Summary ve PASS Verification Summary bağla.",
    apiBacked: false,
  }),
  makeCase({
    id: "robot-pass-limited",
    vertical: "robot",
    title: "Robot PASS With Limitations",
    titleTr: "Robot PASS Sınırlamalı",
    incidentClass: "robot_limited_witness",
    scenarioFrame: "Robot PASS With Limitations",
    eventId: "QEV-RBT-PASS-LIMIT-01",
    occurredAt: "2026-03-21T12:00:00.000Z",
    summary: "Robot cell package remains PASS, but one external aisle camera and one maintenance acknowledgement remain outside the bundle. Those gaps stay in the limitation annex.",
    summaryTr: "Robot hücre paketi PASS kalır; ancak bir dış koridor kamerası ve bir bakım onayı paket dışındadır. Bu boşluklar limitation annex içinde kalır.",
    recordedEvidenceSummary: "Cell route trace is recorded; external aisle corroboration is not bundled.",
    derivedAssessmentSummary: "Derived review stays PASS and makes the missing external corroboration explicit.",
    limitations: [
      "External aisle camera corroboration is not packaged.",
      "Maintenance acknowledgement remains referenced, not embedded.",
    ],
    limitationsTr: [
      "Dış koridor kamera teyidi paketlenmedi.",
      "Bakım onayı referanslı fakat gömülü değil.",
    ],
    recordedEvidence: [
      recorded("REC-RBT-LIMIT-1", "route_trace", "2026-03-21T12:00:00.000Z", "Route trace", "Rota izi", "rbt-limit-route"),
      recorded("REC-RBT-LIMIT-2", "operator_log", "2026-03-21T12:00:03.000Z", "Operator log", "Operatör günlüğü", "rbt-limit-operator", "restricted_internal"),
    ],
    derivedAssessment: [
      derived("DER-RBT-LIMIT-1", "bounded_review", "2026-03-21T12:01:00.000Z", ["REC-RBT-LIMIT-1", "REC-RBT-LIMIT-2"], "Robot limitation synthesis", "Robot sınırlama sentezi", "Keeps PASS issuance available while showing the external corroboration gap.", "Dış teyit boşluğunu gösterirken PASS issuance’ı kullanılabilir tutar."),
    ],
    whyInevitable: "Robot evidence should surface missing support material as limitations, not convert the event itself into FAIL.",
    reviewWhyEn: "Review preserves the main PASS line and exposes the missing aisle support separately.",
    reviewWhyTr: "İnceleme ana PASS çizgisini korur ve eksik koridor desteğini ayrı gösterir.",
    nextStepEn: "Bind PASS Witness Summary and PASS Limitation Annex.",
    nextStepTr: "PASS Witness Summary ve PASS Limitation Annex bağla.",
    apiBacked: false,
  }),
  makeCase({
    id: "robot-pass-reverify",
    vertical: "robot",
    title: "Robot Re-Verification FAIL",
    titleTr: "Robot Yeniden Doğrulama FAIL",
    incidentClass: "robot_integrity_reverify",
    scenarioFrame: "Robot PASS Artifact / Tampered Copy",
    eventId: "QEV-RBT-REVERIFY-FAIL-01",
    occurredAt: "2026-03-21T12:20:00.000Z",
    summary: "Robot event remains PASS. FAIL is reserved for re-verifying a tampered copy that breaks the issue chain.",
    summaryTr: "Robot olayı PASS kalır. FAIL, issue zincirini bozan oynanmış kopyanın yeniden doğrulamasına ayrılmıştır.",
    recordedEvidenceSummary: "Original issue record and manifest remain intact in the canonical chain.",
    derivedAssessmentSummary: "Derived integrity comparison targets the artifact copy, not the event narrative.",
    limitations: [],
    limitationsTr: [],
    recordedEvidence: [
      recorded("REC-RBT-REVERIFY-1", "issue_record", "2026-03-21T12:20:00.000Z", "Original issue record", "Özgün issuance kaydı", "rbt-reverify-issue"),
      recorded("REC-RBT-REVERIFY-2", "manifest_snapshot", "2026-03-21T12:20:03.000Z", "Manifest snapshot", "Manifest anlık görüntüsü", "rbt-reverify-manifest"),
    ],
    derivedAssessment: [
      derived("DER-RBT-REVERIFY-1", "integrity_comparison", "2026-03-21T12:21:00.000Z", ["REC-RBT-REVERIFY-1", "REC-RBT-REVERIFY-2"], "Robot integrity comparison", "Robot bütünlük karşılaştırması", "Evaluates whether the returning artifact copy still matches the original PASS issue record.", "Geri dönen artefakt kopyasının özgün PASS issuance kaydıyla hâlâ eşleşip eşleşmediğini değerlendirir."),
    ],
    whyInevitable: "Robot artifact integrity must fail on breach while the originating witnessed event stays PASS.",
    reviewWhyEn: "Review reserves FAIL for chain breach, not for the originating robot event.",
    reviewWhyTr: "İnceleme FAIL’i özgün robot olayına değil, zincir ihlaline ayırır.",
    nextStepEn: "Feed a tampered copy back and expect chain breach notices.",
    nextStepTr: "Oynanmış kopyayı geri ver ve zincir ihlali bildirimlerini bekle.",
    apiBacked: false,
    tamperLane: true,
  }),
];