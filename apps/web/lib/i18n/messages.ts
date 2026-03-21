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
  verifierRecorded: "recorded_evidence",
  verifierDerived: "derived_assessment",
  verifierRawLayer: "raw_layer",
  verifierSecondLayer: "second_layer",
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
  verifierWhyUnderReview: "why_under_review",
  verifierReviewState: "Review state",
  verifierSafeNextStep: "Safe next step",
  verifierCaseContext: "case_context",
  verifierIncidentClass: "incident_class",
  verifierScenarioFrame: "scenario_frame",
  verifierIdentityChain: "identity_chain",
  verifierIncidentSummary: "incident_summary",
  verifierUnknownDisputed: "unknown_disputed",
  verifierHumanReview: "human_review_required",
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
  navHome: "Ana Sayfa",
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
  verifierRecorded: "kayıtlı_kanıt",
  verifierDerived: "türetilmiş_değerlendirme",
  verifierRawLayer: "ham_katman",
  verifierSecondLayer: "ikinci_katman",
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
  verifierWhyUnderReview: "neden_incelemede",
  verifierReviewState: "İnceleme durumu",
  verifierSafeNextStep: "Güvenli sonraki adım",
  verifierCaseContext: "vaka_bağlamı",
  verifierIncidentClass: "olay_sınıfı",
  verifierScenarioFrame: "senaryo_çerçevesi",
  verifierIdentityChain: "kimlik_zinciri",
  verifierIncidentSummary: "olay_özeti",
  verifierUnknownDisputed: "bilinmeyen_tartışmalı",
  verifierHumanReview: "insan_incelemesi_gerekli",
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
