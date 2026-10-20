# Decisions

Derived record. `masterprompt.md` remains authoritative. Decisions require owner approval where the specification says so.

## ADR-0001 — Repository location

- **Date:** 2026-10-20
- **Status:** Accepted for P0; owner may revise.
- **Context:** The working directory `C:\Build Scope` contained only `masterprompt.md`. The suggested `C:\BuildScopeCheck` path did not exist. The owner supplied the project root explicitly.
- **Decision:** Use `C:\Build Scope` as the repository root and preserve the supplied `masterprompt.md` unchanged.
- **Consequences:** The path contains a space. Commands and documentation must quote paths. No duplicate project is created at `C:\BuildScopeCheck`.

## ADR-0002 — Application stack

- **Date:** 2026-10-20
- **Status:** Accepted for P0; owner review requested.
- **Context:** No existing application code, configuration or stack was present. The master prompt requires a lean TypeScript full-stack application, server-side validation and secrets, secure document handling, server-side webhook verification and printable reports.
- **Decision:** Next.js 16.4.2 App Router, React 19.3.1, TypeScript 5.9.3 strict, CSS custom properties, Vitest 4.1.12, ESLint 9 flat config and npm. CI uses Node.js 24 LTS.
- **Rationale:**
  - Next.js provides one deployable application for server-rendered pages, route handlers and PDF/report endpoints without extra services.
  - TypeScript 5.9 is a conservative choice; TypeScript 7 was not adopted before tooling compatibility is verified.
  - Vitest 4.1.12 is used because Vitest 5's declared engine range does not include the local Node 25.6.1 runtime.
  - Plain CSS with custom properties avoids an additional build dependency and keeps the initial surface small; component styling can evolve in P2.
  - Prettier 3.9.10 provides deterministic formatting with `format` and `format:check`.
  - ESLint 9.39.5 is retained because `eslint-plugin-react`, used by `eslint-config-next`, declares peer support through ESLint 9 only. npm reports that this ESLint release is deprecated; upgrade when the plugin supports ESLint 10.
- **Consequences:** Next.js conventions govern routing and server/client boundaries. Environment variables remain server-side except explicitly safe public values. The stack decision can be revisited before feature work if the owner prefers another verified environment.

## ADR-0003 — Safety defaults are executable gates

- **Date:** 2026-10-20
- **Status:** Accepted for P0.
- **Context:** The master prompt makes cost-data licensing and live payments hard gates. Documentation alone can be bypassed accidentally.
- **Decision:** `src/lib/config.ts` parses `BUILDSCOPE_COST_DATA_MODE` and `BUILDSCOPE_PAYMENT_MODE`. Defaults are `OFF` and `disabled`. Production `DEMO` cost data is rejected. `LICENSED` and `live` require explicit approval flags. Configuration tests cover these gates.
- **Consequences:** Invalid or unapproved configuration fails visibly rather than silently falling back to paid data or live charging. This gate does not itself implement a cost-data provider or payments.

## ADR-0004 — Documentation is derived, not authoritative

- **Date:** 2026-10-20
- **Status:** Accepted for P0.
- **Context:** The master prompt requires status, decisions, traceability and next-action records without allowing them to override requirements.
- **Decision:** Keep `docs/` records concise and evidence-backed. Link entries to requirement IDs and commands. Any conflict with `masterprompt.md` is escalated to the owner rather than resolved by editing the ledger.
- **Consequences:** Phase status must distinguish planned, implemented, verified, blocked and unverified work.

## ADR-0005 — P0 secret and artifact handling

- **Date:** 2026-10-20
- **Status:** Accepted for P0.
- **Context:** The final product will handle sensitive construction documents, but P0 has no document pipeline and no authorized real-document processing.
- **Decision:**
  - Commit only `.env.example` with placeholders. Ignore `.env` and all `.env.*` variants except the example.
  - Ignore `.next`, build output, coverage, TypeScript build metadata, logs, Playwright artifacts and common editor/OS files.
  - Use synthetic fixtures only when test work begins.
  - Do not log raw document content or secrets when server features are added.
  - Keep `masterprompt.md` out of automated formatting so its approved text and hash remain unchanged.
- **Consequences:** P0 repository artifacts contain no customer data or credentials. A documented retention/deletion policy is still required before any real-document handling in a later phase.

## ADR-0006 — Canonical P1 research document names

