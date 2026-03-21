"use client";

import Link from "next/link";
import Image from "next/image";
import { LogoPrimary } from "./components/LogoPrimary";
import { useLanguage } from "../lib/LanguageContext";
import { MSG } from "../lib/i18n/messages";
import { SectionHeader } from "./components/ui/SectionHeader";
import { VerticalsDiagram } from "./components/diagrams/VerticalsDiagram";
import { CanonicalSpineDiagram } from "./components/diagrams/CanonicalSpineDiagram";
import { EvidenceLayerDiagram } from "./components/diagrams/EvidenceLayerDiagram";
import { RoleExportDiagram } from "./components/diagrams/RoleExportDiagram";
import { InstitutionalUseFamilies } from "./components/institutional/InstitutionalUseFamilies";
import { SectorScenarioCards } from "./components/sector/SectorScenarioCards";
const MEDIA = {
  hero: "/media/home/home-hero-vehicle.jpg",
  vehicle: "/media/home/vehicle-section-dashboard.jpg",
  drone: "/media/home/drone-section.jpg",
  robot: "/media/home/robot-section-factory.jpg",
  documentProtocol: "/media/home/document-protocol-section.jpg",
} as const;

const MONO = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function LandingPage() {
  const { lang } = useLanguage();
  const m = MSG[lang];
  return (
    <main
      className="home-hero-with-grid"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        backgroundPosition: "0 0",
        color: "var(--text)",
        padding: "1.75rem 2rem 2.25rem",
        fontFamily: SANS,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        {/* Hero */}
        <section
          className="home-hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2.15fr) minmax(0, 1.45fr)",
            gap: "1.75rem",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ marginBottom: "0.55rem" }}>
              <LogoPrimary href="/" height={44} />
            </div>
            <p
              style={{
                margin: "0 0 0.85rem 0",
                fontSize: "1rem",
                fontStyle: "normal",
                fontWeight: 500,
                color: "var(--text-soft)",
                letterSpacing: "-0.01em",
                lineHeight: 1.35,
                fontFamily: SANS,
              }}
            >
              {m.motto}
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.25rem 0.6rem",
                borderRadius: 999,
                marginBottom: "0.65rem",
                background: "var(--chip-bg)",
                border: "1px solid var(--chip-border)",
                color: "var(--chip-text)",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: MONO,
              }}
            >
              {m.homeHeroChip}
            </div>
            <h1 style={{ fontSize: "2.2rem", margin: 0, lineHeight: 1.25, fontWeight: 600 }}>
              {(() => {
                const accent = lang === "tr" ? "Do\u011frulay\u0131c\u0131-\u00f6ncelikli" : "Verifier-first";
                const parts = m.homeHeroHeading.split(accent);
                if (parts.length < 2) return m.homeHeroHeading;
                return <>{parts[0]}<span style={{ color: "var(--accent)" }}>{accent}</span>{parts[1]}</>;
              })()}
            </h1>
            <p
              style={{
                fontSize: "0.96rem",
                color: "var(--text-soft)",
                maxWidth: 680,
                lineHeight: 1.6,
                marginTop: "0.85rem",
              }}
            >
              {m.homeHeroBody}
            </p>
            <div
              style={{
                marginTop: "0.95rem",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "0.5rem",
                maxWidth: 700,
              }}
            >
              {[
                m.homeHeroPillar1,
                m.homeHeroPillar2,
                m.homeHeroPillar3,
                m.homeHeroPillar4,
              ].map((line) => (
                <div
                  key={line}
                  style={{
                    borderRadius: 8,
                    border: "1px solid var(--border-soft)",
                    background: "var(--panel)",
                    padding: "0.48rem 0.62rem",
                    fontSize: "0.79rem",
                    color: "var(--text-soft)",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "1.05rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                fontSize: "0.8rem",
              }}
            >
              <Link
                href="/verifier"
                style={{
                  padding: "0.6rem 1.35rem",
                  borderRadius: 12,
                  border: "none",
                background: "var(--cta-gradient)",
                boxShadow: "var(--cta-shadow)",
                  textDecoration: "none",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontFamily: MONO,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {m.homeHeroCta}
              </Link>
              <Link
                href="/docs"
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--panel)",
                  textDecoration: "none",
                  color: "var(--text-soft)",
                }}
              >
                {m.homeHeroCtaSecondary}
              </Link>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                aspectRatio: "16/10",
                background: "var(--border-muted)",
              }}
            >
              <Image
                src={MEDIA.hero}
                alt="Vehicle incident review - QARAQUTU verifier-first witness protocol in fleet and claims context"
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <VerticalsDiagram />
            <div
              style={{
                borderRadius: 10,
                border: "1px dashed var(--border)",
                padding: "0.55rem 0.7rem",
                fontSize: "0.77rem",
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}
            >
              {lang === "tr"
                ? "Protokol konumu: QARAQUTU, inceleme zinciri bütünlüğünü korur; sorumluluk motoru veya yargısal ikame değildir."
                : "Protocol position: QARAQUTU preserves chain-of-review integrity; it does not act as a liability engine or judicial substitute."}
            </div>
          </div>
        </section>

        {/* Problem + system */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "1rem",
          }}
        >
          {/* Problem statement */}
          <section
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "1.1rem 1.25rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <SectionHeader badge={lang === "tr" ? "Ba\u011flam" : "Context"} heading={m.sectionProblem} />
            <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: "var(--text-soft)", margin: 0 }}>
              <li>{lang === "tr" ? "Olay inceleme verisi log, kayıt ve dışa aktarımlara dağılır." : "Incident review data is fragmented across logs, captures, and exported files."}</li>
              <li>{lang === "tr" ? "Kayıtlı olgular ile türetilmiş yorumlar sıkça tek anlatı katmanına sıkıştırılır." : "Recorded facts and derived interpretations are often collapsed into one narrative layer."}</li>
              <li>{lang === "tr" ? "Hasar, hukuk ve teknik ekipler çoğu zaman aynı kanonik nesneye bağlanmaz." : "Claims, legal, and technical teams rarely anchor decisions on the same canonical object."}</li>
            </ul>
          </section>

          {/* Product system summary */}
          <section
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--panel-raised)",
              padding: "1.1rem 1.25rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <SectionHeader badge={lang === "tr" ? "Mimari" : "Architecture"} heading={m.sectionProductSystem} />
            <div style={{ marginBottom: "0.75rem" }}>
              <CanonicalSpineDiagram />
            </div>
            <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: "var(--text-soft)", margin: 0 }}>
              <li>
                <strong>{lang === "tr" ? "Tek ürün:" : "Single product:"}</strong> {lang === "tr" ? "Araç, İHA ve Robot genelinde tek kanonik olay modeli." : "one canonical event model across Vehicle, Drone, and Robot."}
              </li>
              <li>
                <strong>{lang === "tr" ? "Doğrulayıcı:" : "Verifier:"}</strong> {lang === "tr" ? "sorumluluk hükmü üretmeyen, sınırlı protokol durumlarına sahip ana inceleme istasyonu." : "primary review station with bounded protocol states, not liability judgement."}
              </li>
              <li>
                <strong>Golden:</strong> {lang === "tr" ? "doğrulayıcı sürekliliği için dahili kalite referansı; bağımsız ürün değil." : "internal quality reference for verifier continuity, not an independent product."}
              </li>
              <li>
                <strong>{lang === "tr" ? "Belge ailesi:" : "Issuance family:"}</strong> {lang === "tr" ? "makbuz ve manifest bağlantısına bağlı, role duyarlı hasar/hukuk artefaktları." : "role-aware claims/legal artifacts tied to receipts and manifest linkage."}
              </li>
            </ul>
          </section>
        </section>

        {/* Three verticals - supporting visuals */}
        <section
          className="home-verticals-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "1rem",
          }}
        >
          {[
            { key: "vehicle", img: MEDIA.vehicle, label: "Vehicle", trace: "Event \u2192 Bundle \u2192 Manifest", alt: "Vehicle incident dashboard - canonical event review and verification trace" },
            { key: "drone", img: MEDIA.drone, label: "Drone", trace: "Mission \u2192 Telemetry \u2192 Link", alt: "Drone operations - mission and telemetry linkage for QARAQUTU witness protocol" },
            { key: "robot", img: MEDIA.robot, label: "Robot", trace: "Interaction \u2192 Safety \u2192 Handoff", alt: "Robot and industrial safety - interaction and handoff trace for protocol-grade review" },
          ].map((v) => (
            <div
              key={v.key}
              style={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--panel)",
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4/3",
                  background: "var(--border-muted)",
                }}
              >
                <Image
                  src={v.img}
                  alt={v.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 340px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "0.65rem 0.85rem", borderTop: "1px solid var(--border-soft)" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.2rem", fontFamily: MONO }}>{v.label}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: MONO }}>{v.trace}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Role-aware review + export family */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "1rem",
          }}
        >
          <section
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "1.1rem 1.25rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <SectionHeader badge={lang === "tr" ? "Roller" : "Roles"} heading={m.sectionRoleFlow} />
            <div style={{ marginBottom: "0.75rem" }}>
              <RoleExportDiagram />
            </div>
            <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: "var(--text-soft)", margin: 0 }}>
              <li>
                <strong>Claims</strong>{" "}
                {lang === "tr"
                  ? "kanonik referanslara bağlı, uyuşmazlık-odaklı kısa özetler alır."
                  : "receives concise dispute-ready summaries tied to canonical references."}
              </li>
              <li>
                <strong>Legal</strong>{" "}
                {lang === "tr"
                  ? "manifest, makbuz ve provenans çerçevesiyle zincir-merkezli artefaktlar alır."
                  : "receives chain-centric artifacts with manifest, receipt, and provenance framing."}
              </li>
              <li>
                <strong>Technical</strong>{" "}
                {lang === "tr"
                  ? "kanonik olay nesnesi ve kanıt ayrımı omurgasına bağlı kalır."
                  : "remains anchored to the canonical event object and evidence separation."}
              </li>
            </ul>
          </section>
          <section
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              padding: "1.1rem 1.25rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <SectionHeader badge={lang === "tr" ? "Disiplin" : "Discipline"} heading={m.sectionEvidenceLayer} />
            <div
              style={{
                marginBottom: "0.75rem",
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                aspectRatio: "16/9",
                maxHeight: 200,
                position: "relative",
                background: "var(--border-muted)",
              }}
            >
              <Image
                src={MEDIA.documentProtocol}
                alt="Document and protocol artifact family - trace-linked, role-bounded evidence outputs"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <EvidenceLayerDiagram />
            </div>
            <p style={{ fontSize: "0.84rem", opacity: 0.9, color: "var(--text-soft)", marginTop: 0, marginBottom: "0.45rem" }}>
              {lang === "tr"
                ? "Kontrollü artifact çıktıları role bağlı ve ize bağlı kalır:"
                : "Controlled artifact outputs remain role-bounded and trace-linked:"}
            </p>
            <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: "var(--text-soft)", margin: 0 }}>
              <li>
                <strong>{lang === "tr" ? "Claims pack:" : "Claims pack:"}</strong>{" "}
                {lang === "tr"
                  ? "hasar inceleme duruşu için JSON/PDF artifact ailesi."
                  : "JSON/PDF artifact family for claims review posture."}
              </li>
              <li>
                <strong>{lang === "tr" ? "Legal pack:" : "Legal pack:"}</strong>{" "}
                {lang === "tr"
                  ? "açık zincir ve provenans çerçevesi taşıyan JSON/PDF artifact ailesi."
                  : "JSON/PDF artifact family with explicit chain and provenance framing."}
              </li>
            </ul>
          </section>
        </section>

        {/* Institutional use families */}
        <section
          style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panel-raised)",
            padding: "1.35rem 1.5rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <SectionHeader
            badge={lang === "tr" ? "Kurumsal" : "Institutional"}
            heading={lang === "tr" ? "Kurumsal kullanım aileleri" : "Institutional use families"}
            accentWord={lang === "tr" ? "aileleri" : "families"}
            subtitle={lang === "tr" ? "Tek kanonik olay çekirdeği, çok sayıda kurumsal kabuk. Aynı olay omurgası korunur; yalnız öncelik, görünürlük ve belge önerisi role göre değişir." : "One canonical event core, many institutional shells. The same event spine is preserved; only priority, visibility, and document recommendation vary by role."}
          />
          <InstitutionalUseFamilies lang={lang} />
        </section>

        {/* Sector demo scenarios */}
        <section
          style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            padding: "1.35rem 1.5rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <SectionHeader
            badge={lang === "tr" ? "Sektörler" : "Sectors"}
            heading={lang === "tr" ? "Sektör demo senaryoları" : "Sector demo scenarios"}
            accentWord={lang === "tr" ? "senaryolar" : "scenarios"}
            subtitle={lang === "tr" ? "Her sektörün neden QARAQUTU'ya ihtiyaç duyduğu: olay, kurumsal risk, iz-bağlı yanıt ve tercih edilen belge ailesi." : "Why each sector needs QARAQUTU: incident, institutional risk, trace-linked response, and preferred document family."}
          />
          <SectorScenarioCards lang={lang} />
        </section>

        {/* Verification summary */}
        <section
          style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            padding: "1.1rem 1.25rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <SectionHeader
            badge={lang === "tr" ? "Doktrin" : "Doctrine"}
            heading={lang === "tr" ? "Doğrulama" : "Verification"}
            subtitle={lang === "tr" ? "Doğrulama, paket üzerinde sınırlı bir değerlendirmedir. Durumlar (PASS, FAIL, UNKNOWN, UNVERIFIED) inceleme duruşunu temsil eder; yargısal gerçeklik, sorumluluk ataması veya bağımsız hukuk/uzman yargısının yerine geçmez." : "Verification remains a bounded package assessment. States (PASS, FAIL, UNKNOWN, UNVERIFIED) represent review posture, not judicial truth, not liability assignment, and not a substitute for independent legal or expert judgement."}
          />
        </section>

        {/* Surfaces + CTAs */}
        <section
          style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            padding: "1.1rem 1.25rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <SectionHeader badge={lang === "tr" ? "Y\u00fczeyler" : "Surfaces"} heading={m.sectionProductSurfaces} />
          <ul style={{ fontSize: "0.84rem", paddingLeft: "1.1rem", lineHeight: 1.6, color: "var(--text-soft)", marginTop: 0 }}>
            <li>
              <strong>Verifier</strong>{" "}
              {lang === "tr"
                ? "- birincil inceleme istasyonu; kanonik olay denetimi ve sınırlı doğrulama zinciri."
                : "- primary review station; canonical event inspection and bounded verification chain."}
            </li>
            <li>
              <strong>Golden</strong>{" "}
              {lang === "tr"
                ? "- doğrulayıcı sürekliliği için dahili kalite/rubrik yüzeyi; ayrı bir birincil ürün değildir."
                : "- internal quality reference and rubric surface for verifier continuity; not a separate primary product."}
            </li>
            <li>
              <strong>Console</strong>{" "}
              {lang === "tr"
                ? "- kontrollü protokol kabuğu hazırlığı için ayrılmış yüzey; aktif yürütme değildir."
                : "- reserved shell for controlled protocol shell preparation and future bounded operator surface; not active execution."}
            </li>
            <li>
              <strong>Docs</strong>{" "}
              {lang === "tr"
                ? "- uygulama hizalaması için protokol ve API çerçevesi."
                : "- protocol and API framing for implementation alignment."}
            </li>
            <li>
              <strong>Admin / diagnostics</strong>{" "}
              {lang === "tr"
                ? "- ortam ve doğrulama sağlığı için yalnız tanılama çalışma yüzeyi."
                : "- diagnostics-only workbench for environment and verification health."}
            </li>
          </ul>
          <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.6rem", fontSize: "0.8rem" }}>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: "1px solid var(--border)",
                color: "var(--text)",
                background: "var(--accent-soft)",
              }}
            >
              {lang === "tr" ? "Doğrulayıcı (birincil)" : "Verifier (primary)"}
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: "1px solid var(--border)",
                color: "var(--text-soft)",
              }}
            >
              {lang === "tr" ? "Golden (dahili referans)" : "Golden (internal reference)"}
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: "1px solid var(--border)",
                color: "var(--text-soft)",
              }}
            >
              {lang === "tr" ? "Konsol (ayrılmış hazırlık kabuğu)" : "Console (reserved preparation shell)"}
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: "1px solid var(--border)",
                color: "var(--text-soft)",
              }}
            >
              {lang === "tr" ? "Belgeler" : "Docs"}
            </span>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: 999,
                border: "1px solid var(--border)",
                color: "var(--text-soft)",
              }}
            >
              {lang === "tr" ? "Admin (yalnız tanılama)" : "Admin (diagnostics-only)"}
            </span>
          </div>
        </section>

        {/* Institutional notice */}
        <section
          style={{
            marginTop: "0.4rem",
            borderTop: "1px solid var(--border)",
            paddingTop: "0.85rem",
            paddingBottom: "0.1rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", opacity: 0.8, color: "var(--text-muted)", maxWidth: 820, lineHeight: 1.6 }}>
            {lang === "tr"
              ? "QARAQUTU, uyuşmazlık düzeyinde bir kanıt sistemidir. Sorumluluk motoru, yargısal karar sistemi veya bağımsız hukuk/hasar/teknik değerlendirmelerin yerine geçen bir yapı değildir. Doğrulayıcı durumları ve dışa aktarımlar, tek taraflı kusur-sonuç hükmü değil; kanonik kayda bağlı role uygun artefaktlardır."
              : "QARAQUTU is a dispute-grade evidence system. It is not a liability engine, not a judicial decision system, and not a substitute for independent legal, claims, or technical judgment. Verifier states and exports are role-appropriate artifacts linked to a canonical record, not unilateral findings about fault or outcome."}
          </p>
        </section>
      </div>
    </main>
  );
}

