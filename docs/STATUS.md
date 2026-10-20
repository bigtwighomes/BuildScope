# Status

- **Last updated:** 2026-10-20
- **Authoritative specification:** `masterprompt.md` v1.0 (research baseline 2026-10-20)
- **Master prompt SHA-256:** `B36FAFB37E281E31FCEB565C24E05EA80B9A26A5E03B920D6B277B2ABB28D391` (unchanged)
- **Active phase:** P3 deterministic document-intelligence lab (synthetic, no AI), with P2 owner acceptance still pending
- **Overall status:** P0 `LOCALLY VERIFIED`; P1 research `LOCALLY VERIFIED` with licensing and REA setup `BLOCKED`; P2 `LOCALLY VERIFIED` including browser/accessibility automation, owner review pending; P3 deterministic slice `IMPLEMENTED / LOCALLY VERIFIED`, while AI extraction and the commercial P3 gate are `BLOCKED`
- **Product status:** Synthetic P2 walkthrough and synthetic text-PDF lab only. Uploads are processed in memory and discarded. No AI, OCR, persistence, accounts, payments, entitlements, licensed cost data, report delivery or live integration exists.

## Phase ledger

| Phase                                 | Status                                                   | Evidence                                                                                                                                                                                                             |
| ------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0 Foundation / repository            | LOCALLY VERIFIED                                         | Baseline commands, safety gates and docs verified 2026-10-20. See `docs/tests/TEST_RESULTS.md`.                                                                                                                      |
| P1 Research and feasibility           | LOCALLY VERIFIED (setup/licensing BLOCKED)               | `COMPETITOR_MATRIX.md`, `REA_EVIDENCE.md`, `CRAFTSMAN_LICENSE.md`, `DATA_SOURCE_REGISTER.md`, `MARKET_OPPORTUNITIES.md`, `PRICING_AND_UNIT_ECONOMICS.md`, `SCOPE_AND_MVP.md`.                                        |
| P2 Minimal original product UX        | LOCALLY VERIFIED (owner acceptance pending)              | `/` landing and `/demo` workspace with eight views, filters, evidence drilldown, changes, unknowns and printable report. P2/P3 browser suite passes; owner review not recorded.                                      |
| P3 Core document intelligence         | PARTIAL (deterministic lab LOCALLY VERIFIED; AI BLOCKED) | `/analyze` and `/api/analyze` validate synthetic text PDFs, extract line items, produce evidence-linked comparisons, responsibilities, arithmetic and corrections. No AI/OCR, no real documents, no durable storage. |
| P4 Change orders and risk/disclosures | PARTIAL DEMO                                             | Changes view and risk placeholders exist in the synthetic demo; no real document handling, revision workflow or disclosure engine.                                                                                   |
| P5 Free public source integrations    | NOT STARTED                                              | Reachability recorded; no adapter, cache, terms review or contract test.                                                                                                                                             |
| P6 Reference cost adapter             | BLOCKED                                                  | No commercial license or written data rights. Cost data defaults OFF; demo ranges are visibly synthetic.                                                                                                             |
| P7 Commercial workflow and reporting  | BLOCKED                                                  | Stripe not implemented; no accounts, entitlements, secure delivery or server-side PDF. Browser print only. Live payments not approved.                                                                               |
| P8 Security, legal and paid pilot     | PLANNED / BLOCKED                                        | Counsel review not performed; no real-document processing; no deployment or security review.                                                                                                                         |
| P9 Later expansion                    | PLANNED                                                  | Not justified by paid demand.                                                                                                                                                                                        |

P3 entry criteria in `docs/product/SCOPE_AND_MVP.md` were not met: the owner has not accepted the P2 walkthrough, no AI provider has been approved, and no real-document privacy/retention design exists. The deterministic slice is therefore a bounded synthetic lab, not authorization to open the commercial P3 gate.

## P1 deliverables

| Item                                  | Requirement      | Status                                    | Evidence                                                                                        |
| ------------------------------------- | ---------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Competitor matrix                     | REQ-030          | LOCALLY VERIFIED (public pages only)      | `docs/research/COMPETITOR_MATRIX.md`, retrieved 2026-10-20, labeled claims.                     |
| REA evaluation                        | REQ-030          | EVALUATED, NOT INSTALLED                  | `docs/research/REA_EVIDENCE.md`; Node 25.6.1 not in documented support list; no setup executed. |
| Craftsman API shape                   | REQ-300, REQ-301 | VERIFIED API SHAPE; PRICE BLOCKED         | `docs/research/CRAFTSMAN_LICENSE.md`; `nec-api.json` endpoints and sandbox/production recorded. |
| Craftsman inquiry draft               | REQ-301          | DRAFTED, NOT SENT                         | `docs/research/CRAFTSMAN_LICENSE.md`.                                                           |
| Public data register                  | REQ-320          | REACHABILITY VERIFIED; ACTIVATION BLOCKED | `docs/research/DATA_SOURCE_REGISTER.md`; Census/FEMA/EPQS reachable; no adapter.                |
| Market differentiation hypothesis     | REQ-010-REQ-012  | LOCALLY VERIFIED AS HYPOTHESIS            | `docs/research/MARKET_OPPORTUNITIES.md`.                                                        |
| Pricing and unit-economics hypothesis | REQ-011, REQ-610 | LOCALLY VERIFIED AS HYPOTHESIS            | `docs/research/PRICING_AND_UNIT_ECONOMICS.md`; no viability claim.                              |
| MVP boundary                          | REQ-001, REQ-800 | DEFINED                                   | `docs/product/SCOPE_AND_MVP.md`.                                                                |

