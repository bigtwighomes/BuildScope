# Test Plan

## P0 foundation

| ID      | Test                                | Requirement      | Expected                                         |
| ------- | ----------------------------------- | ---------------- | ------------------------------------------------ |
| T-P0-01 | Default environment configuration   | REQ-302, REQ-600 | Cost data `OFF`; payments `disabled`             |
| T-P0-02 | Unknown mode values                 | REQ-302, REQ-600 | Visible configuration error                      |
| T-P0-03 | DEMO cost data in production        | REQ-302          | Rejected                                         |
| T-P0-04 | DEMO cost data outside production   | REQ-302          | Allowed for internal development only            |
| T-P0-05 | LICENSED cost data without approval | REQ-300, REQ-302 | Rejected                                         |
| T-P0-06 | Live payments without approval      | REQ-600          | Rejected                                         |
| T-P0-07 | Configuration output shape          | REQ-413          | Secret values are not exposed                    |
| T-P0-08 | Static checks and build             | REQ-020, REQ-800 | Lint, typecheck, tests and production build pass |

Commands:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

No test result may be recorded without the command and actual output.

## P1 research checks (completed 2026-10-20)

| ID      | Check                                  | Requirement      | Expected and observed                                                                                                                                                        |
| ------- | -------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-P1-01 | Competitor pages retrieved and labeled | REQ-030          | `COMPETITOR_MATRIX.md` records sources, dates and `VERIFIED/PUBLIC CLAIM/INFERENCE/UNKNOWN` labels                                                                           |
| T-P1-02 | REA provenance and Node compatibility  | REQ-030          | `REA_EVIDENCE.md`; local Node v25.6.1 not in documented support list; no setup executed                                                                                      |
| T-P1-03 | Craftsman API shape verified           | REQ-300, REQ-301 | `nec-api.json` retrieved; endpoints, sandbox/production hosts and `api-key` header recorded; price unknown                                                                   |
| T-P1-04 | Census geocoder reachability           | REQ-320          | HTTP `200` structured-address JSON response                                                                                                                                  |
| T-P1-05 | FEMA NFHL reachability                 | REQ-320          | Metadata HTTP `200`; flood-zone point query HTTP `200` via `curl.exe`                                                                                                        |
| T-P1-06 | USGS EPQS reachability                 | REQ-320          | HTTP `200` JSON elevation; docs URL returned HTTP `500` earlier                                                                                                              |
| T-P1-07 | P1 research documents present          | REQ-030, REQ-610 | `COMPETITOR_MATRIX.md`, `REA_EVIDENCE.md`, `CRAFTSMAN_LICENSE.md`, `DATA_SOURCE_REGISTER.md`, `MARKET_OPPORTUNITIES.md`, `PRICING_AND_UNIT_ECONOMICS.md`, `SCOPE_AND_MVP.md` |

## Unified five-step workflow checks

| ID     | Test                                    | Requirement      | Expected                                                                             | Result |
| ------ | --------------------------------------- | ---------------- | ------------------------------------------------------------------------------------ | ------ |
| T-U-01 | Project type and location capture       | REQ-101, REQ-200 | Name/location persist; all three project types reach documents                       | PASS   |
| T-U-02 | Sample provenance and analysis identity | REQ-413          | `bundled-synthetic-fixture`, `sample`, `SAMPLE-*`, cost mode `OFF`                   | PASS   |
| T-U-03 | Upload provenance and analysis identity | REQ-413          | `user-upload-unverified`, `upload`, `DOC-*`                                          | PASS   |
| T-U-04 | Correction and reset                    | REQ-103          | Correction marked/logged; reset removes it; evidence preserved                       | PASS   |
| T-U-05 | Rejection reasons                       | REQ-600          | Named reasons shown for image-only/encrypted documents                               | PASS   |
| T-U-06 | Project-aware scope                     | REQ-102          | Bathroom scope includes waterproofing/ventilation; new-home scope includes sitework  | PASS   |
| T-U-07 | Change arithmetic                       | REQ-212          | `$1,000 + 10% fee - $200 + $50 = $930`; unknown exposure remains visible             | PASS   |
| T-U-08 | Screening-question honesty              | REQ-322, REQ-400 | All observations `not_evaluated`; official links; no conclusion                      | PASS   |
| T-U-09 | Report content                          | REQ-510          | Documents, findings, scope, responsibilities, costs, changes, questions, limitations | PASS   |
| T-U-10 | Start over and legacy route             | REQ-101, REQ-500 | Sample clears safely; `/demo` redirects to sample flow                               | PASS   |

