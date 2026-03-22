/**
 * QARAQUTU — EN/TR message dictionary.
 * Controlled, deliberate translation. Not machine-piped.
 * Core doctrine terms (Verifier, Recorded, Derived, Trace, Issuance) are preserved verbatim in EN.
 * TR copy is reviewed for natural, institutional register — not literal translation.
 *
 * Usage: import { MSG } from "../../lib/i18n/messages"; then MSG.en.navHome or MSG.tr.navHome
 * For a future i18n provider, replace with adapter that reads from this structure.
 */

export type Lang = "en" | "tr";

const en = {
  // Navigation
  navHome: "Home",
  navVerifier: "Verifier",
  navDocs: "Docs",
  navGolden: "Golden (internal)",
  navConsole: "Console (protected)",
  navAdmin: "Admin (protected)",

  // Brand
  tagline: "Witness · Verifier · Trace · Issuance",
  motto: "Does not judge. It witnesses.",
  description:
    "Verifier-first witness protocol for dispute-grade event packages across Vehicle, Drone, and Robot.",

  // Home hero
  homeHeroChip: "Witness protocol",
  homeHeroHeading: "One product. Verifier-first. Three verticals.",
  homeHeroBody:
    "QARAQUTU is a verifier-first witness protocol for dispute-grade event packages across Vehicle, Drone, and Robot. The Verifier is the main review station: a bounded assessment with recorded evidence, derived assessment, verification trace, and artifact issuance. Golden is the internal quality bar and reference for the verifier, not a separate product or primary surface.",
  homeHeroCta: "Open Verifier",
  homeHeroCtaSecondary: "Docs",
  homeHeroPillar1: "Verifier is the primary surface",
  homeHeroPillar2: "Recorded and derived stay separated",
  homeHeroPillar3: "Trace supports review, not final truth",
  homeHeroPillar4: "Issuance is protocol artifact, not blame",
  homeHeroEyebrow: "QARAQUTU · witness protocol · inspection-grade surface",
  homeHowItWorksTitle: "How the protocol runs",
  homeHowItWorksLead: "Five bounded steps from capture to role-specific review. No verdict engine; disciplined artifacts only.",
  homeHowStep1: "Capture / record — sensors and sources enter the canonical package as recorded evidence.",
  homeHowStep2: "Separate recorded vs derived — reconstruction and interpretation never replace raw witness material.",
  homeHowStep3: "Verify / trace — bounded checks produce an audit trace; trace supports review, not final truth.",
  homeHowStep4: "Issue bounded artifact — claims/legal outputs tied to manifest, bundle, and receipt chain.",
  homeHowStep5: "Route to role-specific review — each institution receives a shell aligned to its evidence need.",
  homeProblemIntro: "Dispute-grade incidents break down when evidence is scattered or conflated.",
  homeProblemCard1Title: "Logs, exports, and review drift apart",
  homeProblemCard1Body:
    "Incident material spreads across logs, ad-hoc exports, and disconnected review threads. No single canonical object anchors decisions.",
  homeProblemCard2Title: "Recorded vs derived collapse",
  homeProblemCard2Body:
    "Raw captures and later interpretation are often merged into one narrative. That erodes chain-of-review integrity and role-appropriate reading.",
  homeProblemCard3Title: "Role-specific evidence needs stay unlinked",
  homeProblemCard3Body:
    "Insurance, legal, field, and technical stakeholders rarely reference the same bounded package. Each role needs its own shell on one spine.",
  homeDemoDoctrineTitle: "Why a canonical witness layer is inevitable",
  homeDemoDoctrineSubtitle:
    "Doctrine-safe demo scenarios — illustrative classes only; no named real-world incidents embedded in the product.",
  homeDemoVehicleWhy: "Near-miss and collision disputes turn on timing, chain of custody, and separation of telemetry from narrative.",
  homeDemoVehicleSeparation: "Recorded payloads stay raw; derived timelines and reconstructions are explicitly second-layer.",
  homeDemoDroneWhy: "BVLOS and mission anomalies require traceable link-loss windows and recovery sequences accountable to operators.",
  homeDemoDroneSeparation: "Telemetry streams remain recorded; mission readings and timelines are derived and bounded.",
  homeDemoRobotWhy: "Public interaction and safety-stop events need operator handoff and protective-stop context without mixing layers.",
  homeDemoRobotSeparation: "Interaction logs are recorded; encounter synthesis stays derived and review-conditioned.",
  homeRoleGridTitle: "Who uses this protocol",
  homeRoleGridSubtitle:
    "One canonical event core; institutional shells vary by filing, liability, and operational context — not by inventing parallel truths.",
  homeRoleInsuranceTitle: "Insurance / claims",
  homeRoleInsuranceBody: "Dispute-ready summaries and claims packs tied to canonical references — not unilateral fault findings.",
  homeRoleLegalTitle: "Legal / notary / authenticity",
  homeRoleLegalBody: "Manifest, receipt, and trace framing for filing — authenticity signals do not imply liability or verdict.",
  homeRoleMuniTitle: "Municipality / administrative",
  homeRoleMuniBody: "Administrative packets and version chain for public-body review — derived items are not presented as administrative fact.",
  homeRoleFieldTitle: "Police / gendarmerie / field evidence",
  homeRoleFieldBody: "Recorded sources, time sequence, and trace appendix — recorded and derived remain explicitly separated.",
  homeRoleTechnicalTitle: "Technical manufacturer / autonomous ops",
  homeRoleTechnicalBody: "System–scenario–event linkage and packet structure for engineering review — reconstruction is not fault assignment.",
  homeRoleOversightTitle: "Oversight / compliance orientation",
  homeRoleOversightBody: "Access, export, and issuance history views for bounded governance — policy limits still apply.",
  footerWitnessLine1: "Witness, not judgement.",
  footerWitnessLine2: "QARAQUTU preserves separation of recorded evidence, derived assessment, verification trace, and bounded issuance.",
  verifierMainNavLabel: "Inspection panels",
  verifierUnknownIntro:
    "Explicitly bounded uncertainty: items here are unresolved or disputed between parties — not missing fields awaiting casual data entry.",
  verifierTracePanelNote:
    "Each step documents what was checked in this run. The trace supports institutional review; it is not a claim of absolute truth.",
  verifierIssuancePanelLead:
    "Bounded evidence-package preparation: profiles gate what may be issued; issuance does not assign blame or replace human judgement.",
  verifierRoleContextLabel: "Role context",
  verifierRoleContextBody:
    "Recipient framing and export profile gate which artifacts may be prepared. This does not change the canonical package or the trace.",
  verifierWaitingSelectionTitle: "Waiting for bounded selection",
  verifierWaitingSelectionBody:
    "Choose system, scenario, and event in the command spine. The inspection station loads one canonical package at a time — no dashboard aggregation.",
  verifierEvidenceRecordedCaption: "Witness material as captured — sensors, logs, payloads. Not interpretation.",
  verifierEvidenceDerivedCaption: "Reconstruction and synthesis from recorded items — does not replace or erase the raw layer.",
  verifierActionBarDoctrineTrace: "trace ≠ truth",
  verifierActionBarDoctrineIssuance: "issuance ≠ blame",
  verifierReviewStage: "Review stage",
  verifierVerificationTraceHeader: "Verification trace",
  verifierArtifactIssuanceHeader: "Artifact issuance",
  verifierEmptyEventCatalog: "No event cards for this scenario.",
  verifierPickScenarioFirst: "Choose a scenario first; events are listed per scenario.",

  // Section headers
  sectionProblem: "The problem",
  sectionProductSystem: "Product system",
  sectionRoleFlow: "Role-aware review flow",
  sectionEvidenceLayer: "Evidence layer discipline",
  sectionInstitutional: "Institutional use families",
  sectionSectorScenarios: "Sector demo scenarios",
  sectionVerification: "Verification",
  sectionProductSurfaces: "Product surfaces",

  // Verifier
  verifierStation: "Verification Station",
  verifierInspection: "Inspection Station",
  verifierTitle: "Event Package Verification",
  verifierSubtitle: "Bounded assessment of the selected event package. Does not make liability or guilt determinations.",
  verifierSelectedSystem: "Selected System",
  verifierSelectedScenario: "Selected Scenario",
  verifierSelectedEvent: "Selected Event",
  verifierNotSelected: "Not selected",
  verifierCommandSpine: "Command Spine",
  verifierOrder: "Order: 1) System 2) Scenario 3) Event",
  verifierLayering: "Layering: Recorded separate, Derived separate",
  verifierNoOverride: "Unknown/Disputed and Trace are not overridden by issuance",
  verifierSteps: {
    system: "System",
    scenario: "Scenario",
    event: "Event",
    incidentSummary: "Incident Summary",
    evidenceLayers: "Evidence Layers",
    unknownDisputed: "Unknown / Disputed",
    verificationTrace: "Verification Trace",
    artifactIssuance: "Artifact Issuance",
    whyInevitable: "Why QARAQUTU is inevitable",
  },
  verifierRecorded: "Recorded evidence",
  verifierDerived: "Derived assessment",
  verifierRawLayer: "Raw layer",
  verifierSecondLayer: "Second layer",
  verifierDoctrine: "// doctrine_spine",
  verifierNoRecorded: "No recorded evidence.",
  verifierNoDerived: "No derived evidence.",
  verifierNoEvent: "No event selected.",
  verifierNoScenario: "No scenario selected.",
  verifierResultTitle: "Verification result (this run)",
  verifierNoResult: "No verification has been run yet. Select an event and start verification to see its current state and verification trace summary.",
  verifierIssuanceNote: "Select an event in the left spine for artifact issuance.",
  verifierIssuanceDoctrine: "Issuance is role- and trace-bound; it does not override unknown/disputed or produce a final ruling.",
  verifierSelectEvent: "Select an event in the left spine to view recorded and derived evidence layers. Layers are not blended; verification trace and issuance depend on them.",
  verifierDemoLabel: "Demo scenario · Public class · Anonymized · Not a final determination",
  verifierWhatHappened: "What happened",
  verifierWhyUnderReview: "Why under review",
  verifierReviewState: "Review state",
  verifierSafeNextStep: "Safe next step",
  verifierCaseContext: "Case context",
  verifierIncidentClass: "Incident class",
  verifierScenarioFrame: "Scenario frame",
  verifierIdentityChain: "Identity chain",
  verifierIncidentSummary: "Incident summary",
  verifierUnknownDisputed: "Unknown / disputed",
  verifierHumanReview: "Human review required",
  verifierDemoNotice: "Demo scenario",
  verifierDemoPublic: "Public class",
  verifierDemoAnonymized: "Anonymized",
  verifierDemoNotFinal: "Not a final determination",

  // Docs
  docsTitle: "QARAQUTU Docs / API",
  docsChip: "Protocol & API",

  // Access / Restricted
  accessGateLabel: "Access gate",
  accessTitle: "Authorized access required",
  accessBody: "QARAQUTU's protected surfaces are intentionally bounded. Enter an authorized access token to continue.",
  accessTokenLabel: "Access token",
  accessTokenPlaceholder: "Authorized token",
  accessSubmit: "Continue",
  accessBack: "Back",
  accessNote: "This gate is a minimal protection layer for the current acceptance slice. Full tenant IAM / RBAC is a later sprint.",
  restrictedLabel: "Restricted surface",
  restrictedTitle: "Authorized access required",
  restrictedBody: "This area is intentionally bounded. It supports internal review and controlled issuance workflows and is not a general public product surface.",
  restrictedRequestAccess: "Request access",
  restrictedReturn: "Return to landing",
  restrictedNote: "Note: \"restricted\" means protected and access-controlled, not \"missing\" or \"broken\". If you believe you should have access, use the access gate and re-enter with authorized credentials.",

  // Admin
  adminTitle: "System diagnostics",
  adminSubtitle: "Internal diagnostics surface for verifier-first operations. Bounded review of environment, verifier spine, and issuance pathways — not an operations dashboard or business console.",
  adminDiagnosticsOnly: "Diagnostics only",
  adminProtectedSurface: "Protected surface · authorized access required",

  // Console
  consoleTitle: "Console — controlled protocol shell preparation",
  consoleBody: "Reserved internal surface for shaping future bounded protocol operations. This page is not public, not a free-form execution terminal, and not an operations dashboard.",

  // Doctrine disclaimer
  doctrineDisclaimer: "QARAQUTU is a dispute-grade evidence system. It is not a liability engine, not a judicial decision system, and not a substitute for independent legal, claims, or technical judgment. Verifier states and exports are role-appropriate artifacts linked to a canonical record, not unilateral findings about fault or outcome.",

  // Document / report authority — families (canonical)
  docFamily_incidentEvent: "Incident / Event Report",
  docFamily_verificationSummary: "Verification Summary",
  docFamily_traceAppendix: "Trace Appendix",
  docFamily_claimsPack: "Claims Pack",
  docFamily_legalPack: "Legal Pack",
  docFamily_technicalPack: "Technical Pack",
  docFamily_administrativePacket: "Administrative Packet",
  docFamily_authenticityReceipt: "Authenticity Receipt",
  docSector_vehicleIncident: "Vehicle Incident Report",
  docSector_droneIncident: "Drone Incident Report",
  docSector_robotIncident: "Robot Incident Report",
  docMeta_documentId: "Document ID",
  docMeta_eventId: "Event ID",
  docMeta_bundleId: "Bundle ID",
  docMeta_manifestRef: "Manifest ref",
  docMeta_receiptRef: "Receipt ref",
  docMeta_traceRef: "Trace ref",
  docMeta_schemaVersion: "Schema version",
  docMeta_createdAt: "Created at",
  docMeta_verifiedAt: "Verified at",
  docMeta_verificationState: "Verification state",
  docMeta_roleAudience: "Role / audience",
  docMeta_exportPurpose: "Export purpose",
  docMeta_exportProfile: "Export profile",
  docCover_label: "Cover",
  docBody_label: "Document body",
  docPage_identity: "Page 1 — body",
  docAuthenticityNote:
    "These identifiers bind this document to a canonical event package and issuance record at the stated version. They support traceability and institutional filing; they are not a claim of absolute truth, fault, or final legal outcome.",
  docAuthorityStrip_title: "Protocol identity & chain",
  docInstitutionLayer_title: "Recipient framing",
  docPrintHint: "Layout optimized for print — suitable for official file placement.",
  docFooter_doctrineShort:
    "QARAQUTU — Verifier-first witness protocol. Not a liability engine or judicial substitute. Recorded, Derived, Unknown/Disputed, Verification Trace, and Artifact Issuance remain explicitly separated.",
  docSealLabel: "Protocol seal",
  verifierIssuancePreviewTitle: "Issued artifact — authority preview",
  verifierAudienceSelect: "Recipient framing",
  docLinkage_qr: "Verification QR slot",
} as const;