## P2 deliverables

| Item                               | Requirement      | Status                                | Evidence                                                                                         |
| ---------------------------------- | ---------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Landing page and demo report entry | REQ-500          | LOCALLY VERIFIED                      | `src/app/page.tsx`; HTTP 200 smoke test; demo CTA and disclaimers present.                       |
| Interactive demo workspace         | REQ-500, REQ-102 | LOCALLY VERIFIED                      | `src/app/demo/page.tsx`, `src/components/demo/*`; HTTP 200; eight sections.                      |
| Scope comparison and evidence      | REQ-102, REQ-103 | LOCALLY VERIFIED                      | Seven statuses, filters, search, expandable evidence with document/page/span.                    |
| Responsibility matrix              | REQ-102          | LOCALLY VERIFIED                      | Eight responsibility entries; "Not stated" preserved as a finding.                               |
| Known / planning / unknown         | REQ-210          | LOCALLY VERIFIED                      | Three separated sections; synthetic ranges labeled; "no defensible localized range" shown.       |
| Change-order impact                | REQ-212          | LOCALLY VERIFIED (demo)               | Five changes across draft/requested/quoted/approved/rejected; unknown fee exposure shown.        |
| Findings and questions             | REQ-102          | LOCALLY VERIFIED                      | Evidence-linked findings; checklist-only finding has no fabricated evidence.                     |
| Printable report preview           | REQ-510          | PARTIAL                               | Browser print works; server PDF, entitlement and delivery are PLANNED and gated.                 |
| Synthetic fixture and tests        | REQ-700          | LOCALLY VERIFIED                      | `src/lib/demo/*`, `tests/unit/demo-analysis.test.ts`; P2/P3 total is 51 tests.                   |
| Browser/accessibility walkthrough  | REQ-500          | LOCALLY VERIFIED (automated Edge run) | `npm run verify:browser`; axe WCAG 2.1 A/AA, keyboard focus/tab order, mobile/tablet, print PDF. |
| Owner review                       | REQ-500          | PENDING                               | No owner acceptance recorded.                                                                    |

## P3 deterministic lab deliverables

| Item                         | Requirement      | Status           | Evidence                                                                                                                                            |
| ---------------------------- | ---------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upload and intake validation | REQ-100, REQ-600 | LOCALLY VERIFIED | Three-file/8 MiB request, 4 MiB/file, PDF magic, duplicate SHA-256, empty/encrypted/image-only/oversized rejection, in-memory only.                 |
| Native PDF text extraction   | REQ-100          | LOCALLY VERIFIED | `unpdf`/PDF.js `extractText` per page; page count, text-size and timeout limits; document cleanup. No OCR.                                          |
| Typed parsing                | REQ-101, REQ-102 | LOCALLY VERIFIED | `parse.ts` extracts project, bidders, pricing basis, line items, allowances, exclusions, specs, responsibilities and terms from synthetic fixtures. |
| Evidence contract            | REQ-103          | LOCALLY VERIFIED | Every extracted fact and line item carries document/page/section/span; findings omit evidence rather than fabricate it.                             |
| Deterministic comparison     | REQ-102          | LOCALLY VERIFIED | Seven statuses across 17 scope areas; source explanations and evidence; all 51 fixture status cells match expected ground truth.                    |
| Responsibility matrix        | REQ-102          | LOCALLY VERIFIED | Eight responsibilities across three bidders, each with party, source and evidence.                                                                  |
| Financial arithmetic         | REQ-210, REQ-105 | LOCALLY VERIFIED | Integer-cent decimal parsing; subtotal, tax, expected/ stated/ calculated total and delta; unknown never becomes zero.                              |
| Reviewer corrections         | REQ-103          | LOCALLY VERIFIED | Price, basis, allowances, exclusions, spec, party and line-category corrections; audit log; original evidence preserved.                            |
| Prompt-injection defense     | REQ-103, REQ-600 | LOCALLY VERIFIED | Instruction-like source text is treated as evidence and reported as findings; browser test confirms injected markup does not execute.               |
| API                          | REQ-100          | LOCALLY VERIFIED | `POST /api/analyze`, `POST /api/analyze/sample`; raw `Analysis` JSON; `Cache-Control: no-store`; sanitized errors.                                  |
| Review and report UI         | REQ-103, REQ-510 | LOCALLY VERIFIED | `/analyze` with Overview, Documents, Scope comparison, Responsibilities, Costs, Findings and Report; evidence drilldown, copy question and print.   |
| Synthetic fixtures           | REQ-700          | LOCALLY VERIFIED | Northline, Cascade and Sagebrush PDFs plus image-only and encrypted rejection fixtures under `tests/fixtures/synthetic/`.                           |
| Automated tests              | REQ-700          | LOCALLY VERIFIED | 4 P3-focused test files plus the existing P0/P2 suites: 6 files, 51 tests.                                                                          |
| Browser/accessibility lab    | REQ-500, REQ-700 | LOCALLY VERIFIED | P2/P3 Edge suite: 84/84 checks, axe WCAG 2.1 A/AA, desktop/tablet/mobile, upload rejection, corrections, reset and print PDF.                       |
| Real-document handling       | REQ-600          | BLOCKED          | Synthetic fixtures only; no owner permission, retention design or security review.                                                                  |
| AI extraction                | REQ-104          | BLOCKED          | No approved provider, data-rights review or measured accuracy; implementation is intentionally deterministic.                                       |