## P3 deterministic lab checks

| ID      | Test                                  | Requirement      | Expected                                                                    | Result |
| ------- | ------------------------------------- | ---------------- | --------------------------------------------------------------------------- | ------ |
| T-P3-01 | Sample intake and extraction          | REQ-100          | 3 synthetic PDFs, 3 pages each, 32 line items, `SAMPLE-*` ID                | PASS   |
| T-P3-02 | Ground-truth arithmetic               | REQ-105          | Northline/Cascade match; Sagebrush discrepancy `$2,500.00`; no line errors  | PASS   |
| T-P3-03 | Analysis metrics                      | REQ-103, REQ-700 | 21 findings, 20 with evidence, >100 evidence references, 2 security spans   | PASS   |
| T-P3-04 | Comparison statuses                   | REQ-102          | Foundation, utilities, permits, labor and appliance cells match truth       | PASS   |
| T-P3-05 | Spec conflicts and freight            | REQ-102, REQ-103 | Roofing/windows conflicting; freight differences; cited evidence            | PASS   |
| T-P3-06 | Silent cells carry no evidence        | REQ-103          | `NOT_SPECIFIED` and `UNREADABLE` cells have empty evidence arrays           | PASS   |
| T-P3-07 | Evidence coordinates are valid        | REQ-103          | Every citation resolves to a real document/page/line and non-empty span     | PASS   |
| T-P3-08 | Findings and checklist separation     | REQ-102, REQ-103 | Priority sorted; extracted/security findings cited; checklist questions not | PASS   |
| T-P3-09 | Prompt-injection defense              | REQ-103, REQ-600 | Instruction text is evidence only; no system-prompt leakage or execution    | PASS   |
| T-P3-10 | Correction recalculates and preserves | REQ-103, REQ-105 | Corrected total matches; original document and evidence unchanged           | PASS   |
| T-P3-11 | Line-category correction              | REQ-102, REQ-103 | Corrected category changes comparison cell; audit log records `LI-06`       | PASS   |
| T-P3-12 | Corrected field keeps source evidence | REQ-103          | Reviewer value replaces display value while original span remains           | PASS   |
| T-P3-13 | Reject unreadable inputs              | REQ-100, REQ-600 | Image-only `NO_TEXT`; encrypted `ENCRYPTED`; zero docs and zero findings    | PASS   |
| T-P3-14 | Partial PDF handling                  | REQ-100, REQ-103 | Readable page kept; unreadable pages listed; affected scope `UNREADABLE`    | PASS   |
| T-P3-15 | Bad-file rejection                    | REQ-600          | Duplicate, empty, non-PDF and oversized files rejected with named codes     | PASS   |
| T-P3-16 | Page/text/document limits             | REQ-100, REQ-600 | Four uploads rejected; page and text limits produce explicit rejections     | PASS   |
| T-P3-17 | Filename sanitation                   | REQ-413          | Path segments stripped; unsafe characters replaced; length bounded          | PASS   |
| T-P3-18 | Sample API                            | REQ-100          | HTTP 200, 3 documents, 21 findings, synthetic provenance, `no-store`        | PASS   |
| T-P3-19 | Upload API                            | REQ-100          | HTTP 200 raw analysis, sanitized name, `no-store`, expected total           | PASS   |
| T-P3-20 | API error contract                    | REQ-600          | 415 JSON, 400 no-files, 400 too-many, 413 oversize, named rejections        | PASS   |
| T-P3-21 | Money parsing and formatting          | REQ-105          | Integer cents, rejects malformed/unsafe values, exact formatting            | PASS   |
| T-P3-22 | Streamed request limit                | REQ-600          | Browser upload over 8 MiB returns 413 without form parsing                  | PASS   |
| T-P3-23 | Bathroom fixture comparison           | REQ-102, REQ-700 | Waterproofing/ventilation included/excluded; no sitework; totals match      | PASS   |

