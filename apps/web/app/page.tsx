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
import { HomeRoleInstitutionGrid } from "./components/home/HomeRoleInstitutionGrid";
import { HomeCommandSpineFlow } from "./components/home/HomeCommandSpineFlow";
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
                margin: "0 0 0.55rem 0",
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: MONO,
                lineHeight: 1.4,
              }}
            >
              {m.homeHeroEyebrow}
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
            <p
              style={{
                margin: "0 0 0.65rem 0",
                fontSize: "1.05rem",
                fontWeight: 500,
                color: "var(--text-soft)",
                letterSpacing: "-0.015em",
                lineHeight: 1.35,
                fontFamily: SANS,
              }}
            >
              {m.motto}
            </p>
            <h1
              style={{
                fontSize: "clamp(1.35rem, 3.5vw, 2.05rem)",
                margin: 0,
                lineHeight: 1.2,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {m.homeHeroHeading}
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
            <p
              style={{
                marginTop: "0.85rem",
                marginBottom: 0,
                fontSize: "0.74rem",
                lineHeight: 1.55,
                color: "var(--text-muted)",
                maxWidth: 720,
              }}
            >
              {m.homeHeroArchitectureNote}
            </p>
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
                boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
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
            <VerticalsDiagram lang={lang} />
            <p style={{ margin: 0, fontSize: "0.76rem", lineHeight: 1.5, color: "var(--text-soft)" }}>{m.homeVerticalsCaption}</p>
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
                ? "Protokol konumu: Doğrulayıcı bir inceleme istasyonudur; zincir disiplinini korur, sorumluluk motoru veya mahkeme ikamesi değildir."
                : "Protocol position: the Verifier is an inspection station—it preserves chain discipline; it is not a liability engine or a substitute for court judgement."}
            </div>
          </div>
        </section>

        <HomeCommandSpineFlow lang={lang} />

        {/* Problem — institutional cards */}
        <section
          style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            padding: "1.2rem 1.35rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <SectionHeader badge={lang === "tr" ? "Ba\u011flam" : "Context"} heading={m.sectionProblem} />
          <p style={{ margin: "0 0 1rem", fontSize: "0.88rem", lineHeight: 1.55, color: "var(--text-soft)", maxWidth: 820 }}>
            {m.homeProblemIntro}
          </p>
          <div
            className="home-problem-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "0.75rem",
            }}
          >
            {[
              { title: m.homeProblemCard1Title, body: m.homeProblemCard1Body },
              { title: m.homeProblemCard2Title, body: m.homeProblemCard2Body },
              { title: m.homeProblemCard3Title, body: m.homeProblemCard3Body },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  borderRadius: 10,
                  border: "1px solid var(--border-soft)",
                  background: "var(--panel-card)",
                  padding: "0.85rem 0.95rem",
                  borderTop: "2px solid var(--accent)",
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: "0.7rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.4rem", letterSpacing: "0.02em" }}>
                  {card.title}
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: 1.55, color: "var(--text-soft)" }}>{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How the protocol runs */}
        <section
          style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panel-raised)",
            padding: "1.2rem 1.35rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <SectionHeader badge={lang === "tr" ? "Akış" : "Flow"} heading={m.homeHowItWorksTitle} />
          <p style={{ margin: "0 0 1rem", fontSize: "0.86rem", lineHeight: 1.55, color: "var(--text-soft)", maxWidth: 860 }}>
            {m.homeHowItWorksLead}
          </p>
          <div
            className="home-how-steps-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: "0.65rem",
            }}
          >
            {[m.homeHowStep1, m.homeHowStep2, m.homeHowStep3, m.homeHowStep4, m.homeHowStep5].map((step, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--panel)",
                  padding: "0.65rem 0.75rem",
                  minWidth: 0,
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: "0.62rem", color: "var(--accent)", fontWeight: 700, marginBottom: "0.35rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p style={{ margin: 0, fontSize: "0.76rem", lineHeight: 1.5, color: "var(--text-soft)" }}>{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Product system summary */}
        <section
          style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            padding: "1.1rem 1.25rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <SectionHeader badge={lang === "tr" ? "Mimari" : "Architecture"} heading={m.sectionProductSystem} />
          <div style={{ marginBottom: "0.75rem" }}>
            <CanonicalSpineDiagram lang={lang} />
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

        {/* Doctrine-safe demo verticals — class illustrations only */}
        <section
          style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panel-raised)",
            padding: "1.25rem 1.4rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <SectionHeader
            badge={lang === "tr" ? "Demo" : "Demo"}
            heading={m.homeDemoDoctrineTitle}
            accentWord={lang === "tr" ? "kaçınılmaz" : "inevitable"}
            subtitle={m.homeDemoDoctrineSubtitle}
          />
          <div
            className="home-verticals-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "1rem",
              marginTop: "0.5rem",
            }}
          >
            {[
              {
                key: "vehicle",
                img: MEDIA.vehicle,
                label: lang === "tr" ? "Araç" : "Vehicle",
                trace: "Event \u2192 Bundle \u2192 Manifest",
                alt: "Vehicle incident dashboard - canonical event review and verification trace",
                why: m.homeDemoVehicleWhy,
                sep: m.homeDemoVehicleSeparation,
              },
              {
                key: "drone",
                img: MEDIA.drone,
                label: "Drone",
                trace: "Mission \u2192 Telemetry \u2192 Link",
                alt: "Drone operations - mission and telemetry linkage for QARAQUTU witness protocol",
                why: m.homeDemoDroneWhy,
                sep: m.homeDemoDroneSeparation,
              },
              {
                key: "robot",
                img: MEDIA.robot,
                label: "Robot",
                trace: "Interaction \u2192 Safety \u2192 Handoff",
                alt: "Robot and industrial safety - interaction and handoff trace for protocol-grade review",
                why: m.homeDemoRobotWhy,
                sep: m.homeDemoRobotSeparation,
              },
            ].map((v) => (
              <div
                key={v.key}
                style={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--panel)",
                  overflow: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
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
                <div style={{ padding: "0.65rem 0.85rem", borderTop: "1px solid var(--border-soft)", flex: 1 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.25rem", fontFamily: MONO }}>{v.label}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontFamily: MONO, marginBottom: "0.5rem" }}>{v.trace}</div>
                  <p style={{ margin: "0 0 0.45rem", fontSize: "0.78rem", lineHeight: 1.5, color: "var(--text-soft)" }}>{v.why}</p>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.72rem", lineHeight: 1.5, color: "var(--text-muted)", fontFamily: MONO }}>{v.sep}</p>
                  <Link
                    href="/verifier"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "var(--accent)",
                      textDecoration: "none",
                      fontFamily: MONO,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {m.homeDemoCardCta}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Role / institution grid */}
        <section
          style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            padding: "1.25rem 1.4rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <SectionHeader
            badge={lang === "tr" ? "Kurumsal" : "Institutional"}
            heading={m.homeRoleGridTitle}
            accentWord={lang === "tr" ? "kullanır" : "uses"}
          />
          <HomeRoleInstitutionGrid lang={lang} />
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

        {/* Institutional notice — doctrine closure */}
        <section
          style={{
            marginTop: "0.5rem",
            borderTop: "1px solid var(--border)",
            paddingTop: "1rem",
            paddingBottom: "0.25rem",
          }}
        >
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-soft)", margin: "0 0 0.45rem", letterSpacing: "0.02em" }}>
            {m.footerWitnessLine1}
          </p>
          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", maxWidth: 860, lineHeight: 1.65, margin: "0 0 0.55rem" }}>
            {m.footerWitnessLine2}
          </p>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", maxWidth: 860, lineHeight: 1.6, margin: 0, opacity: 0.92 }}>
            {m.doctrineDisclaimer}
          </p>
        </section>
      </div>
    </main>
  );
}

