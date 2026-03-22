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
  const protocolTags =
    lang === "tr"
      ? ["KAYITLI ≠ TÜRETİLMİŞ", "İZ ≠ NİHAİ GERÇEK", "DÜZENLEME ≠ SUÇLAMA"]
      : ["RECORDED ≠ DERIVED", "TRACE ≠ TRUTH", "ISSUANCE ≠ BLAME"];

  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: SANS,
      }}
    >
      {/* Full-bleed dark hero — inspection-station landing grammar */}
      <section
        className="home-dark-hero"
        style={{
          position: "relative",
          minHeight: "min(92vh, 880px)",
          background: "#090908",
          color: "#eceae6",
          borderBottom: "1px solid #1a1a18",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "2.25rem 2rem 2.75rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            className="home-hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.85fr) minmax(0, 1.35fr)",
              gap: "2rem",
              alignItems: "stretch",
            }}
          >
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <LogoPrimary href="/" height={56} variant="onDarkSurface" />
              </div>
              <p
                style={{
                  margin: "0 0 0.65rem 0",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  fontFamily: MONO,
                  lineHeight: 1.4,
                }}
              >
                {m.homeHeroEyebrow}
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.4rem",
                  marginBottom: "0.75rem",
                }}
              >
                {protocolTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "0.22rem 0.55rem",
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "rgba(255,255,255,0.04)",
                      fontSize: "0.62rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      fontFamily: MONO,
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.28rem 0.65rem",
                  borderRadius: 2,
                  marginBottom: "0.75rem",
                  background: "rgba(212,86,26,0.12)",
                  border: "1px solid rgba(212,86,26,0.35)",
                  color: "var(--accent)",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: MONO,
                }}
              >
                {m.homeHeroChip}
              </div>
              <p
                style={{
                  margin: "0 0 0.55rem 0",
                  fontSize: "1.12rem",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.72)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.38,
                  fontFamily: SANS,
                }}
              >
                {m.motto}
              </p>
              <h1
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.35rem)",
                  margin: 0,
                  lineHeight: 1.15,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: "#f7f5f0",
                }}
              >
                {m.homeHeroHeading}
              </h1>
              <p
                style={{
                  fontSize: "1rem",
                  color: "rgba(255,255,255,0.58)",
                  maxWidth: 640,
                  lineHeight: 1.62,
                  marginTop: "1rem",
                }}
              >
                {m.homeHeroBody}
              </p>
              <div
                style={{
                  marginTop: "1.1rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "0.55rem",
                  maxWidth: 720,
                }}
              >
                {[m.homeHeroPillar1, m.homeHeroPillar2, m.homeHeroPillar3, m.homeHeroPillar4].map((line) => (
                  <div
                    key={line}
                    style={{
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.03)",
                      padding: "0.52rem 0.68rem",
                      fontSize: "0.8125rem",
                      color: "rgba(255,255,255,0.62)",
                      lineHeight: 1.45,
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
              <p
                style={{
                  marginTop: "1rem",
                  marginBottom: 0,
                  fontSize: "0.8rem",
                  lineHeight: 1.58,
                  color: "rgba(255,255,255,0.42)",
                  maxWidth: 720,
                  fontFamily: MONO,
                }}
              >
                {m.homeHeroArchitectureNote}
              </p>
              <div
                style={{
                  marginTop: "1.35rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.65rem",
                  alignItems: "center",
                }}
              >
                <Link
                  href="/verifier"
                  style={{
                    padding: "0.65rem 1.5rem",
                    borderRadius: 2,
                    border: "1px solid var(--accent-border)",
                    background: "var(--accent)",
                    textDecoration: "none",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontFamily: MONO,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontSize: "0.72rem",
                  }}
                >
                  {m.homeHeroCta}
                </Link>
                <Link
                  href="/docs"
                  style={{
                    padding: "0.62rem 1.25rem",
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: "transparent",
                    textDecoration: "none",
                    color: "rgba(255,255,255,0.78)",
                    fontFamily: MONO,
                    fontSize: "0.7rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {m.homeHeroCtaSecondary}
                </Link>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.12)",
                  aspectRatio: "16/10",
                  background: "#121211",
                }}
              >
                <Image
                  src={MEDIA.hero}
                  alt="Vehicle incident review - QARAQUTU verifier-first witness protocol in fleet and claims context"
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  style={{ objectFit: "cover", opacity: 0.92 }}
                  priority
                />
              </div>
              <div style={{ borderRadius: 2, border: "1px solid rgba(255,255,255,0.08)", padding: "0.65rem 0.75rem", background: "rgba(255,255,255,0.02)" }}>
                <VerticalsDiagram lang={lang} />
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: 1.55, color: "rgba(255,255,255,0.5)" }}>{m.homeVerticalsCaption}</p>
              <div
                style={{
                  borderRadius: 2,
                  border: "1px dashed rgba(255,255,255,0.18)",
                  padding: "0.6rem 0.75rem",
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.55,
                  fontFamily: MONO,
                }}
              >
                {lang === "tr"
                  ? "Protokol konumu: Doğrulayıcı bir inceleme istasyonudur; zincir disiplinini korur, sorumluluk motoru veya mahkeme ikamesi değildir."
                  : "Protocol position: the Verifier is an inspection station—it preserves chain discipline; it is not a liability engine or a substitute for court judgement."}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="home-below-fold home-hero-with-grid"
        style={{ maxWidth: 1180, margin: "0 auto", padding: "2rem 2rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}
      >
        <HomeCommandSpineFlow lang={lang} />

        {/* Problem — institutional cards */}
        <section
          style={{
            borderRadius: 4,
            border: "1px solid var(--border-strong)",
            background: "var(--panel)",
            padding: "1.45rem 1.5rem",
            boxShadow: "none",
          }}
        >
          <SectionHeader badge={lang === "tr" ? "Ba\u011flam" : "Context"} heading={m.sectionProblem} />
          <p style={{ margin: "0 0 1.15rem", fontSize: "0.92rem", lineHeight: 1.58, color: "var(--text-soft)", maxWidth: 820 }}>
            {m.homeProblemIntro}
          </p>
          <div
            className="home-problem-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "1rem",
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
                  borderRadius: 2,
                  border: "1px solid var(--border)",
                  background: "var(--panel-card)",
                  padding: "1rem 1.05rem",
                  borderLeft: "3px solid var(--accent)",
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: "0.74rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.45rem", letterSpacing: "0.04em" }}>
                  {card.title}
                </div>
                <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.58, color: "var(--text-soft)" }}>{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How the protocol runs — dark band */}
        <section
          style={{
            borderRadius: 2,
            border: "1px solid #1f1f1d",
            background: "#0b0b0a",
            color: "#e8e6e1",
            padding: "1.75rem 1.65rem",
            boxShadow: "none",
          }}
        >
          <SectionHeader tone="dark" badge={lang === "tr" ? "Akış" : "Flow"} heading={m.homeHowItWorksTitle} />
          <p style={{ margin: "0 0 1.25rem", fontSize: "0.9rem", lineHeight: 1.58, color: "rgba(255,255,255,0.52)", maxWidth: 860 }}>
            {m.homeHowItWorksLead}
          </p>
          <div
            className="home-how-steps-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: "0.75rem",
            }}
          >
            {[m.homeHowStep1, m.homeHowStep2, m.homeHowStep3, m.homeHowStep4, m.homeHowStep5].map((step, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "#121211",
                  padding: "0.85rem 0.8rem",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.85rem",
                    color: "var(--accent)",
                    fontWeight: 700,
                    marginBottom: "0.45rem",
                    letterSpacing: "0.06em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p style={{ margin: 0, fontSize: "0.8125rem", lineHeight: 1.52, color: "rgba(255,255,255,0.62)" }}>{step}</p>
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
            borderRadius: 4,
            border: "1px solid var(--border-strong)",
            background: "var(--panel-raised)",
            padding: "1.35rem 1.45rem",
            boxShadow: "none",
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
              gap: "1.1rem",
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
                  borderRadius: 2,
                  border: "1px solid var(--border-strong)",
                  background: "var(--panel)",
                  overflow: "hidden",
                  boxShadow: "none",
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
                <div style={{ padding: "0.85rem 0.95rem", borderTop: "1px solid var(--border)", flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.3rem", fontFamily: MONO }}>{v.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontFamily: MONO, marginBottom: "0.55rem", letterSpacing: "0.04em" }}>{v.trace}</div>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", lineHeight: 1.55, color: "var(--text-soft)" }}>{v.why}</p>
                  <p style={{ margin: "0 0 0.55rem", fontSize: "0.75rem", lineHeight: 1.52, color: "var(--text-muted)", fontFamily: MONO }}>{v.sep}</p>
                  <Link
                    href="/verifier"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      color: "var(--accent)",
                      textDecoration: "none",
                      fontFamily: MONO,
                      letterSpacing: "0.05em",
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

        {/* Institutional notice — doctrine closure (reinforced; site footer continues below) */}
        <section
          style={{
            marginTop: "0.5rem",
            borderRadius: 2,
            padding: "1.35rem 1.25rem",
            background: "var(--panel-card)",
            border: "1px solid var(--border-strong)",
          }}
        >
          <p
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "var(--text)",
              margin: "0 0 0.5rem",
              letterSpacing: "0.08em",
              fontFamily: MONO,
              textTransform: "uppercase",
            }}
          >
            {m.footerWitnessLine1}
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-soft)", maxWidth: 860, lineHeight: 1.65, margin: "0 0 0.6rem" }}>
            {m.footerWitnessLine2}
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", maxWidth: 860, lineHeight: 1.62, margin: 0 }}>
            {m.doctrineDisclaimer}
          </p>
        </section>
      </div>
    </main>
  );
}

