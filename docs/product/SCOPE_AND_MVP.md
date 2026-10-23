# Scope and MVP

- **Phase:** unified synthetic five-step product `LOCALLY VERIFIED`; deterministic P3 lab `IMPLEMENTED / LOCALLY VERIFIED`; P4 local change/screening support `PARTIAL`; commercial P3, AI extraction and all paid paths remain `PLANNED` or `BLOCKED`.
- **Authoritative source:** `masterprompt.md` v1.0. This document derives from it and does not override it.
- **Status labels:** the unified flow and deterministic P3 lab are locally verified with synthetic fixtures. AI extraction, real-document handling, accounts, payments, server-side reports and integrations remain `PLANNED` or `BLOCKED`.

## Product sentence (REQ-001)

BuildScope Check is a small, premium, self-service tool that turns user-supplied construction proposals into evidence-linked scope comparisons, responsibility assignments, change exposure and prioritized questions. Optional localized cost ranges appear only when defensible, licensed data exists.

## MVP boundary

### In scope for the first sellable core (P3/P4)

1. Landing page with a transparent synthetic sample report and plain-English limitations.
2. Project types: new home, materials package (log/SIP/hybrid/conventional), bathroom renovation.
3. Temporary project/session, optional location input, and 2-3 text-based PDF proposals.
4. Secure intake, validation and native text extraction (OCR only if proven necessary later).
5. Schema-validated extraction into line items, allowances, exclusions, terms and responsibilities.
6. Customer review/correction without mutating original evidence.
7. Side-by-side scope comparison with the seven statuses: `INCLUDED`, `EXCLUDED`, `NOT SPECIFIED`, `SEPARATELY CONTRACTED`, `CONFLICTING`, `UNREADABLE`, `NOT APPLICABLE`.
8. Responsibility matrix for `supplies/purchases/pays/installs/coordinates/delivers/unloads/warrants`.
9. Three-way financial presentation: **Known Costs / Planning Estimates / Unpriced & Unknown**. Unknown is never zero.
10. Change / change-order impact: baseline versus draft/requested/quoted/approved/rejected revisions, documented delta, unknown fee and schedule exposure.
11. Location and hazard screening only when source terms and behavior are verified; otherwise clearly `NOT EVALUATED`.
12. Evidence-linked questions for the correct bidder.
13. Printable/exportable report with source spans, methodology, limitations and disclaimers.
14. One-time Stripe test-mode payment and secure entitled delivery (P7, not before).

### Out of scope (REQ-013)

No CRM, accounting, scheduling, permit approval, stamped design, legal certification, contractor matchmaking, live valuation, native mobile app, production takeoff, continuous price surveillance, unlimited AI chat, autonomous legal conclusions or unsupervised procurement. No multi-agent orchestration.

## Current user flow (REQ-101)

1. Land on `/`; start a review or open the synthetic sample.
2. Choose project type and enter a project name and optional location.
3. Add two or three text PDFs, or load the synthetic example.
4. Review extracted fields and line items, correct mistakes, and read named rejection reasons where applicable.
5. Compare scope, responsibilities, costs and unknowns, customer-entered changes, and site questions.
6. Print or save the evidence-linked report.
7. **Not implemented:** payment, entitlement, secure delivery, retention/deletion and real-document processing.

## Delivered in this repository

- Landing page with product positioning, starting points, visible limitations and no active paid/screening claims.
- Unified five-step workspace at `/analyze`:
  - Project: new-home, materials-package and bathroom project types with project notes.
  - Documents: bounded uploads, duplicate detection, rejection reasons and synthetic sample.
  - Review: corrections, audit entries, extracted fields, line items and warnings.
  - Compare: scope, responsibilities, costs/unknowns, changes, site questions and findings.
  - Report: eight sections, inline evidence, provenance, changes, site questions and limitations.
- `/demo` compatibility redirect to `/analyze?sample=1`; the old demo source and tests were removed.
- Deterministic parser and analysis for the generated synthetic templates:
  - line items, quantities, amounts, allowances, exclusions, specifications, terms and responsibilities;
  - project-aware scope categories plus categories observed in documents;
  - seven scope statuses, eight responsibility roles and evidence spans;
  - integer-cent arithmetic with expected/stated/calculated totals and deltas.
- Customer-entered change review:
  - additions, credits, baseline, percentage fee, fixed fee and schedule;
  - fee percentage applied only to positive changed work;
  - unknown exposure remains explicit;
  - entries are local to the session and are not represented as extracted or approved.
- Sourced site questions:
  - flood, permits, radon, contractor, moisture and ventilation;
  - every item is `not_evaluated`, with a source link and limitation;
  - no geocoding, parcel lookup or risk conclusion.
- Security and packaging:
  - streamed 8 MiB request limit before multipart parsing;
  - no-store analysis responses;
  - security headers;
  - sample fixtures under `fixtures/samples/`, not the test directory.
- 6 files / 46 tests and 125 automated Edge/browser/axe checks.
- **No** AI, OCR, persistence, real documents, authentication, entitlements, live screening, server PDF or payments.

## Acceptance criteria for the synthetic product UX

- [x] Branded responsive layout with desktop comparison readability and mobile card reflow.
- [x] Five-step project/documents/review/compare/report flow.
- [x] Project type and optional location capture.
- [x] Scope comparison with all seven statuses and evidence drilldown.
- [x] Responsibility matrix.
- [x] Known costs, excluded scope and unknown exposure separated.
- [x] Customer-entered change review with unknown exposure.
- [x] Site questions marked `not_evaluated` with sources.
- [x] Findings and prioritized questions with evidence or explicit checklist-only status.
- [x] Printable report with provenance and limitations.
- [x] No working control that implies a capability that does not exist.
- [x] Unit/integration tests and production build pass.
- [x] Automated browser, keyboard, axe accessibility, responsive and print checks pass.
- [ ] Independent human browser/accessibility walkthrough beyond automation.
- [ ] Owner review of the unified walkthrough.

## P3 entry criteria

- [ ] Walkthrough reviewed and accepted by the owner.
- [ ] AI provider selected with measured accuracy, data rights, security and per-report cost.
- [ ] A documented decision to keep cost data OFF or a written commercial license.
- [ ] Privacy/retention design for real documents, plus explicit owner permission for any real document handling.

The deterministic P3 lab was implemented without satisfying these criteria. It is a bounded synthetic lab and does not open the commercial P3 gate.

## Traceability

- REQ-001, REQ-010 through REQ-013, REQ-100 through REQ-105, REQ-200, REQ-210 through REQ-212, REQ-322, REQ-400, REQ-500, REQ-510, REQ-600, REQ-610, REQ-700, REQ-800.
