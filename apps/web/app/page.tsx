"use client";

import Link from "next/link";
import { LogoPrimary } from "./components/LogoPrimary";
import { useLanguage } from "../lib/LanguageContext";

const MONO = "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'IBM Plex Sans', 'Inter', 'Segoe UI', sans-serif";

const COPY = {
  tr: {
    heroTagline: "Kurumsal Tanık Protokolü",
    heroHeadline: [
      "Aynı olayı sigorta, hukuk ve teknik",
      "farklı nesnelerde okuduğunda",
      "kurumun ihtiyacı tek zincir,",
      "üç ayrı öykü değil.",
    ],
    heroBody:
      "QARAQUTU sensör, günlük ve operatör bağlamını tek kanonik olay paketinde birleştirir; ardından ayrılmış bir Doğrulayıcı istasyonunda inceler: kayıtlı materyal, türetilmiş okumalar, açık bilinmeyenler, doğrulama izi ve role sınırlı belge düzenlemesi.",
    heroProps: [
      ["Hüküm vermez", "Şahitlik eder. Yorum ile kaydı asla aynı yüzeyde birleştirmez."],
      ["Rol sınırlı okuma", "Polis, sigorta, hukuk ve teknik aynı omurgadan farklı belge kabuğu alır."],
      ["Araç · İHA · Robot", "Üç alanda aynı protokol; kayıt, iz ve düzenleme ayrımı korunur."],
      ["Bağlayıcı hazır", "Gerçek araç, İHA ve robot veri uç noktaları doğrudan bağlanır."],
    ],
    doctrineNote:
      "Mimari notu: Doğrulayıcı birincil inceleme istasyonudur. Araç, İHA ve Robot tek kanonik model üzerindedir. Golden ayrı ürün değil; doğrulayıcı sürekliliği için dahili referanstır.",
    howLabel: "Nasıl Çalışır",
    howTitle: "Tek omurgada kayıt, türetme ve belgeleme; ayrımı bozulmadan",
    howBody:
      "Hasar, vekil, saha ve mühendislik aynı omurgadan çalışsın diye tasarlanmıştır; tanık ile yorumun aynı yüzeyde erimesine izin vermez.",
    howCards: [
      ["01", "Olay Paketi Oluşturulur", "Sensör, günlük ve operatör bağlamı tek kanonik pakette birleşir. Kayıt katmanı ve türetilmiş katman aynı nesneye yazılmaz.", ["LiDAR", "IMU", "GPS", "CAN"]],
      ["02", "Doğrulayıcı İstasyonunda İncelenir", "Nokta bulutu sahne görünümü etrafında T0→T3 faz okuma, kayıt/türetilmiş/bilinmeyen ayrımı, doğrulama izi ve belge hazırlığı görünür olur.", ["T0 T1 T2 T3", "Kayıt Katmanı"]],
      ["03", "Rol Odaklı Belge Çıkarılır", "Aynı olay paketi polis, sigorta, hukuk ve teknik kabuğa dönüştürülür. Her kurum yalnızca kendi katmanını okur.", ["Polis", "Sigorta", "Hukuk"]],
    ],
    domainLabel: "Alanlar",
    domainTitle: "Araç · Drone · Robot; üç alan, tek protokol",
    domainBody: "Üç alanda aynı protokol; kayıtlı, türetilmiş, iz ve düzenleme ayrımı korunur.",
    domains: [
      ["ARC", "Araç", "Şerit, dur çizgisi, geçiş, bordür ve nesne alanı tek olay omurgasında tutulur. Hız, ivme ve brakaj kayıt katmanında mühürlüdür.", ["Event", "Bundle", "Manifest"]],
      ["UAV", "Drone / İHA", "Koridor, irtifa bandı, ihlal sınırı ve engel alanı tek protokole bağlanır. Uçuş planı sapması ve devralma anı görünür kalır.", ["Mission", "Telemetry", "Link"]],
      ["RBT", "Robot", "Hücre, güvenlik zarfı, rota koridoru ve insan yakınlığı aynı istasyonda okunur. PLC ve güvenlik ihlali ayrıştırılmış kalır.", ["Interaction", "Safety", "Handoff"]],
    ],
    doctrineLabel: "Doktrin",
    doctrineTitle: "Doktrin ayrımları ürün yüzeyinde açık kalır",
    doctrineBody: "Aynı istasyon içinde her katman görünür olabilir; fakat hiçbiri diğeri gibi davranmaz.",
    doctrineCards: [
      ["Kayıt Katmanı", "Kayıtlı materyal türetilmiş yoruma dönüşmez.", "Sensör, günlük, telemetri ve operatör girdisi mühürlü katmanda kalır."],
      ["Türetilmiş Katman", "Türetilmiş okuma hüküm değildir.", "Uzman yorumu, model okuması ve skorlar ayrı epistemik statü taşır."],
      ["Doğrulama İzi", "İz, gerçeğin kendisi değildir.", "Yapılan adımlar, kullanılan kayıtlar ve açık hususlar zincir halinde görünür olur."],
      ["Belgeleme", "Belge düzenleme suçlama değildir.", "Role bağlı çıktı aynı olay omurgasından gelir; kurumsal öncelik değişir, olay değişmez."],
    ],
    rolesLabel: "Roller",
    rolesTitle: "Roller omurgayı paylaşır, belge kabukları ayrılır",
    rolesBody: "Aynı paket, farklı kurumsal okuma yüzeylerine dönüşür.",
    roles: [
      ["ROL", "Polis", "Olay yeri, zaman çizgisi ve kaza tutanağı önceliklidir."],
      ["ROL", "Sigorta", "Hasar akışı, teminat incelemesi ve belge zinciri önceliklidir."],
      ["ROL", "Muhakeme", "Delil zinciri, inceleme izi ve açık hususlar önceliklidir."],
      ["ROL", "Bilirkişi", "Teknik okuma, neden-sonuç sınırı ve karşılaştırmalı değerlendirme görünür olur."],
      ["ROL", "Üretici", "Sistem davranışı, komponent ilişkisi ve hata bağlamı ayrıştırılır."],
      ["ROL", "Operatör", "Yakında", true],
    ],
    statsLabel: "İşletim ritmi",
    statsTitle: "İşletim ritmi",
    statsBody: "Canonical landing HTML’deki sade cadence bandını koruyarak ölçüleri öne çıkarır.",
    stats: [["01", "Tek kanonik olay omurgası"], ["03", "Araç / Drone / Robot alanı"], ["05", "Sınırlı protokol adımı"], ["24/7", "İnceleme yüzeyi erişimi"]],
    ctaTitle: "Tek omurga üzerinde olay incelemesini açın; tanık ile yorumu karıştırmayın.",
    ctaBody: "Doğrulayıcı, araç, drone ve robot olaylarını aynı kurumsal tanık protokolünde tutar. Belgeler ve erişim yüzeyleri aynı çekirdeğe bağlı kalır.",
    openVerifier: "Doğrulayıcıyı Aç",
    howLink: "Nasıl Çalışır?",
    previewTitle: "Mühürlü Yeniden Oluşturma Görünümü",
    previewLabel: "HÜCRE · GÜVENLİK ZARFI · YAKINLIK",
    doctrineChips: ["Kayıtlı ≠ Türetilmiş", "İz ≠ Nihai Gerçek", "Düzenleme ≠ Suçlama"],
    previewBadges: ["ROBOT", "RİSK: YÜKSEK", "İNCELENMEDİ"],
  },
  en: {
    heroTagline: "Institutional Witness Protocol",
    heroHeadline: [
      "When insurance, legal, and engineering",
      "read the same incident differently,",
      "institutions need one chain,",
      "not three separate stories.",
    ],
    heroBody:
      "QARAQUTU unifies sensor data, event logs, and operator context into a single canonical incident package, then inspects it in a separated Verifier station: recorded material, derived readings, open unknowns, verification trace, and role-scoped document issuance.",
    heroProps: [
      ["Does not judge", "It witnesses. Interpretation is never merged with recording on the same surface."],
      ["Role-scoped reading", "Police, insurance, legal, and technical shells read from the same spine."],
      ["Vehicle · UAV · Robot", "One protocol across three domains. Recording, trace, and issuance remain separated."],
      ["Connector-ready", "Real vehicle, drone, and robot data endpoints plug in directly."],
    ],
    doctrineNote:
      "Architecture note: the Verifier is the primary inspection station. Vehicle, Drone, and Robot share one canonical model. Golden is not a separate product; it is an internal continuity reference.",
    howLabel: "How It Works",
    howTitle: "Recording, derivation, and documentation on one spine; separation never breaks",
    howBody:
      "Designed so that claims, legal, field, and engineering teams work from the same spine without melting witness material into interpretation.",
    howCards: [
      ["01", "Incident Package Is Formed", "Sensors, logs, and operator context are unified into one canonical package. The recording layer and derived layer never write to the same object.", ["LiDAR", "IMU", "GPS", "CAN"]],
      ["02", "Inspected in the Verifier Station", "Around a point-cloud scene view, T0→T3 phase reading, recorded/derived/unknown separation, verification trace, and document readiness stay visible.", ["T0 T1 T2 T3", "Recording Layer"]],
      ["03", "Role-Scoped Document Is Issued", "The same package becomes police, insurance, legal, and technical shells. Each institution reads only its own layer.", ["Police", "Insurance", "Legal"]],
    ],
    domainLabel: "Domains",
    domainTitle: "Vehicle · Drone · Robot; three domains, one protocol",
    domainBody: "One protocol across three domains, with recorded, derived, trace, and issuance always separated.",
    domains: [
      ["VEH", "Vehicle", "Lane, stop-line, crossing, curb, and object field stay on one event spine. Speed, acceleration, and braking remain sealed in the recording layer.", ["Event", "Bundle", "Manifest"]],
      ["UAV", "Drone / UAV", "Corridor, altitude band, intrusion boundary, and obstacle field bind into one protocol. Flight-plan deviation and handoff remain explicit.", ["Mission", "Telemetry", "Link"]],
      ["RBT", "Robot", "Workcell, safety envelope, route corridor, and human proximity are read in one station. PLC and safety violations remain separated.", ["Interaction", "Safety", "Handoff"]],
    ],
    doctrineLabel: "Doctrine",
    doctrineTitle: "Doctrine separations stay explicit on the product surface",
    doctrineBody: "The same station can show every layer without letting one impersonate another.",
    doctrineCards: [
      ["Recorded Layer", "Recorded material never becomes derived interpretation.", "Sensors, logs, telemetry, and operator input remain sealed in the witness layer."],
      ["Derived Layer", "Derived reading is not judgement.", "Expert reading, model interpretation, and scores carry a separate epistemic status."],
      ["Verification Trace", "Trace is not final truth.", "Executed steps, used records, and open issues stay visible as a chain."],
      ["Issuance", "Document issuance is not blame.", "Role-scoped outputs come from the same event spine; institutional priority changes, the event does not."],
    ],
    rolesLabel: "Roles",
    rolesTitle: "Roles share the spine while document shells stay distinct",
    rolesBody: "The same package becomes different institutional reading surfaces.",
    roles: [
      ["ROLE", "Police", "Scene, timeline, and incident reporting are prioritized."],
      ["ROLE", "Insurance", "Claims flow, coverage review, and document chain are prioritized."],
      ["ROLE", "Adjudication", "Evidence chain, review trace, and open issues are prioritized."],
      ["ROLE", "Expert", "Technical reading, cause boundary, and comparison stay explicit."],
      ["ROLE", "Manufacturer", "System behavior, component relation, and fault context are separated."],
      ["ROLE", "Operator", "Coming soon", true],
    ],
    statsLabel: "Operational cadence",
    statsTitle: "Operational cadence",
    statsBody: "The canonical landing HTML uses a restrained stats band; this keeps that same rhythm.",
    stats: [["01", "One canonical event spine"], ["03", "Vehicle / Drone / Robot domains"], ["05", "Bounded protocol steps"], ["24/7", "Inspection surface availability"]],
    ctaTitle: "Open incident review on one spine; stop mixing witness material with interpretation.",
    ctaBody: "The Verifier keeps vehicle, drone, and robot incidents inside one institutional witness protocol. Docs and access surfaces remain tied to the same core.",
    openVerifier: "Open Verifier",
    howLink: "How It Works",
    previewTitle: "Sealed Reconstruction View",
    previewLabel: "WORKCELL · SAFETY ENVELOPE · PROXIMITY",
    doctrineChips: ["Recorded ≠ Derived", "Trace ≠ Final Truth", "Issuance ≠ Blame"],
    previewBadges: ["ROBOT", "RISK: HIGH", "UNREVIEWED"],
  },
} as const;

