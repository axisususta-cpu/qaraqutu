/**
 * Institution-targeted language layers for document shells.
 * Doctrine-safe: institution-ready framing without fault, crime attribution, or final determination language.
 */

import type { Lang } from "./i18n/messages";
import type { InstitutionAudienceId } from "./report-authority";

export interface InstitutionFraming {
  headingTone: string;
  subtitle: string;
  summaryWording: string;
  metadataEmphasis: string;
  outputFraming: string;
}

const en: Record<InstitutionAudienceId, InstitutionFraming> = {
  insurance_claims: {
    headingTone: "Claims and coverage review file",
    subtitle: "Structured witness record for underwriting and claims workflow — not a liability determination.",
    summaryWording:
      "Presents recorded and derived layers as separated; verification trace documents review steps, not adjudication.",
    metadataEmphasis: "Prioritize event ID, bundle/manifest linkage, receipt reference, and verification state for file alignment.",
    outputFraming: "Suitable as a controlled file attachment; independent claims judgment remains with the carrier and parties.",
  },
  notary_authenticity: {
    headingTone: "Authenticity and record-identity packet",
    subtitle: "Protocol-bound identifiers linking this document to a canonical event package and issuance receipt.",
    summaryWording:
      "Emphasizes document ID, receipt reference, and trace linkage for record integrity — not a statement of legal merit.",
    metadataEmphasis: "Highlight document ID, receipt ref, manifest ref, and version for archival cross-check.",
    outputFraming: "Framed for notarial or registry-style record keeping; does not certify facts beyond the stated chain.",
  },
  legal_court: {
    headingTone: "Court-ready review appendix (protocol-bound)",
    subtitle: "Dispute-grade packaging with explicit separation of recorded material, derived assessment, and trace.",
    summaryWording:
      "Unknown or disputed items remain visible; issuance does not collapse layers or substitute for tribunal findings.",
    metadataEmphasis: "Preserve trace reference, verification state, and issuance purpose for procedural traceability.",
    outputFraming: "Intended as an institutional exhibit candidate; counsel and tribunal retain independent evaluation.",
  },
  municipality_admin: {
    headingTone: "Administrative incident record (bounded)",
    subtitle: "Municipal or administrative use: factual packaging without policy verdict or enforcement attribution.",
    summaryWording:
      "Supports administrative review workflows; recorded and derived content are not merged into a single narrative authority.",
    metadataEmphasis: "Event ID, bundle linkage, and verification state support case file routing and audit.",
    outputFraming: "For official file use where a bounded, trace-linked record is required — not an enforcement decision.",
  },
  police_field: {
    headingTone: "Field evidence coordination document",
    subtitle: "Operational handoff aid: identity chain and trace visible — not a criminal finding or charge sheet.",
    summaryWording:
      "Documents what the protocol bound at issuance time; field teams should treat unknown/disputed lanes as first-class.",
    metadataEmphasis: "Strong emphasis on event ID, trace ref, verification state, and receipt for chain-of-custody alignment.",
    outputFraming: "Supports investigation support workflows; prosecutorial or disciplinary conclusions are out of scope here.",
  },
  technical_vendor: {
    headingTone: "Technical and product-integrity appendix",
    subtitle: "Manufacturer or autonomous-system context: telemetry and reconstruction boundaries stay explicit.",
    summaryWording:
      "Derived assessments are labeled as such; verification trace describes checks performed, not ground truth of the incident.",
    metadataEmphasis: "Bundle ID, manifest ref, schema version, and trace ref anchor engineering review and regression audit.",
    outputFraming: "For technical stakeholders; root-cause and product liability analysis remain separate professional exercises.",
  },
};

