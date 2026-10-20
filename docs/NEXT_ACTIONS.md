# Next Actions

Derived record. Authorized work must stay inside the current phase gate in `masterprompt.md`.

## P0 closeout

- [x] Inspect the working directory and confirm no pre-existing application work.
- [x] Preserve `masterprompt.md` unchanged and record its SHA-256.
- [x] Create the `AGENTS.md` session bootstrap.
- [x] Select and scaffold the stack with baseline commands and CI proposal.
- [x] Add executable safety gates for cost data and payments.
- [x] Complete the full baseline verification and update the evidence ledger.
- [ ] Owner review of stack and P0 deliverables.
- [ ] Resolve or accept the ESLint 9 deprecation warning before later dependency upgrades.
- [ ] Track the development-only `braces` advisory in `eslint-config-next` and upgrade when a patched, non-breaking release is available.

## P1 — Research and feasibility (complete except approvals)

- [x] Lawful public competitor review of RemodelerIQ, EstimateHawk and BidCompare AI / GreatBuildz, with retrieval dates and labels. See `docs/research/COMPETITOR_MATRIX.md`.
- [x] Canonical competitor and REA records created.
- [x] REA provenance and Node requirements checked. Setup **not** executed; Node 25.6.1 is outside the documented support list. See `docs/research/REA_EVIDENCE.md`.
- [x] Craftsman API shape independently verified; licensing inquiry drafted. **Not sent.** See `docs/research/CRAFTSMAN_LICENSE.md`.
- [x] Free public-data reachability recorded in `docs/research/DATA_SOURCE_REGISTER.md`. No adapter activated.
- [x] `docs/product/SCOPE_AND_MVP.md` produced with an explicit MVP boundary.
- [x] `docs/research/PRICING_AND_UNIT_ECONOMICS.md` and `docs/research/MARKET_OPPORTUNITIES.md` produced without invented costs.
- [ ] Owner decision on the Craftsman inquiry and REA setup.

## P2 — Synthetic product UX (implemented)

- [x] Landing page with transparent demo positioning and non-active capability list.
- [x] `/demo` interactive workspace: Overview, Scope, Responsibilities, Costs & unknowns, Changes, Location & risks, Findings & questions, Report preview.
- [x] Scope status filters, search, row evidence drilldown, responsibility scope selector, change status filters, copy-question controls, browser print.
- [x] Synthetic fixture with allowance, discrepancy, conflicting-spec, missing-scope and change-order cases.
- [x] Deterministic unit tests for totals, evidence completeness, unknowns and change baselines.
- [x] Automated Edge browser, keyboard, axe accessibility, responsive and print-PDF walkthrough (`npm run verify:browser`).
- [ ] Owner review of the P2 walkthrough.
- [ ] Independent human product/accessibility review if the owner requires one beyond automation.

## P3 - Deterministic synthetic document lab (implemented; commercial gate closed)

The bounded lab was implemented without AI or OCR. It does not satisfy the full P3 entry gate and does not authorize real-document processing.

- [x] Text-PDF intake with size/count/page limits, magic-byte validation, duplicate hashes and explicit rejection codes.
- [x] Native per-page text extraction with cleanup; no OCR.
- [x] Deterministic parsing for synthetic templates: line items, allowances, exclusions, specs, responsibilities, terms and pricing basis.
- [x] Evidence spans for extracted facts and findings; prompt-injection text is treated only as source evidence.
- [x] Deterministic scope comparison, responsibility matrix, integer-cent financial reconciliation and prioritized findings.
- [x] Reviewer corrections with audit log and preserved original evidence.
- [x] `/analyze` review UI and printable report; `/api/analyze` and `/api/analyze/sample` APIs.
- [x] Ground-truth tests: 6 files / 51 tests; 84/84 browser checks.
- [ ] Owner acceptance of the P2 walkthrough and P3 lab.
- [ ] Written AI-provider, data-rights, accuracy and per-report budget decision.
- [ ] Real-document privacy, retention, deletion and security design.
- [ ] Authentication/authorization, rate limiting and streaming request-body enforcement before any internet-facing use.
- [ ] Independent human review of arbitrary vendor PDFs; current parsers are template-specific.

If the owner chooses to continue toward commercial P3:

1. Record the provider/data-handling/budget decision and keep cost data OFF.
2. Define retention, deletion and real-document handling; obtain explicit owner permission.
3. Add auth, abuse controls and deployment security review.
4. Measure extraction and citation accuracy on an approved, non-confidential corpus.
5. Keep deterministic reconciliation as the calculation authority regardless of extraction method.

## Approval queue

No external action below is authorized:

- `rea-agents setup` execution or OpenCode configuration changes.
- Sending the Craftsman licensing inquiry or contacting any vendor.
- Activating Craftsman, RSMeans or other paid cost data.
- Enabling Stripe test checkout against real accounts or any live payment.
- Processing real customer documents.
- Deployment, remote push, domain purchase or production configuration.
- Legal conclusions or public claims about compliance, savings or accuracy.

## Highest-value next task

Owner review of the P2 synthetic walkthrough and the bounded P3 deterministic lab. If accepted, decide whether to authorize a written AI-provider spike and real-document handling design. Cost data stays OFF until a written license exists.
