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

## P2 synthetic demo checks (implemented 2026-10-20)

| ID      | Test                                               | Requirement      | Expected                                                                     | Result |
| ------- | -------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------- | ------ |
| T-P2-01 | Quoted totals exclude allowances and discrepancies | REQ-105, REQ-210 | Northline `$486,000`, Cascade `$231,500`, Sagebrush `$418,900`               | PASS   |
| T-P2-02 | Allowances are not added twice                     | REQ-105          | Allowance subtotal `$36,900` stays separate from quoted totals               | PASS   |
| T-P2-03 | Scope statuses stay distinct                       | REQ-102          | All seven statuses available; at least five `NOT_SPECIFIED` cells            | PASS   |
| T-P2-04 | Evidence completeness for material extractions     | REQ-103          | No `INCLUDED/EXCLUDED/SEPARATELY_CONTRACTED/CONFLICTING` cell lacks evidence | PASS   |
| T-P2-05 | Status and query filtering                         | REQ-500          | Filters return expected rows and preserve all rows by default                | PASS   |
| T-P2-06 | Unknown conditions are counted and carry no amount | REQ-210          | 9 unknown conditions; 7 unassigned responsibilities; no dollar field         | PASS   |
| T-P2-07 | Change baselines preserved across statuses         | REQ-212          | Requested, approved and rejected changes retain baseline values              | PASS   |
| T-P2-08 | Lower-cost change still carries unknown exposure   | REQ-212          | Pergola credit `−$4,100` with non-empty unknown exposure                     | PASS   |
| T-P2-09 | Currency and delta formatting                      | REQ-500          | `$486,000`, `+$14,800`, `−$4,100`                                            | PASS   |

## P3 deterministic lab checks (implemented 2026-10-20)

| ID      | Test                                  | Requirement      | Expected                                                                    | Result |
| ------- | ------------------------------------- | ---------------- | --------------------------------------------------------------------------- | ------ |
| T-P3-01 | Sample intake and extraction          | REQ-100          | 3 synthetic PDFs, 3 pages each, 32 line items, deterministic `SYN-` ID      | PASS   |
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
| T-P3-18 | Sample API                            | REQ-100          | HTTP 200, 3 documents, 21 findings, synthetic flag, `no-store`              | PASS   |
| T-P3-19 | Upload API                            | REQ-100          | HTTP 200 raw analysis, sanitized name, `no-store`, expected total           | PASS   |
| T-P3-20 | API error contract                    | REQ-600          | 415 JSON, 400 no-files, 400 too-many, 413 declared-oversize, named reject   | PASS   |
| T-P3-21 | Money parsing and formatting          | REQ-105          | Integer cents, rejects malformed/unsafe values, exact formatting            | PASS   |
| T-P3-22 | Analyze browser workflow              | REQ-500, REQ-700 | Sample load, 7 sections, corrections/reset, evidence, print, mobile         | PASS   |

## Browser and accessibility checks

| ID     | Check                                   | Expected                                                     | Result |
| ------ | --------------------------------------- | ------------------------------------------------------------ | ------ |
| T-B-01 | axe WCAG 2.1 A/AA on all desktop routes | No violations on landing, demo and analyze                   | PASS   |
| T-B-02 | Keyboard focus and tab order            | Visible 3px focus outline; next sidebar item reachable       | PASS   |
| T-B-03 | Tablet and mobile reflow                | No page-level horizontal overflow; cards replace wide tables | PASS   |
| T-B-04 | Print CSS and PDF generation            | Navigation hidden; P2 and P3 PDFs generated                  | PASS   |
| T-B-05 | P3 interaction flows                    | Filters, evidence, corrections, reset, copy question, reload | PASS   |
| T-B-06 | Upload rejection UX                     | Image-only and encrypted files rejected; sample reloads      | PASS   |
| T-B-07 | Prompt-injection markup                 | Injected `<script>` text is escaped and not executed         | PASS   |
| T-B-08 | Console and page errors                 | No browser console errors or uncaught page errors            | PASS   |

## Planned test families

These are not implemented and must not be reported as passing.

- **P3 commercial extraction (REQ-104, REQ-700):** arbitrary vendor layouts, OCR/image PDFs, ambiguous units and terms, prompt-injection variants, extraction/citation accuracy on an approved corpus, latency and per-report cost. The deterministic lab only covers the generated synthetic templates.
- **P3 production document handling (REQ-413, REQ-600):** authentication/authorization, tenant isolation, streaming/proxy body limits, rate limiting, concurrent uploads, extraction cancellation, retention/deletion, log leakage and deployment packaging.
- **P4 changes and risk (REQ-212, REQ-322, REQ-414):** added/removed scope, substitutions, upgrades, plumbing relocation, rework, known versus unknown change fees, approvals versus requests, schedule changes, baseline preservation, credits not double counted.
- **P5 public sources (REQ-320-REQ-323):** geocode ambiguity and misses, ZIP crossing counties, flood/mapped screening, unavailable services, coverage gaps, fallbacks that distinguish `NOT EVALUATED` from `NO RISK`.
- **P6 reference costs (REQ-302):** source absence, demo-only, licensed test data, stale data, forbidden caching/redistribution, invalid location modifiers, provider outage, no invented localized amounts.
- **P7 commercial workflow (REQ-600, REQ-510):** signed webhook verification, duplicate webhook, unauthenticated report access, expired download, payment failure, deletion, retry idempotency, server PDF pagination and evidence links.
- **P8 security and legal (REQ-413, REQ-700):** counsel review, malicious PDF corpus beyond current fixtures, real-data retention/deletion, abuse controls and independent human accessibility review.

## Metrics to establish with fixtures

Extraction completeness, citation correctness, scope-classification precision, arithmetic correctness, false omission claims, ambiguity clarity, latency, cost per report, failure rates and support burden. Acceptance thresholds require a documented synthetic ground-truth set and must not be asserted before measurement.
