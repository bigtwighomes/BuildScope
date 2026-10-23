# Status

- **Last updated:** 2026-10-22
- **Authoritative specification:** `masterprompt.md` v1.0 (research baseline 2026-10-20)
- **Master prompt SHA-256:** `B36FAFB37E281E31FCEB565C24E05EA80B9A26A5E03B920D6B277B2ABB28D391` (unchanged)
- **Active phase:** unified synthetic five-step proposal review, with the deterministic document lab retained
- **Overall status:** P0 `LOCALLY VERIFIED`; P1 research `LOCALLY VERIFIED` with licensing and REA setup `BLOCKED`; unified product UX `LOCALLY VERIFIED` with owner review pending; deterministic P3 slice `IMPLEMENTED / LOCALLY VERIFIED`; P4 local change and screening support `PARTIAL`; commercial P3 and all paid/production paths `BLOCKED`
- **Product status:** Synthetic five-step review only. Uploads are processed in memory and discarded. Corrections and customer-entered changes exist only in the browser session. No AI, OCR, persistence, accounts, payments, entitlements, licensed cost data, live screening, report delivery or deployment exists.

## Phase ledger

| Phase                                 | Status                                                   | Evidence                                                                                                                                                                                                              |
| ------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0 Foundation / repository            | LOCALLY VERIFIED                                         | Baseline commands, safety gates and docs verified 2026-10-20. See `docs/tests/TEST_RESULTS.md`.                                                                                                                       |
| P1 Research and feasibility           | LOCALLY VERIFIED (setup/licensing BLOCKED)               | `COMPETITOR_MATRIX.md`, `REA_EVIDENCE.md`, `CRAFTSMAN_LICENSE.md`, `DATA_SOURCE_REGISTER.md`, `MARKET_OPPORTUNITIES.md`, `PRICING_AND_UNIT_ECONOMICS.md`, `SCOPE_AND_MVP.md`.                                         |
| P2 Minimal original product UX        | LOCALLY VERIFIED (owner acceptance pending)              | `/` landing and `/analyze` five-step workspace: project setup, uploads, review, comparison and report. `/demo` redirects to `/analyze?sample=1`.                                                                      |
| P3 Core document intelligence         | PARTIAL (deterministic lab LOCALLY VERIFIED; AI BLOCKED) | Bounded text-PDF intake, deterministic extraction, evidence-linked comparison, responsibilities, arithmetic, corrections and printable report. No AI/OCR, real documents or durable storage.                          |
| P4 Change orders and risk/disclosures | PARTIAL                                                  | Customer-reported change arithmetic, explicit unknown exposure and sourced `not_evaluated` site questions exist locally. No verified change-order extraction, revision workflow, live screening or disclosure engine. |
| P5 Free public source integrations    | NOT STARTED                                              | Reachability recorded; no adapter, cache, terms review or contract test.                                                                                                                                              |
| P6 Reference cost adapter             | BLOCKED                                                  | No commercial license or written data rights. Cost data defaults OFF.                                                                                                                                                 |
| P7 Commercial workflow and reporting  | BLOCKED                                                  | Stripe not implemented; no accounts, entitlements, secure delivery or server-side PDF. Browser print only. Live payments not approved.                                                                                |
| P8 Security, legal and paid pilot     | PLANNED / BLOCKED                                        | Counsel review not performed; no real-document processing; no deployment or independent security review.                                                                                                              |
| P9 Later expansion                    | PLANNED                                                  | Not justified by paid demand.                                                                                                                                                                                         |

P3 entry criteria in `docs/product/SCOPE_AND_MVP.md` remain unmet: the owner has not accepted the walkthrough, no AI provider has been approved, and no real-document privacy/retention design exists. The deterministic slice is a bounded synthetic lab, not authorization to open the commercial P3 gate.

## Current product deliverables

