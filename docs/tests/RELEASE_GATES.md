# Release Gates

Derived summary of `masterprompt.md` section 16. No commercial, deployment, real-document, paid-data or payment gate is open.

| Gate                          | Required outcome                                                                                                                                                        | Status                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| P0 Foundation / repository    | Existing work inspected and preserved; master prompt in place; `AGENTS.md`; stack and baseline commands established                                                     | LOCALLY VERIFIED                                                          |
| P1 Research and feasibility   | Public competitor matrix; legitimate REA evaluation; licensing inquiry draft; free-data register; differentiation and margin hypothesis; licensing cost clearly blocked | LOCALLY VERIFIED except approvals                                         |
| P2 Minimal product UX         | Branded responsive synthetic walkthrough; comparison, evidence, known-versus-unknown views; accessible                                                                  | LOCALLY VERIFIED (automated browser); owner acceptance pending            |
| P3 Document intelligence      | Secure text ingestion; extraction; human correction; deterministic math; comparison and responsibilities; ground-truth tests                                            | PARTIAL: synthetic deterministic lab verified; AI/commercial gate BLOCKED |
| P4 Changes and risk           | Baseline versus revision; fees and schedule unknowns; location input; disclosure engine; source/version tracking                                                        | NOT STARTED                                                               |
| P5 Public data                | Verified free-source integrations with provenance, fallback and no false parcel/compliance claims                                                                       | NOT STARTED                                                               |
| P6 Reference costs            | OFF/DEMO/LICENSED adapter; production disabled without written licensing approval                                                                                       | BLOCKED                                                                   |
| P7 Commercial workflow        | Test-mode Stripe, entitlements, secure downloads, professional PDF, retention and monitoring                                                                            | NOT STARTED                                                               |
| P8 Security, legal and pilots | Adversarial review, counsel review, unit economics, 5–10 legitimate pilot opportunities, owner approval                                                                 | NOT STARTED                                                               |
| P9 Later expansion            | Only after paid demand and acceptable unit economics                                                                                                                    | NOT STARTED                                                               |

## P0 gate evidence

- Repository contained only `masterprompt.md`; no files overwritten.
- `masterprompt.md` SHA-256 was recorded before and after scaffolding.
- `AGENTS.md` directs future agents to the authoritative specification.
- Local Git repository initialized with no remote and no commit.
- Lint, typecheck, tests and production build documented in `docs/tests/TEST_RESULTS.md`.
- Cost data defaults OFF; live payments disabled; tests enforce approval flags.

## P1 gate evidence

- Competitor pages retrieved 2026-10-20 and labeled `VERIFIED/PUBLIC CLAIM/INFERENCE/UNKNOWN`.
- REA provenance, license and Node requirements recorded; setup not executed because local Node v25.6.1 is outside the documented support list.
- Craftsman API specification independently retrieved; endpoints, sandbox/production hosts and API-key header recorded; production price remains unknown and the inquiry is unsent.
- Census, FEMA NFHL and USGS EPQS reachability recorded; no provider activated.
- MVP boundary, market hypothesis and pricing hypothesis documented without invented numbers.

## P2 gate evidence

- Landing page and `/demo` workspace build and serve HTTP 200.
- Eight demo sections cover scope, responsibilities, known/planning/unknown costs, changes, risks, findings and report preview.
- Scope filters, search, evidence drilldown, responsibility selector, change filters and copy-question controls are functional client interactions.
- Report preview prints through the browser dialog; no server PDF exists.
- 11 new deterministic unit tests pass alongside the 8 P0 gate tests.
- All data is synthetic and labeled; cost mode is OFF; no network calls, uploads, payments or licensed data.
- Automated Edge suite passed 84/84 checks across P2/P3: axe WCAG 2.1 A/AA, keyboard focus/tab order, responsive layouts, print PDFs, correction flows and no console errors.
- Outstanding: owner acceptance and, if required, independent human product/accessibility review.

## P3 gate evidence (deterministic synthetic lab only)

- `/analyze` and `POST /api/analyze` accept up to three synthetic text PDFs in memory; no persistence, AI, OCR or external calls.
- Intake enforces file/request/document/page/text limits, PDF magic bytes, duplicate hashes and explicit rejection codes.
- Extraction produces typed proposals, line items, allowances, exclusions, responsibilities and terms with document/page/section/span evidence.
- Deterministic comparison covers 17 scope areas and seven statuses; responsibility matrix covers eight duties across three bidders.
- Integer-cent arithmetic independently reconciles totals and exposes the Sagebrush `$2,500.00` discrepancy.
- Reviewer corrections recalculate outputs and retain an audit log without overwriting source evidence.
- Prompt-injection text is treated as evidence and reported as security findings; browser checks confirm injected markup does not execute.
- 6 files / 51 tests and 84/84 browser checks pass; image-only, encrypted, partial, duplicate and oversized fixtures are covered.
- **Full P3 gate remains closed:** no owner acceptance, approved AI provider, arbitrary-vendor accuracy evidence, real-document permission, retention design, auth/rate limiting or streaming body limit.

## Mandatory before any paid launch

- Documented commercial cost-data rights or an explicit decision to ship without localized dollar ranges.
- Counsel review of terms, privacy, liability, refunds and disclosures.
- Security/privacy review and tested document retention/deletion.
- Verified end-to-end test-mode purchase and entitlement flow.
- Owner approval for deployment, live payments and any production data processing.
