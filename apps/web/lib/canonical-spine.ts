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

function TRACE_STEP(
  step: number,
  check: string,
  result: string,
  note: string,
  tr?: { check: string; note: string }
): VerificationTraceStep {
  const row: VerificationTraceStep = { step, check, result, note };
  if (tr) {
    row.checkTr = tr.check;
    row.noteTr = tr.note;
  }
  return row;
}

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
      "Demo urban corridor: subject vehicle executed a hard brake after side-entry threat; AEB and driver inputs both appear in the raw bus. Bounded verification confirms package integrity and layer separation—so underwriting and OEM review can argue about intervention timing without fighting over which file is authoritative.",
    summaryTr:
      "Demo kent koridoru: yan giriş tehdidi sonrası araç sert fren uyguladı; ham veri yolunda hem AEB hem sürücü girdileri görünür. Sınırlı doğrulama paket bütünlüğünü ve katman ayrımını teyit eder — sigorta ve üretici incelemesi, hangi dosyanın otorite olduğu tartışmasına girmeden müdahale zamanlamasını tartışabilir.",
    verificationState: "PASS",
    reviewWhyEn:
      "Bundle–manifest linkage and immutability checks for this assisted-driving near-miss: insurers and counsel need a single chain where radar/camera fusion, brake request, and driver torque are not collapsed into one narrative before review.",
    reviewWhyTr:
      "Bu destekli sürüş yakın kaçışı için paket–manifest bağlantısı ve değişmezlik kontrolleri: sigorta ve hukuk, radar/kamera füzyonu, fren isteği ve sürücü torkunun tek anlatıda eritilmeden önce tek zincirde kalmasına ihtiyaç duyar.",
    nextStepEn:
      "For claims: attach trace appendix to the FNOL pack and reserve OEM calibration review. For legal: lock discovery scope to manifest-listed hashes only. For technical: request bounded sensor-alignment worksheet export when issuance path is enabled.",
    nextStepTr:
      "Hasar tarafı: FNOL paketine iz eki ekleyin ve OEM kalibrasyon incelemesini rezerve edin. Hukuk tarafı: keşif kapsamını yalnızca manifestte listelenen özetlere kilitleyin. Teknik taraf: düzenleme yolu açıksa sınırlı sensör hizalama çalışma kağıdı dışa aktarımını talep edin.",
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
        displayLabel: "AEB / ADAS event payload (ECU raw JSON, sealed)",
        displayLabelTr: "AEB / ADAS olay yükü (ECU ham JSON, mühürlü)",
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
        displayLabel: "CAN-FD snapshot: speed, yaw rate, brake pressure, steering torque (±400 ms)",
        displayLabelTr: "CAN-FD anlık görüntü: hız, yalpa hızı, fren basıncı, direksiyon torku (±400 ms)",
        machineLabel: "telemetry_snapshot",
      },
      {
        recordId: "REC-NEARMISS-CAMMETA",
        sourceType: "camera_metadata",
        sourceId: "SRC-NEARMISS-CAM",
        capturedAt: "2026-03-11T08:30:00.500Z",
        contentType: "application/json",
        hash: "hash-cammeta-nearmiss",
        sizeOrLength: 512,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.94,
        displayLabel: "Forward camera segment index + frame timestamps (no pixel payload in bundle)",
        displayLabelTr: "Ön kamera segment indeksi + kare zaman damgaları (pakette piksel yükü yok)",
        machineLabel: "camera_index_only",
      },
      {
        recordId: "REC-NEARMISS-EDR",
        sourceType: "edr_excerpt",
        sourceId: "SRC-NEARMISS-EDR",
        capturedAt: "2026-03-11T08:30:02.000Z",
        contentType: "application/octet-stream",
        hash: "hash-edr-nearmiss",
        sizeOrLength: 1536,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.93,
        displayLabel: "EDR-aligned excerpt hash (pre-impact 5 s, vendor redaction profile)",
        displayLabelTr: "EDR hizalı özet özet hash (çarpışma öncesi 5 sn, satıcı maskeleme profili)",
        machineLabel: "edr_excerpt_hash",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "DER-NEARMISS-TIMELINE",
        derivedType: "timeline_synthesis",
        derivedFrom: ["REC-NEARMISS-JSON", "REC-NEARMISS-TRACE", "REC-NEARMISS-CAMMETA"],
        generatedAt: "2026-03-11T08:31:00.000Z",
        method: "timeline_v1",
        confidence: 0.92,
        recordedFlag: false,
        derivationNote: "Structured assessment from recorded payload and telemetry; not a verdict on causation.",
        displayLabel: "Brake request vs driver input ordering (synthetic timeline)",
        displayLabelTr: "Fren isteği ile sürücü girdisi sıralaması (sentetik zaman çizelgesi)",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Orders AEB request, longitudinal decel onset, and steering torque rise within the demo window; useful for claims triage and OEM field-review packets. Does not decide whether the side vehicle had priority or if settings were misuse.",
        humanSummaryTr:
          "Demo penceresinde AEB isteği, boyuna yavaşlama başlangıcı ve direksiyon torku artışını sıralar; hasar triyajı ve OEM saha inceleme paketleri için kullanılır. Yan aracın önceliği veya ayarların kötüye kullanımı olup olmadığına karar vermez.",
        sourceDependencies: ["REC-NEARMISS-JSON", "REC-NEARMISS-TRACE", "REC-NEARMISS-CAMMETA"],
      },
      {
        derivedId: "DER-NEARMISS-SENSOR",
        derivedType: "analytical_reading",
        derivedFrom: ["REC-NEARMISS-JSON", "REC-NEARMISS-TRACE"],
        generatedAt: "2026-03-11T08:31:15.000Z",
        method: "cross_signal_v1",
        confidence: 0.87,
        recordedFlag: false,
        derivationNote: "Cross-sensor consistency reading; not a calibration certificate or OEM sign-off.",
        displayLabel: "Radar vs vision threat flag agreement (bounded confidence band)",
        displayLabelTr: "Radar ile görüntü tehdit bayrağı uyumu (sınırlı güven bandı)",
        machineLabel: "sensor_agreement",
        humanSummary:
          "Flags where fusion reported a side threat while longitudinal closure rate from CAN remained below nominal collision threshold—an interpretive bridge for engineers, not a statement that sensors were defective.",
        humanSummaryTr:
          "Füzyon yan tehdit bildirirken CAN üzerindeki boyuna kapanma hızının nominal çarpışma eşiğinin altında kaldığı anları işaretler — mühendisler için yorum köprüsüdür; sensörlerin kusurlu olduğu iddiası değildir.",
        sourceDependencies: ["REC-NEARMISS-JSON", "REC-NEARMISS-TRACE"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [
      "Whether dash-cam wall-clock skew relative to CAN monotonic time materially affects ordering of brake vs steering events in this demo bundle.",
      "Whether OEM-published AEB trigger band for this road grade matches the observed intervention curve without independent bench data.",
      "Whether post-event remote diagnostic upload completed inside fleet policy window; affects warranty posture but not this trace’s integrity.",
    ],
    unknownDisputedTr: [
      "Bu demo paketinde dash-cam duvar saati kayması, CAN monoton zamanına göre fren ile direksiyon olaylarının sıralamasını anlamlı biçimde değiştirir mi?",
      "Bu yol eğimi için OEM yayınlı AEB tetik bandı, bağımsız tezgâh verisi olmadan gözlenen müdahale eğrisi ile örtüşüyor mu?",
      "Olay sonrası uzaktan tanılama yüklemesi filo politika penceresi içinde tamamlandı mı; garanti duruşunu etkiler, bu izin bütünlüğünü değil.",
    ],
    verificationTrace: [
      TRACE_STEP(
        1,
        "Canonical event linkage",
        "PASS",
        "Near-miss event anchored to bundle QBN and manifest QMF; duplicate-event guard did not fire.",
        {
          check: "Kanonik olay bağlantısı",
          note: "Yakın kaçış olayı QBN paketi ve QMF manifestine bağlandı; çift olay koruması tetiklenmedi.",
        }
      ),
      TRACE_STEP(
        2,
        "Recorded vs derived separation",
        "PASS",
        "ECU JSON, CAN snapshot, camera index, and EDR excerpt remain in recorded layer; timeline and sensor readings are explicitly derived.",
        {
          check: "Kayıtlı ve türetilmiş ayrımı",
          note: "ECU JSON, CAN anlık görüntü, kamera indeksi ve EDR özeti kayıtlı katmanda; zaman çizelgesi ve sensör okumaları açıkça türetilmiş.",
        }
      ),
      TRACE_STEP(
        3,
        "Timestamp discipline",
        "PASS",
        "Monotonic bus timeline and camera frame indices align within declared skew tolerance; no silent clock rewrite detected in bundle.",
        {
          check: "Zaman damgası disiplini",
          note: "Monotonik veri yolu zaman çizelgesi ile kamera kare indeksleri beyan sapma toleransı içinde; pakette sessiz saat yeniden yazımı tespit edilmedi.",
        }
      ),
      TRACE_STEP(
        4,
        "Cross-signal plausibility",
        "PASS",
        "Fusion threat flags and longitudinal deceleration profile are co-present in the recorded substrate; derived agreement chart does not upgrade them to a fault finding.",
        {
          check: "Çapraz sinyal tutarlılığı",
          note: "Füzyon tehdit bayrakları ve boyuna yavaşlama profili kayıtlı substratta birlikte; türetilmiş uyum grafiği bunları kusur bulgusuna yükseltmez.",
        }
      ),
      TRACE_STEP(
        5,
        "Bounded verification outcome",
        "PASS",
        "Package integrity and layer discipline verified for this run; interpretive disputes listed under Unknown / Disputed remain explicitly open.",
        {
          check: "Sınırlı doğrulama sonucu",
          note: "Bu çalıştırma için paket bütünlüğü ve katman disiplini doğrulandı; Bilinmeyen / Tartışmalı altındaki yorum ihtilafları açıkça açık kalır.",
        }
      ),
    ],
    artifactIssuance: { available: true, apiBacked: true },
    incidentSpine: {
      systemType: "vehicle",
      incidentId: "golden-vehicle-nearmiss",
      scenarioTitle: "Near Miss / AEB Activation",
      incidentSummary: "Urban corridor near-miss with side entry threat; bounded layered reconstruction with separate recorded and derived narratives.",
      riskLabel: "YUKSEK",
      uncertaintyState: "medium",
      spatialVocabulary: {
        generic: "Lane / Stop line / Crossing window",
        vehicle: "Lane, curb, intersection, body relation",
      },
      phases: [
        {
          phase: "t0",
          labelTr: "Olay Öncesi",
          labelEn: "Pre-Event",
          descriptionTr: "Araç yaklaşımı, şerit uyumu ve sinyal durumu kaydedildi.",
          descriptionEn: "Vehicle approach, lane compliance and signal state captured.",
          recordedLayerHint: "Telemetry plus camera metadata in sealed package.",
          derivedLayerHint: "Planned stop line judgement and threat vector marked.",
          traceMarker: "pre_event",
        },
        {
          phase: "t1",
          labelTr: "Yaklaşım",
          labelEn: "Approach",
          descriptionTr: "Hız, fren isteği ve çevresel araç yerleşimi okunuyor.",
          descriptionEn: "Speed, brake request, and surrounding vehicle positions are analyzed.",
          recordedLayerHint: "CAN-FD snapshot and camera index alignment.",
          derivedLayerHint: "Brake intervention timeline and lane intrusions synthesized.",
          traceMarker: "approach",
        },
        {
          phase: "t2",
          labelTr: "Kritik An",
          labelEn: "Critical Moment",
          descriptionTr: "AEB devreye girer; güç, çarpışma toleransı ve karar kanıtı dikkatle işlenir.",
          descriptionEn: "AEB engages; force, collision threshold, and decision evidence are examined.",
          recordedLayerHint: "Impact locus and event marker from telemetry and camera chronology.",
          derivedLayerHint: "Near-miss risk band and trace gap uncertainty are annotated.",
          traceMarker: "critical",
        },
        {
          phase: "t3",
          labelTr: "Olay Sonrası",
          labelEn: "Post-Event",
          descriptionTr: "Geriye dönüş, kayıt tamponu ve AEB hat durumu değerlendirilir.",
          descriptionEn: "Recovery, cloud buffer, and AEB fault state are assessed.",
          recordedLayerHint: "Post-event vehicle stabilisation and error logs included.",
          derivedLayerHint: "Confidence status and unresolved unknowns are surfaced.",
          traceMarker: "post_event",
        },
      ],
    },
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
      {
        profileCode: "claims",
        enabled: true,
        apiBacked: true,
        reasonTr:
          "Hasar dosyası: kanonik özet, iz eki ve makbuz hattı — kusur hükmü veya tek taraflı sorumluluk dili üretmez.",
        reasonEn:
          "Claims pack: canonical summary, trace appendix, and receipt chain — does not emit fault findings or one-sided liability language.",
      },
      {
        profileCode: "legal",
        enabled: true,
        apiBacked: true,
        reasonTr:
          "Hukukî dosyalama: manifest bağlı kimlik alanları ve katman ayrımı — delil listesi değil mahkeme kararı ikamesi değildir.",
        reasonEn:
          "Legal filing shell: manifest-bound identity fields and layer separation — an exhibit list, not a substitute for court determination.",
      },
      {
        profileCode: "technical",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "OEM / mühendislik okuması: sensör ve zaman çizelgesi sentezi; bounded PDF/JSON issuance yolu henüz bağlı değil.",
        reasonEn:
          "OEM / engineering read: sensor and timeline synthesis; bounded PDF/JSON issuance path not yet wired.",
      },
      {
        profileCode: "safety",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "Saha güvenliği notu: müdahale öncesi/sonrası ölçülebilir göstergeler; operasyonel görevlendirme emri değildir.",
        reasonEn:
          "Field safety note: measurable pre/post-intervention indicators; not an operational dispatch order.",
      },
      {
        profileCode: "governance",
        enabled: false,
        apiBacked: false,
        reasonTr: "Bu vaka bağlamında öncelikli yönetişim paketi tanımlanmadı.",
        reasonEn: "No priority governance packet defined for this case context.",
      },
      {
        profileCode: "regulatory",
        enabled: false,
        apiBacked: false,
        reasonTr: "Tip onayı / uyum beyanı bu demo kapsamında ayrıcalıklı çıkarılmıyor.",
        reasonEn: "Type-approval / compliance attestation not privileged in this demo scope.",
      },
      {
        profileCode: "public_safety",
        enabled: false,
        apiBacked: false,
        reasonTr: "Genel kamu güvenliği duyurusu bu paketten türetilmedi.",
        reasonEn: "Public safety bulletin not derived from this package.",
      },
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
      "Demo two-vehicle intersection contact: both parties assert green-time and lane discipline. The canonical package preserves ECU fragments, signal-controller excerpt, and dash indices so bounded verification can attest structure—not who had priority.",
    summaryTr:
      "Demo iki araçlı kavşak teması: her iki taraf da yeşil süre ve şerit disiplinini ileri sürüyor. Kanonik paket ECU parçaları, sinyal kumanda özeti ve gösterge indekslerini korur; böylece sınırlı doğrulama yapıyı teyit eder — önceliğin kimde olduğuna karar vermez.",
    verificationState: "UNKNOWN",
    reviewWhyEn:
      "Multi-party collision reviews fail when each side exports a different PDF. Here the spine locks hashes for vehicle payloads, signal timing excerpt, and third-party witness-device ping—so dispute is argued on shared references, not on shadow copies.",
    reviewWhyTr:
      "Çok taraflı çarpışma incelemeleri taraflar farklı PDF dışa aktardığında çöker. Burada omurga araç yükleri, sinyal zaman özeti ve üçüncü taraf tanık cihaz ping’i için özetleri kilitler — ihtilaf gölge kopyalar üzerinden değil paylaşılan referanslar üzerinden yürütülür.",
    nextStepEn:
      "Claims: freeze subrogation narrative to manifest-listed artifacts only. Legal: schedule joint technical read on signal-phase log vs ECU clock skew. Municipal liaison: optional administrative packet for signal maintenance history—export when regulatory profile is enabled in your tenant.",
    nextStepTr:
      "Hasar: rücu anlatısını yalnızca manifestte listelenen artefaktlarla dondurun. Hukuk: sinyal faz günlüğü ile ECU saat kayması üzerine ortak teknik okuma planlayın. İdari muhatap: sinyal bakım geçmişi için isteğe bağlı idari paket — kiracınızda düzenleyici profil açıksa dışa aktarın.",
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
        displayLabel: "Per-vehicle ECU collision fragment (speed, heading, brake, indicator state)",
        displayLabelTr: "Araç başına ECU çarpışma parçası (hız, yön, fren, sinyal kolu)",
        machineLabel: "source_event_json",
      },
      {
        recordId: "REC-COLLISION-SIGNAL",
        sourceType: "traffic_controller_log",
        sourceId: "SRC-COLLISION-SIG",
        capturedAt: "2026-03-11T09:45:00.100Z",
        contentType: "application/json",
        hash: "hash-signal-collision",
        sizeOrLength: 896,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.91,
        displayLabel: "Anonymized signal phase log excerpt (cycle ID only, no jurisdiction name)",
        displayLabelTr: "Anonim sinyal faz günlüğü özeti (yalnızca döngü kimliği, yetki alanı adı yok)",
        machineLabel: "signal_excerpt",
      },
      {
        recordId: "REC-COLLISION-LIDAR",
        sourceType: "lidar_snapshot",
        sourceId: "SRC-COLLISION-LID",
        capturedAt: "2026-03-11T09:45:00.200Z",
        contentType: "application/octet-stream",
        hash: "hash-lidar-collision",
        sizeOrLength: 2816,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.89,
        displayLabel: "Lidar point-cloud index + pose hash (payload referenced off-manifest per policy)",
        displayLabelTr: "Lidar nokta bulutu indeksi + poz hash (yük politika gereği manifest dışı referans)",
        machineLabel: "lidar_index",
      },
      {
        recordId: "REC-COLLISION-WITNESS",
        sourceType: "mobile_telemetry_ping",
        sourceId: "SRC-COLLISION-WIT",
        capturedAt: "2026-03-11T09:45:01.000Z",
        contentType: "application/json",
        hash: "hash-witness-ping",
        sizeOrLength: 320,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.84,
        displayLabel: "Third-party dash-app coarse GPS ping + device clock (consent-scoped demo token)",
        displayLabelTr: "Üçüncü taraf dash uygulaması kaba GPS ping + cihaz saati (onay kapsamlı demo jetonu)",
        machineLabel: "witness_ping",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "DER-COLLISION-TIMELINE",
        derivedType: "timeline_synthesis",
        derivedFrom: ["REC-COLLISION-JSON", "REC-COLLISION-SIGNAL"],
        generatedAt: "2026-03-11T09:46:00.000Z",
        method: "timeline_v1",
        confidence: 0.88,
        recordedFlag: false,
        derivationNote: "Structured reading from recorded payload; does not resolve disputed lane or signal interpretation.",
        displayLabel: "Approach–impact ordering relative to signal cycle markers",
        displayLabelTr: "Sinyal döngü işaretleyicilerine göre yaklaşma–temas sıralaması",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Aligns both vehicle deceleration curves to the same anonymized cycle IDs; shows where narratives diverge without picking a winner. Useful for joint expert sessions and insurance mediation binders.",
        humanSummaryTr:
          "Her iki aracın yavaşlama eğrilerini aynı anonim döngü kimlikleriyle hizalar; anlatıların nerede ayrıldığını kazanan seçmeden gösterir. Ortak bilirkişi oturumları ve sigorta arabuluculuk dosyaları için uygundur.",
        sourceDependencies: ["REC-COLLISION-JSON", "REC-COLLISION-SIGNAL"],
      },
      {
        derivedId: "DER-COLLISION-GEOM",
        derivedType: "analytical_reading",
        derivedFrom: ["REC-COLLISION-LIDAR", "REC-COLLISION-JSON"],
        generatedAt: "2026-03-11T09:46:30.000Z",
        method: "geometry_hint_v1",
        confidence: 0.82,
        recordedFlag: false,
        derivationNote: "Geometric hint from indexed lidar + pose; not a crash reconstruction certificate.",
        displayLabel: "Lane occupancy hint at T−2 s / T0 (confidence banded)",
        displayLabelTr: "T−2 sn / T0 anında şerit işgal ipucu (güven bandlı)",
        machineLabel: "geom_hint",
        humanSummary:
          "Estimates relative lateral position bands immediately before contact; explicitly labeled as hypothesis-grade for engineers—does not replace police diagram or insurer scene survey.",
        humanSummaryTr:
          "Temas öncesi göreli yanal konum bantlarını tahmin eder; mühendisler için açıkça hipotez sınıfı etiketlenir — polis diyagramı veya sigorta saha ölçümünün yerini almaz.",
        sourceDependencies: ["REC-COLLISION-LIDAR", "REC-COLLISION-JSON"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [
      "Which party’s perception of green-time matches the controller excerpt when accounting for local clock skew and firmware revision.",
      "Whether the witness-app ping establishes presence inside the box or only proximity; admissibility posture varies by forum.",
      "Whether lidar index resolution is sufficient for lane-discipline claims without raw cloud retrieval—retrieval policy is outside this verification run.",
    ],
    unknownDisputedTr: [
      "Yerel saat kayması ve ürün yazılımı revizyonu hesaba katıldığında yeşil süre algısı kumanda özetine hangi tarafın örtüştüğü.",
      "Tanık uygulaması ping’i kutunun içinde varlığı mı yoksa yalnızca yakınlığı mı kurar; kabul edilebilirlik duruşu foruma göre değişir.",
      "Ham bulut alınmadan şerit disiplini iddiaları için lidar indeks çözünürlüğü yeterli mi — alım politikası bu doğrulama çalıştırmasının dışındadır.",
    ],
    verificationTrace: [
      TRACE_STEP(
        1,
        "Canonical event linkage",
        "PASS",
        "Intersection bundle lists both vehicle fragments under one manifest; cross-reference IDs consistent.",
        {
          check: "Kanonik olay bağlantısı",
          note: "Kavşak paketi her iki araç parçasını tek manifest altında listeler; çapraz referans kimlikleri tutarlı.",
        }
      ),
      TRACE_STEP(
        2,
        "Recorded vs derived separation",
        "PASS",
        "Controller excerpt and witness ping remain recorded; timeline and geometry hints are isolated in derived objects.",
        {
          check: "Kayıtlı ve türetilmiş ayrımı",
          note: "Kumanda özeti ve tanık ping kayıtlı kalır; zaman çizelgesi ve geometri ipuçları türetilmiş nesnelerde izole.",
        }
      ),
      TRACE_STEP(
        3,
        "Multi-party integrity",
        "PASS",
        "No silent merge of party-specific payloads; each hash line references its declared source type.",
        {
          check: "Çok taraflı bütünlük",
          note: "Tarafa özgü yüklerde sessiz birleştirme yok; her özet satırı beyan edilen kaynak tipine referans verir.",
        }
      ),
      TRACE_STEP(
        4,
        "Disputed fact boundary",
        "UNKNOWN",
        "Open questions on signal interpretation and witness relevance remain listed; trace does not collapse them into a verdict.",
        {
          check: "Tartışmalı olgu sınırı",
          note: "Sinyal yorumu ve tanık ilişkilendirmesine dair açık sorular listelenmiş kalır; iz bunları hükme indirgemez.",
        }
      ),
      TRACE_STEP(
        5,
        "Bounded verification outcome",
        "UNKNOWN",
        "Structural verification complete for this run; factual allocation explicitly deferred to human fora.",
        {
          check: "Sınırlı doğrulama sonucu",
          note: "Bu çalıştırma için yapısal doğrulama tamamlandı; olgusal paylaştırma açıkça insan forumlarına ertelendi.",
        }
      ),
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
      {
        profileCode: "claims",
        enabled: true,
        apiBacked: true,
        reasonTr:
          "Çok taraflı hasar paketi: çarpışma çekirdeği + iz eki; kusur yüzdesi veya tahkim sonucu üretmez.",
        reasonEn:
          "Multi-party claims pack: collision core + trace appendix; does not output fault percentages or arbitration outcomes.",
      },
      {
        profileCode: "legal",
        enabled: true,
        apiBacked: true,
        reasonTr:
          "Keşif çerçevesi: kanonik kimlikler ve katmanlı delil envanteri; mahkeme hükmü veya savcılık görüşü değildir.",
        reasonEn:
          "Discovery framing: canonical IDs and layered exhibit inventory; not a court ruling or prosecution opinion.",
      },
      {
        profileCode: "technical",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "Saha mühendisliği özeti: lidar indeks + geometri ipucu; tam rekonstrüksiyon raporu issuance ile bağlı değil.",
        reasonEn:
          "Field engineering summary: lidar index + geometry hint; full reconstruction report not wired to issuance.",
      },
      {
        profileCode: "safety",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "Olay yeri güvenliği notu: sinyal ve yaklaşma ölçülebilir göstergeleri; trafik düzenleme emri değildir.",
        reasonEn:
          "Scene safety note: measurable signal and approach indicators; not a traffic control order.",
      },
      {
        profileCode: "governance",
        enabled: false,
        apiBacked: false,
        reasonTr: "Kurumsal olay yönetişimi bu demo vakasında paketlenmedi.",
        reasonEn: "Corporate incident governance not packaged for this demo case.",
      },
      {
        profileCode: "regulatory",
        enabled: false,
        apiBacked: false,
        reasonTr: "Sinyal bakım idari özeti isteğe bağlıdır; varsayılan olarak kapalı.",
        reasonEn: "Signal maintenance administrative summary is optional; off by default.",
      },
      {
        profileCode: "public_safety",
        enabled: false,
        apiBacked: false,
        reasonTr: "Kamu güvenliği uyarısı bu paketten otomatik türetilmez.",
        reasonEn: "Public safety alert not auto-derived from this package.",
      },
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
      "Demo BVLOS corridor: command uplink and telemetry downlink drop for a bounded window while the aircraft continues on last-valid mission vectors. Bounded verification preserves raw link metrics, RC handoff log, and geofence heartbeat—so oversight can audit the loss window without inferring pilot negligence.",
    summaryTr:
      "Demo BVLOS koridoru: hava aracı son geçerli görev vektörleriyle devam ederken komut yük bağlantısı ve telemetri iniş hattı sınırlı bir pencerede düşer. Sınırlı doğrulama ham bağlantı ölçümlerini, kumanda el değişimi günlüğünü ve coğrafi çit nabzını korur — gözetim kayıp penceresini denetleyebilir, pilot ihmali çıkarmaz.",
    verificationState: "UNVERIFIED",
    reviewWhyEn:
      "BVLOS accountability turns on whether the loss window, failsafe ladder, and operator re-acquisition are all on one manifest-backed chain. This demo case stresses that separation between raw RF/telemetry captures and any narrative about “who lost control” must remain explicit.",
    reviewWhyTr:
      "BVLOS hesap verebilirliği; kayıp penceresi, failsafe basamakları ve operatör yeniden ele geçirmenin tek manifest destekli zincirde olup olmadığına bağlıdır. Bu demo vaka, ham RF/telemetri yakalamaları ile “kontrolü kim kaybetti” anlatısı arasındaki ayrımın açık kalması gerektiğini vurgular.",
    nextStepEn:
      "Oversight: file BVLOS exceedance worksheet against the trace appendix. Operator org: pair this bundle with rostered PIC and relief-controller logs (outside this package). Insurer: use claims profile only for first-party equipment exposure—no third-party ground liability inference from this trace.",
    nextStepTr:
      "Gözetim: aşım çalışma kağıdını iz ekiyle eşleştirin. Operatör kuruluş: bu paketi görevli PIC ve yedek kumanda günlükleriyle eşleyin (paket dışı). Sigorta: yalnızca birinci taraf ekipman maruziyeti için hasar profilini kullanın — bu izden üçüncü taraf zemin sorumluluğu çıkarmayın.",
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
        displayLabel: "Primary downlink frame stream (RSSI, SNR, packet loss, GPS fix quality)",
        displayLabelTr: "Birincil iniş hattı kare akışı (RSSI, SNR, paket kaybı, GPS kalite)",
        machineLabel: "telemetry_stream",
      },
      {
        recordId: "rec-drone-003-2",
        sourceType: "command_uplink_log",
        sourceId: "SRC-DRONE-003-U",
        capturedAt: "2025-03-14T10:05:02Z",
        contentType: "application/json",
        hash: "hash-drone-003-uplink",
        sizeOrLength: 640,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.88,
        displayLabel: "Uplink command queue snapshot (mode flags, last acknowledged stick/digital inputs)",
        displayLabelTr: "Yüksel bağlantı komut kuyruğu anlık görüntüsü (mod bayrakları, son onaylı girdiler)",
        machineLabel: "uplink_queue",
      },
      {
        recordId: "rec-drone-003-3",
        sourceType: "geofence_heartbeat",
        sourceId: "SRC-DRONE-003-GF",
        capturedAt: "2025-03-14T10:05:04Z",
        contentType: "application/json",
        hash: "hash-drone-003-gf",
        sizeOrLength: 384,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.92,
        displayLabel: "Geofence server heartbeat + corridor boundary tokens (no map tiles in bundle)",
        displayLabelTr: "Coğrafi çit sunucu nabzı + koridor sınır jetonları (pakette harita karo yok)",
        machineLabel: "geofence_hb",
      },
      {
        recordId: "rec-drone-003-4",
        sourceType: "operator_handoff_log",
        sourceId: "SRC-DRONE-003-H",
        capturedAt: "2025-03-14T10:06:30Z",
        contentType: "application/json",
        hash: "hash-drone-003-handoff",
        sizeOrLength: 512,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.86,
        displayLabel: "Control-station roster handoff log (anonymized station IDs)",
        displayLabelTr: "Kontrol istasyonu nöbet el değişimi günlüğü (anonim istasyon kimlikleri)",
        machineLabel: "handoff_log",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "der-drone-003-timeline",
        derivedType: "timeline_synthesis",
        derivedFrom: ["rec-drone-003-1", "rec-drone-003-2"],
        generatedAt: "2025-03-14T10:06:00Z",
        method: "timeline_v1",
        confidence: 0.85,
        recordedFlag: false,
        derivationNote: "Structured assessment from recorded telemetry; not a determination of operator responsibility.",
        displayLabel: "Link-loss window vs failsafe ladder ordering",
        displayLabelTr: "Bağlantı kaybı penceresi ve failsafe basamak sıralaması",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Orders the first missed ACK, first sustained telemetry gap, and published failsafe transitions as separate markers—useful for CAA-style review binders. Does not score crew competence.",
        humanSummaryTr:
          "İlk kaçırılan ACK, ilk sürekli telemetri boşluğu ve yayınlanan failsafe geçişlerini ayrı işaretleyiciler olarak sıralar; SHGM tarzı inceleme dosyaları için uygundur. Mürettebat yeterliliğine puan vermez.",
        sourceDependencies: ["rec-drone-003-1", "rec-drone-003-2"],
      },
      {
        derivedId: "der-drone-003-energy",
        derivedType: "analytical_reading",
        derivedFrom: ["rec-drone-003-1"],
        generatedAt: "2025-03-14T10:06:15Z",
        method: "power_budget_v1",
        confidence: 0.8,
        recordedFlag: false,
        derivationNote: "Power-budget hint from bus voltage samples in stream; not a battery airworthiness ruling.",
        displayLabel: "Propulsion bus voltage trend during link-loss (hint only)",
        displayLabelTr: "Bağlantı kaybı sırasında tahrik bara gerilim eğilimi (yalnızca ipucu)",
        machineLabel: "power_hint",
        humanSummary:
          "Flags whether voltage sag correlates temporally with high RF retransmit bursts—helps maintenance triage, not pilot blame.",
        humanSummaryTr:
          "Gerilim düşüşünün yüksek RF yeniden iletim patlamalarıyla zamansal örtüşüp örtüşmediğini işaretler — bakım triyajına yardımcıdır, pilot suçlaması değildir.",
        sourceDependencies: ["rec-drone-003-1"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [
      "Whether the measured link-loss duration exceeded the operator’s declared CONOPS limit once maintenance-adjusted thresholds are applied.",
      "Whether geofence server clock skew understates time outside the corridor during the gap—requires independent NTP audit.",
      "Whether secondary observer C2 station (not in this bundle) issued conflicting RTL commands during recovery.",
    ],
    unknownDisputedTr: [
      "Ölçülen bağlantı kaybı süresi, bakım düzeltmeli eşikler uygulandığında operatörün beyan CONOPS sınırını aştı mı?",
      "Coğrafi çit sunucu saat kayması, boşluk sırasında koridor dışı süreyi hafifletiyor mu — bağımsız NTP denetimi gerekir.",
      "Bu pakette olmayan ikincil gözlemci C2 istasyonu kurtarma sırasında çelişkili RTL komutu verdi mi?",
    ],
    verificationTrace: [
      TRACE_STEP(
        1,
        "Link-loss window",
        "OK",
        "Loss window registered on manifest with monotonic onboard timebase; no post-hoc stretch detected in bundle.",
        {
          check: "Bağlantı kaybı penceresi",
          note: "Kayıp penceresi manifestte monotonik uçuş zaman tabanıyla kayıtlı; pakette sonradan uzatma tespit edilmedi.",
        }
      ),
      TRACE_STEP(
        2,
        "Telemetry integrity",
        "OK",
        "Downlink frames before/after gap are hash-chained; missing sequence numbers explicitly enumerated.",
        {
          check: "Telemetri bütünlüğü",
          note: "Boşluktan önce/sonra iniş hattı kareleri zincir özetli; eksik sıra numaraları açıkça numaralandı.",
        }
      ),
      TRACE_STEP(
        3,
        "Failsafe ladder documentation",
        "OK",
        "Failsafe transitions appear as recorded mode flags; derived timeline narrates but does not upgrade them to compliance findings.",
        {
          check: "Failsafe basamak belgesi",
          note: "Failsafe geçişleri kayıtlı mod bayrakları olarak görünür; türetilmiş zaman çizelgesi anlatır, uyum bulgusuna yükseltmez.",
        }
      ),
      TRACE_STEP(
        4,
        "Handoff log presence",
        "OK",
        "Operator handoff log present and separated from telemetry—human factors review remains external to this trace.",
        {
          check: "El değişimi günlüğü varlığı",
          note: "Operatör el değişimi günlüğü mevcut ve telemetriden ayrı — insan faktörleri incelemesi bu izin dışında kalır.",
        }
      ),
      TRACE_STEP(
        5,
        "BVLOS accountability",
        "UNVERIFIED",
        "Accountability allocation across PIC, relief controller, and infrastructure remains explicitly open; trace lists checks only.",
        {
          check: "BVLOS hesap verebilirliği",
          note: "PIC, yedek kumanda ve altyapı arasında hesap paylaşımı açıkça açık kalır; iz yalnızca kontrolleri listeler.",
        }
      ),
    ],
    artifactIssuance: { available: true, apiBacked: true },
    incidentSpine: {
      systemType: "drone",
      incidentId: "golden-drone-linkloss",
      scenarioTitle: "Link Loss / Operator Uncertainty",
      incidentSummary: "BVLOS link-loss event with handoff and mission corridor integrity; separate recorded and derived windows support audit without narrative overreach.",
      riskLabel: "ORTA",
      uncertaintyState: "medium",
      spatialVocabulary: {
        generic: "Corridor / Airspace / Geofence",
        vehicle: "Waypoint, altitude, fail-safe",
      },
      phases: [
        {
          phase: "t0",
          labelTr: "Ön Olay",
          labelEn: "Pre-Event",
          descriptionTr: "Görev öncesi link sağlığı, plan hedef ve yayın parametreleri kaydedildi.",
          descriptionEn: "Pre-flight link health, planned waypoint and uplink policy are captured.",
          recordedLayerHint: "GPS + radio link health samples in sealed telemetry bundle.",
          derivedLayerHint: "Pre-loss risk envelope and waypoint adherence estimation.",
          traceMarker: "pre_event",
        },
        {
          phase: "t1",
          labelTr: "Yaklaşım",
          labelEn: "Approach",
          descriptionTr: "İniş hatası öncesi komut/telemetri bütünü izlenir.",
          descriptionEn: "Pre-failure command/telemetry stream alignment is monitored.",
          recordedLayerHint: "Command and telemetry cadence logs from source capture.",
          derivedLayerHint: "Soft-fail indicator trend and first-missed transmit gap.",
          traceMarker: "approach",
        },
        {
          phase: "t2",
          labelTr: "Kritik An",
          labelEn: "Critical Moment",
          descriptionTr: "Uçuş link kaybı ve failsafe geçişi doğrulanır.",
          descriptionEn: "Loss handoff and failsafe transition are confirmed.",
          recordedLayerHint: "Loss-of-lock and autopilot switch flags in raw streams.",
          derivedLayerHint: "Risk band opening and diversion intention inference.",
          traceMarker: "critical",
        },
        {
          phase: "t3",
          labelTr: "Olay Sonrası",
          labelEn: "Post-Event",
          descriptionTr: "Yeniden kazanım, politika etkinliği ve kayıt milleri değerlendirilir.",
          descriptionEn: "Reacquisition, policy compliance, and record tail are assessed.",
          recordedLayerHint: "Post-loss telemetry backfill and handoff metadata.",
          derivedLayerHint: "Residual uncertainty / intent versus rule-based loss review.",
          traceMarker: "post_event",
        },
      ],
    },
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
      {
        profileCode: "claims",
        enabled: true,
        apiBacked: true,
        reasonTr:
          "Ekipman ve operasyon kesinti maruziyeti: iz ekiyle sınırlı hasar dosyası; üçüncü taraf zemin iddiası üretmez.",
        reasonEn:
          "Equipment / ops interruption exposure: claims binder bounded to trace appendix; does not manufacture third-party ground allegations.",
      },
      {
        profileCode: "legal",
        enabled: true,
        apiBacked: true,
        reasonTr:
          "Denetim ve sözleşme uyumu için kanonik zincir özeti; savunma veya dava stratejisi değildir.",
        reasonEn:
          "Canonical chain summary for oversight and contract alignment; not a defense or litigation strategy memo.",
      },
      {
        profileCode: "technical",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "Bakım triyajı: güç ve RF ipuçları; tam uçuş veri kaydı (FDR) ikamesi değildir.",
        reasonEn:
          "Maintenance triage: power and RF hints; not a substitute for a full flight data record.",
      },
      {
        profileCode: "safety",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "Saha güvenliği brifingi: koridor ve failsafe sınırları; görev emri veya NOTAM ikamesi değildir.",
        reasonEn:
          "Field safety briefing: corridor and failsafe boundaries; not an ops order or NOTAM substitute.",
      },
      {
        profileCode: "governance",
        enabled: false,
        apiBacked: false,
        reasonTr: "Kurumsal drone gözetim paketi bu demo için ayrıcalıklı değil.",
        reasonEn: "Corporate drone governance pack not privileged for this demo.",
      },
      {
        profileCode: "regulatory",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "Uyum dosyası çerçevesi: BVLOS aşım çalışma kağıdı şablonu; düzenleyici onay beyanı değildir.",
        reasonEn:
          "Compliance filing frame: BVLOS exceedance worksheet template; not a regulatory approval attestation.",
      },
      {
        profileCode: "public_safety",
        enabled: false,
        apiBacked: false,
        reasonTr: "Genel kamu uyarısı bu izden türetilmedi.",
        reasonEn: "General public alert not derived from this trace.",
      },
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
    summary:
      "Demo waypoint transit: aircraft climbs through the cleared altitude band while still nominally on mission plan hash. Raw NAV solution, wind shear estimate channel, and mission file revision tag are co-registered so oversight can separate “off-plan geometry” from “off-plan intent.”",
    summaryTr:
      "Demo waypoint geçişi: hava aracı hâlâ nominal görev planı özeti üzerindeyken temizlenmiş irtifa bandının üstüne çıkar. Ham NAV çözümü, rüzgâr kesir tahmin kanalı ve görev dosyası revizyon etiketi birlikte kayıtlıdır; böylece gözetim “plandan sapmış geometriyi” “plandan sapmış niyetten” ayırabilir.",
    verificationState: "UNVERIFIED",
    reviewWhyEn:
      "Mission anomalies in BVLOS-adjacent ops often mix environmental readings with autopilot mode changes. This case stresses recorded separation: the mission JSON hash, autopilot mode enum stream, and METAR ingestion token must not be flattened before technical or regulatory readers engage.",
    reviewWhyTr:
      "BVLOS yakın operasyonlarda görev anomalileri çevresel okumaları otopilot mod değişimleriyle karıştırır. Bu vaka kayıtlı ayrımı vurgular: görev JSON özeti, otopilot mod numaralandırma akışı ve METAR alım jetonu teknik veya düzenleyici okuyucular devreye girmeden düzleştirilmemelidir.",
    nextStepEn:
      "Chief pilot: compare mission file revision tag against signed dispatch release. Compliance: map deviation seconds only to the trace-backed band table—do not infer SORA breach from narrative alone. Client insurer: technical pack export for rotor-stress subrogation only if engineering profile is enabled.",
    nextStepTr:
      "Baş pilot: görev dosyası revizyon etiketini imzalı sevk onayıyla karşılaştırın. Uyum: sapma saniyelerini yalnızca iz destekli bant tablosuna eşleyin — yalnızca anlatıdan SORA ihlali çıkarmayın. Müşteri sigortası: mühendislik profili açıksa rotor gerilimi rücu için teknik paket dışa aktarımı.",
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
        displayLabel: "Waypoint transit telemetry (AGL, ground speed, autopilot mode enum, rotor RPM)",
        displayLabelTr: "Waypoint geçiş telemetrisi (AGL, yer hızı, otopilot mod numaraları, rotor devri)",
        machineLabel: "telemetry_stream",
      },
      {
        recordId: "rec-drone-001-2",
        sourceType: "mission_file",
        sourceId: "SRC-DRONE-001-M",
        capturedAt: "2025-03-12T14:21:50Z",
        contentType: "application/json",
        hash: "hash-drone-001-mission",
        sizeOrLength: 1820,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.94,
        displayLabel: "Signed mission plan blob + waypoint altitude ceilings (hash-only in manifest)",
        displayLabelTr: "İmzalı görev planı + waypoint irtifa tavanları (manifestte yalnızca özet)",
        machineLabel: "mission_blob",
      },
      {
        recordId: "rec-drone-001-3",
        sourceType: "environmental_ingest",
        sourceId: "SRC-DRONE-001-W",
        capturedAt: "2025-03-12T14:21:55Z",
        contentType: "application/json",
        hash: "hash-drone-001-wind",
        sizeOrLength: 420,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.87,
        displayLabel: "METAR / micro-forecast token ingested pre-flight (source station anonymized)",
        displayLabelTr: "Uçuş öncesi alınan METAR / mikro tahmin jetonu (istasyon anonim)",
        machineLabel: "wx_ingest",
      },
      {
        recordId: "rec-drone-001-4",
        sourceType: "obstacle_radar",
        sourceId: "SRC-DRONE-001-OBS",
        capturedAt: "2025-03-12T14:22:10Z",
        contentType: "application/octet-stream",
        hash: "hash-drone-001-obs",
        sizeOrLength: 960,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.85,
        displayLabel: "Obstacle radar contact list (range/bearing snapshots, no imagery)",
        displayLabelTr: "Engel radarı temas listesi (menzil/yön anlık görüntüleri, görüntü yok)",
        machineLabel: "radar_contacts",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "der-drone-001-timeline",
        derivedType: "timeline_synthesis",
        derivedFrom: ["rec-drone-001-1", "rec-drone-001-2"],
        generatedAt: "2025-03-12T14:23:00Z",
        method: "timeline_v1",
        confidence: 0.88,
        recordedFlag: false,
        derivationNote: "Structured assessment from recorded telemetry; does not assign cause of deviation.",
        displayLabel: "Ceiling breach window vs mode transitions",
        displayLabelTr: "Tavan ihlali penceresi ve mod geçişleri",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Shows when AGL first exceeds the mission ceiling token while autopilot remained in LOITER-TRANSIT versus when climb authority shifted—supports SORA-style evidence binders without stating regulatory breach.",
        humanSummaryTr:
          "AGL’nin görev tavan jetonunu ilk kez aştığı anı otopilotun LOITER-TRANSIT’te kaldığı dönemle, tırmanış yetkisinin değiştiği anı gösterir — düzenleyici ihlal beyanı olmadan SORA tarzı delil dosyalarına destek olur.",
        sourceDependencies: ["rec-drone-001-1", "rec-drone-001-2"],
      },
      {
        derivedId: "der-drone-001-wind",
        derivedType: "analytical_reading",
        derivedFrom: ["rec-drone-001-1", "rec-drone-001-3"],
        generatedAt: "2025-03-12T14:23:20Z",
        method: "wx_correlation_v1",
        confidence: 0.79,
        recordedFlag: false,
        derivationNote: "Correlation hint between vertical speed and ingested gust token; not a meteorological certification.",
        displayLabel: "Vertical speed vs gust-token correlation (hypothesis tag)",
        displayLabelTr: "Dikey hız ile hamle jetonu korelasyonu (hipotez etiketi)",
        machineLabel: "wx_corr",
        humanSummary:
          "Flags temporal overlap between climb rate spikes and forecast gust markers—useful for operator debrief scripts, not for blaming ATC or forecast providers.",
        humanSummaryTr:
          "Tırmanma hızı sıçramaları ile tahmin hamle işaretleyicileri arasında zamansal örtüşmeyi işaretler — operatör brifing metinleri için uygundur; ATC veya tahmin sağlayıcıyı suçlamak için değildir.",
        sourceDependencies: ["rec-drone-001-1", "rec-drone-001-3"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [
      "Whether the ceiling token in the signed mission file matches the regulatory band table version active on dispatch date.",
      "Whether obstacle radar contacts materially explain the climb or are uncorrelated noise—human sensor fusion review required.",
      "Whether autopilot mode labels in the enum stream map 1:1 to the OEM manual the operator trained on.",
    ],
    unknownDisputedTr: [
      "İmzalı görev dosyasındaki tavan jetonu, sevk tarihinde geçerli düzenleyici bant tablosu sürümüyle örtüşüyor mu?",
      "Engel radarı temasları tırmanmayı anlamlı biçimde açıklıyor mu yoksa ilişkisiz gürültü mü — insan sensör füzyon incelemesi gerekir.",
      "Numaralandırma akışındaki otopilot mod etiketleri operatörün eğitildiği OEM kılavuzuyla bire bir örtüşüyor mu?",
    ],
    verificationTrace: [
      TRACE_STEP(
        1,
        "Mission plan linkage",
        "OK",
        "Mission hash on manifest matches signed blob reference; waypoint list not silently rewritten inside bundle.",
        {
          check: "Görev planı bağlantısı",
          note: "Manifestteki görev özeti imzalı yük referansıyla eşleşir; waypoint listesi paket içinde sessizce yeniden yazılmamış.",
        }
      ),
      TRACE_STEP(
        2,
        "Altitude band deviation",
        "OK",
        "AGL samples exceed declared ceiling for 6.4 s per recorded clock; significance deferred to oversight.",
        {
          check: "İrtifa bandı sapması",
          note: "AGL örnekleri kayıtlı saate göre beyan tavanı 6,4 sn aşar; anlam gözetimde ertelenir.",
        }
      ),
      TRACE_STEP(
        3,
        "Environmental ingest boundary",
        "OK",
        "METAR token remains a recorded ingest; derived gust correlation is isolated and labeled hypothetical.",
        {
          check: "Çevresel alım sınırı",
          note: "METAR jetonu kayıtlı alım olarak kalır; türetilmiş hamle korelasyonu izole ve hipotetik etiketlidir.",
        }
      ),
      TRACE_STEP(
        4,
        "Radar contact separation",
        "OK",
        "Obstacle contacts kept in separate recorded object; not merged into autopilot fault codes.",
        {
          check: "Radar temas ayrımı",
          note: "Engel temasları ayrı kayıtlı nesnede tutulur; otopilot arıza kodlarıyla birleştirilmemiştir.",
        }
      ),
      TRACE_STEP(
        5,
        "Oversight review",
        "UNVERIFIED",
        "Regulatory and training-alignment questions stay open; trace documents procedural checks only.",
        {
          check: "Gözetim incelemesi",
          note: "Düzenleyici ve eğitim hizalama soruları açık kalır; iz yalnızca prosedürel kontrolleri belgeler.",
        }
      ),
    ],
    artifactIssuance: { available: true, apiBacked: true },
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
      {
        profileCode: "claims",
        enabled: true,
        apiBacked: true,
        reasonTr:
          "Rotor ve görev kesinti maruziyeti: hasar özeti + iz; operatör kusur yüzdesi üretmez.",
        reasonEn:
          "Rotor / mission interruption exposure: loss summary + trace; does not output operator fault percentage.",
      },
      {
        profileCode: "legal",
        enabled: true,
        apiBacked: true,
        reasonTr:
          "Sözleşme ve izin dosyası ekleri için kanonik zaman çizelgesi; düzenleyici ceza kararı değildir.",
        reasonEn:
          "Canonical timeline for contract and permit dossier attachments; not a regulatory penalty determination.",
      },
      {
        profileCode: "technical",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "Mühendislik inceleme kağıdı: mod geçişleri ve tavan penceresi; tam uçuş simülasyonu ikamesi değildir.",
        reasonEn:
          "Engineering review sheet: mode transitions and ceiling window; not a substitute for full flight simulation.",
      },
      {
        profileCode: "safety",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "Operasyonel güvenlik brifingi: sapma süresi ve engel temas listesi; görev iptal emri değildir.",
        reasonEn:
          "Operational safety briefing: deviation seconds and obstacle contact list; not a mission cancel order.",
      },
      {
        profileCode: "governance",
        enabled: false,
        apiBacked: false,
        reasonTr: "Kurumsal kalite denetim paketi bu demo için tanımlanmadı.",
        reasonEn: "Corporate quality audit pack not defined for this demo.",
      },
      {
        profileCode: "regulatory",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "Uyum sunumu şablonu: bant tablosu eşlemesi; SHGM/ FAA kararı ikamesi değildir.",
        reasonEn:
          "Compliance presentation template: band-table mapping; not a CAA / FAA decision substitute.",
      },
      {
        profileCode: "public_safety",
        enabled: false,
        apiBacked: false,
        reasonTr: "Yerleşim alanı uyarısı bu paketten otomatik üretilmez.",
        reasonEn: "Populated-area alert not auto-generated from this package.",
      },
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
      "Demo retail-adjacent aisle: mobile manipulator slows for pedestrian congestion, then remote operator takes voice-augmented control. Raw logs capture lidar proximity rings, VOIP session metadata, and zone tokens—bounded verification proves the encounter is one sealed object before any narrative about distress or negligence.",
    summaryTr:
      "Demo perakende bitişik koridor: mobil manipülatör yayalar için yavaşlar, ardından uzaktan operatör ses destekli kontrolü devralır. Ham günlükler lidar yakınlık halkalarını, VOIP oturum üst verisini ve bölge jetonlarını yakalar — sıkıntı veya ihmale dair anlatıdan önce karşılaşmanın tek mühürlü nesne olduğunu sınırlı doğrulama kanıtlar.",
    verificationState: "UNVERIFIED",
    reviewWhyEn:
      "Public robot incidents fracture when video clips omit controller context. This case foregrounds recorded separation between on-robot perception samples and operator takeover metadata so municipal risk and venue insurers can review the same spine.",
    reviewWhyTr:
      "Kamusal robot olayları video klipler kumanda bağlamını düşürdüğünde parçalanır. Bu vaka, belediye riski ve mekân sigortası aynı omurgayı inceleyebilsin diye uçbirim algı örnekleri ile operatör devralma üst verisi arasındaki kayıtlı ayrımı öne çıkarır.",
    nextStepEn:
      "Venue risk: file incident with facility security using trace appendix only. Operator org: pair VOIP metadata with rostered supervisor (external HR record). Legal: treat derived de-escalation reading as hypothesis—do not cite as emotional distress finding.",
    nextStepTr:
      "Mekân riski: olayı yalnızca iz ekiyle tesis güvenliğine bildirin. Operatör kuruluşu: VOIP üst verisini nöbetçi süpervizörle eşleyin (İK kaydı paket dışı). Hukuk: türetilmiş yatıştırma okumasını hipotez kabul edin — duygusal sıkıntı bulgusu gibi atıf yapmayın.",
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
        displayLabel: "Onboard interaction log (state machine transitions, max speed caps, audio beacon flags)",
        displayLabelTr: "Uçbirim etkileşim günlüğü (durum makinesi geçişleri, hız tavanları, ses işaret bayrakları)",
        machineLabel: "interaction_log",
      },
      {
        recordId: "rec-robot-003-2",
        sourceType: "lidar_proximity",
        sourceId: "SRC-ROBOT-003-L",
        capturedAt: "2025-03-13T14:20:02Z",
        contentType: "application/octet-stream",
        hash: "hash-robot-003-lidar",
        sizeOrLength: 2048,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.91,
        displayLabel: "Lidar proximity ring samples (range histogram only, no stored point cloud)",
        displayLabelTr: "Lidar yakınlık halkası örnekleri (yalnızca menzil histogramı, nokta bulutu yok)",
        machineLabel: "lidar_rings",
      },
      {
        recordId: "rec-robot-003-3",
        sourceType: "operator_session",
        sourceId: "SRC-ROBOT-003-V",
        capturedAt: "2025-03-13T14:20:08Z",
        contentType: "application/json",
        hash: "hash-robot-003-voip",
        sizeOrLength: 480,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.88,
        displayLabel: "Remote operator session metadata (session ID, codec, jitter; no audio payload)",
        displayLabelTr: "Uzaktan operatör oturum üst verisi (oturum kimliği, codec, gecikme; ses yükü yok)",
        machineLabel: "voip_meta",
      },
      {
        recordId: "rec-robot-003-4",
        sourceType: "venue_zone_token",
        sourceId: "SRC-ROBOT-003-Z",
        capturedAt: "2025-03-13T14:19:50Z",
        contentType: "application/json",
        hash: "hash-robot-003-zone",
        sizeOrLength: 256,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.93,
        displayLabel: "Venue digital twin zone token (crowd-density policy revision hash)",
        displayLabelTr: "Mekân dijital ikiz bölge jetonu (kalabalık yoğunluğu politika revizyon özeti)",
        machineLabel: "zone_token",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "der-robot-003-summary",
        derivedType: "timeline_synthesis",
        derivedFrom: ["rec-robot-003-1", "rec-robot-003-3"],
        generatedAt: "2025-03-13T14:21:00Z",
        method: "timeline_v1",
        confidence: 0.86,
        recordedFlag: false,
        derivationNote: "Structured assessment from recorded interaction log; does not determine whether context loss constituted harm.",
        displayLabel: "Pedestrian approach → slow → remote takeover timeline",
        displayLabelTr: "Yaya yaklaşma → yavaşlama → uzaktan devralma zaman çizelgesi",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Orders deceleration, voice-channel open, and mode handoff without embedding subjective crowd mood—useful for venue compliance workshops.",
        humanSummaryTr:
          "Yavaşlama, ses kanalı açılışı ve mod devrini öznel kalabalık algısı eklemeden sıralar — mekân uyum atölyeleri için uygundur.",
        sourceDependencies: ["rec-robot-003-1", "rec-robot-003-3"],
      },
      {
        derivedId: "der-robot-003-deescalation",
        derivedType: "analytical_reading",
        derivedFrom: ["rec-robot-003-1", "rec-robot-003-2"],
        generatedAt: "2025-03-13T14:21:12Z",
        method: "policy_gap_v1",
        confidence: 0.78,
        recordedFlag: false,
        derivationNote: "Policy-gap hint compares recorded caps to venue token; not a safety certification.",
        displayLabel: "Recorded speed caps vs venue crowd-density policy token (gap hint)",
        displayLabelTr: "Kayıtlı hız tavanları ile mekân kalabalık politikası jetonu (boşluk ipucu)",
        machineLabel: "policy_gap",
        humanSummary:
          "Flags whether the robot remained inside the posted cap for the hashed policy revision—does not judge if the policy itself was adequate for peak hour.",
        humanSummaryTr:
          "Robotun özetlenmiş politika revizyonu için beyan edilen tavan içinde kalıp kalmadığını işaretler — politikanın yoğun saat için yeterli olup olmadığına hükmetmez.",
        sourceDependencies: ["rec-robot-003-1", "rec-robot-003-4"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [
      "Whether the encounter crossed the venue’s contractual escalation threshold for remote human takeover versus acceptable autonomous slow-mode.",
      "Whether absence of audio payload in the bundle blocks fair review of operator tone—or whether separate lawful retention holds the only copy.",
      "Whether lidar histograms alone prove sufficient minimum separation for municipal ADA-crowding scenarios.",
    ],
    unknownDisputedTr: [
      "Karşılaşma, uzaktan insan devralması için mekân sözleşmesi eskalasyon eşiğini mi aştı yoksa kabul edilebilir otonom yavaş modunda mı kaldı?",
      "Pakette ses yükü olmaması operatör tonunun adil incelenmesini engeller mi — yoksa yasal saklamada tek kopya mı var?",
      "Lidar histogramları tek başına belediye ADA yoğunluğu senaryoları için yeterli minimum ayrımı kanıtlar mı?",
    ],
    verificationTrace: [
      TRACE_STEP(
        1,
        "Encounter registered",
        "OK",
        "Encounter object sealed under public-interaction manifest; venue zone token referenced without embedding floor plans.",
        {
          check: "Karşılaşma kaydı",
          note: "Karşılaşma nesnesi kamusal etkileşim manifesti altında mühürlendi; kat planları gömülmeden mekân bölge jetonu referanslandı.",
        }
      ),
      TRACE_STEP(
        2,
        "Interaction log integrity",
        "OK",
        "State transitions hash-chained; no retroactive edit flags in bundle.",
        {
          check: "Etkileşim günlüğü bütünlüğü",
          note: "Durum geçişleri zincir özetli; pakette geriye dönük düzenleme bayrağı yok.",
        }
      ),
      TRACE_STEP(
        3,
        "Sensor vs operator metadata separation",
        "OK",
        "Lidar rings remain recorded; remote session metadata stored as separate object—no implicit merge.",
        {
          check: "Sensör ve operatör üst verisi ayrımı",
          note: "Lidar halkaları kayıtlı kalır; uzak oturum üst verisi ayrı nesnede — örtük birleştirme yok.",
        }
      ),
      TRACE_STEP(
        4,
        "Derived policy gap labeling",
        "OK",
        "Policy gap chart explicitly labeled non-certifying; cannot be exported as compliance attestation from this trace alone.",
        {
          check: "Türetilmiş politika boşluğu etiketi",
          note: "Politika boşluğu grafiği açıkça sertifikalandırmayan olarak etiketlendi; yalnız bu izden uyum beyanı olarak dışa aktarılamaz.",
        }
      ),
      TRACE_STEP(
        5,
        "Context review",
        "UNVERIFIED",
        "Escalation and admissibility questions remain open; trace lists procedural checks only.",
        {
          check: "Bağlam incelemesi",
          note: "Eskalasyon ve kabul edilebilirlik soruları açık kalır; iz yalnızca prosedürel kontrolleri listeler.",
        }
      ),
    ],
    artifactIssuance: { available: true, apiBacked: true },
    incidentSpine: {
      systemType: "robot",
      incidentId: "golden-robot-public",
      scenarioTitle: "Public Interaction",
      incidentSummary: "Retail-adjacent robot human proximity / operator takeover event with separate onboard sensor and operator metadata spine.",
      riskLabel: "ORTA",
      uncertaintyState: "high",
      spatialVocabulary: {
        generic: "Workcell / Zone / Proximity",
        vehicle: "Aisle, walking path, safety envelope",
      },
      phases: [
        {
          phase: "t0",
          labelTr: "Ön Olay",
          labelEn: "Pre-Event",
          descriptionTr: "Ön yaşam çizelgesi, alan hacmi ve hız sınırı verisi sabitlenir.",
          descriptionEn: "Baseline motions, zone volume and speed cap are locked.",
          recordedLayerHint: "Lidar rings and interaction log preamble.",
          derivedLayerHint: "Safe buffer estimations and crowd proximity model.",
          traceMarker: "pre_event",
        },
        {
          phase: "t1",
          labelTr: "Yaklaşım",
          labelEn: "Approach",
          descriptionTr: "Yayaların yaklaşım açısı, hız ve kontrol mod geçişi işaretleri okunur.",
          descriptionEn: "Pedestrian approach vectors, speed and control mode shift markers are read.",
          recordedLayerHint: "Lidar closest point counts and zone token updates.",
          derivedLayerHint: "Proximity lanes and caution band projected gaps.",
          traceMarker: "approach",
        },
        {
          phase: "t2",
          labelTr: "Kritik An",
          labelEn: "Critical Moment",
          descriptionTr: "Uzaktan operatör devralma ve yavaşlama komutları etkinleşir.",
          descriptionEn: "Remote operator takeover and braking command chain is executed.",
          recordedLayerHint: "Operator session metadata and movement attenuation hashes.",
          derivedLayerHint: "Rule-bound decel margin and avoidant intent trace.",
          traceMarker: "critical",
        },
        {
          phase: "t3",
          labelTr: "Olay Sonrası",
          labelEn: "Post-Event",
          descriptionTr: "Saha tekrar taranır, kalıcı risk bandı ve rapor behemeal edilir.",
          descriptionEn: "Area rescanned, residual risk band and report artifacts are emitted.",
          recordedLayerHint: "Post-handoff logs and zone clearance samples.",
          derivedLayerHint: "Uncertainty delta and compliance margin note.",
          traceMarker: "post_event",
        },
      ],
    },
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
      {
        profileCode: "claims",
        enabled: true,
        apiBacked: true,
        reasonTr:
          "Mekân ve ziyaretçi maruziyeti: olay özeti + iz; duygusal sıkıntı teşhisi veya kusur yüzdesi üretmez.",
        reasonEn:
          "Venue / patron exposure: incident summary + trace; does not output emotional distress diagnosis or fault percentage.",
      },
      {
        profileCode: "legal",
        enabled: true,
        apiBacked: true,
        reasonTr:
          "Sözleşme ve KVKK çerçevesi için kanonik zaman çizelgesi; mahkeme hükmü veya idari para cezası değildir.",
        reasonEn:
          "Canonical timeline for contract and privacy framing; not a court judgment or administrative fine.",
      },
      {
        profileCode: "technical",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "Robot mühendisliği özeti: lidar histogramları ve mod geçişleri; tam ODD sertifikasyonu ikamesi değildir.",
        reasonEn:
          "Robotics engineering summary: lidar histograms and mode transitions; not an ODD certification substitute.",
      },
      {
        profileCode: "safety",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "Saha güvenliği brifingi: hız tavanları ve bölge jetonu; operasyonel tahliye emri değildir.",
        reasonEn:
          "Field safety briefing: speed caps and zone token; not an operational evacuation order.",
      },
      {
        profileCode: "governance",
        enabled: false,
        apiBacked: false,
        reasonTr: "Kurumsal robot etik kurulu paketi bu demo için ayrıcalıklı değil.",
        reasonEn: "Corporate robotics ethics board pack not privileged in this demo.",
      },
      {
        profileCode: "regulatory",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "İdari dosya şablonu: politika boşluğu grafiği ekleri; düzenleyici onay beyanı değildir.",
        reasonEn:
          "Administrative dossier template: policy-gap chart attachments; not a regulatory approval statement.",
      },
      {
        profileCode: "public_safety",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "Kamu güvenliği brifingi: kalabalık yoğunluğu jetonu ile hizalanmış ölçülebilir göstergeler; panik uyarısı değildir.",
        reasonEn:
          "Public safety briefing: measurable indicators aligned to crowd-density token; not a panic alert.",
      },
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
    summary:
      "Demo collaborative workcell: protective stop fires on redundant proximity while a human reaches across light curtain plane. Raw safety PLC telegram, torque-limited joint snapshot, and maintenance calibration seal are co-registered—bounded verification shows the stop chain, not whether maintenance was negligent.",
    summaryTr:
      "Demo işbirlikli iş hücresi: insan perde düzlemini geçerken yedekli yakınlıkta koruyucu durdurma tetiklenir. Ham güvenlik PLC telgrafı, tork sınırlı eklem anlık görüntüsü ve bakım kalibrasyon mührü birlikte kayıtlıdır — sınırlı doğrulama durdurma zincirini gösterir, bakımın ihmalkâr olup olmadığını değil.",
    verificationState: "UNVERIFIED",
    reviewWhyEn:
      "ISO 10218-style reviews need the stop ladder, reset authority, and calibration lineage on one manifest. This demo stresses that torque telemetry and PLC bits stay recorded while “was threshold correct?” stays disputed.",
    reviewWhyTr:
      "ISO 10218 tarzı incelemeler durdurma basamaklarını, sıfırlama yetkisini ve kalibrasyon soyunu tek manifestte ister. Bu demo tork telemetrisi ve PLC bitlerinin kayıtlı kalmasını, “eşik doğru muydu?” sorusunun tartışmalı kalmasını vurgular.",
    nextStepEn:
      "EHS: lock out/tag out before clearing stop; cite trace IDs in CAPA form only. Legal: do not treat derived threshold comparison as negligence admission. Production: restart only after dual human acknowledgment per local SOP (outside this bundle).",
    nextStepTr:
      "İSG: durdurmayı kaldırmadan önce kilitle/etiketle; CAPA formunda yalnızca iz kimliklerine atıf yapın. Hukuk: türetilmiş eşik karşılaştırmasını ihmalkârlık itirafı saymayın. Üretim: yerel SOP uyarınca çift insan onayı olmadan yeniden başlatma (paket dışı).",
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
        displayLabel: "Safety PLC telegram stream (E-stop, light curtain, reset interlock bits)",
        displayLabelTr: "Güvenlik PLC telgraf akışı (E-stop, ışık perdesi, sıfırlama kilidi bitleri)",
        machineLabel: "safety_log",
      },
      {
        recordId: "rec-robot-001-2",
        sourceType: "joint_telemetry",
        sourceId: "SRC-ROBOT-001-J",
        capturedAt: "2025-03-13T11:08:00.050Z",
        contentType: "application/octet-stream",
        hash: "hash-robot-001-joint",
        sizeOrLength: 768,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.93,
        displayLabel: "Joint torque / velocity snapshot (±120 ms around stop edge)",
        displayLabelTr: "Eklem tork / hız anlık görüntüsü (durdurma kenarı ±120 ms)",
        machineLabel: "joint_snap",
      },
      {
        recordId: "rec-robot-001-3",
        sourceType: "calibration_seal",
        sourceId: "SRC-ROBOT-001-C",
        capturedAt: "2025-03-13T08:00:00Z",
        contentType: "application/json",
        hash: "hash-robot-001-cal",
        sizeOrLength: 360,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.9,
        displayLabel: "Proximity sensor calibration seal (vendor anonymized, expiry timestamp)",
        displayLabelTr: "Yakınlık sensörü kalibrasyon mührü (satıcı anonim, sona erme zaman damgası)",
        machineLabel: "cal_seal",
      },
      {
        recordId: "rec-robot-001-4",
        sourceType: "maintenance_ticket",
        sourceId: "SRC-ROBOT-001-M",
        capturedAt: "2025-03-13T09:30:00Z",
        contentType: "application/json",
        hash: "hash-robot-001-ticket",
        sizeOrLength: 420,
        recordedFlag: true,
        derivationNote: null,
        originConfidence: 0.87,
        displayLabel: "CMMS ticket stub linked to cell (procedure code only, no technician PII)",
        displayLabelTr: "Hücreye bağlı CMMS bilet özü (yalnızca prosedür kodu, teknisyen KVKK verisi yok)",
        machineLabel: "cmms_stub",
      },
    ] as RecordedEvidenceItem[],
    derivedAssessment: [
      {
        derivedId: "der-robot-001-timeline",
        derivedType: "timeline_synthesis",
        derivedFrom: ["rec-robot-001-1", "rec-robot-001-2"],
        generatedAt: "2025-03-13T11:09:00Z",
        method: "timeline_v1",
        confidence: 0.9,
        recordedFlag: false,
        derivationNote: "Structured assessment from recorded safety log; protective stop is boundary-preserving, not a fault finding.",
        displayLabel: "Curtain break → torque collapse → E-stop latch timeline",
        displayLabelTr: "Perde kırılması → tork düşüşü → E-stop mandal zaman çizelgesi",
        machineLabel: "timeline_synthesis",
        humanSummary:
          "Shows ordering between curtain violation, commanded torque ramp-down, and latched stop—useful for insurer loss-control visits without naming individual maintainers.",
        humanSummaryTr:
          "Perde ihlali, komutlu tork düşüşü ve kilitli durdurma arasındaki sıralamayı gösterir — bireysel bakımcı adı vermeden sigorta kayıp kontrol ziyaretleri için uygundur.",
        sourceDependencies: ["rec-robot-001-1", "rec-robot-001-2"],
      },
      {
        derivedId: "der-robot-001-threshold",
        derivedType: "analytical_reading",
        derivedFrom: ["rec-robot-001-1", "rec-robot-001-3"],
        generatedAt: "2025-03-13T11:09:15Z",
        method: "threshold_compare_v1",
        confidence: 0.81,
        recordedFlag: false,
        derivationNote: "Compares trigger margin to sealed calibration constants; not a product recall trigger.",
        displayLabel: "Observed trigger margin vs sealed calibration constants (read-only table)",
        displayLabelTr: "Gözlenen tetik marjı ile mühürlü kalibrasyon sabitleri (salt okunur tablo)",
        machineLabel: "threshold_compare",
        humanSummary:
          "States whether the observed proximity margin was inside the sealed band at stop time—does not decide if seal was forged or if policy should change.",
        humanSummaryTr:
          "Durdurma anında gözlenen yakınlık marjının mühürlü bandın içinde olup olmadığını belirtir — mührün sahte olup olmadığına veya politikanın değişmesi gerektiğine karar vermez.",
        sourceDependencies: ["rec-robot-001-1", "rec-robot-001-3"],
      },
    ] as DerivedEvidenceItem[],
    unknownDisputed: [
      "Whether the CMMS stub proves the correct preventive task was executed before shift start—or only that a ticket existed.",
      "Whether dual-channel proximity agreement met SIL expectations for this cell configuration without independent hardware audit.",
      "Whether restart authority should stay withheld until ergonomics reviews the reach envelope that led to the curtain break.",
    ],
    unknownDisputedTr: [
      "CMMS özü vardiya başlangıcından önce doğru önleyici görevin yapıldığını kanıtlar mı — yoksa yalnızca bir biletin var olduğunu mu?",
      "Bu hücre konfigürasyonu için çift kanallı yakınlık uyumu, bağımsız donanım denetimi olmadan SIL beklentisini karşıladı mı?",
      "Perde kırılmasına yol açan erişim zarfı ergonomi tarafından incelenene kadar yeniden başlatma yetkisi bekletilmeli mi?",
    ],
    verificationTrace: [
      TRACE_STEP(
        1,
        "Workcell cycle bound",
        "OK",
        "Cycle ID and light-curtain map revision hash registered on manifest; no undeclared program edits in bundle.",
        {
          check: "İş hücresi döngü sınırı",
          note: "Döngü kimliği ve ışık perdesi harita revizyon özeti manifestte kayıtlı; pakette beyan edilmemiş program düzenlemesi yok.",
        }
      ),
      TRACE_STEP(
        2,
        "Safety log integrity",
        "OK",
        "PLC telegram ordering preserved; duplicate stop acknowledgements explicitly enumerated.",
        {
          check: "Güvenlik günlüğü bütünlüğü",
          note: "PLC telgraf sıralaması korunmuş; yinelenen durdurma onayları açıkça numaralandı.",
        }
      ),
      TRACE_STEP(
        3,
        "Joint telemetry boundary",
        "OK",
        "Torque snapshot remains separate object from PLC bits; no silent fusion into a single ‘fault code’ string.",
        {
          check: "Eklem telemetrisi sınırı",
          note: "Tork anlık görüntüsü PLC bitlerinden ayrı nesne olarak kalır; tek bir ‘arıza kodu’ dizesinde sessiz füzyon yok.",
        }
      ),
      TRACE_STEP(
        4,
        "Calibration seal linkage",
        "OK",
        "Calibration seal referenced by hash; expiry checked against onboard clock, not against vendor SLA contract text.",
        {
          check: "Kalibrasyon mührü bağlantısı",
          note: "Kalibrasyon mührü özetle referanslanır; sona erme uçbirim saatine göre kontrol edilir, satıcı SLA sözleşme metnine göre değil.",
        }
      ),
      TRACE_STEP(
        5,
        "Protective stop review",
        "UNVERIFIED",
        "Human factors and SIL audit questions remain open; trace documents mechanical verification steps only.",
        {
          check: "Koruyucu durdurma incelemesi",
          note: "İnsan faktörleri ve SIL denetimi soruları açık kalır; iz yalnızca mekanik doğrulama adımlarını belgeler.",
        }
      ),
    ],
    artifactIssuance: { available: true, apiBacked: true },
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
      {
        profileCode: "claims",
        enabled: true,
        apiBacked: true,
        reasonTr:
          "Üretim kesinti ve ekipman maruziyeti: olay özeti + iz; iş güvenliği ihlali kararı üretmez.",
        reasonEn:
          "Production interruption / equipment exposure: incident summary + trace; does not output workplace safety violation rulings.",
      },
      {
        profileCode: "legal",
        enabled: true,
        apiBacked: true,
        reasonTr:
          "İş hukuku ve tedarik zinciri sözleşmeleri için kanonik zaman çizelgesi; mahkeme hükmü değildir.",
        reasonEn:
          "Canonical timeline for labor and supply-chain contracts; not a court judgment.",
      },
      {
        profileCode: "technical",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "OEM / entegratör inceleme kağıdı: tork ve PLC dizisi; tam fonksiyonel güvenlik raporu ikamesi değildir.",
        reasonEn:
          "OEM / integrator review sheet: torque and PLC sequence; not a full functional safety report substitute.",
      },
      {
        profileCode: "safety",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "EHS brifingi: durdurma basamakları ve sıfırlama kilidi; üretim hattını tek başına açma emri değildir.",
        reasonEn:
          "EHS briefing: stop ladder and reset interlock; not a standalone line-clearance order.",
      },
      {
        profileCode: "governance",
        enabled: false,
        apiBacked: false,
        reasonTr: "Üst yönetim olay inceleme paketi bu demo için ayrıcalıklı değil.",
        reasonEn: "Executive incident review pack not privileged in this demo.",
      },
      {
        profileCode: "regulatory",
        enabled: true,
        apiBacked: false,
        reasonTr:
          "İdari denetim dosyası şablonu: kalibrasyon mührü ve CMMS özü; düzenleyici ceza makbuzu değildir.",
        reasonEn:
          "Regulatory inspection dossier template: calibration seal + CMMS stub; not a regulatory penalty receipt.",
      },
      {
        profileCode: "public_safety",
        enabled: false,
        apiBacked: false,
        reasonTr: "Genel kamu uyarısı bu endüstriyel hücre paketinden türetilmez.",
        reasonEn: "General public alert not derived from this industrial cell package.",
      },
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