const tr = {
  // Navigation
  navHome: "Home",
  navVerifier: "Doğrulayıcı",
  navDocs: "Belgeler",
  navGolden: "Golden (dahili)",
  navConsole: "Konsol (korumalı)",
  navAdmin: "Admin (korumalı)",

  // Brand
  tagline: "Tanık · Doğrulayıcı · İz · Belgeleme",
  motto: "Hüküm vermez. Şahitlik eder.",
  description:
    "Araç, İnsansız Hava Aracı ve Robot'ta uyuşmazlık düzeyinde olay paketleri için doğrulayıcı-öncelikli tanık protokolü.",

  // Home hero
  homeHeroChip: "Tanık protokolü",
  homeHeroHeading: "Tek ürün. Doğrulayıcı-öncelikli. Üç dikey.",
  homeHeroBody:
    "QARAQUTU; Araç, İHA ve Robot genelinde uyuşmazlık düzeyinde olay paketleri için doğrulayıcı-öncelikli bir tanık protokolüdür. Doğrulayıcı ana inceleme istasyonudur: kayıtlı kanıt, türetilmiş değerlendirme, doğrulama izi ve belge düzenlemesiyle sınırlı bir değerlendirme yapısı. Golden, doğrulayıcı için dahili kalite referansıdır; ayrı bir ürün değildir.",
  homeHeroCta: "Doğrulayıcıyı Aç",
  homeHeroCtaSecondary: "Belgeler",
  homeHeroPillar1: "Doğrulayıcı temel yüzeydir",
  homeHeroPillar2: "Kayıtlı ve türetilmiş ayrı kalır",
  homeHeroPillar3: "İz, incelemeyi destekler; nihai gerçek değildir",
  homeHeroPillar4: "Belge düzenlemesi protokol çıktısıdır, sorumluluk değil",
  homeHeroEyebrow: "QARAQUTU · tanık protokolü · inceleme sınıfı yüzey",
  homeHowItWorksTitle: "Protokol nasıl işler",
  homeHowItWorksLead: "Yakalamadan role özgü incelemeye beş sınırlı adım. Hüküm motoru yok; yalnızca disiplinli artefakt.",
  homeHowStep1: "Yakalama / kayıt — sensör ve kaynaklar, kayıtlı kanıt olarak kanonik pakete girer.",
  homeHowStep2: "Kayıtlı ve türetilmiş ayrımı — yorumlama, ham tanık materyalinin yerini almaz.",
  homeHowStep3: "Doğrulama / iz — sınırlı kontroller denetim izi üretir; iz incelemeyi destekler, nihai gerçek değildir.",
  homeHowStep4: "Sınırlı artefakt düzenleme — hasar/hukuk çıktıları manifest, paket ve makbuz zincirine bağlıdır.",
  homeHowStep5: "Role özgü incelemeye yönlendirme — sigorta, hukuk, saha, teknik; her biri tek omurga üzerinde disiplinli kabuk alır.",
  homeProblemIntro: "Uyuşmazlık düzeyinde olaylarda kanıt dağıldığında veya birbirine karıştığında zincir çöker.",
  homeProblemCard1Title: "Log, dışa aktarım ve inceleme birbirinden kopar",
  homeProblemCard1Body:
    "Olay verisi loglara, düzensiz dışa aktarımlara ve kopuk inceleme iplerine yayılır. Tekil kanonik nesne kararları sabitlemez.",
  homeProblemCard2Title: "Kayıtlı ile türetilmiş iç içe geçer",
  homeProblemCard2Body:
    "Ham yakalama ile sonradan yorum tek anlatıda birleşir; inceleme zinciri bütünlüğü ve role uygun okuma zayıflar.",
  homeProblemCard3Title: "Role özgü kanıt ihtiyaçları bağlanmaz",
  homeProblemCard3Body:
    "Sigorta, hukuk, saha ve teknik taraflar çoğu kez aynı sınırlı pakete bağlanmaz; her rol tek omurgada kendi kabuğunu görmelidir.",
  homeDemoDoctrineTitle: "Neden kanonik tanık katmanı kaçınılmaz",
  homeDemoDoctrineSubtitle:
    "Doktrin güvenli demo senaryolar — yalnızca sınıf örnekleri; ürüne gerçek adlı olay gömülmez.",
  homeDemoVehicleWhy: "Yakın kaçış ve çatışma ihtilafları zamanlama, zincir ve telemetri–anlatı ayrımına dayanır.",
  homeDemoVehicleSeparation: "Kayıtlı yükler ham kalır; zaman çizgisi ve rekonstrüksiyon açıkça ikinci katmandır.",
  homeDemoDroneWhy: "BVLOS ve görev anomalilerinde bağlantı kaybı penceresi ve kurtarma dizisi operatör hesap verebilirliği için izlenebilir olmalıdır.",
  homeDemoDroneSeparation: "Telemetri akışı kayıtlı kalır; görev okumaları ve zaman çizgisi türetilmiş ve sınırlıdır.",
  homeDemoRobotWhy: "Kamusal karşılaşma ve güvenlik durdurma olaylarında el değişimi ve koruyucu durdurma bağlamı katmanları karıştırmadan sunulmalıdır.",
  homeDemoRobotSeparation: "Etkileşim günlükleri kayıtlıdır; karşılaşma özeti türetilmiş ve incelemeye koşulludur.",
  homeRoleGridTitle: "Kim bu protokolü kullanır",
  homeRoleGridSubtitle:
    "Tek kanonik olay çekirdeği; kurumsal kabuklar dosyalama, sorumluluk ve operasyon bağlamına göre değişir — paralel gerçeklik üretmez.",
  homeRoleInsuranceTitle: "Sigorta / hasar",
  homeRoleInsuranceBody: "Kanonik referanslara bağlı ihtilafa hazır özet ve hasar paketleri — tek taraflı kusur hükmü değildir.",
  homeRoleLegalTitle: "Hukuk / noter / özgünlük",
  homeRoleLegalBody: "Dosyalama için manifest, makbuz ve iz çerçevesi — özgünlük sinyalleri sorumluluk veya hüküm ima etmez.",
  homeRoleMuniTitle: "Belediye / idari",
  homeRoleMuniBody: "Kamu kurumu incelemesi için idari paket ve sürüm zinciri — türetilmiş öğeler idari olgu gibi sunulmaz.",
  homeRoleFieldTitle: "Polis / jandarma / saha kanıtı",
  homeRoleFieldBody: "Kayıtlı kaynaklar, zaman dizisi ve iz eki — kayıtlı ve türetilmiş açıkça ayrı kalır.",
  homeRoleTechnicalTitle: "Teknik üretici / otonom operasyon",
  homeRoleTechnicalBody: "Sistem–senaryo–olay bağlantısı ve paket yapısı mühendislik incelemesi için — rekonstrüksiyon kusur ataması değildir.",
  homeRoleOversightTitle: "Gözetim / uyum yönelimi",
  homeRoleOversightBody: "Sınırlı yönetişim için erişim, dışa aktarım ve düzenleme geçmişi görünümleri — politika sınırları geçerlidir.",
  footerWitnessLine1: "Tanıklık eder; hüküm vermez.",
  footerWitnessLine2: "QARAQUTU; kayıtlı kanıt, türetilmiş değerlendirme, doğrulama izi ve sınırlı düzenlemeyi ayrı tutar.",
  verifierMainNavLabel: "İnceleme panelleri",
  verifierUnknownIntro:
    "Açıkça sınırlanmış belirsizlik: buradaki maddeler taraflar arasında çözülmemiş veya tartışmalıdır — eksik alan doldurma formu değildir.",
  verifierTracePanelNote:
    "Her adım bu çalıştırmada neyin kontrol edildiğini belgeler. İz kurumsal incelemeyi destekler; mutlak gerçeklik iddiası taşımaz.",
  verifierIssuancePanelLead:
    "Sınırlı delil paketi hazırlığı: profiller neyin düzenlenebileceğini belirler; düzenleme suçlama veya insan yargısının yerini almaz.",
  verifierRoleContextLabel: "Rol bağlamı",
  verifierRoleContextBody:
    "Muhatap çerçevesi ve dışa aktarım profili hangi artefaktların hazırlanabileceğini belirler; kanonik paketi veya izi değiştirmez.",
  verifierWaitingSelectionTitle: "Sınırlı seçim bekleniyor",
  verifierWaitingSelectionBody:
    "Komut omurgasında sistem, senaryo ve olay seçin. İnceleme istasyonu aynı anda tek kanonik paket yükler — gösterge paneli toplaması değildir.",
  verifierEvidenceRecordedCaption: "Yakalandığı haliyle tanık materyali — sensör, günlük, yük. Yorum değildir.",
  verifierEvidenceDerivedCaption: "Kayıtlı öğelerden rekonstrüksiyon ve sentez — ham katmanın yerini almaz ve silmez.",
  verifierActionBarDoctrineTrace: "iz ≠ nihai gerçek",
  verifierActionBarDoctrineIssuance: "düzenleme ≠ suçlama",
  verifierReviewStage: "İnceleme aşaması",
  verifierVerificationTraceHeader: "Doğrulama izi",
  verifierArtifactIssuanceHeader: "Belge düzenlemesi",
  verifierEmptyEventCatalog: "Bu senaryo için olay kartı yok.",
  verifierPickScenarioFirst: "Önce senaryo seçin; olaylar senaryoya göre listelenir.",

  // Section headers
  sectionProblem: "Sorun",
  sectionProductSystem: "Ürün sistemi",
  sectionRoleFlow: "Role dayalı inceleme akışı",
  sectionEvidenceLayer: "Kanıt katmanı disiplini",
  sectionInstitutional: "Kurumsal kullanım aileleri",
  sectionSectorScenarios: "Sektör demo senaryoları",
  sectionVerification: "Doğrulama",
  sectionProductSurfaces: "Ürün yüzeyleri",

  // Verifier
  verifierStation: "Doğrulama İstasyonu",
  verifierInspection: "İnceleme İstasyonu",
  verifierTitle: "Olay Paketi Doğrulaması",
  verifierSubtitle: "Seçili olay paketinin sınırlı değerlendirmesi. Hukuki sorumluluk veya suç tespiti yapılmaz.",
  verifierSelectedSystem: "Seçili Sistem",
  verifierSelectedScenario: "Seçili Senaryo",
  verifierSelectedEvent: "Seçili Olay",
  verifierNotSelected: "Seçilmedi",
  verifierCommandSpine: "Komut Omurgası",
  verifierOrder: "Sıra: 1) Sistem 2) Senaryo 3) Olay",
  verifierLayering: "Katman: Kayıtlı ayrı, Türetilmiş ayrı",
  verifierNoOverride: "Bilinmeyen/Tartışmalı ve İz, belgeleme tarafından geçersiz kılınmaz",
  verifierSteps: {
    system: "Sistem",
    scenario: "Senaryo",
    event: "Olay",
    incidentSummary: "Olay Özeti",
    evidenceLayers: "Kanıt Katmanları",
    unknownDisputed: "Bilinmeyen / Tartışmalı",
    verificationTrace: "Doğrulama İzi",
    artifactIssuance: "Belge Düzenlemesi",
    whyInevitable: "Neden QARAQUTU vazgeçilmez",
  },
  verifierRecorded: "Kayıtlı kanıt",
  verifierDerived: "Türetilmiş değerlendirme",
  verifierRawLayer: "Ham katman",
  verifierSecondLayer: "İkinci katman",
  verifierDoctrine: "// doktrin_omurgası",
  verifierNoRecorded: "Kayıtlı kanıt yok.",
  verifierNoDerived: "Türetilmiş kanıt yok.",
  verifierNoEvent: "Henüz olay seçilmedi.",
  verifierNoScenario: "Senaryo seçilmedi.",
  verifierResultTitle: "Doğrulama sonucu (bu çalışma)",
  verifierNoResult: "Henüz doğrulama çalıştırılmadı. Bir olay seçin ve doğrulamayı başlatın.",
  verifierIssuanceNote: "Belge düzenlemesi için sol omurgadan bir olay seçin.",
  verifierIssuanceDoctrine: "Belgeleme role ve ize bağlıdır; bilinmeyen/tartışmalı durumları geçersiz kılmaz.",
  verifierSelectEvent: "Kayıtlı ve türetilmiş kanıt katmanlarını görmek için sol omurgadan bir olay seçin.",
  verifierDemoLabel: "Demo senaryo · Kamuya açık · Anonimize · Nihai hüküm değildir",
  verifierWhatHappened: "Ne oldu",
  verifierWhyUnderReview: "İnceleme gerekçesi",
  verifierReviewState: "İnceleme durumu",
  verifierSafeNextStep: "Güvenli sonraki adım",
  verifierCaseContext: "Vaka bağlamı",
  verifierIncidentClass: "Olay sınıfı",
  verifierScenarioFrame: "Senaryo çerçevesi",
  verifierIdentityChain: "Kimlik zinciri",
  verifierIncidentSummary: "Olay özeti",
  verifierUnknownDisputed: "Bilinmeyen / tartışmalı",
  verifierHumanReview: "İnsan incelemesi gerekli",
  verifierDemoNotice: "Demo senaryo",
  verifierDemoPublic: "Kamuya açık",
  verifierDemoAnonymized: "Anonimize",
  verifierDemoNotFinal: "Nihai hüküm değildir",

  // Docs
  docsTitle: "QARAQUTU Belgeleri / API",
  docsChip: "Protokol & API",

  // Access / Restricted
  accessGateLabel: "Erişim kapısı",
  accessTitle: "Yetkili erişim gereklidir",
  accessBody: "QARAQUTU'nun korumalı yüzeyleri kasıtlı olarak sınırlıdır. Devam etmek için yetkili erişim belirtecinizi girin.",
  accessTokenLabel: "Erişim belirteci",
  accessTokenPlaceholder: "Yetkili belirteç",
  accessSubmit: "Devam",
  accessBack: "Geri",
  accessNote: "Bu kapı, mevcut kabul dilimi için minimal bir koruma katmanıdır. Tam kiracı IAM / RBAC sonraki sprintte gelecek.",
  restrictedLabel: "Kısıtlı yüzey",
  restrictedTitle: "Yetkili erişim gereklidir",
  restrictedBody: "Bu alan kasıtlı olarak sınırlıdır. Dahili inceleme ve kontrollü belgeleme iş akışlarını destekler; genel bir ürün yüzeyi değildir.",
  restrictedRequestAccess: "Erişim talep et",
  restrictedReturn: "Ana sayfaya dön",
  restrictedNote: "Not: \"kısıtlı\" korumalı ve erişim kontrollü anlamına gelir; eksik veya bozuk değildir.",

  // Admin
  adminTitle: "Sistem tanılama",
  adminSubtitle: "Doğrulayıcı-öncelikli operasyonlar için dahili tanılama yüzeyi. Ortam, doğrulayıcı omurgası ve belgeleme yollarının sınırlı incelemesi — operasyonel gösterge paneli değil.",
  adminDiagnosticsOnly: "Yalnızca tanılama",
  adminProtectedSurface: "Korumalı yüzey · yetkili erişim gereklidir",

  // Console
  consoleTitle: "Konsol — kontrollü protokol kabuğu hazırlığı",
  consoleBody: "Gelecekteki sınırlı protokol operasyonlarını şekillendirmek için ayrılmış dahili yüzey. Bu sayfa herkese açık değildir; serbest biçimli bir yürütme terminali veya operasyonel gösterge paneli değildir.",

  // Doctrine disclaimer
  doctrineDisclaimer: "QARAQUTU bir uyuşmazlık düzeyinde kanıt sistemidir. Sorumluluk motoru, yargısal karar sistemi veya bağımsız hukuki, talep ya da teknik yargının yerini tutan bir araç değildir.",

  // Document / report authority — families (canonical)
  docFamily_incidentEvent: "Olay / Vaka Raporu",
  docFamily_verificationSummary: "Doğrulama Özeti",
  docFamily_traceAppendix: "İz Eki",
  docFamily_claimsPack: "Hasar Paketi",
  docFamily_legalPack: "Hukuk Paketi",
  docFamily_technicalPack: "Teknik Paket",
  docFamily_administrativePacket: "İdari Paket",
  docFamily_authenticityReceipt: "Orijinallik Makbuzu",
  docSector_vehicleIncident: "Araç Olay Raporu",
  docSector_droneIncident: "İHA Olay Raporu",
  docSector_robotIncident: "Robot Olay Raporu",
  docMeta_documentId: "Belge ID",
  docMeta_eventId: "Olay ID",
  docMeta_bundleId: "Paket ID",
  docMeta_manifestRef: "Manifest ref",
  docMeta_receiptRef: "Makbuz ref",
  docMeta_traceRef: "İz ref",
  docMeta_schemaVersion: "Şema sürümü",
  docMeta_createdAt: "Oluşturulma",
  docMeta_verifiedAt: "Doğrulama zamanı",
  docMeta_verificationState: "Doğrulama durumu",
  docMeta_roleAudience: "Rol / muhatap",
  docMeta_exportPurpose: "Dışa aktarım amacı",
  docMeta_exportProfile: "Dışa aktarım profili",
  docCover_label: "Kapak",
  docBody_label: "Belge gövdesi",
  docPage_identity: "Sayfa 1 — gövde",
  docAuthenticityNote:
    "Bu kimlik alanları belgeyi belirtilen sürümdeki kanonik olay paketi ve düzenleme kaydına bağlar. İzlenebilirlik ve kurumsal dosyalamayı destekler; mutlak gerçeklik, kusur veya nihai hukukî sonuç iddiası taşımaz.",
  docAuthorityStrip_title: "Protokol kimliği ve zincir",
  docInstitutionLayer_title: "Muhatap çerçevesi",
  docPrintHint: "Baskıya uygun yerleşim — resmî dosyaya konmaya uygundur.",
  docFooter_doctrineShort:
    "QARAQUTU — Doğrulayıcı-öncelikli tanık protokolü. Sorumluluk motoru veya yargı yerine geçmez. Kayıtlı, Türetilmiş, Bilinmeyen/Tartışmalı, Doğrulama İzi ve Belge Düzenlemesi açıkça ayrı kalır.",
  docSealLabel: "Protokol mührü",
  verifierIssuancePreviewTitle: "Düzenlenen belge — otorite önizlemesi",
  verifierAudienceSelect: "Muhatap çerçevesi",
  docLinkage_qr: "Doğrulama QR alanı",
} as const;

export const MSG = { en, tr } as const;

/**
 * Future-ready adapter hook.
 * When an external translation provider is integrated, replace this with a provider-aware hook.
 * For now, returns the static message object for the given language.
 */
export function getMessages(lang: Lang) {
  return MSG[lang];
}