| Item                             | Requirement      | Status                       | Evidence                                                                                                                                                                                         |
| -------------------------------- | ---------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Landing and entry points         | REQ-500          | LOCALLY VERIFIED             | `/` with start-review and synthetic-example links; `/demo` compatibility redirect; no hidden demo dependency.                                                                                    |
| Five-step review workspace       | REQ-101, REQ-500 | LOCALLY VERIFIED             | Project, Documents, Review, Compare, Report; browser history and step gating work.                                                                                                               |
| Project types                    | REQ-012          | LOCALLY VERIFIED (SYNTHETIC) | New home, materials package/kit and bathroom renovation, each with a project-specific scope library and notes.                                                                                   |
| Bounded upload                   | REQ-100, REQ-600 | LOCALLY VERIFIED             | Streamed 8 MiB request limit, 3 files, 4 MiB/file, PDF magic, duplicate hashes, page/text/extraction limits, named rejections.                                                                   |
| Native text extraction           | REQ-100          | LOCALLY VERIFIED             | `unpdf`/PDF.js per-page text; no OCR; partial pages marked unreadable; bounded timeout.                                                                                                          |
| Typed deterministic parsing      | REQ-101, REQ-102 | LOCALLY VERIFIED (SYNTHETIC) | Project, bidder, pricing basis, line items, allowances, exclusions, specifications and responsibilities from synthetic templates.                                                                |
| Evidence contract                | REQ-103          | LOCALLY VERIFIED             | Extracted facts and line items carry document/page/section/line/span; silent cells carry no evidence.                                                                                            |
| Scope comparison                 | REQ-102          | LOCALLY VERIFIED (SYNTHETIC) | Seven statuses; project-specific categories plus observed categories; filters and evidence drilldown.                                                                                            |
| Responsibility matrix            | REQ-102          | LOCALLY VERIFIED             | Eight responsibility roles across bidders with party, source and evidence.                                                                                                                       |
| Financial reconciliation         | REQ-105, REQ-210 | LOCALLY VERIFIED (SYNTHETIC) | Integer-cent subtotal, tax, expected/stated/calculated totals, deltas, allowances and excluded scope; unknown tax treatment is insufficient data, not a discrepancy; unknown never becomes zero. |
| Change review                    | REQ-212          | PARTIAL                      | Session-only customer-entered additions, credits, fee percentage, fixed fee and schedule; negative money inputs rejected; unknown exposure remains visible.                                      |
| Site and project questions       | REQ-322, REQ-400 | PARTIAL                      | Sourced `not_evaluated` checklist for flood, permits, radon, contractor, moisture and ventilation; project location retained in the analysis; no live lookup or conclusion.                      |
| Findings and questions           | REQ-102          | LOCALLY VERIFIED (SYNTHETIC) | Priority-sorted evidence-linked findings and checklist-only questions; no fabricated citations.                                                                                                  |
| Review corrections               | REQ-103          | LOCALLY VERIFIED             | Price, basis, allowances, exclusions, specifications, parties and line categories; audit log; source evidence preserved.                                                                         |
| Rejection reasons                | REQ-600          | LOCALLY VERIFIED             | Review view lists named document rejection reasons when no document or only some documents pass validation.                                                                                      |
| Provenance                       | REQ-413          | LOCALLY VERIFIED             | Uploads are `user-upload-unverified`; sample is `bundled-synthetic-fixture`; cost mode is `OFF`; IDs use `DOC-*` or `SAMPLE-*`.                                                                  |
| Report                           | REQ-510          | PARTIAL                      | Eight-section evidence-linked report with changes, site questions, source/version/limitations and limitations; browser print/save only.                                                          |
| Security headers                 | REQ-600          | LOCALLY VERIFIED             | nosniff, frame denial, no-referrer, permissions policy, COOP, CORP and CSP framing/object restrictions.                                                                                          |
| Prompt-injection defense         | REQ-103, REQ-600 | LOCALLY VERIFIED             | Instruction-like source text is evidence only; browser checks confirm markup does not execute.                                                                                                   |
| Landing/product copy             | REQ-010, REQ-410 | LOCALLY VERIFIED             | Homeowner language, visible limitations and no active-cost/payment claims.                                                                                                                       |
| Automated unit/integration tests | REQ-700          | LOCALLY VERIFIED             | 6 files / 46 tests covering gates, money, changes/risks, extraction, intake, evidence, corrections and API behavior.                                                                             |
| Browser/accessibility suite      | REQ-500, REQ-700 | LOCALLY VERIFIED             | 24 production scenarios / 125 checks in Edge; axe WCAG 2.1 A/AA, keyboard, tablet/mobile, print PDF, security headers and rejection flows.                                                       |
| Real-document handling           | REQ-600          | BLOCKED                      | Synthetic fixtures only; no owner permission, retention design or security review.                                                                                                               |
| AI extraction                    | REQ-104          | BLOCKED                      | No approved provider, data-rights review or measured accuracy; implementation remains deterministic.                                                                                             |
| Owner review                     | REQ-500          | PENDING                      | Owner acceptance of the unified walkthrough is not recorded.                                                                                                                                     |

## Verification summary