function ChainRow({ items }: { items: readonly string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {items.map((item, index) => (
        <span key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ padding: "2px 7px", border: "1px solid rgba(255,255,255,0.07)", color: "#44464e" }}>{item}</span>
          {index < items.length - 1 ? <span style={{ color: "#44464e", fontSize: 8 }}>→</span> : null}
        </span>
      ))}
    </div>
  );
}

function Preview({ copy }: { copy: (typeof COPY)["tr"] | (typeof COPY)["en"] }) {
  return (
    <div style={{ position: "relative", zIndex: 1, marginTop: 32 }}>
      <div style={{ border: "1px solid rgba(255,255,255,0.13)", background: "#141518", overflow: "hidden" }}>
        <div style={{ background: "#1a1c21", borderBottom: "1px solid rgba(255,255,255,0.13)", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8650a" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#44464e" }} />
          <span style={{ fontFamily: MONO, fontSize: 9, color: "#44464e", letterSpacing: "0.12em", flex: 1 }}>{copy.previewTitle}</span>
          <span style={{ fontFamily: MONO, fontSize: 9, padding: "2px 6px", background: "rgba(232,101,10,0.14)", border: "1px solid rgba(232,101,10,0.3)", color: "#e8650a", letterSpacing: "0.08em" }}>T2 — CRITICAL</span>
        </div>
        <div style={{ position: "relative", height: 308, background: "#08090b", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(232,101,10,0.09) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 20% 80%, rgba(232,101,10,0.04) 0%, transparent 60%)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "42px 42px", opacity: 0.6 }} />
          <span style={{ position: "absolute", top: 12, left: 12, fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{copy.previewLabel}</span>
          {Array.from({ length: 64 }).map((_, index) => (
            <span key={index} style={{ position: "absolute", left: `${8 + ((index * 13) % 82)}%`, top: `${12 + ((index * 19) % 64)}%`, width: index % 6 === 0 ? 4 : 2, height: index % 6 === 0 ? 4 : 2, borderRadius: index % 6 === 0 ? 0 : "50%", background: index % 5 === 0 ? "rgba(232,101,10,0.9)" : "rgba(230,227,220,0.5)", boxShadow: index % 5 === 0 ? "0 0 10px rgba(232,101,10,0.32)" : "none" }} />
          ))}
          <div style={{ position: "absolute", left: "15%", top: "60%", width: "54%", height: 1, background: "linear-gradient(90deg, transparent, rgba(232,101,10,0.9), transparent)", transform: "rotate(-11deg)" }} />
          <div style={{ position: "absolute", left: "39%", top: "35%", width: "28%", height: 1, borderTop: "1px dashed rgba(78,201,176,0.6)", transform: "rotate(19deg)" }} />
        </div>
        <div style={{ background: "rgba(255,255,255,0.07)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
          {[
            { key: "ZONE", value: "SAFE-Z", orange: true },
            { key: "CONF", value: "0.82", orange: true },
            { key: "PHASE", value: "T2", orange: false },
            { key: "PKT", value: "RSF-001", orange: false },
          ].map(({ key, value, orange }) => (
            <div key={key} style={{ background: "#1a1c21", padding: "7px 9px" }}>
              <div style={{ fontFamily: MONO, fontSize: 8, color: "#44464e", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>{key}</div>
              <div style={{ fontFamily: MONO, fontSize: key === "PKT" ? 9 : 11, fontWeight: 600, color: orange ? "#e8650a" : "#e6e3dc" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {copy.previewBadges.map((item, index) => (
          <span key={item} style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.12em", padding: "3px 9px", border: `1px solid ${index === 1 ? "rgba(232,101,10,0.4)" : "rgba(255,255,255,0.13)"}`, color: index === 1 ? "#e8650a" : "#8a8880", textTransform: "uppercase", background: index === 1 ? "rgba(232,101,10,0.14)" : "transparent" }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { lang } = useLanguage();
  const copy = COPY[lang];

  return (
    <main style={{ minHeight: "100vh", background: "#0c0d0f", color: "#e6e3dc", fontFamily: SANS }}>
      <section style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr", padding: "100px 32px 60px", position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(232,101,10,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 20% 80%, rgba(232,101,10,0.03) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "60px 60px", opacity: 0.7 }} />
        <div style={{ maxWidth: 1280, width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 52, alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ marginBottom: 28 }}>
              <LogoPrimary href="/" height={44} variant="onDarkSurface" />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", color: "#44464e", textTransform: "uppercase", marginBottom: 20 }}>{copy.heroTagline}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {copy.doctrineChips.map((chip) => (
                <span key={chip} style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", padding: "4px 10px", border: "1px solid rgba(255,255,255,0.13)", color: "#8a8880", textTransform: "uppercase" }}>{chip}</span>
              ))}
            </div>
            <h1 style={{ fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 500, lineHeight: 1.2, color: "#e6e3dc", margin: "0 0 20px", letterSpacing: "-0.01em" }}>
              {copy.heroHeadline.slice(0, 3).map((line) => (
                <span key={line} style={{ display: "block" }}>{line}</span>
              ))}
              <span style={{ display: "block", color: "#e8650a" }}>{copy.heroHeadline[3]}</span>
            </h1>
            <p style={{ fontSize: 15, color: "#8a8880", lineHeight: 1.7, maxWidth: 560, margin: "0 0 28px" }}>{copy.heroBody}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 32, maxWidth: 540 }}>
              {copy.heroProps.map(([title, body]) => (
                <div key={title} style={{ background: "#141518", padding: "11px 13px", fontSize: 12, color: "#8a8880", lineHeight: 1.5 }}>
                  <strong style={{ display: "block", fontFamily: MONO, fontSize: 9, color: "#44464e", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 400 }}>{title}</strong>
                  {body}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <Link href="/verifier" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 24px", background: "#e8650a", color: "#0c0d0f", textDecoration: "none", fontWeight: 600 }}>{copy.openVerifier}</Link>
              <a href="#how" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 24px", background: "transparent", color: "#8a8880", border: "1px solid rgba(255,255,255,0.13)", textDecoration: "none" }}>{copy.howLink}</a>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#44464e", marginTop: 16, lineHeight: 1.8 }}>{copy.doctrineNote}</div>
          </div>
          <Preview copy={copy} />
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      <section id="how" style={{ background: "#141518", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "100px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#e8650a", marginBottom: 16 }}>{copy.howLabel}</div>
          <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 500, lineHeight: 1.2, margin: "0 0 16px", letterSpacing: "-0.01em" }}>{copy.howTitle}</h2>
          <p style={{ fontSize: 15, color: "#8a8880", lineHeight: 1.7, maxWidth: 600 }}>{copy.howBody}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)", marginTop: 48 }}>
            {copy.howCards.map(([num, title, body, tags]) => (
              <div key={num} style={{ background: "#1a1c21", padding: "28px 24px" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: "#e8650a", letterSpacing: "0.15em", marginBottom: 12 }}>{num}</div>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 10, lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#8a8880", lineHeight: 1.7 }}>{body}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                  {tags.map((tag) => (
                    <span key={tag} style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.1em", padding: "3px 8px", border: "1px solid rgba(255,255,255,0.13)", color: "#44464e", textTransform: "uppercase" }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      <section id="domain" style={{ padding: "100px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#e8650a", marginBottom: 16 }}>{copy.domainLabel}</div>
          <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 500, lineHeight: 1.2, margin: "0 0 16px", letterSpacing: "-0.01em" }}>{copy.domainTitle}</h2>
          <p style={{ fontSize: 15, color: "#8a8880", lineHeight: 1.7, maxWidth: 600 }}>{copy.domainBody}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 48 }}>
            {copy.domains.map(([icon, title, body, chain]) => (
              <div key={title} style={{ border: "1px solid rgba(255,255,255,0.13)", background: "#141518", padding: 24 }}>
                <div style={{ width: 40, height: 40, border: "1px solid rgba(255,255,255,0.13)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontFamily: MONO, fontSize: 13, color: "#e8650a", fontWeight: 600 }}>{icon}</div>
                <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#8a8880", lineHeight: 1.6, marginBottom: 14 }}>{body}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "#44464e" }}><ChainRow items={chain} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="doctrine" style={{ background: "#141518", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "100px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#e8650a", marginBottom: 16 }}>{copy.doctrineLabel}</div>
          <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 500, lineHeight: 1.2, margin: "0 0 16px", letterSpacing: "-0.01em" }}>{copy.doctrineTitle}</h2>
          <p style={{ fontSize: 15, color: "#8a8880", lineHeight: 1.7, maxWidth: 600 }}>{copy.doctrineBody}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)", marginTop: 48 }}>
            {copy.doctrineCards.map(([label, statement, note]) => (
              <div key={label} style={{ background: "#1a1c21", padding: 24 }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "#44464e", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
                <div style={{ fontSize: 15, color: "#e6e3dc", lineHeight: 1.5, marginBottom: 8 }}>{statement}</div>
                <div style={{ fontSize: 12, color: "#8a8880", lineHeight: 1.6 }}>{note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      <section id="roles" style={{ padding: "100px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#e8650a", marginBottom: 16 }}>{copy.rolesLabel}</div>
          <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 500, lineHeight: 1.2, margin: "0 0 16px", letterSpacing: "-0.01em" }}>{copy.rolesTitle}</h2>
          <p style={{ fontSize: 15, color: "#8a8880", lineHeight: 1.7, maxWidth: 600 }}>{copy.rolesBody}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginTop: 48 }}>
            {copy.roles.map(([tag, name, desc, future]) => (
              <div key={name} style={{ border: "1px solid rgba(255,255,255,0.07)", background: "#141518", padding: "20px 16px", opacity: future ? 0.4 : 1, borderStyle: future ? "dashed" : "solid" }}>
                <div style={{ fontFamily: MONO, fontSize: 8, color: "#e8650a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>{tag}</div>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{name}</div>
                <div style={{ fontSize: 11, color: "#8a8880", lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      <section style={{ background: "#141518", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "100px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#e8650a", marginBottom: 16 }}>{copy.statsLabel}</div>
          <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 500, lineHeight: 1.2, margin: "0 0 16px", letterSpacing: "-0.01em" }}>{copy.statsTitle}</h2>
          <p style={{ fontSize: 15, color: "#8a8880", lineHeight: 1.7, maxWidth: 600 }}>{copy.statsBody}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)", marginTop: 48 }}>
            {copy.stats.map(([value, label]) => (
              <div key={value} style={{ background: "#1a1c21", padding: "28px 24px" }}>
                <div style={{ fontFamily: MONO, fontSize: 32, fontWeight: 600, color: "#e8650a", marginBottom: 6 }}>{value}</div>
                <div style={{ fontSize: 13, color: "#8a8880" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      <section id="cta" style={{ padding: "112px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(232,101,10,0.07) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,42px)", fontWeight: 500, lineHeight: 1.2, marginBottom: 20, letterSpacing: "-0.01em" }}>{copy.ctaTitle}</h2>
          <p style={{ fontSize: 15, color: "#8a8880", lineHeight: 1.7, marginBottom: 36 }}>{copy.ctaBody}</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            <Link href="/verifier" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 24px", background: "#e8650a", color: "#0c0d0f", textDecoration: "none", fontWeight: 600 }}>{copy.openVerifier}</Link>
            <Link href="/docs" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 24px", background: "transparent", color: "#8a8880", border: "1px solid rgba(255,255,255,0.13)", textDecoration: "none" }}>Docs</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