## Verification summary

- `npm run verify` passed on 2026-10-20: Prettier check, ESLint, TypeScript strict check, **6 test files / 51 tests**, and production build.
- Build routes: `/`, `/_not-found`, `/analyze` (dynamic), `/api/analyze` (dynamic), `/api/analyze/sample` (dynamic), `/demo`, `/icon.svg`.
- Static production server smoke test returned HTTP 200 for `/`, `/demo` and `/analyze`.
- `npm run verify:browser` passed **84/84 checks** against `http://127.0.0.1:3000` using installed Edge. Includes axe WCAG 2.1 A/AA on landing, P2, P3, upload/correction/reset, report print PDFs (P2 89,465 bytes; P3 353,696 bytes), keyboard focus/tab order, tablet/mobile reflow and no console/page errors.
- P2 print and P3 report print are browser PDFs; no server-side PDF generation exists.
- Sample API verified: 3 documents, 0 rejections, 21 findings, 20 findings with evidence, 131 evidence references, 51 comparison cells, arithmetic `[matches, matches, discrepancy]` with `$2,500.00` delta.
- Fixture ground truth verified: Northline total `$486,540.00`; Cascade materials total `$209,200.00`; Sagebrush calculated total `$505,662.40` versus stated `$508,162.40`.
- Upload route verified with three synthetic PDFs: HTTP 200 and 94,957-byte analysis response. Image-only and encrypted fixtures are accepted as documents but produce zero findings and explicit `NO_TEXT` / `ENCRYPTED` rejections.
- Master prompt SHA-256 unchanged.

## Unresolved problems and limitations

- **P2/P3 owner acceptance:** not recorded. Automated browser checks are not a substitute for owner product review.
- **Commercial P3 gate:** BLOCKED. P3 entry criteria require owner acceptance, an approved AI provider, and privacy/retention design before real documents or AI extraction.
- **Security scope:** `/api/analyze` has no authentication, authorization, CSRF/origin policy or rate limiting. It is a local synthetic lab, not an internet-facing service.
- **Request-body enforcement:** the 8 MiB request limit is checked after Next.js parses the multipart form. A streaming or reverse-proxy body limit has not been verified.
- **Extraction timeout:** the request stops waiting at the timeout, but the underlying PDF.js work is not synchronously cancelled; cleanup runs when work settles.
- **Sample route packaging:** `/analyze` and `/api/analyze/sample` read fixtures from `tests/fixtures/synthetic` at runtime. This works from the repository with `next start` but is not a deployment packaging strategy.
- **OCR and image PDFs:** unsupported by design; image-only PDFs produce an explicit rejection. No OCR accuracy or safety claim is made.
- **No durable state:** corrections and analyses exist in browser memory only; refresh discards them. No accounts, database, file storage or retention schedule.
- **No AI:** extraction and comparison are deterministic parsers for the synthetic templates. They are not demonstrated on arbitrary vendor PDFs.
- **Commercial cost data:** BLOCKED. No written Craftsman quote or redistribution rights. Demo plan ranges are synthetic.
- **REA:** not installed. Local Node v25.6.1 is outside the documented support list, and setup modifies agent configuration.
- **Legal review:** BLOCKED. Terms, privacy, liability, refunds and disclosure text are drafts.
- **CI:** workflow exists but has never run; no remote.
- **Development advisory:** 5 high-severity `braces` advisories in the lint toolchain; production dependencies are clean; no safe non-breaking fix was applied.
- **ESLint 9 deprecation:** retained because `eslint-plugin-react` peer support stops at ESLint 9.
- **No commits:** local repository intentionally has no commit because the owner has not requested one.

## Decisions requiring owner authorization

- Accept, revise or reject the P2 walkthrough and the bounded P3 deterministic lab.
- Decide whether to continue toward commercial P3 with an approved AI provider and security/retention design, or stop the lab here.
- Authorize or decline any `rea-agents setup` execution (also resolve the Node support question).
- Approve or reject sending the prepared Craftsman inquiry.
- Approve any commercial data license, live payment mode, deployment, remote push or real-document processing.

## Conclusion

**P0, P1, P2 and the deterministic P3 lab are LOCALLY VERIFIED to the extent possible without owner approvals, a real AI provider, licensed cost data, real documents or deployment.** The product remains synthetic and non-commercial. The full P3 gate and every paid/production path remain blocked pending explicit owner decisions.
