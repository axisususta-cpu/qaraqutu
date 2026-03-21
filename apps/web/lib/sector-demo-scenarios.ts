/**
 * Sector Demo Scenarios v1.
 * Sector-specific witness scenarios — institutional, doctrine-safe.
 * QARAQUTU does not decide; it turns the technological event into a hard-to-deny chain of witness.
 */

import type { DocumentFamilyCode, InstitutionalRoleId } from "./institutional-roles";

export interface SectorScenario {
  id: string;
  sectorLabelEn: string;
  sectorLabelTr: string;
  whyItMattersEn: string;
  whyItMattersTr: string;
  scenarioTitleEn: string;
  scenarioTitleTr: string;
  incidentDescriptionEn: string;
  incidentDescriptionTr: string;
  institutionalRiskEn: string;
  institutionalRiskTr: string;
  qaraqutuResponseEn: string;
  qaraqutuResponseTr: string;
  preferredDocumentFamily: DocumentFamilyCode[];
  roleShellAlignment: InstitutionalRoleId[];
  whyInevitableEn: string;
  whyInevitableTr: string;
}

export const SECTOR_DEMO_SCENARIOS: SectorScenario[] = [
  {
    id: "insurance-claims",
    sectorLabelEn: "Insurance / Claims",
    sectorLabelTr: "Sigorta / Hasar",
    whyItMattersEn: "Dispute-grade evidence must anchor claims decisions on a single canonical object.",
    whyItMattersTr: "İhtilaf düzeyinde kanıt, hasar kararlarını tek bir kanonik nesneye dayandırmalıdır.",
    scenarioTitleEn: "Fleet incident — claims review posture",
    scenarioTitleTr: "Filo olayı — hasar inceleme duruşu",
    incidentDescriptionEn: "Vehicle incident with telemetry, dashcam, and sensor data. Multiple parties need dispute-ready summaries tied to the same canonical event.",
    incidentDescriptionTr: "Telemetri, dashcam ve sensör verisi içeren araç olayı. Birden fazla taraf aynı kanonik olaya bağlı ihtilafa hazır özetlere ihtiyaç duyar.",
    institutionalRiskEn: "Recorded and derived collapse into one narrative; claims and legal teams anchor on different objects.",
    institutionalRiskTr: "Kayıtlı ve türetilmiş tek bir anlatıda birleşir; hasar ve hukuk ekipleri farklı nesnelere dayanır.",
    qaraqutuResponseEn: "Trace-linked claims pack with recorded/derived separation, canonical refs, and role-bounded artifact issuance.",
    qaraqutuResponseTr: "Kayıtlı/türetilmiş ayrımı, kanonik referanslar ve rol-sınırlı artifact issuance ile iz-bağlı hasar paketi.",
    preferredDocumentFamily: ["claims_pack", "verification_summary", "incident_report"],
    roleShellAlignment: ["claims"],
    whyInevitableEn: "Institutions cannot adjudicate without a shared, tamper-evident evidence spine.",
    whyInevitableTr: "Kurumlar, paylaşılan ve değiştirilemez kanıt omurgası olmadan karar veremez.",
  },
  {
    id: "notary-authenticity",
    sectorLabelEn: "Notary / Authenticity",
    sectorLabelTr: "Noter / Özgünlük",
    whyItMattersEn: "Authenticity signals must be trace-linked, not conflated with liability or verdict.",
    whyItMattersTr: "Özgünlük sinyalleri iz-bağlı olmalı; sorumluluk veya hüküm ile karıştırılmamalıdır.",
    scenarioTitleEn: "Document authenticity — manifest and receipt chain",
    scenarioTitleTr: "Belge özgünlüğü — manifest ve makbuz zinciri",
    incidentDescriptionEn: "Authenticity verification of a signed document or digital artifact. Manifest, receipt, and version chain must remain explicit.",
    incidentDescriptionTr: "İmzalı belge veya dijital artifact için özgünlük doğrulaması. Manifest, makbuz ve sürüm zinciri açık kalmalıdır.",
    institutionalRiskEn: "Authenticity claims without trace; receipt and manifest linkage lost in presentation.",
    institutionalRiskTr: "İz olmadan özgünlük iddiaları; makbuz ve manifest bağlantısı sunumda kaybolur.",
    qaraqutuResponseEn: "Authenticity receipt with manifest, receipt ID, version chain, and trace appendix — protocol seal, not verdict.",
    qaraqutuResponseTr: "Manifest, makbuz ID, sürüm zinciri ve iz ekleri ile özgünlük makbuzu — protokol mührü, hüküm değil.",
    preferredDocumentFamily: ["authenticity_receipt", "verification_summary", "trace_appendix"],
    roleShellAlignment: ["notary", "clerk"],
    whyInevitableEn: "Authenticity without trace is assertion; trace without separation is confusion.",
    whyInevitableTr: "İz olmadan özgünlük iddiadır; ayrım olmadan iz karışıklıktır.",
  },
  {
    id: "patent-ip",
    sectorLabelEn: "Patent / IP Witnessing",
    sectorLabelTr: "Patent / Fikri Mülkiyet Tanıklığı",
    whyItMattersEn: "IP witness records need trace-linked provenance; authenticity layer must stay distinct.",
    whyItMattersTr: "Fikri mülkiyet tanık kayıtları iz-bağlı provenansa ihtiyaç duyar; özgünlük katmanı ayrı kalmalıdır.",
    scenarioTitleEn: "Prior art / invention disclosure — witness record",
    scenarioTitleTr: "Önceki sanat / buluş açıklaması — tanık kaydı",
    incidentDescriptionEn: "Timestamped invention disclosure or prior-art capture. Trace-linked witness record with authenticity layer for IP proceedings.",
    incidentDescriptionTr: "Zaman damgalı buluş açıklaması veya önceki sanat yakalama. IP süreçleri için özgünlük katmanı ile iz-bağlı tanık kaydı.",
    institutionalRiskEn: "Witness record without trace; authenticity conflated with legal claim.",
    institutionalRiskTr: "İz olmadan tanık kaydı; özgünlük hukuki iddia ile karıştırılır.",
    qaraqutuResponseEn: "Trace-linked witness record with authenticity layer; verification trace supports review, not truth itself.",
    qaraqutuResponseTr: "Özgünlük katmanı ile iz-bağlı tanık kaydı; doğrulama izi incelemeyi destekler, gerçeğin kendisi değil.",
    preferredDocumentFamily: ["trace_appendix", "authenticity_receipt", "verification_summary"],
    roleShellAlignment: ["notary", "technical"],
    whyInevitableEn: "IP proceedings require incontestable timestamp and provenance; trace provides the spine.",
    whyInevitableTr: "IP süreçleri tartışılmaz zaman damgası ve provenans gerektirir; iz omurgayı sağlar.",
  },
  {
    id: "municipality-administrative",
    sectorLabelEn: "Municipality / Administrative Review",
    sectorLabelTr: "Belediye / İdari İnceleme",
    whyItMattersEn: "Administrative decisions need version chain and access history, not derived-as-fact.",
    whyItMattersTr: "İdari kararlar sürüm zinciri ve erişim geçmişine ihtiyaç duyar; türetilmiş-olarak-olgu değil.",
    scenarioTitleEn: "Administrative packet — version and access chain",
    scenarioTitleTr: "İdari paket — sürüm ve erişim zinciri",
    incidentDescriptionEn: "Public-body review of a permit, appeal, or administrative file. Version chain, access history, and export history must be explicit.",
    incidentDescriptionTr: "İzin, itiraz veya idari dosya için kamu kurumu incelemesi. Sürüm zinciri, erişim geçmişi ve export geçmişi açık olmalıdır.",
    institutionalRiskEn: "Derived presented as administrative fact; version and access history opaque.",
    institutionalRiskTr: "Türetilmiş idari olgu olarak sunulur; sürüm ve erişim geçmişi opak.",
    qaraqutuResponseEn: "Administrative packet with version chain, access history, verification summary — derived stays separate.",
    qaraqutuResponseTr: "Sürüm zinciri, erişim geçmişi, doğrulama özeti ile idari paket — türetilmiş ayrı kalır.",
    preferredDocumentFamily: ["administrative_packet", "verification_summary"],
    roleShellAlignment: ["administrative", "oversight"],
    whyInevitableEn: "Administrative accountability requires auditable chain; derived cannot masquerade as fact.",
    whyInevitableTr: "İdari hesap verebilirlik denetlenebilir zincir gerektirir; türetilmiş olgu kisvesine bürünemez.",
  },
  {
    id: "police-field-evidence",
    sectorLabelEn: "Police / Gendarmerie / Field Evidence",
    sectorLabelTr: "Polis / Jandarma / Saha Kanıtı",
    whyItMattersEn: "Field evidence must preserve recorded source list and time sequence; trace supports review.",
    whyItMattersTr: "Saha kanıtı kayıtlı kaynak listesini ve zaman dizisini korumalıdır; iz incelemeyi destekler.",
    scenarioTitleEn: "Incident record — recorded evidence and trace appendix",
    scenarioTitleTr: "Olay kaydı — kayıtlı kanıt ve iz ekleri",
    incidentDescriptionEn: "Field incident with body-worn, vehicle, or scene capture. Recorded evidence, source list, time sequence, and trace appendix for chain-of-custody.",
    incidentDescriptionTr: "Vücut kamerası, araç veya sahne kaydı ile saha olayı. Zincir-of-custody için kayıtlı kanıt, kaynak listesi, zaman dizisi ve iz ekleri.",
    institutionalRiskEn: "Recorded and derived conflated; trace presented as truth; chain-of-custody gaps.",
    institutionalRiskTr: "Kayıtlı ve türetilmiş karıştırılır; iz gerçek olarak sunulur; zincir-of-custody boşlukları.",
    qaraqutuResponseEn: "Incident report with recorded/derived separation; trace appendix for verification steps — trace supports review, not truth itself.",
    qaraqutuResponseTr: "Kayıtlı/türetilmiş ayrımı ile olay raporu; doğrulama adımları için iz ekleri — iz incelemeyi destekler, gerçeğin kendisi değil.",
    preferredDocumentFamily: ["incident_report", "trace_appendix", "verification_summary"],
    roleShellAlignment: ["field"],
    whyInevitableEn: "Field evidence without separation is contested; trace without doctrine is liability theatre.",
    whyInevitableTr: "Ayrım olmadan saha kanıtı tartışmalıdır; doktrin olmadan iz sorumluluk tiyatrosudur.",
  },
  {
    id: "technical-manufacturer",
    sectorLabelEn: "Technical Manufacturer / Autonomous SaaS",
    sectorLabelTr: "Teknik Üretici / Otonom SaaS",
    whyItMattersEn: "Technical reconstruction must stay distinct from fault assignment; trace links system to event.",
    whyItMattersTr: "Teknik rekonstrüksiyon kusur isnadından ayrı kalmalıdır; iz sistemi olaya bağlar.",
    scenarioTitleEn: "Technical pack — system, scenario, event linkage",
    scenarioTitleTr: "Teknik paket — sistem, senaryo, olay bağlantısı",
    incidentDescriptionEn: "Autonomous system event — vehicle, drone, or robot. System/scenario/event linkage, source refs, packet structure, and trace for technical review.",
    incidentDescriptionTr: "Otonom sistem olayı — araç, drone veya robot. Teknik inceleme için sistem/senaryo/olay bağlantısı, kaynak referansları, paket yapısı ve iz.",
    institutionalRiskEn: "Technical reconstruction presented as fault finding; trace conflated with verdict.",
    institutionalRiskTr: "Teknik rekonstrüksiyon kusur bulma olarak sunulur; iz hüküm ile karıştırılır.",
    qaraqutuResponseEn: "Technical pack with system/scenario/event, source refs, trace appendix — reconstruction is not fault assignment.",
    qaraqutuResponseTr: "Sistem/senaryo/olay, kaynak referansları, iz ekleri ile teknik paket — rekonstrüksiyon kusur isnadı değildir.",
    preferredDocumentFamily: ["technical_pack", "trace_appendix", "incident_report"],
    roleShellAlignment: ["technical"],
    whyInevitableEn: "Manufacturers need dispute-grade trace without liability theatre; technical pack delivers that.",
    whyInevitableTr: "Üreticiler sorumluluk tiyatrosu olmadan ihtilaf düzeyinde iz gerektirir; teknik paket bunu sağlar.",
  },
];

export function getSectorScenario(id: string): SectorScenario | null {
  return SECTOR_DEMO_SCENARIOS.find((s) => s.id === id) ?? null;
}

export function getAllSectorScenarios(): SectorScenario[] {
  return [...SECTOR_DEMO_SCENARIOS];
}

/** Sector ↔ Document family mapping — for cross-reference. */
export function getSectorsByDocumentFamily(familyCode: DocumentFamilyCode): SectorScenario[] {
  return SECTOR_DEMO_SCENARIOS.filter((s) => s.preferredDocumentFamily.includes(familyCode));
}
