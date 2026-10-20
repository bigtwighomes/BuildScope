# Scope and MVP

- **Phase:** P2 synthetic walkthrough `LOCALLY VERIFIED`; P3 deterministic synthetic PDF lab `IMPLEMENTED / LOCALLY VERIFIED`; commercial P3, AI extraction and all paid paths remain `PLANNED` or `BLOCKED`.
- **Authoritative source:** `masterprompt.md` v1.0. This document derives from it and does not override it.
- **Status labels:** P2 and the deterministic P3 lab are locally verified with synthetic fixtures. AI extraction, real-document handling, accounts, payments, server-side reports and integrations remain `PLANNED` or `BLOCKED`.

## Product sentence (REQ-001)

BuildScope Check is a small, premium, self-service tool that turns user-supplied construction proposals into evidence-linked scope comparisons, responsibility assignments, change-order exposure and prioritized questions. Optional localized cost ranges appear only when defensible, licensed data exists.

## MVP boundary

### In scope for the first sellable core (P3/P4)

1. Landing page with a transparent synthetic sample report and plain-English limitations.
2. Project types: new home, materials package (log/SIP/hybrid/conventional), bathroom renovation.
3. Temporary project/session, optional location input, and 2–3 text-based PDF proposals.
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

## User flow (REQ-101)

1. Land on the page; open the synthetic sample report; read limitations.
2. Choose project type.
3. Create a temporary project; optionally add ZIP/city/state and opt-in street address.
4. Upload 2–3 text PDFs (synthetic fixtures until real handling is authorized).
5. Review extraction and correct text, with originals preserved.
6. Read the comparison, responsibility, financial and change views.
7. Preview the report; see transparent pricing.
8. Pay once via Stripe test mode (later phase); server verifies entitlement.
9. Download the entitled report; receipt and recovery exist.
10. Source documents are deleted on the stated retention schedule.

## P2 delivered in this repository

- Landing page with product positioning, demo preview, non-active capabilities and pilot pricing hypothesis.
- Synthetic demo at `/demo` with eight views: Overview, Scope comparison, Responsibilities, Costs & unknowns, Changes, Location & risks, Findings & questions, Report preview.
- Functional interactions: section navigation, status filters, text search, row evidence expansion, change filtering, responsibility scope selector, copy-question buttons, print/save-as-PDF.
- Synthetic fixture with two installed proposals, one materials-only package, evidence spans, allowance and discrepancy handling, changes including a rejected change and a credit with unknown exposure, and unknown conditions.
- Deterministic unit tests for totals separation, evidence completeness, unknown counting and change baselines.
- No uploads, no AI, no network calls, no payments, no licensed cost data, no live screening in the P2 demo.

## P3 deterministic lab delivered in this repository

- `/analyze` review workspace and two server APIs for synthetic text PDFs.
- In-memory intake with three-file/8 MiB request, 4 MiB/file, 40-page, text-size and timeout limits; PDF magic, duplicate hash and rejection handling.
- Native per-page PDF text extraction; no OCR.
- Typed parsing of line items, allowances, exclusions, specs, responsibilities, terms and pricing basis for the generated fixtures.
- Evidence contract with document/page/section/span citations; prompt-injection text is evidence only.
- Deterministic seven-status comparison, responsibility matrix, integer-cent reconciliation and prioritized findings.
- Reviewer corrections with an audit log; original evidence is preserved.
- Seven-section review UI with filters, evidence drilldown, copy-question and browser-print report.
- 6 files / 51 tests and 84/84 automated Edge/browser/axe checks.
- **No** AI, OCR, persistence, real documents, authentication, entitlements, server PDF or payments.

## Acceptance criteria for P2

- [x] Branded responsive layout with desktop comparison readability and mobile card reflow.
- [x] Scope comparison with all seven statuses and evidence drilldown.
- [x] Responsibility matrix.
- [x] Known / planning / unknown separation with explicit "no defensible localized range" callout.
- [x] Change-order view that distinguishes requested, quoted, approved and rejected changes.
- [x] Findings and prioritized questions with evidence or explicit checklist-only status.
- [x] Printable report preview.
- [x] No working control that implies a capability that does not exist.
- [x] Unit tests pass; production build passes.
- [x] Automated browser, keyboard, axe accessibility, responsive and print checks pass.
- [ ] Independent human browser/accessibility walkthrough beyond automation.
- [ ] Owner review of the P2 walkthrough.

## P3 entry criteria

- [ ] P2 walkthrough reviewed and accepted by the owner.
- [ ] AI provider selected with measured accuracy, data rights, security and per-report cost.
- [ ] A documented decision to keep cost data OFF or a written commercial license.
- [ ] Privacy/retention design for real documents, plus explicit owner permission for any real document handling.

The deterministic P3 lab was implemented without satisfying these criteria. It is a bounded synthetic lab and does not open the commercial P3 gate.

## Traceability

- REQ-001, REQ-010 through REQ-013, REQ-100 through REQ-105, REQ-200, REQ-210 through REQ-212, REQ-500, REQ-510, REQ-600, REQ-610, REQ-700, REQ-800.