- `npm run verify` re-run on 2026-10-22: Prettier check, ESLint, TypeScript strict check, **6 test files / 46 tests**, and production build all pass.
- Build routes: `/`, `/_not-found`, `/demo` and `/icon.svg` static; `/analyze`, `/api/analyze` and `/api/analyze/sample` dynamic.
- `npm run verify:browser` passed **125/125 checks** against a self-started production server on `http://127.0.0.1:3117` using installed Microsoft Edge.
- Browser coverage includes the five-step flow, empty and sample routes, legacy redirect, PDF rejection reasons, reviewer corrections/reset, scope filters and evidence, responsibility matrix, costs and the `$2,500.00` discrepancy, changes, site questions, copy question, report print, start over, security headers, streamed 413 rejection, keyboard focus, tablet/mobile reflow, axe WCAG 2.1 A/AA and no unexpected console/page errors.
- Print artifact: `artifacts/browser-check/report-print.pdf`, approximately 360 KB; the byte count varies with PDF metadata.
- Fixture ground truth: Northline `$486,540.00`; Cascade `$209,200.00`; Sagebrush calculated `$505,662.40` versus stated `$508,162.40` (difference `$2,500.00`); Willow `$40,957.50`; Harbor `$27,700.00`.
- Bathroom fixture ground truth: waterproofing and ventilation are `INCLUDED` for Willow and `EXCLUDED` for Harbor; sitework is not part of the bathroom comparison.
- Sample API: 3 documents, 0 rejections, 21 findings, 20 findings with evidence, 32 line items and `SAMPLE-*` provenance.
- Upload API: streamed request-body enforcement returns 413 for oversized bodies; image-only and encrypted files produce `NO_TEXT` / `ENCRYPTED` rejections and no accepted documents.
- Master prompt SHA-256 unchanged.
- HEAD remains `8398425`; the 2026-10-22 changes are currently uncommitted, so no new CI run exists.
- No deployment exists; GitHub hosts the source repository only.

## Unresolved problems and limitations

- **Owner acceptance:** not recorded. Automated browser checks are not a substitute for owner product review.
- **Commercial P3 gate:** BLOCKED. Entry criteria require owner acceptance, an approved AI provider, and privacy/retention design before real documents or AI extraction.
- **Authentication and abuse controls:** `/api/analyze` has no authentication, authorization, origin policy or rate limiting. It remains a local synthetic lab, not an internet-facing service.
- **No durable state:** analyses, corrections, customer-entered changes and report state exist in browser memory only; refresh discards them. No accounts, database, file storage or retention schedule.
- **PDF timeout:** the request stops waiting at the timeout and destroys the document when it becomes available, but a `getDocumentProxy` promise that never settles cannot be synchronously cancelled.
- **Parser scope:** deterministic parsers are built for the generated templates. Arbitrary vendor PDFs, OCR and image-only documents are unsupported.
- **No planning ranges:** known proposal amounts and unknown/excluded scope are separated, but the three-way planning-estimate layer and localized ranges are not implemented.
- **Changes and site questions:** changes are customer-reported session notes, not verified change orders. Site questions are sourced checklist items with no geocoding, screening or legal conclusion.
- **No AI:** extraction and comparison are deterministic. No model accuracy or arbitrary-document performance is claimed.
- **Commercial cost data:** BLOCKED. No written Craftsman quote or redistribution rights. No paid data is present.
- **REA:** not installed. Local Node v25.6.1 is outside the documented support list, and setup modifies agent configuration.
- **Legal review:** BLOCKED. Terms, privacy, liability, refunds and disclosure text are drafts.
- **CI:** GitHub Actions run `39514595890` passed on commit `8398425`; the workflow has no remote Edge browser job and the current working tree has not been pushed.
- **Development advisory:** 5 high-severity `braces` advisories in the lint toolchain; production dependencies are clean; no safe non-breaking fix was applied.
- **ESLint 9 deprecation:** retained because `eslint-plugin-react` peer support stops at ESLint 9.
- **Sample packaging:** sample PDFs live under `fixtures/samples/`; this is a repository/source deployment strategy, not a package artifact.

## Decisions requiring owner authorization

- Accept, revise or reject the unified five-step synthetic walkthrough and the bounded P3 deterministic lab.
- Decide whether to continue toward commercial P3 with an approved AI provider and security/retention design, or stop the lab here.
- Authorize or decline any `rea-agents setup` execution (also resolve the Node support question).
- Approve or reject sending the prepared Craftsman inquiry.
- Approve any commercial data license, live payment mode, deployment, public release or real-document processing.
- Authorize committing and pushing the current verified working tree.

## Conclusion

**P0, P1, the unified synthetic five-step product and the deterministic P3 lab are LOCALLY VERIFIED to the extent possible without owner approvals, a real AI provider, licensed cost data, real documents or deployment.** The product remains synthetic and non-commercial. Full P3, P4 integrations and every paid/production path remain blocked pending explicit owner decisions.