const tr: Record<InstitutionAudienceId, InstitutionFraming> = {
  insurance_claims: {
    headingTone: "Hasar ve teminat inceleme dosyası",
    subtitle: "Underwriting ve hasar süreci için yapılandırılmış tanık kaydı — sorumluluk hükmü değildir.",
    summaryWording:
      "Kayıtlı ve türetilmiş katmanlar ayrı sunulur; doğrulama izi inceleme adımlarını belgeler, tahkim değildir.",
    metadataEmphasis: "Dosya hizası için olay ID, paket/manifest bağlantısı, makbuz referansı ve doğrulama durumu önceliklidir.",
    outputFraming: "Kontrollü ek dosya olarak uygundur; bağımsız hasar değerlendirmesi sigorta ve taraflara aittir.",
  },
  notary_authenticity: {
    headingTone: "Orijinallik ve kayıt kimlik paketi",
    subtitle: "Bu belgeyi kanonik olay paketi ve düzenleme makbuzuna bağlayan protokol kimlikleri.",
    summaryWording:
      "Belge ID, makbuz referansı ve iz bağlantısı arşiv çapraz kontrolü içindir; hukukî esas beyanı değildir.",
    metadataEmphasis: "Arşiv için belge ID, makbuz ref, manifest ref ve sürüm öne çıkarılır.",
    outputFraming: "Noter veya sicil tarzı tutum için çerçevelenmiştir; zincir ötesi olgu tasdiki iddiası taşımaz.",
  },
  legal_court: {
    headingTone: "Duruşmaya hazır inceleme eki (protokole bağlı)",
    subtitle: "Uyuşmazlık düzeyinde paketleme; kayıtlı malzeme, türetilmiş değerlendirme ve iz açıkça ayrılmıştır.",
    summaryWording:
      "Bilinmeyen veya tartışmalı kalemler görünür kalır; belgeleme katmanları birleştirilmez ve mahkeme yerini almaz.",
    metadataEmphasis: "Usul izlenebilirliği için iz referansı, doğrulama durumu ve düzenleme amacı korunur.",
    outputFraming: "Kurumsal delil adayı niteliğindedir; avukat ve heyet bağımsız değerlendirmeyi sürdürür.",
  },
  municipality_admin: {
    headingTone: "İdari olay kaydı (sınırlı)",
    subtitle: "Belediye veya idari kullanım: politika hükmü veya zorlama isnadı içermez.",
    summaryWording:
      "İdari inceleme akışlarını destekler; kayıtlı ve türetilmiş içerik tek anlatı otoritesinde birleştirilmez.",
    metadataEmphasis: "Olay ID, paket bağlantısı ve doğrulama durumu dosya yönlendirme ve denetim için uygundur.",
    outputFraming: "Sınırlı, iz bağlı kayıt gerektiren resmî dosya kullanımı içindir — idari karar değildir.",
  },
  police_field: {
    headingTone: "Saha kanıt koordinasyon belgesi",
    subtitle: "Operasyonel devir yardımı: kimlik zinciri ve iz görünür — suç tespiti veya iddianame değildir.",
    summaryWording:
      "Düzenleme anında protokolün bağladıklarını belgeler; bilinmeyen/tartışmalı hatlar birincil sınıf kalır.",
    metadataEmphasis: "Zincir uyumu için olay ID, iz ref, doğrulama durumu ve makbuz güçlü vurgulanır.",
    outputFraming: "Soruşturma destek akışları içindir; kovuşturma veya disiplin sonuçları bu belgenin kapsamı dışındadır.",
  },
  technical_vendor: {
    headingTone: "Teknik ve ürün bütünlüğü eki",
    subtitle: "Üretici veya otonom sistem bağlamı: telemetri ve rekonstrüksiyon sınırları açık tutulur.",
    summaryWording:
      "Türetilmiş değerlendirmeler etiketlidir; doğrulama izi yapılan kontrolleri tanımlar, olayın mutlak gerçeğini değil.",
    metadataEmphasis: "Mühendislik incelemesi ve regresyon denetimi için paket ID, manifest ref, şema sürümü ve iz ref sabitlenir.",
    outputFraming: "Teknik paydaşlar içindir; kök neden ve ürün sorumluluğu analizi ayrı mesleki süreçlerdir.",
  },
};

export function getInstitutionFraming(audience: InstitutionAudienceId, lang: Lang): InstitutionFraming {
  return lang === "tr" ? tr[audience] : en[audience];
}

export function institutionAudienceLabel(audience: InstitutionAudienceId, lang: Lang): string {
  const labels: Record<InstitutionAudienceId, Record<Lang, string>> = {
    insurance_claims: { en: "Insurance / Claims", tr: "Sigorta / Hasar" },
    notary_authenticity: { en: "Notary / Authenticity", tr: "Noter / Orijinallik" },
    legal_court: { en: "Legal / Court-ready review", tr: "Hukuk / Duruşmaya hazır inceleme" },
    municipality_admin: { en: "Municipality / Administrative", tr: "Belediye / İdari" },
    police_field: { en: "Police / Gendarmerie / Field evidence", tr: "Polis / Jandarma / Saha kanıtı" },
    technical_vendor: { en: "Technical manufacturer / Autonomous SaaS", tr: "Teknik üretici / Otonom SaaS" },
  };
  return labels[audience][lang];
}
