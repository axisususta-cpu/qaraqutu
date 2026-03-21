"use client";

import { LogoPrimary } from "../components/LogoPrimary";
import { RoleDocumentMapping } from "../components/institutional/RoleDocumentMapping";
import { DocumentFamilyRoleMatrix } from "../components/institutional/DocumentFamilyRoleMatrix";
import { THEME } from "../../lib/theme";

export default function DocsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        padding: "1.75rem 2rem",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <LogoPrimary href="/" height={28} />
        </div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1.25rem", fontWeight: 600 }}>
          QARAQUTU Docs / API
        </h1>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            Product scope
          </h2>
          <p style={{ fontSize: "0.85rem", color: THEME.textSoft, lineHeight: 1.6 }}>
            QARAQUTU currently focuses on vehicle incident, fleet, insurance,
            claims, and legal review workflows. Public doctrine is verifier-first
            witness protocol: bounded review over canonical event packages, with
            verification trace and controlled artifact issuance. This docs page
            also includes implementation alignment notes where backend terms
            (tenant, policy, visibility classes) are used as technical language,
            not as the public product identity.
          </p>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            Canonical model summary
          </h2>
          <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
            <li>
              <strong>Event</strong>: the canonical incident object with one
              event ID per incident.
            </li>
            <li>
              <strong>Bundle</strong>: the packaging unit for evidence objects
              associated with an event.
            </li>
            <li>
              <strong>Manifest</strong>: the integrity map describing which
              objects belong in the bundle.
            </li>
            <li>
              <strong>Export</strong>: a role-appropriate presentation artifact
              (JSON or PDF) derived from the canonical event.
            </li>
            <li>
              <strong>Receipt</strong>: protocol evidence that an action
              occurred (such as export generation).
            </li>
            <li>
              <strong>Tenant policy (implementation)</strong>: backend
              configuration that determines which export profiles are enabled,
              which visibility classes are allowed in exports, and whether
              policy-driven redaction is enabled.
            </li>
            <li>
              <strong>Verification run</strong>: a persisted record of a single
              verification action, linked to an event, bundle, manifest, and
              verification state. Each run has a unique verification_run_id.
            </li>
            <li>
              <strong>Verification trace</strong>: a persisted artifact
              linked to a verification run; stores structured steps (check,
              result, note) for that run. Each trace has a unique
              <code>transcript_id</code> (API field).
            </li>
            <li>
              <strong>Verification State</strong>: one of PASS, FAIL, UNKNOWN,
              UNVERIFIED for the demo events.
            </li>
            <li>
              <strong>Recorded vs Derived</strong>: recorded evidence represents
              directly captured/source-origin materials; derived evidence
              represents later interpretation, reconstruction, or analysis.
              They are always stored and presented in separate sections.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            Verification semantics
          </h2>
          <p style={{ fontSize: "0.85rem", color: THEME.textSoft, lineHeight: 1.6 }}>
            Verification is a bounded assessment of a referenced event package.
            In this version the canonical verification state can be PASS, FAIL,
            UNKNOWN, or UNVERIFIED. Verification does not constitute a
            liability determination, guilt finding, or judicial decision; it is
            an integrity and linkage assessment over the evidence package.
          </p>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            Document / artifact family
          </h2>
          <p style={{ fontSize: "0.85rem", color: THEME.textSoft, marginBottom: "0.5rem" }}>
            Shared design system for protocol-grade evidence documents. Doctrine preserved:
            Recorded, Derived, Unknown/Disputed, Trace, Issuance — each in separate sections.
          </p>
          <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
            <li>
              <strong>Incident / Event Report</strong> — canonical event with metadata, document ID, linkage.
            </li>
            <li>
              <strong>Verification Summary</strong> — bounded assessment, trace reference.
            </li>
            <li>
              <strong>Trace Appendix</strong> — verification steps, not truth itself.
            </li>
            <li>
              <strong>Role-based Export</strong> — claims pack, legal pack, technical pack.
            </li>
            <li>
              Cover / seal / stamp layer — protocol mark, not primary logo.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            Institutional use families — Role-based review and export mapping
          </h2>
          <p style={{ fontSize: "0.85rem", color: THEME.textSoft, marginBottom: "0.5rem" }}>
            One canonical event core, many institutional shells. The same event spine (Event ID, Bundle ID, Manifest ID,
            Receipt ID, Version, Recorded, Derived, Unknown/Disputed, Trace, Issuance) is preserved. Only priority order,
            visibility weight, document recommendation, and shell layout vary by role.
          </p>
          <div style={{ marginBottom: "1rem" }}>
            <RoleDocumentMapping />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <DocumentFamilyRoleMatrix />
          </div>
          <p style={{ fontSize: "0.85rem", color: THEME.textSoft, marginBottom: "0.5rem" }}>
            Each role has a primary review priority, preferred document family, and forbidden conflation note. Trace-linked
            document families (Incident Report, Verification Summary, Trace Appendix, Claims Pack, Legal Pack, Technical Pack,
            Administrative Packet, Authenticity Receipt) map to these roles. Authenticity, receipt, and version visibility
            remain explicit across all shells.
          </p>
          <p style={{ fontSize: "0.8rem", color: THEME.textMuted }}>
            Role-based shells are a structural framework. Backend role switching is not yet implemented; the Verifier
            remains the primary inspection station with a single canonical view.
          </p>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            Export profiles
          </h2>
          <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
            <li>
              <strong>claims</strong>: claims-oriented evidence pack, available
              as JSON and PDF.
            </li>
            <li>
              <strong>legal</strong>: legal-review oriented evidence pack,
              available as JSON and PDF.
            </li>
            <li>
              Exports are subject to tenant policy and visibility classes; not
              all recorded or derived evidence is necessarily included in a
              given pack.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            Visibility classes & redaction
          </h2>
          <p style={{ fontSize: "0.85rem", color: THEME.textSoft, lineHeight: 1.6 }}>
            Evidence items may carry a visibility class. The current demo
            supports <code>claims_review</code>, <code>legal_review</code>,{" "}
            <code>technical_review</code>, and{" "}
            <code>restricted_internal</code>. Claims exports include only
            claims_review-appropriate evidence; legal exports may include
            claims_review, legal_review, and technical_review materials.
            restricted_internal materials are not exported. When evidence is
            excluded for policy reasons, exports declare this via redaction
            metadata without altering the underlying canonical event.
          </p>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            Doctrine vs implementation language
          </h2>
          <p style={{ fontSize: "0.85rem", color: THEME.textSoft, lineHeight: 1.6 }}>
            Public product identity remains verifier-first witness protocol.
            Terms such as tenant, policy, visibility class, diagnostics route,
            and export profile are implementation descriptors for backend and API
            behavior. They do not redefine QARAQUTU as a generic SaaS console.
          </p>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            Current API routes
          </h2>
          <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
            <li>
              <code>GET /health</code> — basic liveness check.
            </li>
            <li>
              <code>GET /v1/events</code> — list events for the current tenant.
            </li>
            <li>
              <code>GET /v1/events/:eventId</code> — retrieve a single canonical
              event view.
            </li>
            <li>
              <code>POST /v1/events/:eventId/verify</code> — run an
              event-first verification over the demo bundle/manifest for an
              event; creates a persisted verification run and trace,
              returns verification_run_id, transcript_id, verification state,
              and trace summary.
            </li>
            <li>
              <code>GET /v1/verifications/:verificationRunId</code> — retrieve a
              persisted verification run and its trace by run ID; returns
              404 if not found.
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
              <code>GET /v1/exports/:exportId/download</code> — download an
              export by its ID as JSON or PDF, depending on profile and format.
            </li>
            <li>
              <code>GET /v1/system/diagnostics</code> — environment, dataset,
              schema, and build diagnostics for the running backend.
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
            Diagnostics and smoke
          </h2>
          <p style={{ fontSize: "0.85rem", color: THEME.textSoft, lineHeight: 1.6 }}>
            Diagnostics are exposed via the <code>/v1/system/diagnostics</code>{" "}
            route and include environment, versions, supported export profiles,
            recent export activity, recent verification activity, latest
            verification run summary, latest smoke run details, and a compact
            tenant policy summary. Smoke checks are executed via a CLI that
            exercises availability, diagnostics, dataset, verifier (including
            persisted run and trace), verification read route, export
            creation/download, receipt linkage, and multi-page PDF behavior.
            Each smoke CLI execution now creates a persisted SmokeRun record
            (and individual SmokeCheck records per check). Admin shows the most
            recent smoke run and a compact per-check summary.
          </p>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.6rem", marginTop: 0, fontWeight: 600 }}>
            Current limitations
          </h2>
          <ul style={{ fontSize: "0.8rem", paddingLeft: "1rem" }}>
            <li>
              Smoke run history is currently limited to a short list of the
              latest runs in diagnostics/admin.
            </li>
            <li>
              Implementation policy is currently modeled at a tenant-wide level;
              it does not yet support per-user or per-role overrides.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

