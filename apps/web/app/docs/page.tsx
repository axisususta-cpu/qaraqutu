"use client";

import { LogoPrimary } from "../components/LogoPrimary";
import { SectionHeader } from "../components/ui/SectionHeader";
import { RoleDocumentMapping } from "../components/institutional/RoleDocumentMapping";
import { DocumentFamilyRoleMatrix } from "../components/institutional/DocumentFamilyRoleMatrix";
import { SectorScenarioDetail } from "../components/sector/SectorScenarioDetail";
import { getAllSectorScenarios } from "../../lib/sector-demo-scenarios";
import { useLanguage } from "../../lib/LanguageContext";
import { MSG } from "../../lib/i18n/messages";

export default function DocsPage() {
  const { lang } = useLanguage();
  const m = MSG[lang];
  const isTr = lang === "tr";
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        padding: "1.75rem 2rem",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <LogoPrimary href="/" height={36} />
        </div>
        <div
          style={{
            display: "inline-flex",
            padding: "0.2rem 0.55rem",
            borderRadius: 999,
            marginBottom: "0.5rem",
            background: "var(--chip-bg)",
            border: "1px solid var(--chip-border)",
            color: "var(--chip-text)",
            fontSize: "0.65rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {m.docsChip}
        </div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1.25rem", fontWeight: 600 }}>
          {m.docsTitle}
        </h1>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            {isTr ? "Ürün kapsamı" : "Product scope"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
            {isTr
              ? "QARAQUTU şu anda araç olayı, filo, sigorta, hasar ve hukuk inceleme iş akışlarına odaklanır. Kamusal doktrin doğrulayıcı-öncelikli tanık protokolüdür: kanonik olay paketleri üzerinde sınırlı inceleme, doğrulama izi ve kontrollü artifact issuance ile yürütülür. Bu belge sayfasında backend terimleri (tenant, policy, visibility classes) teknik bağlamda kullanılır; kamusal ürün kimliğini yeniden tanımlamaz."
              : "QARAQUTU currently focuses on vehicle incident, fleet, insurance, claims, and legal review workflows. Public doctrine is verifier-first witness protocol: bounded review over canonical event packages, with verification trace and controlled artifact issuance. This docs page also includes implementation alignment notes where backend terms (tenant, policy, visibility classes) are used as technical language, not as the public product identity."}
          </p>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            {isTr ? "Kanonik model özeti" : "Canonical model summary"}
          </h2>
          <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
            <li>
              <strong>Event</strong>: {isTr ? "her olay için tek event ID içeren kanonik olay nesnesi." : "the canonical incident object with one event ID per incident."}
            </li>
            <li>
              <strong>Bundle</strong>: {isTr ? "olayla ilişkili kanıt nesnelerinin paketleme birimi." : "the packaging unit for evidence objects associated with an event."}
            </li>
            <li>
              <strong>Manifest</strong>: {isTr ? "pakete hangi nesnelerin ait olduğunu tanımlayan bütünlük haritası." : "the integrity map describing which objects belong in the bundle."}
            </li>
            <li>
              <strong>Export</strong>: {isTr ? "kanonik olaydan türetilen, role uygun sunum artifact’ı (JSON/PDF)." : "a role-appropriate presentation artifact (JSON or PDF) derived from the canonical event."}
            </li>
            <li>
              <strong>Receipt</strong>: {isTr ? "bir işlemin gerçekleştiğini gösteren protokol kanıtı (ör. export üretimi)." : "protocol evidence that an action occurred (such as export generation)."}
            </li>
            <li>
              <strong>Tenant policy (implementation)</strong>: {isTr ? "hangi export profillerinin etkin olacağını, export’larda hangi görünürlük sınıflarına izin verileceğini ve policy tabanlı redaksiyonun açık olup olmadığını belirleyen backend konfigürasyonu." : "backend configuration that determines which export profiles are enabled, which visibility classes are allowed in exports, and whether policy-driven redaction is enabled."}
            </li>
            <li>
              <strong>Verification run</strong>: {isTr ? "tek bir doğrulama eyleminin kalıcı kaydıdır; olay, bundle, manifest ve verification state ile bağlıdır. Her çalışmanın benzersiz bir verification_run_id değeri vardır." : "a persisted record of a single verification action, linked to an event, bundle, manifest, and verification state. Each run has a unique verification_run_id."}
            </li>
            <li>
              <strong>Verification trace</strong>: {isTr ? "verification run’a bağlı kalıcı artifact’tır; ilgili çalışmanın yapılandırılmış adımlarını (check/result/note) tutar. Her iz için benzersiz " : "a persisted artifact linked to a verification run; stores structured steps (check, result, note) for that run. Each trace has a unique "}
              <code>transcript_id</code>
              {isTr ? " (API alanı) bulunur." : " (API field)."}
            </li>
            <li>
              <strong>Verification State</strong>: {isTr ? "demo olayları için PASS, FAIL, UNKNOWN veya UNVERIFIED değerlerinden biridir." : "one of PASS, FAIL, UNKNOWN, UNVERIFIED for the demo events."}
            </li>
            <li>
              <strong>Recorded vs Derived</strong>: {isTr ? "recorded evidence doğrudan kaydedilen/kaynak kökenli materyalleri; derived evidence ise sonradan üretilen yorum/rekonstrüksiyon/analizi temsil eder. Her zaman ayrı bölümlerde saklanır ve sunulur." : "recorded evidence represents directly captured/source-origin materials; derived evidence represents later interpretation, reconstruction, or analysis. They are always stored and presented in separate sections."}
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            {isTr ? "Doğrulama semantiği" : "Verification semantics"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
            {isTr
              ? "Doğrulama, referans verilen olay paketi üzerinde sınırlı bir değerlendirmedir. Bu sürümde kanonik verification state PASS, FAIL, UNKNOWN veya UNVERIFIED olabilir. Doğrulama; sorumluluk tespiti, suç isnadı veya yargısal karar değildir; kanıt paketi üzerinde bütünlük ve bağlantı değerlendirmesidir."
              : "Verification is a bounded assessment of a referenced event package. In this version the canonical verification state can be PASS, FAIL, UNKNOWN, or UNVERIFIED. Verification does not constitute a liability determination, guilt finding, or judicial decision; it is an integrity and linkage assessment over the evidence package."}
          </p>
        </section>

        <section id="sector-specific-witness-scenarios" style={{ marginBottom: "1.75rem" }}>
          <SectionHeader
            badge={isTr ? "Sektörler" : "Sectors"}
            heading={isTr ? "Sektöre özgü tanıklık senaryoları" : "Sector-specific witness scenarios"}
            accentWord={isTr ? "senaryolar" : "scenarios"}
            subtitle={
              isTr
                ? "Her sektör senaryosu; olay, kurumsal risk, rol kabuğu, belge ailesi ve doktrin-güvenli çıktıyı tanımlar. Doğrulayıcı, sigorta, hukuk, teknik ve idari bağlamlarda aynı inceleme yapısını uygular."
                : "Each sector scenario defines: incident, institutional risk, role shell, document family, and doctrine-safe output. The Verifier applies the same inspection structure across insurance, legal, technical, and administrative contexts."
            }
          />
          {getAllSectorScenarios().map((s) => (
            <SectorScenarioDetail key={s.id} scenario={s} lang={lang} />
          ))}
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            {isTr ? "Belge / artefakt ailesi" : "Document / artifact family"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", marginBottom: "0.5rem" }}>
            {isTr
              ? "Protokol düzeyi kanıt belgeleri için ortak tasarım sistemi. Doktrin korunur: Recorded, Derived, Unknown/Disputed, Trace ve Issuance katmanları ayrı bölümlerde tutulur."
              : "Shared design system for protocol-grade evidence documents. Doctrine preserved: Recorded, Derived, Unknown/Disputed, Trace, Issuance — each in separate sections."}
          </p>
          <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
            <li>
              <strong>Incident / Event Report</strong> — {isTr ? "metadata, document ID ve zincir bağlantısı içeren kanonik olay raporu." : "canonical event with metadata, document ID, linkage."}
            </li>
            <li>
              <strong>Verification Summary</strong> — {isTr ? "sınırlı değerlendirme, trace referansı." : "bounded assessment, trace reference."}
            </li>
            <li>
              <strong>Trace Appendix</strong> — {isTr ? "doğrulama adımlarıdır; gerçeğin kendisi değildir." : "verification steps, not truth itself."}
            </li>
            <li>
              <strong>Role-based Export</strong> — {isTr ? "claims, legal ve technical pack aileleri." : "claims pack, legal pack, technical pack."}
            </li>
            <li>
              {isTr ? "Cover / seal / stamp katmanı — birincil logo değil, protokol işaretidir." : "Cover / seal / stamp layer — protocol mark, not primary logo."}
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            {isTr
              ? "Kurumsal kullanım aileleri — role dayalı inceleme ve dışa aktarma eşleşmesi"
              : "Institutional use families — Role-based review and export mapping"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", marginBottom: "0.5rem" }}>
            {isTr
              ? "Tek kanonik olay çekirdeği, çok sayıda kurumsal kabuk. Aynı olay omurgası (Event ID, Bundle ID, Manifest ID, Receipt ID, Version, Recorded, Derived, Unknown/Disputed, Trace, Issuance) korunur; yalnız öncelik sırası, görünürlük ağırlığı, belge önerisi ve kabuk yerleşimi role göre değişir."
              : "One canonical event core, many institutional shells. The same event spine (Event ID, Bundle ID, Manifest ID, Receipt ID, Version, Recorded, Derived, Unknown/Disputed, Trace, Issuance) is preserved. Only priority order, visibility weight, document recommendation, and shell layout vary by role."}
          </p>
          <div style={{ marginBottom: "1rem" }}>
            <RoleDocumentMapping />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <DocumentFamilyRoleMatrix />
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", marginBottom: "0.5rem" }}>
            {isTr
              ? "Her rolün birincil inceleme önceliği, tercih edilen belge ailesi ve yasaklı birleştirme notu vardır. İz-bağlı belge aileleri (Incident Report, Verification Summary, Trace Appendix, Claims Pack, Legal Pack, Technical Pack, Administrative Packet, Authenticity Receipt) bu rollere eşlenir. Özgünlük, makbuz ve sürüm görünürlüğü tüm kabuklarda açık kalır."
              : "Each role has a primary review priority, preferred document family, and forbidden conflation note. Trace-linked document families (Incident Report, Verification Summary, Trace Appendix, Claims Pack, Legal Pack, Technical Pack, Administrative Packet, Authenticity Receipt) map to these roles. Authenticity, receipt, and version visibility remain explicit across all shells."}
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {isTr
              ? "Role dayalı kabuklar yapısal bir çerçevedir. Backend role switching henüz uygulanmamıştır; Verifier tek kanonik görünümle birincil inceleme istasyonu olarak kalır."
              : "Role-based shells are a structural framework. Backend role switching is not yet implemented; the Verifier remains the primary inspection station with a single canonical view."}
          </p>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            {isTr ? "Dışa aktarma profilleri" : "Export profiles"}
          </h2>
          <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
            <li>
              <strong>claims</strong>: {isTr ? "hasar odaklı kanıt paketi; JSON ve PDF olarak üretilebilir." : "claims-oriented evidence pack, available as JSON and PDF."}
            </li>
            <li>
              <strong>legal</strong>: {isTr ? "hukuk inceleme odaklı kanıt paketi; JSON ve PDF olarak üretilebilir." : "legal-review oriented evidence pack, available as JSON and PDF."}
            </li>
            <li>
              {isTr
                ? "Export çıktıları tenant policy ve visibility class kurallarına tabidir; her recorded/derived öğe her pakete otomatik girmez."
                : "Exports are subject to tenant policy and visibility classes; not all recorded or derived evidence is necessarily included in a given pack."}
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            {isTr ? "Görünürlük sınıfları ve redaksiyon" : "Visibility classes & redaction"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
            {isTr
              ? <>Kanıt öğeleri bir görünürlük sınıfı taşıyabilir. Mevcut demoda <code>claims_review</code>, <code>legal_review</code>, <code>technical_review</code> ve <code>restricted_internal</code> sınıfları desteklenir. Claims export’ları yalnız claims_review uyumlu kanıtları içerir; legal export’ları claims_review, legal_review ve technical_review materyallerini içerebilir. restricted_internal materyaller dışa aktarılmaz. Politika nedeniyle hariç tutulan kanıtlar, kanonik olayı değiştirmeden redaction metadata ile beyan edilir.</>
              : <>Evidence items may carry a visibility class. The current demo supports <code>claims_review</code>, <code>legal_review</code>, <code>technical_review</code>, and <code>restricted_internal</code>. Claims exports include only claims_review-appropriate evidence; legal exports may include claims_review, legal_review, and technical_review materials. restricted_internal materials are not exported. When evidence is excluded for policy reasons, exports declare this via redaction metadata without altering the underlying canonical event.</>}
          </p>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            {isTr ? "Doktrin ve uygulama dili" : "Doctrine vs implementation language"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
            {isTr
              ? "Kamusal ürün kimliği doğrulayıcı-öncelikli tanık protokolü olarak kalır. tenant, policy, visibility class, diagnostics route ve export profile gibi terimler backend/API davranışı için uygulama açıklayıcılarıdır; QARAQUTU’yu generic bir SaaS konsoluna dönüştürmez."
              : "Public product identity remains verifier-first witness protocol. Terms such as tenant, policy, visibility class, diagnostics route, and export profile are implementation descriptors for backend and API behavior. They do not redefine QARAQUTU as a generic SaaS console."}
          </p>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            {isTr ? "Mevcut API rotaları" : "Current API routes"}
          </h2>
          <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
            <li>
              <code>GET /health</code> — {isTr ? "temel canlılık kontrolü." : "basic liveness check."}
            </li>
            <li>
              <code>GET /v1/events</code> — {isTr ? "mevcut tenant için olay listesini döndürür." : "list events for the current tenant."}
            </li>
            <li>
              <code>GET /v1/events/:eventId</code> — {isTr ? "tek bir kanonik olay görünümünü döndürür." : "retrieve a single canonical event view."}
            </li>
            <li>
              <code>POST /v1/events/:eventId/verify</code> — run an
              event-first verification over the demo bundle/manifest for an
              event; creates a persisted verification run and trace,
              returns verification_run_id, transcript_id, verification state,
              and trace summary.
            </li>
            <li>
              <code>GET /v1/verifications/:verificationRunId</code> — {isTr ? "run ID ile kalıcı verification run ve trace kaydını döndürür; bulunamazsa 404 verir." : "retrieve a persisted verification run and its trace by run ID; returns 404 if not found."}
            </li>
            <li>
              <code>POST /v1/events/:eventId/exports</code> — create an export
              with a given profile (claims, legal) and format (json, pdf); body
              includes profile, format, and purpose. Requests that violate
              tenant export profile or visibility policy are rejected with
              institutional error codes (for example
              <code>POLICY_EXPORT_PROFILE_NOT_ALLOWED</code> or{" "}
              <code>POLICY_VISIBILITY_VIOLATION</code>) and do not create
              export artifacts.
            </li>
            <li>
              <code>GET /v1/exports/:exportId/download</code> — {isTr ? "profil ve biçime göre export çıktısını ID üzerinden JSON/PDF olarak indirir." : "download an export by its ID as JSON or PDF, depending on profile and format."}
            </li>
            <li>
              <code>GET /v1/system/diagnostics</code> — {isTr ? "çalışan backend için environment, dataset, schema ve build tanılama bilgilerini döndürür." : "environment, dataset, schema, and build diagnostics for the running backend."}
            </li>
            <li>
              <code>GET /v1/system/pdf-fixture/claims-long</code> — internal
              test-only route that returns a multi-page claims PDF fixture for
              validating layout and paging; not intended for tenant or
              customer-facing use.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            {isTr ? "Tanılama ve smoke" : "Diagnostics and smoke"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
            {isTr
              ? <>Diagnostics, <code>/v1/system/diagnostics</code> rotası üzerinden yayınlanır ve environment, sürümler, desteklenen export profilleri, yakın export/verification aktiviteleri, son verification run özeti, son smoke run detayları ve özet tenant policy bilgisini içerir. Smoke kontrolleri CLI ile çalıştırılır; availability, diagnostics, dataset, verifier (persisted run/trace dahil), verification okuma rotası, export oluşturma/indirme, receipt bağlama ve çok sayfalı PDF davranışı kontrol edilir. Her smoke çalıştırması kalıcı bir SmokeRun kaydı (ve kontrol başına SmokeCheck kayıtları) üretir.</>
              : <>Diagnostics are exposed via the <code>/v1/system/diagnostics</code> route and include environment, versions, supported export profiles, recent export activity, recent verification activity, latest verification run summary, latest smoke run details, and a compact tenant policy summary. Smoke checks are executed via a CLI that exercises availability, diagnostics, dataset, verifier (including persisted run and trace), verification read route, export creation/download, receipt linkage, and multi-page PDF behavior. Each smoke CLI execution now creates a persisted SmokeRun record (and individual SmokeCheck records per check). Admin shows the most recent smoke run and a compact per-check summary.</>}
          </p>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            {isTr ? "Güncel sınırlamalar" : "Current limitations"}
          </h2>
          <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
            <li>
              {isTr
                ? "Smoke run geçmişi şu anda diagnostics/admin yüzeylerinde kısa bir son çalıştırma listesi ile sınırlıdır."
                : "Smoke run history is currently limited to a short list of the latest runs in diagnostics/admin."}
            </li>
            <li>
              {isTr
                ? "Implementation policy şu anda tenant-genel düzeyde modellenmiştir; kullanıcı/rol bazlı override henüz desteklenmez."
                : "Implementation policy is currently modeled at a tenant-wide level; it does not yet support per-user or per-role overrides."}
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