## P4 local change and risk checks

| ID      | Test                                  | Requirement      | Expected                                                               | Result |
| ------- | ------------------------------------- | ---------------- | ---------------------------------------------------------------------- | ------ |
| T-P4-01 | Change arithmetic and unknown fee     | REQ-212, REQ-414 | Positive-work fee only; credits separated; unknown exposure non-empty  | PASS   |
| T-P4-02 | Change is local and customer-reported | REQ-212          | No extraction, approval or persistence claim; removal works            | PASS   |
| T-P4-03 | Screening status and sources          | REQ-322, REQ-400 | `not_evaluated`; project-appropriate topics; source links; limitations | PASS   |
| T-P4-04 | Safe external links                   | REQ-413          | External source links use `rel="noreferrer"`                           | PASS   |

## Browser and accessibility checks

The current harness is `scripts/browser-check.mjs`. It builds the production app, starts `next start` on port 3117 and runs 24 scenarios.

| ID     | Check                             | Expected                                                                   | Result |
| ------ | --------------------------------- | -------------------------------------------------------------------------- | ------ |
| T-B-01 | axe WCAG 2.1 A/AA                 | No violations on landing, review, all compare views, report, tablet/mobile | PASS   |
| T-B-02 | Keyboard focus and tab order      | Visible 3px focus outline; sidebar items reachable                         | PASS   |
| T-B-03 | Tablet and mobile reflow          | No page-level horizontal overflow; cards replace wide tables               | PASS   |
| T-B-04 | Print CSS and PDF generation      | Navigation hidden; report print PDF generated                              | PASS   |
| T-B-05 | Workflow interactions             | Filters, evidence, corrections, reset, changes, copy question, start over  | PASS   |
| T-B-06 | Upload rejection UX               | Image-only/encrypted rejected; named reasons; sample reloads               | PASS   |
| T-B-07 | Prompt-injection markup           | Injected `<script>` text is escaped and not executed                       | PASS   |
| T-B-08 | Security headers and no-store API | Headers present; sample API `no-store`; oversized request 413              | PASS   |
| T-B-09 | Console and page errors           | No unexpected console errors or uncaught page errors                       | PASS   |

## Planned test families

These are not implemented and must not be reported as passing.

- **P3 commercial extraction (REQ-104, REQ-700):** arbitrary vendor layouts, OCR/image PDFs, ambiguous units and terms, prompt-injection variants, extraction/citation accuracy on an approved corpus, latency and per-report cost. The deterministic lab only covers generated templates.
- **P3 production document handling (REQ-413, REQ-600):** authentication/authorization, tenant isolation, origin policy, rate limiting, concurrent uploads, extraction cancellation, retention/deletion, log leakage and deployment packaging.
- **P4 verified changes and risk (REQ-212, REQ-322, REQ-411, REQ-414):** extracted change orders, substitutions, approvals, schedule changes, baseline preservation, disclosure register, geocoding, flood/permit screening, source outages and fallbacks that distinguish `NOT EVALUATED` from `NO RISK`.
- **P5 public sources (REQ-320-REQ-323):** geocode ambiguity and misses, ZIP crossing counties, unavailable services, coverage gaps and contract tests.
- **P6 reference costs (REQ-302):** source absence, demo-only, licensed test data, stale data, forbidden caching/redistribution, invalid location modifiers, provider outage and no invented localized amounts.
- **P7 commercial workflow (REQ-600, REQ-510):** signed webhook verification, duplicate webhook, unauthenticated report access, expired download, payment failure, deletion, retry idempotency, server PDF pagination and evidence links.
- **P8 security and legal (REQ-413, REQ-700):** counsel review, malicious PDF corpus, real-data retention/deletion, abuse controls and independent human accessibility review.

## Metrics to establish with fixtures

Extraction completeness, citation correctness, scope-classification precision, arithmetic correctness, false omission claims, ambiguity clarity, latency, cost per report, failure rates and support burden. Acceptance thresholds require a documented synthetic ground-truth set and must not be asserted before measurement.