- **Date:** 2026-10-20
- **Status:** Accepted for P1.
- **Context:** The master prompt names `docs/research/REA_EVIDENCE.md` and `docs/research/PRICING_AND_UNIT_ECONOMICS.md`. A later directive used the shorter names `REA_FINDINGS.md` and `PRICING.md`. Duplicating research records would create conflicting sources of truth.
- **Decision:** Keep the master-prompt names as canonical. `REA_EVIDENCE.md` states explicitly that it is also the "REA findings" record. No duplicate files are created.
- **Consequences:** Traceability points to the master-prompt filenames. Any future rename requires owner approval.

## ADR-0007 — P2 synthetic demo architecture

- **Date:** 2026-10-20
- **Status:** Accepted for P2; owner review requested.
- **Context:** P2 requires a branded, responsive, synthetic walkthrough with usable comparison, evidence and known-versus-unknown views, without uploads, AI, payments or paid data. The P0 page was a static status page.
- **Decision:** Implement a client-side demo workspace at `/demo` backed by a typed synthetic fixture in `src/lib/demo/`. Pure deterministic helpers live in `src/lib/demo/analysis.ts` and are unit-tested. The landing page at `/` previews the fixture and lists non-active capabilities. The report preview prints via the browser dialog; no server PDF generation exists yet.
- **Rationale:** Keeps P2 free of unverified AI, network and payment dependencies, keeps arithmetic deterministic and testable, and leaves P3 extraction as the only remaining unknown for a real pipeline.
- **Consequences:** The fixture is clearly labeled synthetic everywhere and must never be represented as real data. Changing fixture numbers requires updating the tests.

## ADR-0008 — Public endpoints verified but not activated

- **Date:** 2026-10-20
- **Status:** Accepted for P1/P5 planning.
- **Context:** Census geocoding, FEMA NFHL and USGS EPQS responded successfully during P1 reachability checks. No adapter, cache, contract test, privacy review or terms review exists yet.
- **Decision:** Record reachability only. Do not ship any live integration in P2. Treat all risk cards in the demo as `NOT EVALUATED` placeholders. Adapters require verified terms, fallbacks that distinguish `NOT EVALUATED` from `NO RISK`, and contract tests before activation.
- **Consequences:** The demo contains no external calls and no false parcel, flood or hazard conclusions.

## ADR-0009 - P3 deterministic synthetic document lab

- **Date:** 2026-10-20
- **Status:** Accepted for the bounded synthetic lab; owner review requested. This ADR does not open the commercial P3 gate.
- **Context:** The full P3 gate requires owner acceptance of P2, an approved AI provider with data rights and measured accuracy, and a privacy/retention design for real documents. None of those approvals exists. A deterministic lab can still validate the evidence contract, intake boundaries, arithmetic and correction workflow using synthetic PDFs without sending data to a model.
- **Decision:**
  - Implement `/analyze` and `POST /api/analyze` as a synthetic text-PDF lab. No AI, OCR, external model call, paid data, persistence or real-document handling.
  - Use `unpdf`/PDF.js native text extraction with per-page output, page/text limits, a timeout, PDF magic-byte validation and explicit rejection codes.
  - Parse only the documented synthetic fixture structures. Do not claim arbitrary-vendor PDF accuracy.
  - Require evidence coordinates (document/page/section/span) for extracted facts and findings. Treat instruction-like source text as untrusted evidence and report it, never execute it.
  - Keep arithmetic deterministic and integer-cent based. The calculated result and discrepancy are derived, not copied from the source total.
  - Keep reviewer corrections client-side with an audit log; preserve the original evidence and re-derive comparison, findings and financials from the corrected analysis.
  - Process uploads in memory and discard them after the response. Enforce limits before extraction, not after.
  - Keep `/analyze` dynamic and load the allowlisted sample from local fixtures; this is a repository lab path, not a deployment packaging strategy.
- **Rationale:** Validates the most testable P3 mechanisms with real PDFs and real evidence spans while avoiding unapproved AI, retention and vendor exposure. It also gives the owner a concrete review surface before authorizing a provider.
- **Consequences:**
  - The parsers are template-specific; they are not a general extraction solution.
  - No real customer document may be uploaded. The API has no authentication, rate limiting or retention policy.
  - The request-size check occurs after multipart parsing; a streaming/proxy limit and broader abuse controls are required before internet exposure.
  - Full P3 remains `BLOCKED` until the owner records the provider, real-document, retention and security decisions.

## Pending owner decisions

- Approval before any `rea-agents setup` execution, including the OpenCode client flag and the unsupported local Node condition.
- Approval before sending the prepared Craftsman licensing inquiry.
- Approval of any commercial cost-data or live-payment activation in later phases.
- Owner review and acceptance or rejection of the P2 synthetic walkthrough and the P3 deterministic synthetic lab.
- Decision whether to open the full P3 gate with an approved AI provider, data-rights review, measured accuracy and real-document privacy/retention design.
