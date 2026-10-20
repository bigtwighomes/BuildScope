# Requirements Traceability

Derived record. Requirement text in `masterprompt.md` is authoritative. Status values follow the master prompt vocabulary.

| Requirement                              | Current status                          | Evidence / gap                                                                                                                      |
| ---------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| REQ-001 non-negotiable intent            | PARTIAL                                 | Landing, P2 demo and P3 lab express the scope-responsibility thesis; analysis remains synthetic.                                    |
| REQ-010 product thesis                   | PARTIAL DEMO                            | `/demo` shows scope comparison, responsibilities, three-way costs and changes with synthetic data.                                  |
| REQ-011 commercial targets               | HYPOTHESIS ONLY                         | Pricing hypothesis recorded; no payments, pilots or revenue. `PRICING_AND_UNIT_ECONOMICS.md`.                                       |
| REQ-012 initial buyers                   | PLANNED / PARTIAL                       | Demo covers a log-home owner-builder scenario; bathroom and homeowner journeys not built.                                           |
| REQ-013 non-goals                        | RESPECTED                               | No CRM, scheduler, marketplace, chat or procurement features added.                                                                 |
| REQ-020 inspect and organize             | LOCALLY VERIFIED                        | P0 scaffold, docs and baseline commands verified.                                                                                   |
| REQ-030 competitors and REA              | LOCALLY VERIFIED (REA setup BLOCKED)    | `COMPETITOR_MATRIX.md`; `REA_EVIDENCE.md`; no setup executed; Node support unresolved.                                              |
| REQ-100 document analysis                | PARTIAL (SYNTHETIC LAB)                 | Text-PDF intake and native extraction work on synthetic fixtures; no AI/OCR, arbitrary-vendor accuracy or real-document handling.   |
| REQ-101 user journey                     | PARTIAL DEMO                            | Synthetic P2 walkthrough plus P3 upload/correction/report lab; no account, payment, entitlement or secure delivery.                 |
| REQ-102 core outputs                     | PARTIAL LAB                             | Extracted documents produce scope statuses, responsibility matrix, allowances, contradictions and questions; synthetic only.        |
| REQ-103 evidence contract                | PARTIAL LAB                             | Extracted facts/line items carry document/page/section/span; corrections preserve originals; tests enforce evidence integrity.      |
| REQ-104 AI pipeline                      | PLANNED / BLOCKED                       | No provider selected or called. Deterministic parsers are template-specific and are not an AI pipeline.                             |
| REQ-105 arithmetic                       | LOCALLY VERIFIED (SYNTHETIC)            | Integer-cent helpers reconcile subtotal, tax, expected/stated/calculated totals and deltas; P3 fixture proves a $2,500 delta.       |
| REQ-200 location input                   | PLANNED / DEMO PLACEHOLDER              | Demo shows a ZIP placeholder and states no live geocoding; P4/P5.                                                                   |
| REQ-210 three-way financial presentation | PARTIAL DEMO                            | Known / planning / unknown separated; synthetic ranges labeled; "no defensible localized range" shown.                              |
| REQ-211 reference-cost math              | BLOCKED                                 | No licensed provider or location modifiers.                                                                                         |
| REQ-212 change orders                    | PARTIAL DEMO                            | Five changes with statuses, baseline preservation, unknown fee and schedule exposure. Real documents P4.                            |
| REQ-300 Craftsman hard gate              | BLOCKED                                 | No written license quote; cost data not activated.                                                                                  |
| REQ-301 vendor inquiry                   | DRAFTED / NOT SENT                      | `CRAFTSMAN_LICENSE.md`; owner approval required.                                                                                    |
| REQ-302 cost provider interface          | PARTIAL                                 | Config gates enforced and tested; provider adapter PLANNED for P6. Demo ranges clearly synthetic.                                   |
| REQ-303 other commercial datasets        | BLOCKED                                 | No RSMeans/Gordian license; not used.                                                                                               |
| REQ-320 public source integrations       | PARTIAL (REACHABILITY ONLY)             | Census/FEMA/EPQS responded; no adapters, terms review, fallbacks or contract tests. `DATA_SOURCE_REGISTER.md`.                      |
| REQ-321 integration priority             | PLANNED                                 | Recommended order recorded; no integration started.                                                                                 |
| REQ-322 risk data schema                 | PARTIAL DEMO                            | Demo risk cards use status labels and limitations; no live schema-backed observations.                                              |
| REQ-323 licensed code materials          | RESPECTED                               | No ICC or proprietary material copied.                                                                                              |
| REQ-400 construction risk universe       | PARTIAL DEMO                            | Demo screening cards only; no real assessment.                                                                                      |
| REQ-410 liability boundaries             | PARTIAL                                 | Disclaimers on landing, demo and analyze report; counsel review BLOCKED.                                                            |
| REQ-411 disclosure system                | PLANNED                                 | No central disclosure register yet.                                                                                                 |
| REQ-412 standard warning                 | PARTIAL                                 | Plain-English warnings present in demo and report; not counsel-reviewed.                                                            |
| REQ-413 privacy                          | PARTIAL                                 | No secrets, no real data, no AI calls, no upload persistence. Full privacy/retention design PLANNED.                                |
| REQ-414 change-order disclosure          | PARTIAL DEMO                            | Changes view and financial view carry the required warning text; not counsel-reviewed.                                              |
| REQ-500 premium UX                       | LOCALLY VERIFIED (AUTOMATED BROWSER)    | Responsive landing, P2 demo and P3 lab; 84/84 Edge checks, axe WCAG 2.1 A/AA, keyboard, print, tablet/mobile. Owner review pending. |
| REQ-510 report content                   | PARTIAL                                 | P2 and P3 on-screen reports with inline evidence and browser print; server PDF, entitlement and delivery PLANNED.                   |
| REQ-600 payment, fulfillment, security   | PARTIAL / BLOCKED                       | In-memory synthetic upload lab has limits/rejections but no auth, rate limiting or retention; Stripe/entitlements BLOCKED.          |
| REQ-610 unit economics                   | HYPOTHESIS ONLY                         | Cost categories listed; no measured costs; pilots not started.                                                                      |
| REQ-700 requirements-driven tests        | LOCALLY VERIFIED (SYNTHETIC)            | 6 files / 51 tests cover gates, P2 analysis, money, extraction, intake/rejection, evidence, corrections and API behavior.           |
| REQ-800 P0 foundation                    | LOCALLY VERIFIED                        | Baseline commands verified.                                                                                                         |
| REQ-800 P1 research and P2 UX            | LOCALLY VERIFIED (owner review pending) | P1 docs, P2 workspace and automated browser audit complete; see `docs/STATUS.md`.                                                   |
| REQ-800 P3-P9                            | PARTIAL / PLANNED / BLOCKED             | Deterministic P3 synthetic lab implemented; AI P3, P4-P9 and all commercial gates remain closed.                                    |
| REQ-900 first workflow                   | PARTIAL                                 | Steps 1-8 addressed across the P2/P3 synthetic flow; integrations reachability only; payment/delivery and production steps remain.  |

## Notes

- "PARTIAL DEMO" or "PARTIAL LAB" means interface or deterministic behavior exists with synthetic fixtures only. It is not evidence of a production capability.
- No requirement is marked complete because a page, directory or placeholder exists.
- Paid cost data and live payments are not authorized. `BLOCKED` is intentional.
- Browser accessibility, keyboard navigation and responsive behavior were audited with automated Edge/axe checks on 2026-10-20. This is not a substitute for independent human review or owner acceptance.
- The P3 deterministic lab does not satisfy the full P3 gate because AI-provider, real-document, retention and security approvals are absent.
